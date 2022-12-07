import configStore from '@/layout/components/config/store'
import { geoinfo, portinfo, threatinfo } from '@/service'
import { getIpAssetInfo } from '@shadowflow/components/utils/business/methods-asset'
import { calculateRiskScore } from '@shadowflow/components/utils/business/methods-ti'
import { getDeviceType } from '@shadowflow/components/utils/universal/methods-net'
import { chain, max } from 'lodash'

/**
 * 检测设备是否为黑白名单。
 * @param {String} device 查询的设备，支持IP、URL、Domain
 * @returns {
 *      isWhite: Boolean,
 *      isBlack: Boolean,
 * }
 */
export const checkWhiteOrBlack = device => {
    const {
        ip,
        isOnlyIp,
        isOnlyDomain,
        domain,
        url,
        isOnlyUrl,
    } = getDeviceType(device)
    let useDevice = ''
    switch (true) {
        case isOnlyIp:
            useDevice = ip
            break
        case isOnlyDomain:
            useDevice = domain
            break
        case isOnlyUrl:
            useDevice = url
            break
        default:
            break
    }
    if (!ip) {
        return {
            isBlack: false,
            isWhite: false,
        }
    }
    return {
        isBlack: configStore.black.map(d => d.ip).includes(useDevice),
        isWhite: configStore.white.map(d => d.ip).includes(useDevice),
    }
}

/**
 * 获取设备的详细信息。类型主要是由三种，IP、Port、URL、IP：Port。
 * IP展示的信息列表如下：
 *  地理信息：国、省、县、运营商、经纬度。
 *  情报信息：情报可信度描述。情报原始数据
 *  系统信息：黑白名单，所属资产标签。所属最小层级资产标签。
 *  资产信息：查询上面检测出来的服务，端口、中间件。
 *
 * URL:
 *  情报信息：情报可信度描述。情报原始数据
 *  系统信息：黑白名单
 *
 * Port:
 *  端口信息(Array)：描述、来源、协议、
 *
 * Ip：Port
 *  除了IP和Port的基本信息外，
 *  还有IP + Port的在资产发现里面提供的服务信息。
 * @params {String} device 设备字符串
 * @params {Boolean} isResult 是返回接口，还是返回请求？
 * isResult = true
 * @returns {
 *  ip: {
 *      name: ip,
 *      type: 'ip',
 *      geo: {
 *          nation,
 *          province,
 *          country,,
 *          operator,
 *          long,
 *          lat,
 *      },
 *      threat: {
 *          rank,
 *          rankDesc,
 *          lastestTag,
 *          lastestSource,
 *          created,
 *          updated,
 *          detail,
 *      },
 *      system: {
 *          isWhite,
 *          isBlack,
 *      },
 *      asset: {
 *          isAsset,
 *          assetDesc,
 *          assetDetail
 *      }
 *  }
 *  url: {
 *      name: url,
 *      type: 'url',
 *      threat: {
 *          score,
 *          scoreDesc,
 *          ipCount,
 *          lastestTag,
 *          lastestSource,
 *          createdTime,
 *          updateTime,
 *          detail,
 *      },
 *      system: {
 *          isWhite,
 *          isBlack,
 *      }
 *  }
 * port: {
 *      name: port,
 *      type: 'port',
 *      info: portInfoArr
 * }
 * }
 * isResult = false
 * 返回的都是各个的Pormise, 但是promise返回的内容和isResult=true的时候相同
 * @returns {
 *  ip: {
 *       name: ip,
 *      type: 'ip',
 *      geo: promise,
 *      threat: promise,
 *      system: promise,
 *      asset: promise,
 *  },
 *  url: {
 *      threat: promise,
 *      system: promise,
 *  },
 *  port: {
 *      info: pormise,
 * },
 * }
 */
export function getDeviceInfo(device = '', isResult = true) {
    const useDevice = device.toString()
    const { ip, port, domain, url, isOnlyDomain, isOnlyPort } = getDeviceType(
        useDevice
    )
    // 求IP信息，当Device为IP，或者Ip:Port的时候，
    let finalPromise = new Promise(resolve => {
        resolve()
    })
    let promiseObj = {}
    let resultObj = {}
    if (ip) {
        const geoPromise = new Promise((resolve, reject) => {
            geoinfo(ip)
                .then(geoRes => {
                    const [
                        nation,
                        province,
                        city,
                        operator0,
                        operator1,
                        lat,
                        lng,
                        position,
                        timearea,
                        postalcode,
                        phonepre,
                        nationCode,
                    ] = geoRes[0].result
                    resolve({
                        nation,
                        province,
                        city,
                        operator: [operator0, operator1]
                            .filter(d => d)
                            .join('-'),
                        lat,
                        lng,
                        position,
                        timearea,
                        postalcode,
                        phonepre,
                        nationCode,
                    })
                })
                .catch(e => {
                    reject(e)
                })
        })
        const threatPromise = new Promise((resolve, reject) => {
            threatinfo(ip)
                .then(threatRes => {
                    if (threatRes.length <= 1) {
                        resolve(false)
                        return
                    }
                    const { rank, created, updated, result = [] } =
                        threatRes[0] || {}
                    const { src, tag } = result.length
                        ? TiResultSort(result)[0]
                        : { src: '', tag: '' }
                    const obj = {
                        rank,
                        rankDesc: calculateRiskScore(rank),
                        created,
                        updated,
                        detail: result,
                        lastestTag: tag,
                        lastestSource: src,
                    }
                    resolve(obj)
                })
                .catch(e => {
                    reject(e)
                })
        })
        const systemPromise = new Promise(resolve => {
            const systemInfo = checkWhiteOrBlack(ip)
            resolve(systemInfo)
        })
        const assetPromise = new Promise(resolve => {
            const { isAsset, uniqDescArr: assetDesc, detail } = getIpAssetInfo(
                ip
            )
            resolve({
                isAsset,
                assetDesc,
                assetDetail: detail,
            })
        })
        finalPromise = new Promise(resolve => {
            Promise.allSettled([
                geoPromise,
                threatPromise,
                systemPromise,
                assetPromise,
            ]).then(resArr => {
                const [
                    { value: geo },
                    { value: threat },
                    { value: system },
                    { value: asset },
                ] = resArr
                resultObj = {
                    type: 'ip',
                    name: ip,
                    geo,
                    threat,
                    system,
                    asset,
                }
                resolve()
            })
        })
        promiseObj = {
            type: 'ip',
            name: ip,
            geo: geoPromise,
            threat: threatPromise,
            system: systemPromise,
            asset: assetPromise,
        }
    }
    if (isOnlyPort) {
        finalPromise = new Promise((resolve, reject) => {
            portinfo(port)
                .then(portInfo => {
                    resultObj = {
                        type: 'port',
                        name: port,
                        info: portInfo,
                    }
                    resolve()
                })
                .catch(e => {
                    reject(e)
                })
        })

        promiseObj = {
            type: 'port',
            name: port,
            info: finalPromise,
        }
    }

    if (url || domain) {
        const usevalue = isOnlyDomain ? domain : url
        const deviceType = isOnlyDomain ? 'domain' : 'url'
        const threatPromise = new Promise((resolve, reject) => {
            threatinfo(usevalue)
                .then(threatRes => {
                    if (threatRes.length === 1) {
                        resolve(false)
                        return
                    }
                    const { rank, created, updated, result } = threatRes[0]
                    const { src, tag } = result.length
                        ? TiResultSort(result)[0]
                        : { src: '', tag: '' }
                    resolve({
                        rank,
                        rankDesc: calculateRiskScore(rank),
                        created,
                        updated,
                        detail: result,
                        lastestTag: tag,
                        lastestSource: src,
                    })
                })
                .catch(e => {
                    reject(e)
                })
        })
        const systemPromise = new Promise(resolve => {
            resolve(checkWhiteOrBlack(usevalue))
        })
        finalPromise = new Promise(resolve => {
            Promise.allSettled([threatPromise, systemPromise]).then(
                ([{ value: threat }, { value: system }]) => {
                    resultObj = {
                        type: deviceType,
                        name: usevalue,
                        threat,
                        system,
                    }
                    resolve()
                }
            )
        })

        promiseObj = {
            type: deviceType,
            name: usevalue,
            threat: threatPromise,
            system: systemPromise,
        }
    }

    if (isResult)
        return new Promise(resolve => {
            finalPromise.then(() => {
                resolve(resultObj)
            })
        })
    return promiseObj
}

/**
 * 对threatinfo接口的result字段内数据按检出来源更新时间进行排序
 * @param {Array} data threatinfo返回结果的result字段
 * @returns
 */
export function TiResultSort(data) {
    return chain(data)
        .map(d => {
            const { src, tag, time } = d

            return {
                src,
                tag,
                time: max(time, d2 => {
                    return new Date(d2).getTime()
                }),
            }
        })
        .sort((a, b) => {
            return new Date(b.time).getTime() - new Date(a.time).getTime()
        })
        .value()
}

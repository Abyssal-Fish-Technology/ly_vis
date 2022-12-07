import { chain, sumBy, minBy } from 'lodash'
import {
    Address,
    getDeviceType,
    getIpString,
} from '@shadowflow/components/utils/universal/methods-net'
import { getIpAssetInfo } from '@shadowflow/components/utils/business/methods-asset'
import { arrangeAlerm } from '../../utils/universal/methods-traffic'
import { formatTimestamp } from '../../utils/universal/methods-time'

export function getHostOrUrlFn(url, type) {
    const length = url.indexOf('/')
    return type === 'host' ? url.slice(0, length) : url.substr(length + 1)
}

function getAggreIp(data) {
    return chain(data)
        .reduce((obj, d) => {
            const key = d.ip
            d.show_dev_name = calculateName(d.dev_name, d.dev_model)
            d.show_os_name = calculateName(d.os_name, d.os_version)
            const tempData = obj[key] ? obj[key].data : []
            tempData.push(d)
            obj[key] = {
                data: tempData,
                name: key,
                ip: d.ip,
                devid: d.devid,
                duration: d.duration,
                is_alive: d.is_alive,
            }
            return obj
        }, {})
        .values()
        .forIn(d => {
            const arr = d.data
            d.mac = arr[0].mac
            d.activeCount = arr.length
            const fieldArr = [
                'show_dev_name',
                'dev_type',
                'dev_vendor',
                'show_os_name',
                'os_type',
                'dev_name',
                'os_name',
            ]
            fieldArr.forEach(item => {
                d[item] = calculateSplit(arr, item)
            })
            d.bytes = sumBy(arr, 'bytes')
            d.pkts = sumBy(arr, 'pkts')
            d.flows = sumBy(arr, 'flows')
            d.starttime = minBy(arr, 'starttime').starttime
            d.show_starttime = formatTimestamp(d.starttime)
            d.isV4 = getDeviceType(d.ip).ipType === 'v4'
            d.desc = getIpAssetInfo(d.ip).uniqDescArr
        })
        .orderBy('activeCount', 'desc')
        .value()
}

function calculateSplit(arr, key) {
    return chain(arr).map(key).compact().uniq().value()
}

function calculateName(name, version) {
    if (name && name !== ' ') {
        const nowVersion = version && version !== ' ' ? ` (${version})` : ''
        return `${name}${nowVersion}`
    }
    return ''
}

function getAggreSrv(data) {
    return chain(data)
        .reduce((obj, d) => {
            const {
                ip,
                port,
                mac,
                is_alive,
                srv_time,
                midware_time,
                os_time,
                dev_time,
            } = d
            d.show_srv_name = calculateName(d.srv_name, d.srv_version)
            d.show_dev_name = calculateName(d.dev_name, d.dev_model)
            d.show_os_name = calculateName(d.os_name, d.os_version)
            d.show_midware_name = calculateName(
                d.midware_name,
                d.midware_version
            )
            const key = `${ip}-${port}-${mac}`
            const tempData = obj[key] ? obj[key].data : []
            tempData.push(d)
            obj[key] = {
                data: tempData,
                name: key,
                ip,
                port,
                show_is_alive: is_alive === 1 ? '活跃' : '不活跃',
                srv_time,
                midware_time,
                os_time,
                dev_time,
            }
            return obj
        }, {})
        .values()
        .forIn(d => {
            const arr = d.data
            d.showActiveCount = arr.length
            d.mac = arr[0].mac
            const fieldArr = [
                'protocol',
                'app_proto',
                'srv_type',
                'show_srv_name',
                'show_dev_name',
                'dev_type',
                'dev_vendor',
                'show_os_name',
                'os_type',
                'show_midware_name',
                'midware_type',
                'srv_name',
                'dev_name',
                'os_name',
                'midware_name',
                'srv_time',
                'dev_time',
                'midware_time',
                'os_time',
            ]
            fieldArr.forEach(item => {
                d[item] = calculateSplit(arr, item)
            })
            d.duration = sumBy(arr, 'duration')
            d.bytes = sumBy(arr, 'bytes')
            d.pkts = sumBy(arr, 'pkts')
            d.flows = sumBy(arr, 'flows')
            d.isV4 = arr[0].isV4
            d.desc = getIpAssetInfo(d.ip).uniqDescArr
        })
        .orderBy('activeCount', 'desc')
        .value()
}

function getAggreHost(data) {
    return chain(data)
        .reduce((obj, d) => {
            const key = `${d.host}-${d.ip}`
            const tempData = obj[key] ? obj[key].data : []
            tempData.push(d)
            obj[key] = {
                ip: d.ip,
                data: tempData,
                name: d.host,
                host: d.host,
                is_alive: d.is_alive,
            }
            return obj
        }, {})
        .values()
        .forIn(d => {
            const arr = d.data
            const { host } = d
            let resultHost
            let domain
            if (host.includes('://')) {
                const [, result] = host.split('//')
                resultHost = result
                const [nowDomain] = result.split(':')
                domain = nowDomain
            } else {
                resultHost = host
                const [nowDomain] = host.split(':')
                domain = nowDomain
            }

            let formType = '其它方式'
            const { isOnlyIp, ip, port } = getDeviceType(resultHost)
            if (isOnlyIp || (ip && port)) {
                formType = 'IP访问'
            } else if (getDeviceType(domain).isOnlyDomain) {
                formType = '域名访问'
            }
            d.formType = formType
            d.activeCount = arr.length
            d.bytes = sumBy(arr, 'bytes')
            d.pkts = sumBy(arr, 'pkts')
            d.flows = sumBy(arr, 'flows')
            d.port = calculateSplit(arr, 'port')
            d.showPort = d.port.join(' , ')
            d.desc = getIpAssetInfo(d.ip).uniqDescArr
        })
        .orderBy('activeCount', 'desc')
        .value()
}

function getAggreUrl(data) {
    return chain(data)
        .reduce((obj, d) => {
            const key = `${d.url}-${d.ip}`
            const tempData = obj[key] ? obj[key].data : []
            tempData.push(d)
            obj[key] = {
                ip: d.ip,
                data: tempData,
                name: d.url,
                url: d.url,
                host: getHostOrUrlFn(d.url, 'host'),
                is_alive: d.is_alive,
                port: d.port,
            }
            return obj
        }, {})
        .values()
        .forIn(d => {
            const arr = d.data

            d.activeCount = arr.length
            d.bytes = sumBy(arr, 'bytes')
            d.pkts = sumBy(arr, 'pkts')
            d.flows = sumBy(arr, 'flows')
            d.show_url = getHostOrUrlFn(d.url, 'url')
            d.retcode = chain(arr)
                .map(d1 => d1.retcode.split(','))
                .flatten()
                .uniq()
                .sort()
                .value()
            d.showRetCode = d.retcode.join()
            d.port = calculateSplit(arr, 'port')
            d.showPort = d.port.join(' , ')
            d.desc = getIpAssetInfo(d.ip).uniqDescArr
        })
        .orderBy('activeCount', 'desc')
        .value()
}

export function getAggreData(data, type) {
    let aggreFunction = () => []
    switch (type) {
        case 'ip':
            aggreFunction = getAggreIp
            break
        case 'srv':
            aggreFunction = getAggreSrv
            break
        case 'host':
            aggreFunction = getAggreHost
            break
        case 'url':
            aggreFunction = getAggreUrl
            break
        default:
            break
    }
    const aggreData = aggreFunction(data)
    aggreData.forEach(d => {
        d.show_bytes = arrangeAlerm(d.bytes)
        d.show_pkts = arrangeAlerm(d.pkts)
        d.show_flows = arrangeAlerm(d.flows)
    })

    return aggreData
}

function isNetIp(condition) {
    const {
        v4: { mask: v4Mask, isShow: v4IsShow } = {},
        v6: { mask: v6Mask, isShow: v6IsShow } = {},
    } = condition
    return (
        (v4IsShow && v6IsShow && v4Mask === 32 && v6Mask === 128) ||
        (v4IsShow && v4Mask === 32 && !v6IsShow) ||
        (v6IsShow && v6Mask === 128 && !v4IsShow)
    )
}

export function getIpNetData(data, condition) {
    const {
        v4: { mask: v4Mask, isShow: v4IsShow } = {},
        v6: { mask: v6Mask, isShow: v6IsShow } = {},
    } = condition

    const internal = window.internalIp || []
    const internalIpFormatArr = internal.map(d => {
        const {
            parsedAddress: arrInternal,
            subnet: subnetInternal,
        } = new Address(d.ip)
        return {
            name: `${arrInternal.join('.')}${subnetInternal}`,
            desc: d.desc,
            ip: d.ip,
        }
    })

    const useData = chain(data)
        .filter(d => (d.isV4 && v4IsShow) || (!d.isV4 && v6IsShow))
        .reduce((obj, d) => {
            const addr = new Address(d.ip)
            const mask = d.isV4 ? v4Mask : v6Mask
            const netAddr = new Address(`${d.ip}/${mask}`)
            const key = getIpString(netAddr)
            obj[key] = {
                data: [].concat(
                    obj[key] ? obj[key].data || [] : [],
                    addr.isInSubnet(netAddr) ? [d] : []
                ),
                net: key,
                ip: key,
                name: key,
                devid: d.devid,
            }
            return obj
        }, {})
        .values()
        .forEach(item => {
            const arr = item.data
            let desc = []
            let isInternalSign = false
            const { ipType, mask } = getDeviceType(item.net)
            if (
                (ipType !== 'v4' && mask === '128') ||
                (ipType === 'v4' && mask === '32')
            ) {
                desc = [arr[0].desc]
                isInternalSign = desc.length > 0
            } else {
                const useInternal = internalIpFormatArr.find(
                    d => d.name === item.ip
                )
                if (useInternal) {
                    desc = [useInternal.desc] || ['无描述']
                    isInternalSign = true
                }
            }

            item.desc = desc
            item.isInternal = isInternalSign
            item.activeCount = arr.length
            item.duration = sumBy(arr, 'duration')
            item.bytes = sumBy(arr, 'bytes')
            item.show_bytes = arrangeAlerm(item.bytes)
            item.pkts = sumBy(arr, 'pkts')
            item.show_pkts = arrangeAlerm(item.pkts)
            item.flows = sumBy(arr, 'flows')
            item.show_flows = arrangeAlerm(item.flows)
            item.starttime = minBy(arr, 'starttime').starttime
            item.show_starttime = formatTimestamp(item.starttime)
            item.isV4 = arr[0].isV4
        })
        .orderBy('activeCount', 'desc')
        .value()

    if (isNetIp(condition)) {
        return chain(useData)
            .map(d => d.data)
            .flatten()
            .value()
    }
    return useData
}

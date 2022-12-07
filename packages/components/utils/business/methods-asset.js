import { chain } from 'lodash'
import { isInSubnet } from '../universal/methods-net'

/** ********************************************************************** calculate start ***********************************************************************
 ** 资产计算类方法集合
 ** 资产库中涉及计算的方法都放在这个代码块中
 ** 关键字： calculate asset desc
 * */

/**
 * 这个
 * @param {String} 传入的IP
 * @returns { Object }
 */
export function getIpAssetInfo(ip) {
    let isAsset = false
    const descArr = chain(window.internalIp)
        .filter(d => {
            if (d.ip === '0.0.0.0/0') return false
            const thisIsInternal = isInSubnet(ip, d.ip)
            if (thisIsInternal) isAsset = true
            return thisIsInternal
        })
        .map(d => ({
            ip: d.ip,
            desc: d.desc || '无描述',
        }))
        .value()
    return {
        ip,
        isAsset,
        uniqDescArr: chain(descArr).map('desc').uniq().compact().value(),
        count: descArr.length,
        detail: descArr,
    }
}

/** ***********************************************************************  end ************************************************************************* */

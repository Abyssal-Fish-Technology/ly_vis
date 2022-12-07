// =============================== 翻译类 ===============================

import { chain, isObject } from 'lodash'
import { translateTiTag } from '@shadowflow/components/utils/business/methods-ti'
import EventConfig, { eventConfigFormDict } from '../config'

/**
 * 翻译事件等级
 * @param {*} level
 * @returns {String} 极高 | 高 | 中 | 低 | 极低
 */
export function translateEventLevel(level, sort = false) {
    const levelObj = {
        extra_high: '极高',
        high: '高',
        middle: '中',
        low: '低',
        extra_low: '极低',
    }
    const levelSort = {
        extra_high: 5,
        high: 4,
        middle: 3,
        low: 2,
        extra_low: 1,
    }
    const result = sort ? levelSort[level] : levelObj[level]
    return result || level
}

/**
 * 翻译事件处理状态
 * @param {*} process
 * @returns {String} 未处理 | 已处理 | 已确认
 */
export function translateEventProcess(process) {
    const processObj = {
        unprocessed: '未处理',
        processed: '已处理',
        assigned: '已确认',
    }
    return processObj[process] || process
}

/**
 * 翻译事件活跃状态
 * @param {*} alive
 * @returns {String} 活跃 | 不活跃
 */
export function translateEventActive(alive) {
    const aliveObj = {
        0: '不活跃',
        1: '活跃',
    }
    return aliveObj[alive] || alive
}

/**
 * 翻译事件类型
 * @param {*} type
 * @returns {String} 对应的事件类型
 */
export function translateEventType(type) {
    return EventConfig[type] ? EventConfig[type].name : type
}

/**
 * 翻译事件的配置字段
 * @param {String} key 要翻译的字段
 * @returns {String} 返回翻译内容
 */
export function translateEventConfigLable(key) {
    return eventConfigFormDict[key] || key
}

/**
 * 翻译事件的详细配置字段
 * @param {String} key 要翻译的字段
 * @param {String} eventType 事假类型
 * @returns {String} 返回翻译内容
 */
export function translateEventDetailConfigLable(key, eventType) {
    if (!EventConfig[eventType]) return key
    const { dict = {} } = EventConfig[eventType].config
    return dict[key] || key
}

// =============================== 解析类别 ===============================
/**
 * 事件obj字段拆分,通过事件类型找到配置中的ObjOrder。通过ObjOrder序列顺序找到受害目标和攻击目标。
 * Obj组合中 协议和扩展信息的顺序是固定的。
 * @param {*} eventData
 * @returns {Array} [受害IP，受害端口，攻击IP，攻击端口，协议，扩展信息]
 */
export function splitEventObj(event) {
    const splitObj = event.obj.split(' ')
    const ipArr = chain(splitObj[0])
        .split('>')
        .map(d => d.split(':'))
        .flatten()
        .value()
    const [, proto, extendInfo1, extendInfo2] = splitObj
    const { objOrder } = EventConfig[event.type]
    const victimIp = ipArr[objOrder[0]]
    const victimPort = ipArr[objOrder[1]]
    const attackIp = ipArr[objOrder[2]]
    const attackPort = ipArr[objOrder[3]]
    return [
        victimIp,
        victimPort,
        attackIp,
        attackPort,
        proto,
        extendInfo1, // 情报信息或者标签信息
        extendInfo2, // 域名信息
    ]
}

export function isDnsTypeEvent(event) {
    return ['dns', 'dns_tun', 'dga'].includes(
        isObject(event) ? event.type : event
    )
}

/**
 * 计算威胁来源和受害目标，是直接解析的设备名称。
 * !注意在dns和dga类型中，攻击源用域名显示
 * @param {*} eventData 事件原始数据
 * @returns {Array} [受害设备，威胁设备，协议，扩展信息]
 */
export function getEventDevice(eventData) {
    const [
        victimIp,
        victimPort,
        attackIp,
        ,
        proto,
        extendInfo1,
        extendInfo2,
    ] = splitEventObj(eventData)
    const victimDevice = victimIp || victimPort // 受害设备
    // dns和dns_tun的威胁来源使用域名
    const attackDevice = isDnsTypeEvent(eventData)
        ? extendInfo1 || attackIp
        : attackIp // 威胁设备

    if (eventData.type === 'mining' && eventData.model === 2 && extendInfo2) {
        return [victimDevice, extendInfo2, proto, extendInfo1]
    }
    return [victimDevice, attackDevice, proto, extendInfo1]
}

/**
 * 获取情报事件中的具体情报类型
 * @param {*} eventData 事件原始数据
 * @returns {Array} 威胁类型数组
 */
export function getTitype(event) {
    if (event.type !== 'ti') return []
    return chain(splitEventObj(event)[5]).split('|').map(translateTiTag).value()
}

/**
 * 获取 DNS 事件中的具体情报类型
 * @param {*} eventData 事件原始数据
 * @returns {Array} 威胁类型数组
 */
export function getDnstype(event) {
    if (event.type !== 'dns') return []
    return chain(splitEventObj(event)[4]).split('|').map(translateTiTag).value()
}

/**
 * 获取情报事件中的具体情报类型
 * @param {*} eventData 事件原始数据
 * @returns {Array} 威胁类型数组
 */
export function getCapType(event) {
    if (event.type !== 'cap') return []
    return splitEventObj(event)[5].split('|')
}

/**
 * 获取挖矿事件中的币种类型
 * @param {*} eventData 事件原始数据
 * @returns {Array} 币种类型数组
 */
export function getMiningType(event) {
    return splitEventObj(event)[5]
        .split('|')
        .filter(d => d)
}

// =============================== 由事件衍生出的其他数据 ===============================

/**
 * 获取事件对应的流量的过滤语句
 * @param {*} eventData
 * @returns {Array} [受害IP，受害端口，攻击IP，攻击端口，协议，扩展信息]
 */
export function getEventFilter(eventData) {
    let [ip, , pip] = splitEventObj(eventData)
    const [, port, , pport] = splitEventObj(eventData)
    ip += ip && !ip.includes('/') ? '/32' : ''
    pip += pip && !pip.includes('/') ? '/32' : ''
    let filter = ''
    let ipstr = ip ? `net ${ip}` : ''
    if (ipstr && ipstr.indexOf('!') > -1) {
        ipstr = `not ${ipstr.replace('!', '')}`
    }
    let portstr = port ? `port ${port}` : ''
    portstr = ipstr && portstr ? ` and ${portstr}` : portstr
    let pipstr = pip ? `net ${pip}` : ''
    if (pipstr && pipstr.indexOf('!') > -1) {
        pipstr = `not ${pipstr.replace('!', '')}`
    }
    pipstr = (ipstr || portstr) && pipstr ? ` and ${pipstr}` : pipstr
    let pportstr = pport ? `port ${pport}` : ''
    pportstr =
        (ipstr || portstr || pipstr) && pportstr ? ` and ${pportstr}` : pportstr
    filter =
        ipstr +
        (ipstr ? ' ' : '') +
        portstr +
        (portstr ? ' ' : '') +
        pipstr +
        (pipstr ? ' ' : '') +
        pportstr
    filter = filter.replace(/(^\s*)|(\s*$)/g, '')
    filter = filter.replace(/(\s{2})/g, ' ')
    return filter
}

/**
 * 事件关于特征接口的参数计算，常规请求是Tcpinit接口，但是对于DNS类型的事件，需要查询DNS接口
 * @param {*} event 事件原始数据
 * @param {*} selectName 选中的设备
 * @returns {Object}
 */
export function getEventFeatureParams(event, selectDevice) {
    const [
        victimIp,
        victimPort,
        attackIp,
        attackPort,
        ,
        extendInfo1,
        extendInfo2,
    ] = splitEventObj(event)
    const { endtime, devid, model, type } = event

    const featureParams = {
        endtime,
        devid,
        type: 'tcpinit',
    }
    if (isDnsTypeEvent(event) || (type === 'mining' && model === 2)) {
        return {
            ...featureParams,
            sip: victimIp,
            qname: type === 'mining' ? extendInfo2 : extendInfo1,
            type: ['dns', 'mining'].includes(type) ? 'dns' : 'dns_tun',
        }
    }
    switch (event.type) {
        case 'srv':
            ;[featureParams.dip, featureParams.dport] = [victimIp, victimPort]
            break
        case 'port_scan':
            ;[featureParams.dport, featureParams.sip] = [victimPort, attackIp]
            break
        default:
            if (
                [`${victimIp}:${victimPort}`, victimIp, victimPort].includes(
                    selectDevice
                )
            ) {
                ;[featureParams.sip, featureParams.dip, featureParams.dport] = [
                    victimIp,
                    attackIp,
                    attackPort,
                ]
            } else {
                ;[featureParams.dip, featureParams.dport, featureParams.sip] = [
                    victimIp,
                    victimPort,
                    attackIp,
                ]
            }
            break
    }
    return featureParams
}

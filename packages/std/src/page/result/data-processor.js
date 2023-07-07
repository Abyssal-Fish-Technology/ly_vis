import { calculateTags } from '@shadowflow/components/utils/universal/methods-table'
import {
    formatDuration,
    formatTimestamp,
} from '@shadowflow/components/utils/universal/methods-time'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import { chain, filter, find, has, maxBy, sortBy, sumBy, uniq } from 'lodash'
import { calculateTopnDir } from './config'

function calculatePublicFields(currentData, type) {
    const { data } = currentData
    currentData.data = data.map(d => {
        const {
            bytes = '',
            pkts = '',
            flows = '',
            time = '',
            duration = '',
            bwclass = '',
            qtype = '',
            srv_mark = '',
            ti_mark = '',
        } = d

        let showTopnDir = ''
        if (srv_mark) {
            if (type !== 'tcp') {
                showTopnDir = calculateTopnDir(
                    srv_mark === 'res' ? 'right' : 'left'
                )
            } else {
                showTopnDir = srv_mark === 'res' ? '有响应' : '仅请求'
            }
        }
        if (ti_mark) {
            showTopnDir = calculateTopnDir(ti_mark === 'res' ? 'left' : 'right')
        }

        return {
            ...d,
            showTopnDir,
            showTime: time ? formatTimestamp(time) : '-',
            showDuration: formatDuration(duration),
            showBwclass: bwclass ? calculateTags(bwclass, '|', 'ti') : '',
            showQtype: qtype ? calculateTags(qtype, '|') : '-',
            showBytes: arrangeAlerm(bytes),
            showPkts: arrangeAlerm(pkts),
            showFlows: arrangeAlerm(flows),
        }
    })
    currentData.count = data.length
    currentData.bytes = sumBy(data, 'bytes')
    currentData.pkts = sumBy(data, 'pkts')
    currentData.flows = sumBy(data, 'flows')
    currentData.showBytes = arrangeAlerm(currentData.bytes)
    currentData.showPkts = arrangeAlerm(currentData.pkts)
    currentData.showFlows = arrangeAlerm(currentData.flows)

    if (find(data, d => has(d, 'bwclass'))) {
        currentData.bwclass = chain(data)
            .map(d1 => {
                return d1.bwclass.split('|')
            })
            .flatten()
            .uniq()
            .compact()
            .value()
        currentData.showBwclass = currentData.bwclass.length
            ? calculateTags(currentData.bwclass.join('|'), '|', 'ti')
            : ''
    }
}

export const tcpinit = data => {
    return chain(data)
        .reduce((aggreObj, item) => {
            const key = `${item.sip}-${item.dport}-${item.dip}`
            const tempData = sortBy(
                [item].concat(aggreObj[key] ? aggreObj[key].data : []),
                'time'
            )
            aggreObj[key] = {
                sip: item.sip,
                dport: item.dport,
                dip: item.dip,
                data: tempData,
                type: 'tcpinit',
            }
            return aggreObj
        }, {})
        .each(d => {
            calculatePublicFields(d, 'tcp')
            const dataArr = d.data
            d.protocol = chain(dataArr)
                .map('protocol')
                .uniq()
                .filter(a => a)
                .value()
            d.app_proto = chain(dataArr)
                .map('app_proto')
                .uniq()
                .filter(a => a)
                .value()
            d.retcode = chain(dataArr)
                .map('retcode')
                .uniq()
                .filter(a => a)
                .value()
            d.showTopnDir = chain(dataArr)
                .map('srv_mark')
                .value()
                .includes('res')
                ? '有响应'
                : '仅请求'
            const lastTimeData = maxBy(dataArr, 'time')
            d.duration = lastTimeData.duration
            d.showDuration = formatDuration(d.duration)
            d.lastTime = lastTimeData.time
            d.showLastTime = formatTimestamp(d.lastTime)
            ;[d.Bps, d.pps, d.fps] = [d.bytes * 8, d.pkts, d.flows].map(
                _d => _d / (d.duration || 1)
            )
        })
        .values()
        .orderBy('count', 'desc')
        .value()
}

export const dns = data => {
    return chain(data)
        .reduce((aggreObj, item) => {
            const key = `${item.qname}-${item.sip}`
            const tempData = sortBy(
                [item].concat(aggreObj[key] ? aggreObj[key].data : []),
                'time'
            )
            aggreObj[key] = {
                qname: item.qname,
                data: tempData,
                sip: item.sip,
                type: 'dns',
            }
            return aggreObj
        }, {})
        .values()
        .each(d => {
            calculatePublicFields(d)
            const dataArr = d.data
            d.qtype = chain(dataArr).map('qtype').uniq().value().join('|')
            d.showQtype = calculateTags(d.qtype, '|')
            d.dnsSrvCount = chain(dataArr).map('dip').uniq().value().length

            const lastTimeData = maxBy(dataArr, 'time')
            d.lastTime = lastTimeData.time
            d.showLastTime = formatTimestamp(d.lastTime)
        })
        .values()
        .orderBy('count', 'desc')
        .value()
}

export const scan = data => {
    return chain(data)
        .reduce((aggreObj, item) => {
            const key = `${item.sip}-${item.dport}`
            const tempData = sortBy(
                [item].concat(aggreObj[key] ? aggreObj[key].data : []),
                'time'
            )
            aggreObj[key] = {
                sip: item.sip,
                dport: item.dport,
                data: tempData,
                type: 'scan',
            }
            return aggreObj
        }, {})
        .values()
        .each(d => {
            calculatePublicFields(d)
            const dataArr = d.data
            d.protocol = chain(dataArr).map('protocol').uniq().value()
            const lastTimeData = maxBy(dataArr, 'time')
            d.duration = lastTimeData.duration
            d.showDuration = formatDuration(d.duration)
            d.lastTime = lastTimeData.time
            d.showLastTime = formatTimestamp(d.lastTime)
            ;[d.Bps, d.pps, d.fps] = [d.bytes * 8, d.pkts, d.flows].map(
                _d => _d / (d.duration || 1)
            )
        })
        .values()
        .orderBy('count', 'desc')
        .value()
}

export const sus = data => {
    return chain(data)
        .reduce((aggreObj, item) => {
            // ti_mark = res时 流量方向 threat <-- normalIp;
            const key = item.sip + item.dip
            const tempData = sortBy(
                [item].concat(aggreObj[key] ? aggreObj[key].data : []),
                'time'
            )

            aggreObj[key] = {
                sip: item.sip,
                dip: item.dip,
                data: tempData,
                type: 'sus',
            }
            return aggreObj
        }, {})
        .values()
        .each(d => {
            calculatePublicFields(d)
            const dataArr = d.data
            const lastTimeData = maxBy(dataArr, 'time')
            d.duration = lastTimeData.duration
            d.showDuration = formatDuration(d.duration)
            d.lastTime = lastTimeData.time
            d.showLastTime = formatTimestamp(d.lastTime)
            d.protocol = chain(dataArr).map('protocol').uniq().value()

            // resData代表的是 威胁IP <-- 连接IP的数量。
            const resData = filter(dataArr, d1 => {
                return d1.ti_mark === 'res'
            })
            const resCount = resData.length
            const reqData = filter(dataArr, d1 => {
                return d1.ti_mark === 'req'
            })
            d.resData = resData
            d.reqData = reqData
            d.showTopnDir = resData.length || reqData.length
            let connectType = ''
            if (resCount === dataArr.length) {
                connectType = 'vToT'
            } else if (resCount === 0) {
                connectType = 'tToV'
            } else {
                connectType = 'loop'
            }
            d.connectType = connectType
            ;[d.Bps, d.pps, d.fps] = [d.bytes * 8, d.pkts, d.flows].map(
                _d => _d / (d.duration || 1)
            )
        })
        .orderBy('count', 'desc')
        .value()
}

export const black = data => {
    return chain(data)
        .reduce((aggreObj, item) => {
            const key = `${item.sip}-${item.dip}`
            const tempData = sortBy(
                [item].concat(aggreObj[key] ? aggreObj[key].data : []),
                'time'
            )
            aggreObj[key] = {
                sip: item.sip,
                dip: item.dip,
                data: tempData,
                type: 'black',
            }
            return aggreObj
        }, {})
        .values()
        .each(d => {
            calculatePublicFields(d)
            const dataArr = d.data
            d.protocol = chain(dataArr).map('protocol').uniq().value()
            const lastTimeData = maxBy(dataArr, 'time')
            d.duration = lastTimeData.duration
            d.showDuration = formatDuration(d.duration)
            d.lastTime = lastTimeData.time
            d.showLastTime = formatTimestamp(d.lastTime)
            // resData代表的是 blackIp <-- 连接IP的数量。
            const resData = filter(dataArr, d1 => {
                return d1.ti_mark === 'res'
            })
            const resCount = resData.length
            const reqData = filter(dataArr, d1 => {
                return d1.ti_mark === 'req'
            })
            d.resData = resData
            d.reqData = reqData
            d.showTopnDir = resData.length || reqData.length
            let connectType = ''
            if (resCount === dataArr.length) {
                connectType = 'vToT'
            } else if (resCount === 0) {
                connectType = 'tToV'
            } else {
                connectType = 'loop'
            }
            d.connectType = connectType
            ;[d.Bps, d.pps, d.fps] = [d.bytes * 8, d.pkts, d.flows].map(
                _d => _d / (d.duration || 1)
            )
        })
        .orderBy('count', 'desc')
        .value()
}

export const service = data => {
    return chain(data)
        .reduce((aggreObj, item) => {
            const key = `${item.ip}-${item.port}`
            const tempData = chain([item])
                .concat(aggreObj[key] ? aggreObj[key].data : [])
                .sortBy('time')
                .value()

            aggreObj[key] = {
                ip: item.ip,
                port: item.port,
                data: tempData,
                type: 'service',
            }
            return aggreObj
        }, {})
        .each(d => {
            calculatePublicFields(d)
            const dataArr = d.data
            d.protocol = chain(dataArr).map('protocol').uniq().value()
            const lastTimeData = maxBy(dataArr, 'time')
            d.lastTime = lastTimeData.time
            d.showLastTime = formatTimestamp(d.lastTime)
            d.duration = lastTimeData.duration
            d.showDuration = formatDuration(d.duration)

            // resData代表的是 服务 --> 连接IP的数量。
            const resData = filter(dataArr, d1 => {
                return d1.srv_mark === 'res'
            })
            const resCount = resData.length
            const reqData = filter(dataArr, d1 => {
                return d1.srv_mark === 'req'
            })
            d.resData = resData
            d.reqData = reqData
            d.showTopnDir = resData.length || reqData.length
            let connectType = 'loop'
            if (resCount === dataArr.length) {
                connectType = 'tToV'
            } else if (resCount === 0) {
                connectType = 'vToT'
            }
            d.connectType = connectType
            ;[d.Bps, d.pps, d.fps] = [d.bytes * 8, d.pkts, d.flows].map(
                _d => _d / (d.duration || 1)
            )
        })
        .values()
        .orderBy('count', 'desc')
        .value()
}

export function tcpinitStatic(data, ip, justCount = true) {
    const connectCount = {
        全部连接: data.length,
        作为发起方: data.filter(d => d.sip === ip).length,
        作为接收方: data.filter(d => d.dip === ip).length,
    }
    const flowCount = {
        bytes: arrangeAlerm(sumBy(data, 'bytes')),
    }
    return !justCount ? { connectCount, flowCount } : connectCount
}
export function dnsStatic(data, ip, justCount = true) {
    const connectCount = {
        全部连接: data.length,
    }
    const flowCount = {
        bytes: arrangeAlerm(sumBy(data, 'bytes')),
    }
    return !justCount ? { connectCount, flowCount } : connectCount
}
export function dns_tunStatic(data, ip, justCount = true) {
    const connectCount = {
        全部连接: data.length,
    }
    const flowCount = {
        bytes: arrangeAlerm(sumBy(data, 'bytes')),
    }
    return !justCount ? { connectCount, flowCount } : connectCount
}
export function scanStatic(data, ip, justCount = true) {
    const flatData = data.map(d => d.data).flat(1)
    const connectCount = {
        扫描源: uniq(flatData, 'sip').length,
        扫描端口: data.length,
    }
    const flowCount = {
        bytes: arrangeAlerm(sumBy(data, 'bytes')),
    }
    const flowRate = {
        Bps: arrangeAlerm((maxBy(data, 'Bps') || {}).Bps || 0),
        fps: arrangeAlerm((maxBy(data, 'fps') || {}).fps || 0),
        pps: arrangeAlerm((maxBy(data, 'pps') || {}).pps || 0),
    }

    return !justCount ? { connectCount, flowRate, flowCount } : connectCount
}
export function susStatic(data, ip, justCount = true) {
    const connectCount = {
        全部连接: data.length,
        互相连接: data.filter(d => d.connectType === 'loop').length,
        威胁发起: data.filter(d => d.connectType === 'vToT').length,
        受害发起: data.filter(d => d.connectType === 'tToV').length,
    }
    const flowCount = {
        sbytes: arrangeAlerm(
            chain(data)
                .map(d => sumBy(d.reqData, 'bytes'))
                .sum()
                .value()
        ),
        dbytes: arrangeAlerm(
            chain(data)
                .map(d => sumBy(d.resData, 'bytes'))
                .sum()
                .value()
        ),
        bytes: arrangeAlerm(sumBy(data, 'bytes')),
    }
    const flowRate = {
        Bps: arrangeAlerm((maxBy(data, 'Bps') || {}).Bps || 0),
        fps: arrangeAlerm((maxBy(data, 'fps') || {}).fps || 0),
        pps: arrangeAlerm((maxBy(data, 'pps') || {}).pps || 0),
    }
    return !justCount ? { connectCount, flowRate, flowCount } : connectCount
}
export function blackStatic(data, ip, justCount = true) {
    const connectCount = {
        全部连接: data.length,
        互相连接: data.filter(d => d.connectType === 'loop').length,
        黑名单发起: data.filter(d => d.connectType === 'vToT').length,
        受害发起: data.filter(d => d.connectType === 'tToV').length,
    }
    const flowCount = {
        sbytes: arrangeAlerm(
            chain(data)
                .map(d => sumBy(d.reqData, 'bytes'))
                .sum()
                .value()
        ),
        dbytes: arrangeAlerm(
            chain(data)
                .map(d => sumBy(d.resData, 'bytes'))
                .sum()
                .value()
        ),
        bytes: arrangeAlerm(sumBy(data, 'bytes')),
    }
    const flowRate = {
        Bps: arrangeAlerm((maxBy(data, 'Bps') || {}).Bps || 0),
        fps: arrangeAlerm((maxBy(data, 'fps') || {}).fps || 0),
        pps: arrangeAlerm((maxBy(data, 'pps') || {}).pps || 0),
    }
    return !justCount ? { connectCount, flowRate, flowCount } : connectCount
}
export function serviceStatic(data, ip, justCount = true) {
    const connectCount = {
        服务端口: data.length,
        仅外连服务: data.filter(d => d.connectType === 'tToV').length,
        无响应服务: data.filter(d => d.connectType === 'vToT').length,
    }
    const flowCount = {
        sbytes: arrangeAlerm(
            chain(data)
                .map(d => sumBy(d.reqData, 'bytes'))
                .sum()
                .value()
        ),
        dbytes: arrangeAlerm(
            chain(data)
                .map(d => sumBy(d.resData, 'bytes'))
                .sum()
                .value()
        ),
        bytes: arrangeAlerm(sumBy(data, 'bytes')),
    }
    const flowRate = {
        Bps: arrangeAlerm((maxBy(data, 'Bps') || {}).Bps || 0),
        fps: arrangeAlerm((maxBy(data, 'fps') || {}).fps || 0),
        pps: arrangeAlerm((maxBy(data, 'pps') || {}).pps || 0),
    }
    return !justCount ? { connectCount, flowRate, flowCount } : connectCount
}

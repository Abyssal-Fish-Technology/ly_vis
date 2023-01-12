import {
    formatTimestamp,
    formatDuration,
} from '@shadowflow/components/utils/universal/methods-time'
import {
    getCapType,
    getDnstype,
    getEventDevice,
    getMiningType,
    getTitype,
    splitEventObj,
    translateEventActive,
    translateEventLevel,
    translateEventProcess,
    translateEventType,
} from '@shadowflow/components/system/event-system'
import { chain, countBy, find } from 'lodash'
import { getIpAssetInfo } from '@shadowflow/components/utils/business/methods-asset'
import overallSituationStore from '@/layout/components/overall-situation/store'
import { eventStatusMod } from '@/service'
import { message } from 'antd'
import { reaction } from 'mobx'
import { useEffect } from 'react'

/**
 * 获取事件的资产信息
 * @param {eventObj} event 事件原始数据
 * @returns {Array} 事件的资产描述信息
 */
function getEventAssetDesc(event) {
    const ipArr = splitEventObj(event)
    return chain([ipArr[0], ipArr[2]])
        .compact()
        .uniq()
        .map(d => getIpAssetInfo(d).uniqDescArr)
        .flatten()
        .uniq()
        .value()
}

/**
 * 这个事件阶段计算只是临时性的，需要等到真正的事件接口改造完成后，再进行进一步的修改或者移除。
 */
const stageObj = chain({
    探测阶段: [
        'ip_scan',
        'port_scan',
        'PSH',
        'FSA',
        'DKN',
        'WRZ',
        'GAB',
        'black',
        'ATS',
        'RSM',
        'SCN',
        'HJK',
        'PUP',
        'EXP',
        'TRF',
    ],
    渗透阶段: ['dga', 'srv', 'cmd', 'code', 'file', 'sql', 'xss', 'webshell'],
    沦陷阶段: [
        'frn_trip',
        'mining',
        'Mining',
        'mine',
        'dns_tun',
        'icmp_tun',
        'BOT',
        'TRO',
        'CCH',
    ],
    未知阶段: ['mo'],
})
    .entries()
    .reduce((obj, d) => {
        const [stage, typeArr] = d
        typeArr.forEach(typeItem => {
            obj[typeItem] = stage
        })
        return obj
    }, {})
    .value()

function getEventStage(formateEventData) {
    const { type, detailType = [] } = formateEventData
    return stageObj[type] || stageObj[detailType[0]] || '未知'
}

/**
 * 将事件原始数据附加多个属性，变为一级业务数据
 * @param {Array} event 事件原始数据
 * @returns {Array} 业务数据
 */
export function formatEventData(eventArr = []) {
    return eventArr.map(d => {
        const [
            victimIp,
            victimPort,
            attackIp,
            attackPort,
            protocol,
            ,
            extraInfo,
        ] = splitEventObj(d)
        const [victimDevice, attackDevice] = getEventDevice(d)
        const tiLabel = d.type === 'ti' ? getTitype(d) : []
        const capLabel = d.type === 'cap' ? getCapType(d) : []
        const miningLabel = d.type === 'mining' ? getMiningType(d) : []
        const dnsTiLable = d.type === 'dns' ? getDnstype(d) : []
        const detailType = [
            ...tiLabel,
            ...capLabel,
            ...miningLabel,
            ...dnsTiLable,
        ]
        const internalDescArr = getEventAssetDesc(d)
        const modelObj = {
            0: '经验模型',
            1: 'AI',
            2: '情报',
            3: '包检测',
        }
        const stage = getEventStage({ detailType, type: d.type })
        return {
            // 原始数据
            ...d,
            // 资产信息
            asset_desc:
                internalDescArr.length > 0
                    ? internalDescArr.sort()
                    : ['未录入'],
            isInternal: internalDescArr.length > 0,
            // 设备拆分
            victimIp,
            victimPort,
            attackIp,
            attackPort,
            attackDevice,
            victimDevice,
            protocol: d.type === 'dns' ? '' : protocol,
            tiLabel,
            capLabel,
            detailType,
            extraInfo,
            stage,
            // 语义化翻译
            show_type: translateEventType(d.type),
            show_is_alive: translateEventActive(d.is_alive),
            show_proc_status: translateEventProcess(d.proc_status),
            sort_proc_status: translateEventProcess(d.proc_status, true),
            show_level: translateEventLevel(d.level),
            show_starttime: formatTimestamp(d.starttime, 'min'),
            show_endtime: formatTimestamp(d.endtime, 'min'),
            show_duration: formatDuration(d.duration * 60),
            show_model: modelObj[d.model],
            sort_level: translateEventLevel(d.level, true),
        }
    })
}

/**
 * 单个事件
 * @param {*} param0
 * @returns
 */
export function singleHandleEvent({
    id,
    proc_status,
    proc_comment = '',
    isRefresh = true,
    changeLoading = false,
}) {
    if (changeLoading) {
        changeLoading(true)
    }
    return new Promise((resolve, reject) => {
        eventStatusMod({
            proc_status,
            proc_comment,
            op: 'mod',
            id,
        }).then(res => {
            if (res.length === 0) {
                if (isRefresh) {
                    message.success('操作成功！')
                    overallSituationStore.changeUpdateList([
                        { id, proc_status, proc_comment },
                    ])
                }
                resolve({ id, status: proc_status })
            } else {
                reject()
            }
        })
    })
}

export function batchHandleEvent({
    idList,
    status,
    changeIdlist,
    changeLoading,
}) {
    if (idList.length < 1) {
        message.warning('请选择待处理数据。')
        return false
    }
    changeLoading(true)
    const obj = {}
    const promiseArr = idList.map(id => {
        return singleHandleEvent({
            id,
            proc_status: status,
            isRefresh: false,
        }).then(() => {
            obj[id] = status
        })
    })

    return Promise.allSettled(promiseArr)
        .then(results => {
            const { fulfilled, rejected } = countBy(results, 'status')
            if (fulfilled === idList.length) {
                message.success('操作成功！')
                changeIdlist([])
            } else {
                const lastKey = idList.filter(d => !obj[d])
                changeIdlist(lastKey)
                message.warning(`${rejected}件操作失败!`)
            }
            const statusList = idList.map(id => ({
                id,
                proc_status: status,
            }))
            overallSituationStore.changeUpdateList(statusList)
        })
        .catch(e => {
            message.error(e)
            changeLoading(false)
        })
}

/**
 * 触发eventdata更新的自定义hooks
 * @param {*} getDataFn 数据请求方法
 * @param {*} params  请求参数
 */
export function useEventUpdate(changeProcessed) {
    useEffect(() => {
        const dispose = reaction(
            () => overallSituationStore.updateList,
            d => {
                if (d.length) {
                    changeProcessed(d)
                    setTimeout(() => {
                        overallSituationStore.changeUpdateList([])
                    }, 200)
                }
            },
            {
                fireImmediately: true,
            }
        )
        return () => {
            dispose()
        }
    }, [changeProcessed])
}

export function calculateUpdatedEventData(eventData, updateList) {
    const resultData = eventData.map(d => {
        const { proc_status, proc_comment } =
            find(updateList, d1 => d1.id === d.id) || {}
        return {
            ...d,
            proc_status: proc_status || d.proc_status,
            proc_comment: proc_comment || d.proc_comment,
            show_proc_status: translateEventProcess(
                proc_status || d.proc_status
            ),
        }
    })
    return resultData
}

/**
 * 计算icmp协议type、code、description，主要用在event_feature接口中
 * @param {*} dport type+code16位二进制转换的10进制数
 * @returns type、code、description
 */
export function calculateIcmpType(dport = 0) {
    const icmpTypeArr = [
        {
            type: 0,
            code: 0,
            description: 'Ping应答',
        },
        {
            type: 3,
            code: 0,
            description: '网络不可达',
        },
        {
            type: 3,
            code: 1,
            description: '主机不可达',
        },
        {
            type: 3,
            code: 2,
            description: '协议不可达',
        },
        {
            type: 3,
            code: 3,
            description: '端口不可达',
        },
        {
            type: 3,
            code: 4,
            description: '需要进行分片但设置不分片比特',
        },
        {
            type: 3,
            code: 5,
            description: '源站选路失败',
        },
        {
            type: 3,
            code: 6,
            description: '目的网络未知',
        },
        {
            type: 3,
            code: 7,
            description: '目的主机未知',
        },
        {
            type: 3,
            code: 8,
            description: '源主机被隔离',
        },
        {
            type: 3,
            code: 9,
            description: '目的网络被强制禁止',
        },
        {
            type: 3,
            code: 10,
            description: '目的主机被强制禁止',
        },
        {
            type: 3,
            code: 11,
            description: '由于服务类型TOS，网络不可达',
        },
        {
            type: 3,
            code: 12,
            description: '由于服务类型TOS，主机不可达',
        },
        {
            type: 3,
            code: 13,
            description: '由于过滤，通信被强制禁止',
        },
        {
            type: 3,
            code: 14,
            description: '主机越权',
        },
        {
            type: 3,
            code: 15,
            description: '优先中止生效',
        },
        {
            type: 4,
            code: 0,
            description: '源端被关闭（基本流控制）',
        },
        {
            type: 5,
            code: 0,
            description: '对网络重定向',
        },
        {
            type: 5,
            code: 1,
            description: '对主机重定向',
        },
        {
            type: 5,
            code: 2,
            description: '对服务类型和网络重定向',
        },
        {
            type: 5,
            code: 3,
            description: '对服务类型和主机重定向',
        },
        {
            type: 8,
            code: 0,
            description: 'Ping请求',
        },
        {
            type: 9,
            code: 0,
            description: '路由器通告',
        },
        {
            type: 10,
            code: 0,
            description: '路由器请求',
        },
        {
            type: 11,
            code: 0,
            description: '传输期间生存时间为0',
        },
        {
            type: 11,
            code: 1,
            description: '在数据报组装期间生存时间为0',
        },
        {
            type: 12,
            code: 0,
            description: '坏的IP首部（包括各种差错）',
        },
        {
            type: 12,
            code: 1,
            description: '缺少必需的选项',
        },
        {
            type: 13,
            code: 0,
            description: '时间戳请求',
        },
        {
            type: 15,
            code: 0,
            description: '信息请求',
        },
        {
            type: 16,
            code: 0,
            description: '信息应答',
        },
        {
            type: 17,
            code: 0,
            description: '地址掩码请求',
        },
        {
            type: 18,
            code: 0,
            description: '地址掩码应答',
        },
    ]
    // 10进制转为2进制，然后补全为16位的二进制数，高八位为type，低8位为code，分别转位10进制后返回结果
    const formatStr = parseInt(dport, 10).toString(2)
    const spliceStr = Array(16 - formatStr.length)
        .fill(0)
        .join('')
    const resultStr = `${spliceStr}${formatStr}`
    const [typeStr, codeStr] = [resultStr.slice(0, 8), resultStr.slice(8)]
    const { description = '', code = '', type = '' } =
        find(
            icmpTypeArr,
            d =>
                d.type === parseInt(typeStr, 2) &&
                d.code === parseInt(codeStr, 2)
        ) || {}
    return {
        type,
        code,
        description,
    }
}

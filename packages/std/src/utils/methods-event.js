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

export function calculateIcmpType(icmp_type) {
    const icmpTypeObj = {
        0: '响应应答',
        3: '不可到达',
        4: '源抑制',
        5: '重定向',
        8: '响应请求',
        11: '超时',
        12: '参数失灵',
        13: '时间戳请求',
        14: '时间戳应答',
        17: '地址掩码请求',
        18: '地址掩码应答',
        30: '路由跟踪',
    }
    return icmpTypeObj[icmp_type]
}

import {
    BlackListIcon,
    DDosIcon,
    DNSIcon,
    DNSTunIcon,
    MoIcon,
    TiIcon,
    MiningIcon,
    IpScanIcon,
    IcmpTunIcon,
    CapIcon,
    UrlIcon,
} from '@shadowflow/components/ui/icon/icon-util'
import { eventGet } from '@/service'
import {
    AlertOutlined,
    DatabaseOutlined,
    ScanOutlined,
} from '@ant-design/icons'
import { chain, countBy, differenceWith, sumBy } from 'lodash'
import { action, computed, observable } from 'mobx'
import { formatTimestamp } from '@shadowflow/components/utils/universal/methods-time'
import { EventConfig } from '@shadowflow/components/system/event-system'
import {
    calculateUpdatedEventData,
    formatEventData,
} from '@/utils/methods-event'
import { getStorage } from '@shadowflow/components/utils/universal/methods-storage'

const joinSign = '-ly-'
export default class OverviewOmStore {
    // 事件过滤
    @observable assetEvent = true

    @action.bound changeAssetEvent = newAssetEvent => {
        this.assetEvent = newAssetEvent
    }

    // =============================== 事件获取 ===============================
    // ============== 格式化后的的数据 ==============
    @observable formatData = []

    @action.bound getEventData() {
        return eventGet({ ...this.params })
            .then(res => {
                const result =
                    Object.prototype.toString.call(res) === '[object Array]'
                        ? res
                        : []
                this.formatData = formatEventData(result)
                this.assetEvent = sumBy(this.formatData, d => d.isInternal) > 0

                this.getEditEventType()
            })
            .catch(() => {})
    }

    // ============== 实际的业务数据 ==============
    @computed get eventData() {
        const disabledTypeArr = []
        Object.entries(this.disabledObj).forEach(d => {
            if (d[1]) disabledTypeArr.push(d[0])
        })
        const showTypeArr = this.finalEventType.map(d => d.type)
        const useEventData = this.formatData.filter(
            d =>
                !disabledTypeArr.includes(d.type) &&
                showTypeArr.includes(d.type) &&
                (this.assetEvent ? d.isInternal : true)
        )

        return useEventData
    }

    // ============== 待处理数据 ==============
    @computed get unprocessedData() {
        // return this.eventData
        return this.eventData.filter(d => d.proc_status === 'unprocessed')
    }

    // ============== 事件类型 ==============

    @computed get eventTypeArr() {
        const newEventTypeArr = this.finalEventType.map(d => {
            return {
                ...d,
                value: this.formatData.filter(
                    d1 =>
                        d1.type === d.type &&
                        (this.assetEvent ? d1.isInternal : true)
                ).length,
                disabled: this.disabledObj[d.type],
            }
        })
        return newEventTypeArr
    }

    @observable disabledObj = Object.keys(EventConfig).reduce((obj, d) => {
        obj[d] = false
        return obj
    }, {})

    @action.bound changeDisabledObj(key, value) {
        this.disabledObj[key] = value
    }

    // ============== 编辑事件类型 ==============
    @observable editModalVis = false

    @action.bound openEditModal() {
        this.editModalVis = true
    }

    @action.bound closeEditModal() {
        this.editModalVis = false
        this.saveEventType()
    }

    constructor() {
        this.EVENT_ICONS = {
            mo: MoIcon,
            black: BlackListIcon,
            ti: TiIcon,
            srv: DDosIcon,
            port_scan: ScanOutlined,
            ip_scan: IpScanIcon,
            dns: DNSIcon,
            dns_tun: DNSTunIcon,
            frn_trip: DatabaseOutlined,
            mining: MiningIcon,
            icmp_tun: IcmpTunIcon,
            cap: CapIcon,
            url_content: UrlIcon,
        }
    }

    /**
     * 当离开EventEditModal的时候，
     * 就会把最终的决定展示的EventType赋值给FinalEventType
     * 也就是说finalEventType是最终控制页面数据的。
     */
    @observable finalEventType = []

    @action.bound calcualteFinalEventType() {
        this.finalEventType = this.editEventType
            .slice()
            .sort((a, b) => a.index - b.index)
            .filter(d => d.show)
    }

    @action.bound saveEventType() {
        localStorage.setItem(
            'ly-eventtype',
            JSON.stringify(
                this.editEventType.map(d => ({
                    name: d.name,
                    type: d.type,
                    show: d.show,
                    index: d.index,
                }))
            )
        )
        this.calcualteFinalEventType()
    }

    /**
     * 这个是只存在于EventEditModal内部的变量。
     * 用来控制调整EventType是否展示和展示顺序。
     */
    @observable editEventType = []

    @action.bound getEditEventType() {
        let storageEventType = getStorage('ly-eventtype') || []
        const contrastEventType = () => {
            const diffArr = differenceWith(
                Object.values(EventConfig),
                storageEventType,
                (d1, d2) => d1.name === d2.name && d1.type === d2.type
            )
            return diffArr.length > 0
        }

        if (contrastEventType()) {
            storageEventType = Object.values(EventConfig).map((d, i) => ({
                name: d.name,
                type: d.type,
                show: true,
                index: i,
            }))
        }
        this.editEventType = storageEventType.map(d => ({
            ...d,
            icon: this.EVENT_ICONS[d.type] || AlertOutlined,
            value: this.formatData.filter(d1 => d1.type === d.type).length,
        }))
        this.calcualteFinalEventType()
    }

    @action.bound changeEditEventType(changeData) {
        const { newIndex, oldIndex } = changeData
        const newEditEventType = this.editEventType
            .filter(d => d.name !== changeData.name)
            .map(d => {
                let thisIndex = d.index
                if (thisIndex >= newIndex && thisIndex < oldIndex) {
                    thisIndex += 1
                } else {
                    thisIndex -= 1
                }
                return {
                    ...d,
                    index: thisIndex,
                }
            })
        newEditEventType.push({
            ...changeData,
            index: changeData.newIndex,
        })
        this.editEventType = newEditEventType
    }

    // ============== 事件分布 ==============
    originKeys = [
        {
            name: '威胁来源',
            value: 'attackDevice',
            select: true,
        },
        {
            name: '类型',
            value: 'show_type',
            select: true,
        },
        {
            name: '受害目标',
            value: 'victimDevice',
            select: true,
        },
        {
            name: '资产组',
            value: 'asset_desc',
            select: true,
        },
    ]

    @observable eventDistributeKeys = this.originKeys

    @action.bound selectEventDistributeKeys(selectValue) {
        this.eventDistributeKeys = this.originKeys.map(d => ({
            ...d,
            select: selectValue.includes(d.value),
        }))
    }

    @action.bound orderEventDistributeKeys(orders) {
        const result = this.eventDistributeKeys.sort((a, b) => {
            return orders.indexOf(a.name) - orders.indexOf(b.name)
        })
        this.eventDistributeKeys = result
    }

    @action.bound resetEventDistributeKeys() {
        this.eventDistributeKeys = this.originKeys
    }

    isFirst = true

    @computed get top10() {
        return chain(this.eventData)
            .countBy('victimDevice')
            .map((k, v) => {
                return {
                    v,
                    k,
                }
            })
            .orderBy('k', 'desc')
            .slice(0, 10)
            .map('v')
            .value()
    }

    @computed get eventDistribute() {
        if (this.eventData.length === 0) {
            return {
                nodes: [],
                links: [],
            }
        }

        const useKey = this.eventDistributeKeys
            .filter(d => d.select)
            .map(d => d.value)
        const links = chain(this.eventData)
            .filter(d => this.top10.includes(d.victimDevice))
            .map(d => {
                const { asset_desc = [] } = d
                const resultArr = []
                asset_desc.forEach(d2 => {
                    resultArr.push({
                        ...d,
                        asset_desc: [d2],
                        isSplit: asset_desc.length > 1,
                    })
                })
                return resultArr
            })
            .flatten()
            .reduce((obj, d) => {
                const lineId = d.id
                for (let i = 0; i < useKey.length - 1; i += 1) {
                    const sourceKey = useKey[i]
                    const targetKey = useKey[i + 1]
                    const source = `${sourceKey}${joinSign}${d[sourceKey]}`
                    const target = `${targetKey}${joinSign}${d[targetKey]}`
                    const resultLineId = `${lineId}-${d.asset_desc}`
                    const addNum = d.isSplit ? 0.5 : 1
                    const key = `${source}${joinSign}${target}${joinSign}${resultLineId}`
                    obj[key] = {
                        lineId: resultLineId,
                        source,
                        target,
                        value: obj[key] ? obj[key].value + addNum : addNum,
                    }
                }
                return obj
            }, {})
            .values()
            .value()
        const nodes = chain(links)
            .map(d => [d.source, d.target])
            .flatten()
            .uniq()
            .map(d => ({
                name: d,
                type: d.split(joinSign)[0],
                showName: d.split(joinSign)[1],
                id: d,
            }))
            .value()
        return {
            nodes,
            links,
        }
    }

    // ============== 事件时间 ==============

    @observable eventScatterOriginData = []

    @action.bound getEventScatterOriginData() {
        eventGet({
            ...this.params,
            req_type: 'ori',
        })
            .then(scatterData => {
                const result =
                    Object.prototype.toString.call(scatterData) ===
                    '[object Array]'
                        ? scatterData
                        : []
                this.eventScatterOriginData = result
            })
            .catch(() => {})
    }

    @computed get eventTimeArr() {
        const eventObjArr = this.eventData.map(d => d.obj)
        const disabledTypeArr = []
        Object.entries(this.disabledObj).forEach(d => {
            if (d[1]) disabledTypeArr.push(d[0])
        })
        const result = this.eventScatterOriginData.filter(
            d =>
                !disabledTypeArr.includes(d.type) && eventObjArr.includes(d.obj)
        )
        const timeDataObj = countBy(result, 'time')
        const timeData = chain(timeDataObj)
            .keys()
            .sort()
            .map(timeItem => ({
                value: [
                    formatTimestamp(Number(timeItem), 'all'),
                    timeDataObj[timeItem],
                ],
            }))
            .value()
        return timeData
    }

    // ============== 攻击排行 ==============
    @computed get rankAttackDevice() {
        return {
            title: '威胁来源',
            key: 'attackDevice',
            data: this.calculateRankData('attackDevice', this.eventData),
        }
    }

    // ============== 受害排行 ==============
    @computed get rankVictimDevice() {
        return {
            title: '受害目标',
            key: 'victimDevice',
            data: this.calculateRankData('victimDevice', this.eventData),
        }
    }

    // ============== 资产排行 ==============
    @computed get rankAssetDesc() {
        return {
            title: '受害资产',
            key: 'asset_desc',
            data: this.calculateRankData('asset_desc', this.eventData),
        }
    }

    calculateRankData = (sortName, rawData) => {
        const resultData = chain(rawData)
            .map(d => {
                if (sortName === 'asset_desc') {
                    return d.asset_desc.map(d2 => ({
                        ...d,
                        asset_desc: [d2],
                    }))
                }
                return d
            })
            .flatten()
            .reduce((obj, d) => {
                const name = d[sortName]
                if (name === '' || !this.top10.includes(d.victimDevice))
                    return obj
                const data = obj[name] ? obj[name].data : []
                data.push(d)
                obj[name] = {
                    name,
                    data,
                }
                return obj
            }, {})
            .values()
            .map(d => {
                const { name, data } = d
                const peerDeviceCount =
                    chain(data)
                        .map(d1 => [d1.attackDevice, d1.victimDevice])
                        .flatten()
                        .uniq()
                        .filter(d1 => d1)
                        .value().length - 1
                return {
                    name,
                    eventCount: data.length,
                    peerDeviceCount,
                    duration: sumBy(data, 'duration'),
                }
            })
            .orderBy('eventCount', 'desc')
            .slice(0, 5)
            .value()
        return resultData
    }

    params = {}

    @action.bound start(params) {
        if (params) {
            const { devid, starttime, endtime } = params
            this.params = { devid, starttime, endtime }
        }

        this.getEventScatterOriginData()
        return this.getEventData()
    }

    @action.bound changeProcessed(updateList) {
        this.formatData = calculateUpdatedEventData(this.formatData, updateList)
    }
}

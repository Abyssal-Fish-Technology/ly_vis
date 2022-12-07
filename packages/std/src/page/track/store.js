import { eventGet, featureMo } from '@/service'

import {
    AimOutlined,
    AlertOutlined,
    GroupOutlined,
    SettingOutlined,
} from '@ant-design/icons'
import { chain, isString, orderBy, sumBy } from 'lodash'
import { observable, action, computed } from 'mobx'
import {
    NoConfigIcon,
    NoWaveIcon,
    WaveIcon,
} from '@shadowflow/components/ui/icon/icon-util'
import {
    splitEventObj,
    translateEventType,
} from '@shadowflow/components/system/event-system'
import { formatStringSpace } from '@shadowflow/components/utils/universal/methods-arithmetic'
import { formatDuration } from '@shadowflow/components/utils/universal/methods-time'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'

export default class TrackStore {
    @observable params = {}

    @observable current_groupid = ''

    // 事件数据
    @observable eventData = []

    @action.bound getEventData() {
        if (this.isParamsChange) {
            const { starttime, endtime, devid } = this.params
            return eventGet({
                starttime,
                endtime,
                devid,
            }).then(eventData => {
                this.eventData = eventData
                this.attachEventInfo()
            })
        }
        this.attachEventInfo()

        return Promise.resolve()
    }

    // feature Data
    @observable featureData = []

    @action.bound getFeatureData() {
        if (this.isParamsChange) {
            const { starttime, endtime, devid } = this.params
            return featureMo({
                starttime,
                endtime,
                devid,
            }).then(featureData => {
                this.featureData = featureData
                this.attachFeatureInfo()
            })
        }
        this.attachFeatureInfo()

        return Promise.resolve()
    }

    @observable eventConfigMo = []

    @observable eventConfig = []

    @action.bound getEventConfigData(neweventConfigMo, neweventConfig) {
        this.eventConfigMo = neweventConfigMo
        this.eventConfig = neweventConfig
        this.attachConfigInfo()
    }

    // moGroup
    @observable moGroupData = []

    @action.bound getMoGroupData(mogroup) {
        this.moGroupData = mogroup
        this.statisticalData[0].value = mogroup.length
    }

    // moData
    @observable moData = []

    @action.bound getMoData(modata) {
        this.moData = modata.map(d => ({
            ...d,
            eventInfo: [],
            eventTypeArr: [],
            featureInfo: {
                duration: 0,
                bytes: 0,
                pkts: 0,
                flows: 0,
                avg_bytes: 0,
                avg_pkts: 0,
                avg_flows: 0,
            },
            show_eventType: [],
            configInfo: [],
        }))
        this.statisticalData[1].value = modata.length
        this.changeParams(this.params)
    }

    @observable params = {}

    @observable isParamsChange = false

    @action.bound changeParams(newParams) {
        if (JSON.stringify(this.params) !== JSON.stringify(newParams)) {
            this.params = newParams
            this.isParamsChange = true
        } else {
            this.isParamsChange = false
        }
        return this.attachAllInfo()
    }

    // 给Mo复制所有的信息
    @action.bound attachAllInfo() {
        if (JSON.stringify(this.params) === '{}') {
            return Promise.resolve()
        }
        return Promise.all([
            this.getEventData(),
            this.getFeatureData(),
            this.attachConfigInfo(),
        ]).catch(() => {})
    }

    // 附加配置信息
    @action.bound attachConfigInfo() {
        this.moData = this.moData.map(moItem => {
            const { id } = moItem
            const configDetailIdArr = this.eventConfigMo
                .filter(moConfigItem => moConfigItem.moid === id)
                .map(moConfigItem => moConfigItem.id)
            const configArr = this.eventConfig.filter(eventConfigItem =>
                configDetailIdArr.includes(eventConfigItem.config_id)
            )

            return {
                ...moItem,
                configInfo: configArr,
                isConfig: configArr.length > 0,
            }
        })
        this.statisticalData[5].value = this.moData.filter(moItem => {
            return moItem.isConfig
        }).length
        this.statisticalData[6].value =
            this.moData.length - this.statisticalData[5].value
        return Promise.resolve()
    }

    //
    /**
     * 附加事件信息
     * 每一条Mo中的MoIP和MoPort必须有一个存在。
     * 除了Mo的主体之外，还要考虑 协议。
     */
    @action.bound attachEventInfo() {
        const ipTest = '[\\w.]*'
        const portTest = '\\d*'
        this.moData = this.moData.map(moItem => {
            const { moip, moport, pip, pport, protocol } = moItem
            const moDevice = `${moip || ipTest}:${moport || portTest}`
            const pDevice = `${pip || ipTest}:${pport || portTest}`
            const moToObjRegStr = `^${moDevice}>${pDevice}$|^${pDevice}>${moDevice}$`
            const thisItemEventData = this.eventData.filter(eventDataItem => {
                const [, , , , eventProtocol] = splitEventObj(eventDataItem)
                const isProtocolRight = protocol
                    ? protocol === eventProtocol
                    : true
                const isObjMatch = new RegExp(moToObjRegStr).test(
                    eventDataItem.obj.split(' ')[0]
                )
                return isProtocolRight && isObjMatch
            })
            const eventTypeArr = chain(thisItemEventData)
                .countBy(eventItem => translateEventType(eventItem.type))
                .entries()
                .orderBy(d => d[1], 'desc')
                .map(typeItem => {
                    return {
                        name: typeItem[0],
                        value: typeItem[1],
                    }
                })
                .value()
            return {
                ...moItem,
                eventInfo: thisItemEventData,
                show_eventInfo: thisItemEventData.length,
                eventTypeArr,
                show_eventType: eventTypeArr.map(d => `${d.name}(${d.value})`),
                isEvent: eventTypeArr.length > 0,
            }
        })
        this.statisticalData[2].value = this.moData.filter(
            moItem => moItem.isEvent
        ).length
    }

    // 附件流量特征信息
    @action.bound attachFeatureInfo() {
        this.moData = this.moData.map(moItem => {
            const { id } = moItem
            const thisItemFeatureData = this.featureData.filter(featureItem => {
                return featureItem.moid === id
            })
            const duration_value = sumBy(thisItemFeatureData, 'duration')
            const bytes_value = sumBy(thisItemFeatureData, 'bytes')
            const pkts_value = sumBy(thisItemFeatureData, 'pkts')
            const flows_value = sumBy(thisItemFeatureData, 'flows')
            return {
                ...moItem,
                featureInfo: {
                    duration: duration_value,
                    bytes: bytes_value,
                    pkts: pkts_value,
                    flows: flows_value,
                    avg_bytes: bytes_value / duration_value,
                    avg_pkts: pkts_value / duration_value,
                    avg_flows: flows_value / duration_value,
                },
                show_duration: formatDuration(duration_value),
                show_bytes: arrangeAlerm(bytes_value),
                show_pkts: arrangeAlerm(pkts_value),
                show_flows: arrangeAlerm(flows_value),
                isFeature: thisItemFeatureData.length > 0,
            }
        })
        this.statisticalData[3].value = this.moData.filter(
            moItem => moItem.isFeature
        ).length
        this.statisticalData[4].value =
            this.moData.length - this.statisticalData[3].value
    }

    // 统计数据
    @observable statisticalData = [
        {
            name: '追踪分组',
            value: 0,
            icon: GroupOutlined,
            group: 1,
        },
        {
            name: '追踪条目',
            value: 0,
            icon: AimOutlined,
            group: 1,
        },
        {
            name: '事件命中*',
            value: 0,
            icon: AlertOutlined,
            group: 2,
            special: true,
        },
        {
            name: '存在流量*',
            value: 0,
            icon: WaveIcon,
            group: 2,
            special: true,
        },
        {
            name: '无流量*',
            value: 0,
            icon: NoWaveIcon,
            group: 2,
            special: true,
        },
        {
            name: '已配置告警',
            value: 0,
            icon: SettingOutlined,
            group: 3,
        },
        {
            name: '无配置',
            value: 0,
            icon: NoConfigIcon,
            group: 3,
        },
    ]

    @computed get tableData() {
        const filterArr = Object.entries(this.filterCondition)
        const resultData = this.moData.filter(moItem => {
            let result = true

            for (let i = 0; i < filterArr.length; i += 1) {
                const [key, value] = filterArr[i]
                const formatDevice = isString(value)
                    ? formatStringSpace(value)
                    : ''
                if (Array.isArray(value)) {
                    result = value.includes(moItem[key])
                } else if (key === 'port') {
                    result = [moItem.moport, moItem.pport].includes(
                        formatDevice
                    )
                } else if (key === 'ip') {
                    result = [moItem.moip, moItem.pip].includes(formatDevice)
                } else {
                    result = formatDevice === moItem[key]
                }
                if (!result) {
                    break
                }
            }
            return result
        })
        return orderBy(resultData, 'eventInfo', 'desc')
    }

    @observable filterCondition = {}

    @action.bound changeFilterCondition(newFilter) {
        this.filterCondition = newFilter
    }
}

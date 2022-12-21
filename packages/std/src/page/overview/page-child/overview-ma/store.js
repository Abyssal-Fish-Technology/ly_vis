import { eventGet, sctlStat } from '@/service'
import {
    DesktopOutlined,
    PropertySafetyOutlined,
    ShareAltOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { formatStringSpace } from '@shadowflow/components/utils/universal/methods-arithmetic'
import {
    formatTimestamp,
    rountTime5Min,
} from '@shadowflow/components/utils/universal/methods-time'
import { chain } from 'lodash'
import { action, computed, observable } from 'mobx'

export default class OverviewMaStore {
    // ============== 初始化 ==============
    @observable params = {}

    @action.bound start({ params, configData }) {
        this.params = params
        return this.initConfigData(configData)
    }

    // ============== 原始event配置数据 ==============
    @observable configData = false

    @action.bound initConfigData(newConfigData) {
        this.configData = { ...newConfigData }
        this.calcualteDeviceData()
        return this.calRuleData()
    }

    // ============== 配置卡片数据 ==============
    @computed get configCard() {
        const configCard = [
            {
                icon: DesktopOutlined,
                name: '系统状态',
                values: [
                    {
                        desc: '异常设备',
                        unit: '台',
                        value: 0,
                    },
                    {
                        desc: '正常设备',
                        unit: '台',
                        value: 0,
                    },
                ],
            },
            {
                icon: ShareAltOutlined,
                name: '事件规则',
                values: [
                    {
                        desc: '自定义',
                        unit: '条',
                        value: 0,
                    },
                    {
                        desc: '默认',
                        unit: '条',
                        value: 0,
                    },
                ],
            },
            {
                icon: PropertySafetyOutlined,
                name: '资产配置',
                values: [
                    {
                        desc: '资产组',
                        unit: '个',
                        value: 0,
                    },
                ],
            },
            {
                icon: UserOutlined,
                name: '用户管理',
                values: [
                    {
                        desc: '锁定用户',
                        unit: '位',
                        value: 0,
                    },
                    {
                        desc: '正常用户',
                        unit: '位',
                        value: 0,
                    },
                ],
            },
        ]
        if (!this.configData) {
            return configCard
        }
        const {
            device,
            userList,
            proxy,
            internal,
            event: eventConfig,
        } = this.configData
        configCard[0].values[1].value = device.length + proxy.length
        configCard[0].values[1].value = device.length + proxy.length
        configCard[1].values[0].value = eventConfig.filter(
            d => d.event_type === 'mo'
        ).length
        configCard[1].values[1].value = eventConfig.filter(
            d => d.event_type !== 'mo'
        ).length
        configCard[2].values[0].value = internal.length
        configCard[3].values[0].value = userList.filter(
            d => d.lockedtime > 0
        ).length
        configCard[3].values[1].value = userList.filter(
            d => d.lockedtime === 0
        ).length
        return configCard
    }

    nameDict = {
        probe: '采集器',
        cap: '接收器',
        disk: '磁盘',
        fsd: '守护进程',
    }

    // ============== 服务器设备数据 ==============

    @computed get useDeviceData() {
        const { device: probe, proxy: agent } = this.configData
        return [
            ...probe.map(d => ({
                ...d,
                type: 'probe',
                tid: d.agentid,
                realId: d.id,
                agentid: `agent-${d.agentid}`,
            })),
            ...agent.map(d => ({
                ...d,
                type: 'agent',
                realId: d.id,
                tid: d.id,
            })),
        ].map(d => ({
            ...d,
            name: d.name,
            address: `${d.ip}${d.port ? `:${d.port}` : ''}`,
            status: d.disabled === 'Y' ? '禁用' : '正常',
            id: `${d.type}-${d.id}`,
            detailInfo: {},
        }))
    }

    @observable deviceData = []

    calcualteDetailInfo = data => {
        const order = ['disk', 'probe', 'cap', 'fsd', 'ssh', 'http']
        const nameDict = {
            probe: '采集器',
            cap: '接收器',
            disk: '磁盘',
            fsd: '守护进程',
        }
        const detailInfo = data
            .map(d => {
                const { type, status, desc } = d
                const item = {
                    type,
                    name:
                        type !== 'disk'
                            ? nameDict[type] || type
                            : `${nameDict[type]}(${desc})`,
                    status,
                    desc,
                    id: `${type}-${desc}`,
                }
                return item
            })
            .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))

        return detailInfo
    }

    @action.bound calcualteDeviceData() {
        if (!this.configData) {
            this.deviceData = []
            return
        }

        // ============== 补充节点信息 ==============
        // ============== 获取 Agent和 Probe的补充数据 ==============
        const getAgentAndProbe = new Promise(resolve => {
            const { proxy: agent } = this.configData
            const agentIdArr = agent.map(d => d.id)
            const result = []
            sctlStat({
                type: 'all',
                tid: agentIdArr.join(','),
            })
                .then(statsInfoArr => {
                    agentIdArr.forEach(agentid => {
                        const thisStatsInfo = statsInfoArr.filter(
                            statInfoItem =>
                                statInfoItem.tid === agentid &&
                                statInfoItem.result === 'succeed'
                        )
                        const detailInfo = this.calcualteDetailInfo(
                            thisStatsInfo
                        )
                        this.useDeviceData
                            .filter(
                                d =>
                                    (d.type === 'probe' &&
                                        d.agentid === `agent-${agentid}`) ||
                                    (d.type === 'agent' &&
                                        d.id === `agent-${agentid}`)
                            )
                            .forEach(propeItem => {
                                result.push({
                                    ...propeItem,
                                    detailInfo,
                                })
                            })
                    })
                    resolve(result)
                })
                .catch(err => {
                    Promise.reject(err)
                })
            // .catch(() => {
            //     resolve(this.useDeviceData)
            // })
        })

        // ============== 获取本地服务器的节点详信息 ==============
        const item = {
            name: '服务器',
            address: window.location.host,
            status: '正常',
            id: 'server-3',
            type: 'server',
            detailInfo: {},
            tid: 0,
        }
        const getServer = new Promise(resolve => {
            sctlStat({
                type: 'all',
            })
                .then(statsInfoArr => {
                    item.detailInfo = this.calcualteDetailInfo(statsInfoArr)
                    resolve(item)
                })
                .catch(err => {
                    Promise.reject(err)
                })
            // .catch(() => {
            //     resolve(item)
            // })
        })
        Promise.all([getAgentAndProbe, getServer])
            .then(res => {
                this.deviceData = [...res[0], res[1]]
            })
            .catch(() => {
                this.deviceData = [...this.useDeviceData, item]
            })
    }

    @action.bound changeDeviceData(deviceId, deviceStatus) {
        const newDeviceData = [...this.deviceData]
        newDeviceData.forEach(deviceItem => {
            if (deviceItem.id === deviceId) {
                deviceItem.status = deviceStatus
            }
        })
        this.deviceData = newDeviceData
    }

    @action.bound changeDeviceDetailData(deviceId, detailId, detailValue) {
        const newDeviceData = [...this.deviceData]
        newDeviceData.forEach(deviceItem => {
            if (deviceItem.id === deviceId) {
                deviceItem.detailInfo.forEach(detailItem => {
                    if (detailItem.id === detailId) {
                        detailItem.status = detailValue
                    }
                })
            }
        })
        this.deviceData = newDeviceData
    }

    // ============== 事件规则数据 ==============
    @observable configRule = []

    @action.bound calRuleData() {
        const { event } = this.configData
        // const starttime = rountTime5Min(moment().subtract(7, 'day').unix('X'))
        // const endtime = rountTime5Min(moment().unix('X'))
        const { starttime, endtime } = this.params
        const params = {
            ...this.params,
            req_type: 'ori',
        }
        const gap = 3600 * 4
        const num = (endtime - starttime) / gap
        const timeArr = []
        for (let i = 0; i <= num; i += 1) {
            timeArr.push(starttime + i * gap)
        }
        return eventGet(params).then(eventScatterData => {
            const result = chain(event)
                .map(d => {
                    const thisEventData = eventScatterData.filter(
                        d1 => d1.event_id === d.id
                    )

                    const eventScatterTime = thisEventData.map(d1 =>
                        rountTime5Min(d1.time)
                    )

                    const timeData = timeArr.map(timeItem => ({
                        name: formatTimestamp(timeItem, 'min'),
                        value: eventScatterTime.filter(
                            // d1 => d1 === Number(timeItem)
                            d1 =>
                                d1 >= Number(timeItem) &&
                                d1 < Number(timeItem + gap)
                        ).length,
                    }))
                    return {
                        ...d,
                        data: timeData,
                        value: thisEventData.length,
                    }
                })
                .orderBy('value', 'desc')
                .value()
            this.configRule = result
        })
    }

    // ============== 筛选条件 ==============
    @observable filterCondition = {}

    @action.bound changeFilterCondition(newFilter) {
        this.filterCondition = newFilter
    }

    @computed get useRuleData() {
        const filterArr = Object.entries(this.filterCondition)
        return this.configRule.filter(d => {
            let result = true
            for (let i = 0; i < filterArr.length; i += 1) {
                const [key, value] = filterArr[i]
                if (key === 'name') {
                    result =
                        value === ''
                            ? true
                            : d.desc.includes(formatStringSpace(value))
                } else if (key === 'type') {
                    result =
                        value.length === 0 ? true : value.includes(d.event_type)
                } else if (key === 'status') {
                    result = value === '' ? true : d.status === value
                }
                if (!result) {
                    break
                }
            }
            return result
        })
    }
}

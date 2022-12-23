import configStore from '@/layout/components/config/store'
import { eventGet, featureGet, portinfo } from '@/service'
import { getUrlParams } from '@shadowflow/components/utils/universal/methods-router'
import { splitEventObj } from '@shadowflow/components/system/event-system'
import { initial } from 'lodash'
import { action, observable } from 'mobx'
import moment from 'moment'
import { getDeviceInfo } from '@/utils/methods-data'
// import { calculateUpdatedEventData } from '@/utils/methods-event'
import { calculateSearchParams } from '@shadowflow/components/utils/universal/methods-calc-data'
import { rountTime5Min } from '@shadowflow/components/utils/universal/methods-time'
import { calculateUpdatedEventData } from '@/utils/methods-event'
import { featureObj, translateFeture } from './config'

const searchTypeArr = [
    {
        name: 'IP',
        key: 'ip',
        exclude: [],
    },
    {
        name: '端口',
        key: 'port',
        exclude: ['sus', 'black', 'dns'],
    },
    {
        name: '域名',
        key: 'dns',
        exclude: ['sus', 'black', 'service', 'scan', 'tcpinit'],
    },
    {
        name: 'IP 端口',
        key: 'ip port',
        exclude: [],
    },
    {
        name: 'IP>端口',
        key: 'ip>port',
        exclude: ['service'],
    },
    {
        name: 'IP:端口',
        key: 'ip:port',
        exclude: ['scan'],
    },
]

const calcualteNowFeature = (type, featureArr) => {
    const excludeArr = searchTypeArr.find(d => d.key === type).exclude
    return featureArr.filter(d => !excludeArr.includes(d))
}

class ResultStore {
    // =========================== UI函数 ====================================
    @observable searchValue = {
        ip: '',
        port: '',
        dns: '',
        searchType: 'ip',
    }

    @observable conditionValue = {
        starttime: [moment().subtract(4, 'h'), moment()],
        devid: configStore.device[0] ? configStore.device[0].id : null,
        proto: null,
        feature: ['sus', 'black', 'service', 'scan', 'tcpinit', 'dns'],
        limit: 0,
    }

    // 根据urlParams, 生成条件 每次生成条件都会触发搜索
    @action.bound initCondition(searchParams = '') {
        const searchValueKeys = Object.keys(this.searchValue)
        const { device, ...otherParams } =
            searchParams || getUrlParams('queryParams')

        // 由url传入的device，判断searchType
        const newSearchValue = {
            ...this.searchValue,
            ...calculateSearchParams(device),
        }
        if (!searchParams && otherParams.pagekey) {
            this.currentTabKey = otherParams.pagekey
        }
        searchValueKeys.forEach(key => {
            if (otherParams[key]) {
                newSearchValue[key] = otherParams[key]
            }
        })
        this.searchValue = newSearchValue

        const conditionValueKeys = Object.keys(this.conditionValue)
        const newConditionValue = { ...this.conditionValue }
        conditionValueKeys.forEach(key => {
            let value = otherParams[key]
            if (value !== undefined) {
                if (key === 'feature') {
                    value = value.split(',')
                }
                if (key === 'starttime') {
                    value = [
                        moment(rountTime5Min(value) * 1000),
                        moment(rountTime5Min(otherParams.endtime) * 1000),
                    ]
                }
                if (key === 'devid') {
                    value = Number(value)
                }
                if (value !== undefined) {
                    newConditionValue[key] = value
                }
            } else {
                newConditionValue[key] = this.conditionValue[key]
            }
        })
        newConditionValue.feature = calcualteNowFeature(
            this.searchValue.searchType,
            newConditionValue.feature
        )
        this.conditionValue = newConditionValue
        this.startSearch()
    }

    calRelationEvent = data => {
        const { ip, port, dns, searchType } = this.searchValue
        let useEventData = []
        if (searchType === 'ip') {
            useEventData = data.filter(d => splitEventObj(d).includes(ip))
        } else if (searchType === 'port') {
            useEventData = data.filter(d => splitEventObj(d).includes(port))
        } else if (searchType === 'dns') {
            useEventData = data.filter(d => splitEventObj(d).includes(dns))
        } else if (searchType === 'ip:port') {
            useEventData = data.filter(d => {
                const [ip1, port1, ip2, port2] = splitEventObj(d)
                return (
                    (ip === ip1 && port === port1) ||
                    (ip === ip2 && port === port2)
                )
            })
        } else if (searchType === 'ip>port') {
            useEventData = data.filter(d => {
                const [ip1, port1, ip2, port2] = splitEventObj(d)
                return (
                    (ip === ip1 && port === port2) ||
                    (ip === ip2 && port === port1)
                )
            })
        } else if (searchType === 'ip port') {
            useEventData = data.filter(d => {
                const [ip1, port1, ip2, port2] = splitEventObj(d)
                return (
                    ip === ip1 || ip === ip2 || port === port1 || port === port2
                )
            })
        }
        return useEventData
    }

    // ===============================请求数据===================================

    @observable portInfo = []

    @action.bound getPortInfo(port) {
        this.changePageLoading('basic', true)
        return portinfo(port)
            .then(res => {
                this.portInfo = res
            })
            .finally(() => {
                this.changePageLoading('basic')
            })
    }

    @observable eventInfo = []

    @action.bound getEventInfo() {
        const { starttime, devid } = this.conditionValue
        this.changePageLoading('event', true)
        return eventGet({
            starttime: starttime[0].unix(),
            endtime: starttime[1].unix(),
            devid,
        })
            .then(res => {
                this.eventInfo = this.calRelationEvent(res)
            })
            .finally(() => {
                this.changePageLoading('event')
            })
    }

    @observable deviceInfo = {}

    @action.bound getCurrentDeviceInfo(device) {
        this.changePageLoading('basic', true)
        return getDeviceInfo(device)
            .then(res => {
                this.deviceInfo = res
            })
            .finally(() => {
                this.changePageLoading('basic')
            })
    }

    @observable featureInfo = Object.keys(featureObj).reduce((obj, d) => {
        obj[d] = {
            name: translateFeture(d),
            key: d,
            data: [],
        }
        return obj
    }, {})

    @action.bound getFeatureInfo() {
        const { feature, starttime, devid, limit, proto } = this.conditionValue
        if (feature.length === 1 && feature[0] === '') {
            return []
        }
        const commonParamsItem = {
            starttime: starttime[0].unix(),
            endtime: starttime[1].unix(),
            devid,
            limit,
            proto,
        }
        const proArr = []
        feature.forEach(d => {
            this.changePageLoading(d, true)
            const specialParamsItem = this.calcualteFeatureParams(d)
            proArr.push(
                featureGet({
                    ...commonParamsItem,
                    ...specialParamsItem,
                    type: d,
                })
                    .then(
                        res => {
                            const newObj = JSON.parse(
                                JSON.stringify(this.featureInfo)
                            )
                            newObj[d].data = initial(res)
                            this.featureInfo = newObj
                        },
                        () => {
                            const newObj = JSON.parse(
                                JSON.stringify(this.featureInfo)
                            )
                            newObj[d].data = []
                            this.featureInfo = newObj
                        }
                    )
                    .finally(() => {
                        this.changePageLoading(d)
                    })
            )
        })
        return proArr
    }

    @observable basicLoading = false

    eventLoading = false

    susLoading = false

    dnsLoading = false

    dns_tunLoading = false

    blackLoading = false

    serviceLoading = false

    tcpinitLoading = false

    featureLoading = false

    @action.bound changePageLoading(type, state = false) {
        this[`${type}Loading`] = state
    }

    @action.bound startSearch() {
        const { searchType } = this.searchValue
        let { ip, port, dns } = this.searchValue
        if (searchType === 'ip') {
            this.searchValue = { ...this.searchValue, port: '', dns: '' }
            port = ''
            dns = ''
        } else if (searchType === 'port') {
            this.searchValue = { ...this.searchValue, ip: '', dns: '' }
            ip = ''
            dns = ''
        } else if (searchType === 'dns') {
            this.searchValue = { ...this.searchValue, ip: '', port: '' }
            port = ''
            ip = ''
        } else {
            this.searchValue = { ...this.searchValue, dns: '' }
            dns = ''
        }
        this.portInfo = []
        this.eventInfo = []
        this.deviceInfo = {}
        this.changePageLoading('feature', true)
        const promiseArr = [this.getEventInfo(), ...this.getFeatureInfo()]

        if (ip || dns) {
            promiseArr.push(this.getCurrentDeviceInfo(ip || dns))
        }

        if (port) {
            promiseArr.push(this.getPortInfo(port))
        }

        Promise.allSettled(promiseArr).finally(() => {
            this.changePageLoading('feature', false)
        })
    }

    @observable currentTabKey = '总览'

    @action.bound changeCurrentTabKey(key) {
        this.currentTabKey = key
    }

    @observable featureType = ''

    @action.bound setFeatureType(type) {
        this.featureType = type
    }

    // =============================================== 辅助函数 ============================

    calcualteFeatureParams = type => {
        const { port, dns, ip, searchType } = this.searchValue
        const params = {}
        switch (type) {
            case 'tcpinit':
                params.dport = port
                if (searchType === 'ip' || searchType === 'ip port') {
                    params.ip = ip
                } else if (searchType === 'ip:port') {
                    params.dip = ip
                } else if (searchType === 'ip>port') {
                    params.sip = ip
                }
                break
            case 'scan':
                params.sip = ip
                params.dport = port
                break
            case 'dns':
                if (ip) {
                    params.ip = ip
                }
                if (dns) {
                    params.qname = dns
                }
                break
            case 'sus':
                if (searchType === 'ip:port') {
                    params.dip = ip
                } else if (searchType === 'ip>port') {
                    params.sip = ip
                } else if (searchType === 'ip port' || searchType === 'ip') {
                    params.ip = ip
                }
                break
            case 'black':
                if (searchType === 'ip' || searchType === 'ip port') {
                    params.ip = ip
                } else if (searchType === 'ip:port') {
                    params.dip = ip
                } else if (searchType === 'ip>port') {
                    params.sip = ip
                }
                break
            case 'service':
                params.ip = ip
                params.port = port
                break
            default:
                break
        }
        return params
    }

    @action.bound changeProcessed(updateList) {
        this.eventInfo = calculateUpdatedEventData(this.eventInfo, updateList)
    }
}

export default ResultStore

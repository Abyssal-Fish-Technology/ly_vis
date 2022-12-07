import { chain, compact } from 'lodash'
import { action, observable } from 'mobx'
import moment from 'moment'
import {
    getEventDevice,
    translateEventType,
} from '@shadowflow/components/system/event-system'
import { featureObj, translateFeture } from '../../config'
import * as formatFeatureData from '../../data-processor'

class BasicInfoStore {
    @observable basicInfo = this.reset(Object.keys(featureObj))

    @action.bound reset = feature => {
        return {
            value: '',
            address: '',
            operator: '',
            coordinate: '',
            lastestTag: '',
            risk: '',
            badgeType: '',
            badgeText: '',
            tagList: [],
            featureInfo: feature
                .filter(d => d)
                .map(d => ({
                    name: translateFeture(d),
                    key: d,
                    value: 0,
                    data: formatFeatureData[`${d}Static`]([], ''),
                })),
            eventInfo: {
                eventData: [],
                scatterData: [],
                params: {
                    starttime: moment().unix(),
                    endtime: moment().subtract(1, 'd').unix(),
                },
                trackData: [
                    {
                        name: 'root',
                        parent: '',
                    },
                ],
                loading: true,
            },
            portInfo: false,
        }
    }

    @action.bound start = ({
        conditionValue,
        portInfo,
        featureInfo,
        eventInfo,
        searchValue,
        deviceInfo,
    }) => {
        const { feature, starttime } = conditionValue
        const newBasicInfo = this.reset(feature)
        const { ip, port, dns, searchType } = searchValue
        this.searchValue = searchValue
        switch (searchType) {
            case 'ip':
                newBasicInfo.value = ip
                break
            case 'port':
                newBasicInfo.value = port
                break
            case 'dns':
                newBasicInfo.value = dns
                break
            case 'ip port':
                newBasicInfo.value = `${ip} ${port}`
                break
            case 'ip:port':
                newBasicInfo.value = `${ip}:${port}`
                break
            case 'ip>port':
                newBasicInfo.value = `${ip}>${port}`
                break
            default:
                break
        }

        const { asset, geo, system, threat } = deviceInfo
        const { nation, province, city, operator, lng, lat } = geo || {}
        newBasicInfo.address = compact([nation, province, city]).join(' ')
        newBasicInfo.operator = operator
        newBasicInfo.coordinate = compact([lng, lat]).join(',')

        const { lastestTag = '', rank = '', rankDesc = '', detail = [] } =
            threat || {}
        newBasicInfo.lastestTag = lastestTag
        newBasicInfo.risk = rank ? `${rank}(${rankDesc})` : ''
        const { isAsset, assetDesc = [] } = asset || {}
        const { isBlack, isWhite } = system || {}

        const tagList = []
        let badgeType = 'unknow'
        if (isBlack) {
            badgeType = 'black'
            tagList.push({ tagType: 'black', tagText: '黑名单' })
        }
        if (isWhite) {
            badgeType = 'white'
            tagList.push({ tagType: 'white', tagText: '白名单' })
        }
        if (isAsset) {
            badgeType = 'asset'
            assetDesc.forEach(d => {
                tagList.push({ tagType: 'asset', tagText: d })
            })
        }
        if (threat) {
            badgeType = 'ti'
            newBasicInfo.badgeText = lastestTag
            const threatTagArr = chain(detail)
                .map('tag')
                .uniq()
                .map(threatTag => ({ tagType: 'event', tagText: threatTag }))
                .value()
            tagList.push(...threatTagArr)
        }
        newBasicInfo.badgeType = badgeType
        newBasicInfo.tagList = tagList

        // 事件信息
        eventInfo.forEach(d => {
            const [victimDevice, attackDevice] = getEventDevice(d)
            d.victimDevice = victimDevice
            d.attackDevice = attackDevice
            d.showType = translateEventType(d.type)
        })
        newBasicInfo.eventInfo = {
            eventData: eventInfo,
            trackData: [],
            params: {
                starttime: starttime[0].unix(),
                endtime: starttime[1].unix(),
            },
            loading: false,
            value: searchType.includes('ip') ? ip : newBasicInfo.value,
        }

        // 端口信息
        if (port) {
            newBasicInfo.portInfo = portInfo
                .filter(d => d.desc !== '')
                .map(d => d.desc)
                .join(',')
        }

        // featureInfo
        feature
            .filter(d => d)
            .forEach(d => {
                const featureDataItem = featureInfo[d].data
                const data = featureDataItem
                const aggreData = formatFeatureData[d](data)
                const featureItem = newBasicInfo.featureInfo.find(
                    d1 => d1.key === d
                )
                if (featureItem) {
                    featureItem.value = aggreData.length
                    featureItem.data = formatFeatureData[`${d}Static`](
                        aggreData,
                        ip
                    )
                }
                // 计算活跃端口
                if (d === 'service') {
                    newBasicInfo.act_port = chain(data)
                        .map('port')
                        .uniq()
                        .sort()
                        .join('、')
                        .value()
                }
            })
        this.basicInfo = newBasicInfo
    }
}

export default BasicInfoStore

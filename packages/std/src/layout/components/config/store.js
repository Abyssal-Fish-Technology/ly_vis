import {
    internalApi,
    blacklistApi,
    whitelistApi,
    deviceApi,
    proxyApi,
    moApi,
    mogroupApi,
    userApi,
    eventConfigApiConfig,
    eventConfigApiType,
    eventConfigApiAction,
    eventConfigApiIgnore,
    eventConfigApiLevel,
} from '@/service'
import ConfigStore from '@shadowflow/components/config-store/store'
import { EventConfig } from '@shadowflow/components/system/event-system'
import { find, reduce } from 'lodash'
import { action, observable, reaction } from 'mobx'

class StdConfigStore extends ConfigStore {
    @observable mo = []

    @observable moGroup = []

    @observable event = []

    @observable eventType = []

    @observable eventAction = []

    @observable eventIgnore = []

    @observable eventLevel = []

    // mo数据中添加group id, 改变原始数据
    addGroupId(data) {
        const moGroup = data.moGroup ? data.moGroup : this.moGroup

        data.mo.forEach(d => {
            if (!d.mogroup) return
            const { id } = find(moGroup, d1 => d1.name === d.mogroup)
            d.groupid = id
        })
        return data.mo
    }

    // 暂时放在configstore中，后续考虑放在config页面下
    @action.bound changeData(data) {
        if (Object.keys(data).includes('mo')) {
            this.addGroupId(data)
        }

        // 对源数据排序
        const useData = reduce(
            data,
            (obj, d, k) => {
                obj[k] = d.slice().sort((a, b) => a.id - b.id)
                return obj
            },
            {}
        )
        Object.assign(this, useData)
    }

    getEventDetatilConfig = () => {
        const arr = [eventConfigApiConfig()]
        Object.values(EventConfig).map(d =>
            arr.push(eventConfigApiConfig(d.config.params))
        )
        return Promise.all(arr).then(
            res => {
                //! 将EventConfig 和 对应的EventDetailConfig 合并在一起
                // const [eventConfig, ...eventDetailConfig] = res
                // const eventDetailConfigFlat = flatten(eventDetailConfig)
                // eventConfig.forEach(d => {
                //     d.config_detail = eventDetailConfigFlat.find(
                //         d1 => d1.id === d.config_id
                //     )
                // })
                return res
            },
            e => {
                return Promise.reject(e)
            }
        )
    }

    @action.bound updateAll() {
        const arr = this.getEventDetatilConfig()
        return Promise.all([
            internalApi(),
            blacklistApi(),
            whitelistApi(),
            deviceApi(),
            mogroupApi(),
            userApi(),
            eventConfigApiType(),
            eventConfigApiAction(),
            eventConfigApiIgnore(),
            proxyApi(),
            eventConfigApiLevel(),
            arr,
        ]).then(
            res => {
                const allConfig = {
                    internal: res[0],
                    black: res[1],
                    white: res[2],
                    device: res[3],
                    moGroup: res[4],
                    userList: res[5],
                    eventType: res[6],
                    eventAction: res[7],
                    eventIgnore: res[8],
                    proxy: res[9],
                    eventLevel: res[10],
                }
                const [event, ...eventConfig] = res[11]
                allConfig.event = event
                Object.keys(EventConfig).forEach((d, i) => {
                    allConfig[`eventConfig${d}`] = eventConfig[i]
                })
                this.changeData({ ...allConfig })
                return { ...allConfig }
            },
            e => {
                return Promise.reject(e)
            }
        )
    }

    constructor() {
        super()
        // 更新moGroup时同步更新mo
        reaction(
            () => this.moGroup,
            () => {
                moApi().then(res => {
                    this.changeData({
                        mo: res,
                    })
                })
            }
        )
    }
}

export default new StdConfigStore()

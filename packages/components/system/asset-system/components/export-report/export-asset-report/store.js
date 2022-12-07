import { action, observable } from 'mobx'

import { chain } from 'lodash'
import { statinfoGet } from '@/service'
import {
    getDeviceType,
    isPrivateIP,
} from '@shadowflow/components/utils/universal/methods-net'
// import * as initMethods from './utils'

class AssetReportStore {
    @observable condition = {}

    @observable timeRange = []

    @observable deviceInfo = null

    @observable internal = []

    @action changeData = (obj = {}) => {
        Object.assign(this, obj)
    }

    @observable overviewData = {}

    @action calcOverviewData = () => {
        const useInternal = this.internal.reduce((obj, d) => {
            let key = getDeviceType(d.ip).ipType === 'v6' ? 'v6' : ''
            if (!key) {
                key = isPrivateIP(d.ip) ? 'private' : 'no-private'
            }
            obj[key] = [...(obj[key] || []), d]
            return obj
        }, {})
        const useData = {
            timeRange: this.timeRange,
            deviceInfo: this.deviceInfo,
            internal: useInternal,
        }
        this.overviewData = useData
    }

    @observable asset_data = []

    @observable srv_data = []

    @observable host_data = []

    @observable url_data = []

    @observable os_name_data = []

    @observable srv_name_data = []

    @observable midware_name_data = []

    @observable dev_name_data = []

    @observable os_type_data = []

    @observable srv_type_data = []

    @observable midware_type_data = []

    @observable dev_type_data = []

    @action fetchData = () => {
        const {
            time: [starttime, endtime],
            devid,
        } = this.condition
        const promiseArr = [
            {
                type: 'asset',
                currentParams: {},
            },
            {
                type: 'host',
                currentParams: { sub_type: 'host' },
            },
            {
                type: 'url',
                currentParams: { sub_type: 'url' },
            },
            {
                type: 'srv_name',
                currentParams: { sub_type: 'srv', dim: 'srv_name' },
            },
            {
                type: 'srv_type',
                currentParams: { sub_type: 'srv', dim: 'srv_type' },
            },
            {
                type: 'os_name',
                currentParams: { sub_type: 'srv', dim: 'os_name' },
            },
            {
                type: 'os_type',
                currentParams: { sub_type: 'srv', dim: 'os_type' },
            },
            {
                type: 'midware_name',
                currentParams: { sub_type: 'srv', dim: 'midware_name' },
            },
            {
                type: 'midware_type',
                currentParams: { sub_type: 'srv', dim: 'midware_type' },
            },
            {
                type: 'dev_name',
                currentParams: { sub_type: 'srv', dim: 'dev_name' },
            },
            {
                type: 'dev_type',
                currentParams: { sub_type: 'srv', dim: 'dev_type' },
            },
        ].map(d => {
            return statinfoGet({
                ...d.currentParams,
                starttime,
                endtime,
                devid,
            }).then(res => {
                const obj = chain(res)
                    .filter(d1 => {
                        if (['srv_name', 'srv_type'].includes(d.type)) {
                            return true
                        }
                        return d1.label
                    })
                    .map(d1 => {
                        return { name: d1.label || '未知服务', value: d1.cnt }
                    })
                    .orderBy('value', 'desc')
                    .value()

                this[`${d.type}_data`] = obj
            })
        })

        return Promise.all(promiseArr)
    }

    initData = () => {
        return this.fetchData().then(() => {
            return new Promise(resolve => {
                this.calcOverviewData()
                resolve()
            })
        })
    }
}

export default new AssetReportStore()

import { action, observable } from 'mobx'
import { calcualteColumns, featureObj, translateFeture } from '../../config'
import * as formatFeatureData from '../../data-processor'

class FeatureInfoStore {
    @observable featureData = Object.keys(featureObj).map(d => ({
        name: translateFeture(d),
        aggreData: [],
        key: d,
        columns: calcualteColumns(d),
        detailColumns: calcualteColumns(d, true),
        ...formatFeatureData[`${d}Static`]([], '', false),
    }))

    @action.bound start(obj = {}, searchValue = {}) {
        const { ip } = searchValue
        this.featureData = Object.keys(obj).map(d => {
            const featureItem = obj[d]
            const index = this.featureData.findIndex(d1 => d1.key === d)
            const aggreData = formatFeatureData[d](featureItem.data)
            return {
                ...this.featureData[index],
                aggreData,
                ...formatFeatureData[`${d}Static`](aggreData, ip, false),
            }
        })
    }
}

export default FeatureInfoStore

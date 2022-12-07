import { TiResultSort } from '@/utils/methods-data'
import { translateType } from '@shadowflow/components/utils/business/methods-ti'
import { chain, uniq } from 'lodash'
import { action, observable } from 'mobx'
import moment from 'moment'

class TiInfoStore {
    @observable tiInfo = this.resetTiInfo()

    resetTiInfo = () => {
        return {
            basicInfo: {
                情报类型: '--',
                情报数据: '--',
                最早发现时间: '--',
                最新更新时间: '--',
            },
            rank: 0,
            SrcXTag: [],
            TagXSrc: [],
            detail: [],
        }
    }

    @action.bound start = tiData => {
        const newTiInfo = this.resetTiInfo()
        if (!tiData.threat) {
            this.tiInfo = newTiInfo
            return
        }

        const { detail, rank, updated } = tiData.threat
        newTiInfo.rank = rank
        const discoveryTime = chain(detail)
            .map('time')
            .flatten()
            .min(d => {
                return new Date(d).getTime()
            })
            .value()

        newTiInfo.basicInfo = {
            情报类型: translateType(tiData.type),
            情报数据: detail.length,
            最早发现时间: moment(discoveryTime).format('YYYY-MM-DD HH:mm:ss'),
            最新更新时间: moment(updated).format('YYYY-MM-DD HH:mm:ss'),
        }

        newTiInfo.SrcXTag = chain(detail)
            .reduce((obj, d) => {
                const key = d.src
                const child = obj[key] ? obj[key].child : []
                child.push(d.tag)
                const data = obj[key] ? obj[key].data : []
                data.push(d)
                obj[key] = {
                    type: 'src',
                    name: key,
                    child: uniq(child),
                    data,
                    count: data.length,
                }
                return obj
            }, {})
            .values()
            .orderBy('count', 'desc')
            .value()

        newTiInfo.TagXSrc = chain(detail)
            .reduce((obj, d) => {
                const key = d.tag
                const child = obj[key] ? obj[key].child : []
                child.push(d.src)
                const data = obj[key] ? obj[key].data : []
                data.push(d)
                obj[key] = {
                    type: 'tag',
                    name: key,
                    child: uniq(child),
                    data,
                    count: data.length,
                }
                return obj
            }, {})
            .values()
            .orderBy('count', 'desc')
            .value()
        const nowResult = TiResultSort(detail)

        newTiInfo.detail = nowResult
        this.tiInfo = newTiInfo
    }
}

export default TiInfoStore

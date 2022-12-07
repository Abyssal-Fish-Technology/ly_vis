import { assetIp, assetSrv, assetHost, assetUrl } from '@/service'
import { intersection } from 'lodash'
import { action, computed, observable } from 'mobx'
import { getIpAssetInfo } from '../../utils/business/methods-asset'
import { formatStringSpace } from '../../utils/universal/methods-arithmetic'
import { getAggreData, getIpNetData } from './data-processor'

const assetApi = {
    asset_ip: assetIp,
    asset_srv: assetSrv,
    asset_host: assetHost,
    asset_url: assetUrl,
}

export default class AssetListStore {
    @observable originalData = [] // 请求原始数据

    @observable currentData = [] // 聚合处理后的数据（ip页面中代表ipNet计算后的数据）

    @observable resultData = [] // 聚合处理后的数据，用于ip页面数据计算

    @observable currentParams = {} // toptoolbox参数

    @observable pageType = '' // 页面标识，包括：ip、srv、host、url

    @action.bound getData(type, params) {
        this.pageType = type
        this.currentParams = params
        return assetApi[`asset_${type}`]({ ...params })
            .then(res => {
                this.originalData = res
                const resultAggreData = getAggreData(res, type)
                if (type === 'ip') {
                    this.resultData = resultAggreData
                    this.changeIpNetConditionData()
                } else {
                    this.currentData = resultAggreData
                }
            })
            .catch(() => {})
    }

    @action.bound reCalcualteAssetDesc() {
        this.currentData = this.currentData.map(d => {
            const newItem = { ...d }
            if (![d.ip, d.desc].includes(undefined)) {
                newItem.desc = getIpAssetInfo(d.ip).uniqDescArr
            }
            return newItem
        })
    }

    // ============== 筛选条件 ==============
    @observable filterCondition = {}

    @action.bound changeFilterCondition(newFilter) {
        this.filterCondition = newFilter
    }

    // ============== 获取表单实例  ==============
    form = null

    @action.bound getForm(form) {
        this.form = form
    }

    // 用setFields是因为这个方法主要是图表用的，deviceInput是个对象，用setFiledsValue会导致值的合并。
    @action.bound changeFormCondition(fieldValue) {
        if (this.form) {
            this.form.setFields(fieldValue)
            this.form.submit()
        }
    }

    // ============== 应用数据 ==============
    @computed get useData() {
        const filterArr = Object.entries(this.filterCondition)
        const currentPageType = this.pageType
        return this.currentData.filter(assetItem => {
            let result = true
            for (let i = 0; i < filterArr.length; i += 1) {
                const [key, value] = filterArr[i]
                if (key === 'is_alive' || key === 'formType') {
                    result = value.includes(assetItem[key])
                } else if (
                    ['url', 'host'].includes(currentPageType) &&
                    key === 'port'
                ) {
                    result = assetItem.port.includes(Number(value))
                } else if (Array.isArray(value)) {
                    result = intersection(value, assetItem[key]).length > 0
                } else if (currentPageType === 'srv' && key === 'port') {
                    result = assetItem.port === Number(value)
                } else {
                    result = formatStringSpace(value) === assetItem[key]
                }
                if (!result) {
                    break
                }
            }
            return result
        })
    }

    // ipNet参数集合
    @observable ipNetCondition = {}

    // ipNet change事件
    @action changeIpNetCondition = condition => {
        this.ipNetCondition = condition
        this.changeIpNetConditionData()
    }

    // 计算 ipNet 数据
    @action.bound changeIpNetConditionData() {
        const { resultData, ipNetCondition } = this
        const useData = getIpNetData(resultData, ipNetCondition)
        this.currentData = useData
    }

    // =============== 下面为关联图方法、参数=====================

    @observable srvData = []

    @observable hostData = []

    @observable urlData = []

    @observable ip = ''

    // 关联图按钮点击事件
    @action.bound changeRelationIp(ip, port) {
        this.ip = ip
        if (!ip) return
        this.getRelationData({ ip, port })
    }

    @observable relationLoading = false

    // 获取关联图数据
    @action getRelationData = params => {
        this.relationLoading = true
        const promiseArr = ['srv', 'host', 'url'].map(type => {
            return assetApi[`asset_${type}`]({
                ...params,
                ...this.currentParams,
            }).then(res => {
                this[`${type}Data`] = res
            })
        })
        return Promise.all(promiseArr)
            .then(() => {
                this.relationLoading = false
            })
            .catch(() => {})
    }

    @action.bound setCurrentParams(params) {
        this.currentParams = params
    }
}

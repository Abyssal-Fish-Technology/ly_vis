import { chain, countBy, intersection } from 'lodash'
import { action, computed, observable } from 'mobx'
import {
    formatStringSpace,
    keepDecimals,
} from '@shadowflow/components/utils/universal/methods-arithmetic'
import { eventGet } from '@/service'
import configStore from '@/layout/components/config/store'
import { splitEventObj } from '@shadowflow/components/system/event-system'
import {
    calculateUpdatedEventData,
    formatEventData,
} from '@/utils/methods-event'

export default class EventlistStore {
    // =============================== 数据获取 ===============================
    // ============== 格式化后的数据 ==============
    @observable formatData = []

    // ============== 获取数据 ==============
    @action.bound getEventData(params) {
        return eventGet({
            ...params,
        }).then(eventData => {
            this.formatData = formatEventData(eventData)
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

    // 事件页面的图表用来更高事件查询条件的，并且图表之间的相互修改应该是可以差值叠加的，所以采用了setFieldValue。
    @action.bound changeFormCondition(fieldValue) {
        if (this.form) {
            this.form.setFieldsValue(fieldValue)
            this.form.submit()
        }
    }

    // ============== 应用数据 ==============
    @computed get useData() {
        const filterArr = Object.entries(this.filterCondition)
        const moData = configStore.mo
        const ipTest = '[\\w.]*'
        const portTest = '\\d*'
        return this.formatData.filter(eventItem => {
            let result = true
            for (let i = 0; i < filterArr.length; i += 1) {
                const [key, value] = filterArr[i]
                const formatDevice = [
                    'attackDevice',
                    'victimDevice',
                    'allDevice',
                ].includes(key)
                    ? formatStringSpace(value)
                    : ''
                if (Array.isArray(value)) {
                    if (Array.isArray(eventItem[key])) {
                        result = intersection(value, eventItem[key]).length > 0
                    } else {
                        result = value.includes(eventItem[key])
                    }
                } else if (key === 'moid') {
                    const thisMo = moData.find(
                        moItem => moItem.id === Number(value)
                    )
                    const { moip, moport, pip, pport, protocol } = thisMo
                    const moDevice = `${moip || ipTest}:${moport || portTest}`
                    const pDevice = `${pip || ipTest}:${pport || portTest}`
                    const moToObjRegStr = `^${moDevice}>${pDevice}$|^${pDevice}>${moDevice}$`
                    const [, , , , eventProtocol] = splitEventObj(eventItem)
                    const isProtocolRight = protocol
                        ? protocol === eventProtocol
                        : true
                    const isObjMatch = new RegExp(moToObjRegStr).test(
                        eventItem.obj.split(' ')[0]
                    )
                    result = isProtocolRight && isObjMatch
                } else if (['attackDevice', 'victimDevice'].includes(key)) {
                    const deviceArr = eventItem[key].split(':')
                    result =
                        deviceArr.includes(formatDevice) ||
                        formatDevice === eventItem[key]
                } else if (key === 'allDevice') {
                    const { attackDevice = '', victimDevice = '' } = eventItem
                    const attackDeviceArr = attackDevice.split(':')
                    const victimDeviceArr = victimDevice.split(':')

                    result =
                        attackDeviceArr.includes(formatDevice) ||
                        victimDeviceArr.includes(formatDevice) ||
                        attackDevice === formatDevice ||
                        victimDevice === formatDevice
                } else {
                    // 统一值的类型，传进来的值类型和源数据中的类型可能不一致
                    result = value.toString() === eventItem[key].toString()
                }
                if (!result) {
                    break
                }
            }
            return result
        })
    }

    @computed get attackDeviceData() {
        return this.calcualteDeviceData(this.useData, 'attackDevice')
    }

    @computed get victimDeviceData() {
        return this.calcualteDeviceData(this.useData, 'victimDevice')
    }

    @computed get classifyData() {
        return this.calcualteDeviceData(this.useData, 'show_type')
    }

    @action.bound calcualteDeviceData = (data, sortName) => {
        const countObj = countBy(data, sortName)
        return chain(countObj)
            .keys()
            .map(d => ({
                name: d,
                value: countObj[d],
                percent: `${keepDecimals((countObj[d] * 100) / data.length)}%`,
            }))
            .filter(d1 => d1.name !== '')
            .orderBy('value', 'desc')
            .value()
    }

    @observable params = {}

    @action.bound start(params) {
        if (params) {
            this.params = params
        }
        return this.getEventData(params)
    }

    @action.bound changeProcessed(updateList) {
        this.formatData = calculateUpdatedEventData(this.formatData, updateList)
    }
}

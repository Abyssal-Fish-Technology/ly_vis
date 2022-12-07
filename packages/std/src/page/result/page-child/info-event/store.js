import { eventGet } from '@/service'
import { chain, countBy, max, min, uniqBy } from 'lodash'
import { action, observable } from 'mobx'
import { rountTime5Min } from '@shadowflow/components/utils/universal/methods-time'
import { formatEventData } from '@/utils/methods-event'

class EventInfoStore {
    @observable timeData = {
        time: [],
        extent: [0, 0],
        data: [],
    }

    @action.bound calculateTimeData(data, st, ed) {
        if (data.length === 0) {
            this.timeData = {
                time: [],
                extent: [0, 0],
                data: [],
            }
            return
        }
        const promiseArr = uniqBy(data, d => d.obj).map(d =>
            eventGet({
                obj: d.obj,
                starttime: st,
                endtime: ed,
                req_type: 'scatter',
            })
        )
        const timeArr = []
        Promise.all(promiseArr).then(res => {
            let gap = st
            while (gap < ed) {
                gap += 300
                timeArr.push(gap)
            }
            const dataArr = []
            const timeNotZero = []
            chain(res)
                .flatten()
                .reduce((obj, d) => {
                    if (!obj[d.type]) {
                        obj[d.type] = []
                    }
                    obj[d.type].push(d)
                    return obj
                }, {})
                .forIn((val, key) => {
                    const dataItem = timeArr.map(d => {
                        const thisTimeData = val.find(d1 => d1.time === d)
                        if (thisTimeData) {
                            timeNotZero.push(thisTimeData.time)
                            return thisTimeData.alarm_value
                        }
                        return 0
                    })
                    dataArr.push({
                        name: key,
                        data: dataItem,
                    })
                })
                .value()
            this.timeData = {
                time: timeArr,
                data: dataArr,
                extent: [min(timeNotZero), max(timeNotZero)].map(d =>
                    d.toString()
                ),
            }
        })
    }

    @observable typeData = []

    @action.bound calculateTypeData(data) {
        const typeCount = countBy(data, 'type')
        const newTypeData = Object.keys(typeCount).map(d => ({
            name: d,
            value: typeCount[d],
        }))
        this.typeData = newTypeData
    }

    @observable deviceData = []

    @action.bound calculateDeviceData(data) {
        const newDeviceData = []
        chain(data)
            .map(d => [d.attackDevice, d.victimDevice])
            .flatten()
            .countBy()
            .forIn((val, key) => {
                newDeviceData.push({
                    name: key,
                    value: val,
                })
            })
            .value()
        this.deviceData = newDeviceData.sort((b, a) => b.value - a.value)
    }

    @observable tableData = []

    @action.bound calcualteTableData(data) {
        this.tableData = data
    }

    @observable useData = []

    @action.bound start(eventData, conditionValue) {
        const useData = formatEventData(eventData)
        const [st, ed] = conditionValue.starttime.map(d =>
            rountTime5Min(d.unix())
        )
        this.useData = useData
        this.calculateTimeData(eventData, st, ed)
        this.calculateTypeData(eventData)
        this.calculateDeviceData(useData)
        this.calcualteTableData(useData)
    }
}

export default EventInfoStore

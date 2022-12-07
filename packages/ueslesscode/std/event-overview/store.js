import { observable, action } from 'mobx'
import moment from 'moment'
import { chain, countBy } from 'lodash'
import { calculateIpDesc, keep3 } from '@/utils/methods-data'
import { calculateEventType, EVENT_STAGES } from '@/utils/methods-event'

class EventOverviewStore {
    @observable data = []

    @observable cardData = EVENT_STAGES.map(d => ({
        name: d,
        value: 0,
    }))

    @action.bound calculateCardData() {
        const stageObj = countBy(this.data.map(d => d.stage))
        const newCardData = EVENT_STAGES.map(d => ({
            name: d,
            value: stageObj[d] || 0,
        }))
        this.cardData = newCardData
    }

    @observable ringData = [
        {
            title: '事件类型',
            data: [],
            key: 'show_type',
        },
        {
            title: '活跃状态',
            data: [],
            key: 'show_is_alive',
        },
        {
            title: '处理状态',
            data: [],
            key: 'show_proc_status',
        },
    ]

    @action.bound calcualteRingeData() {
        const total = this.data.length
        const newRingData = this.ringData.map(ringItem => {
            const countObj = countBy(this.data, ringItem.key)
            const data = Object.keys(countObj).map(d => ({
                name: d,
                value: countObj[d],
                percent: `${keep3((countObj[d] * 100) / total)}%`,
            }))
            return {
                ...ringItem,
                data,
            }
        })
        this.ringData = newRingData
    }

    @observable levelData = []

    @action.bound calcualteLevelData() {
        const newLeveltData = chain(this.data)
            .reduce((obj, d) => {
                const key = d.show_type
                obj[key] = obj[key]
                    ? obj[key]
                    : {
                          name: key,
                          level: {
                              极高: 0,
                              高: 0,
                              中: 0,
                              低: 0,
                              极低: 0,
                          },
                      }
                obj[key].level[d.show_level] += 1
                return obj
            }, {})
            .values()
            .value()
        this.levelData = newLeveltData
    }

    @observable timeData = []

    @action.bound calcualteTimeData() {
        const { starttime, endtime } = this.params
        const [startdate, enddate] = [starttime, endtime].map(d =>
            moment.unix(d).startOf('d')
        )
        const gap = enddate.diff(startdate, 'd') + 1
        const newTimeData = []
        for (let i = 0; i < gap; i += 1) {
            const thisDateStart = startdate.clone().add(i, 'd').unix()
            const thisDateEnd = startdate.clone().add(i, 'd').endOf('d').unix()
            const thisDateData = this.data.filter(d => {
                return d.starttime <= thisDateEnd && thisDateStart <= d.endtime
            })

            newTimeData.push({
                name: moment(thisDateStart * 1000).format('YYYY-MM-DD'),
                value: thisDateData.length,
                data: thisDateData,
            })
        }
        this.timeData = newTimeData
    }

    @observable hourData = []

    @action.bound calcaulteHourData() {
        const { starttime, endtime } = this.params
        const [startdate, enddate] = [starttime, endtime].map(d =>
            moment(d * 1000).startOf('d')
        )
        const dividHourData = []
        this.data.forEach(d => {
            const stime =
                d.starttime < startdate.unix() ? startdate.unix() : d.starttime
            const etime = d.endtime
            const hourgap =
                moment(etime * 1000)
                    .startOf('h')
                    .diff(moment(stime * 1000).startOf('h'), 'h') + 1
            for (let i = 0; i < hourgap; i += 1) {
                dividHourData.push({
                    // ...d,
                    day: moment(stime * 1000).format('YYYY-MM-DD'),
                    hour: moment(stime * 1000)
                        .startOf('h')
                        .add(i, 'h')
                        .hours(),
                })
            }
        })

        const dayGap = enddate.diff(startdate, 'd') + 1
        const newHourData = []
        for (let i = 0; i < dayGap; i += 1) {
            const thisStartDay = startdate
                .clone()
                .add(i, 'd')
                .format('YYYY-MM-DD')
            const thisDayData = dividHourData.filter(d => {
                return d.day === thisStartDay
            })

            const oneDayHour = new Array(24).fill(null).reduce((arr, d, h) => {
                const hourDataItem = thisDayData.filter(d1 => d1.hour === h)
                arr.push({
                    name: h,
                    value: hourDataItem.length,
                    data: hourDataItem,
                })
                return arr
            }, [])

            newHourData.push({
                name: thisStartDay,
                value: thisDayData.length,
                data: oneDayHour,
            })
        }
        this.hourData = newHourData
    }

    @observable hostData = {
        nodes: [],
        links: [],
    }

    @action.bound calculateHostData() {
        if (this.data.length === 0) {
            this.hostData = {
                nodes: [],
                links: [],
            }
            return
        }
        const hostData = chain(this.data)
            .reduce((obj, d) => {
                const { attackDevice, victimDevice, victimIp } = d
                const key = `attack_${attackDevice}-type_${calculateEventType(
                    d
                )}-victim_${victimDevice}-${calculateIpDesc(victimIp)}`
                obj[key] = {
                    name: key,
                    value: obj[key] ? obj[key].value + 1 : 1,
                }
                return obj
            }, {})
            .values()
            .map(d => {
                const [prop1, prop2, prop3, prop4] = d.name.split('-')
                return {
                    ...d,
                    prop1,
                    prop2,
                    prop3,
                    prop4,
                }
            })
            .sortBy('prop1')
            .value()
        const links = []
        hostData.forEach((d, i) => {
            links.push({
                source: d.prop1,
                target: d.prop2,
                value: d.value,
                id: i,
            })
            links.push({
                source: d.prop2,
                target: d.prop3,
                value: d.value,
                id: i,
            })
            links.push({
                source: d.prop3,
                target: d.prop4,
                value: d.value,
                id: i,
            })
        })

        const nodes = Array.from(
            new Set(links.flatMap(l => [l.source, l.target])),
            (name, id) => ({
                name,
                showName: name.replace(/(attack_)|(type_)|(victim_)/g, ''),
                id,
            })
        )

        links.forEach(d => {
            d.source = nodes.find(e => e.name === d.source).id
            d.target = nodes.find(e => e.name === d.target).id
        })
        this.hostData = {
            nodes,
            links,
        }
    }

    @action.bound start({ data, params }) {
        this.data = [...data]
        this.params = params
        this.calculateCardData()
        this.calcualteRingeData()
        this.calcualteLevelData()
        // this.calcualteTimeData()
        this.calcaulteHourData()
        this.calculateHostData()
    }
}

const eventOverviewStore = new EventOverviewStore()
export default eventOverviewStore

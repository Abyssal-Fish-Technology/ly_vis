import DateTimeRangePicker from '@shadowflow/components/ui/form/form-components/components/picker-daterange'
import Section from '@shadowflow/components/ui/layout/section'
import { Radio, Space } from 'antd'
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import moment from 'moment'
import { eventGet } from '@/service'
import { chain, difference, isNaN, map, maxBy } from 'lodash'
import {
    brushX,
    extent,
    path,
    scaleBand,
    scaleLinear,
    select,
    selectAll,
} from 'd3'
import { inject, observer } from 'mobx-react'
import {
    calculateDayStage,
    calculateWeekday,
    formatDuration,
    formatTimestamp,
    rountTime5Min,
} from '@shadowflow/components/utils/universal/methods-time'
import TooltipsGlobal from '@shadowflow/components/ui/tooltips'
import { BasicCustomChart } from '@shadowflow/components/charts'
import UnitContainer from '@shadowflow/components/ui/container/unit-container'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import style from './index.module.less'

function ExtraContent({ changeCallback, currenttime, originEndtime }) {
    const [lastTime, setLasttime] = useState({
        starttime: currenttime[0],
        endtime: currenttime[1],
    })
    const [activeKey, setActiveKey] = useState('6')
    useEffect(() => {
        const [starttime, endtime] = currenttime
        setLasttime({ starttime, endtime })
        setActiveKey(
            endtime && endtime === originEndtime
                ? `${Math.floor((endtime - starttime) / 24 / 60 / 60)}`
                : ''
        )
    }, [currenttime, originEndtime])

    const tabList = useMemo(
        () => [
            { tab: '7天 ', key: '6' },
            { tab: '15天 ', key: '14' },
            { tab: '30天 ', key: '29' },
        ],
        []
    )

    return (
        <div className='extra-content'>
            <Space size='large'>
                <div>
                    <span className='time-tips'>自最后检出前：</span>
                    <Radio.Group
                        defaultValue={activeKey}
                        value={activeKey}
                        onChange={e => {
                            const endtime = moment(originEndtime * 1000)
                                .endOf('day')
                                .unix()
                            const starttime = moment(endtime * 1000)
                                .subtract(Number(e.target.value), 'day')
                                .startOf('day')
                                .unix()
                            changeCallback([starttime, endtime])
                        }}
                        style={{ marginRight: '10px' }}
                    >
                        {tabList.map(tabItem => {
                            const { tab, key } = tabItem
                            return (
                                <Radio.Button value={key} key={key}>
                                    {tab}
                                </Radio.Button>
                            )
                        })}
                    </Radio.Group>
                    {currenttime.length && (
                        <DateTimeRangePicker
                            result={lastTime}
                            openChange={times => {
                                const [starttime, endtime] = times
                                changeCallback([
                                    moment(starttime * 1000)
                                        .startOf('day')
                                        .unix(),
                                    moment(endtime * 1000)
                                        .endOf('day')
                                        .unix(),
                                ])
                            }}
                            value={currenttime}
                            initFormat='YYYY-MM-DD'
                            ranges={false}
                            showTime={false}
                        />
                    )}
                </div>
                <div className='analysis-title'>特征分析</div>
            </Space>
        </div>
    )
}

function AlarmTiming({ changeReportData, originRecordData }) {
    // const [scatterData, setScatterData] = useState([])
    const [featureAnalysis, setFeatureAnalysis] = useState([
        {
            title: '时序特征',
            content: {},
        },
        {
            title: '数据特征',
            content: {},
        },
    ])
    const [isLoadChart, setIsLoadChart] = useState(false)
    const [loading, setLoading] = useState(false)
    const { obj, value_type: unit, devid } = originRecordData

    const eventGetInfo = useCallback(
        (starttime, endtime) => {
            setLoading(true)
            eventGet({
                starttime,
                endtime,
                obj,
                devid,
                req_type: 'ori',
            })
                .then(res => {
                    const {
                        time: maxTime = 0,
                        alarm_value: maxValue = 0,
                    } = maxBy(res, 'alarm_value')

                    const {
                        time: newTime = 0,
                        alarm_value: newValue = '',
                    } = maxBy(res, 'time')

                    const weekdayArr = chain(res)
                        .map(d => moment(d.time, 'X').day())
                        .sortBy()
                        .uniq()
                        .value()
                    const wholeWeekArr = [0, 1, 2, 3, 4, 5, 6]
                    let dayDesc = ''
                    switch (true) {
                        case weekdayArr.join() === wholeWeekArr.join():
                            dayDesc = `每天`
                            break
                        case !weekdayArr.includes(0) &&
                            !weekdayArr.includes(6) &&
                            weekdayArr.length > 4:
                            dayDesc = `工作日`
                            break
                        case weekdayArr.join() === '0,6':
                            dayDesc = `周末`
                            break
                        case weekdayArr.length >= 5:
                            dayDesc = `除${difference(wholeWeekArr, weekdayArr)
                                .map(d => calculateWeekday(d))
                                .join('、')}之外每天`
                            break
                        case weekdayArr.length < 5:
                            dayDesc = `${weekdayArr
                                .map(d => calculateWeekday(d))
                                .join('、')}`
                            break
                        default:
                            break
                    }

                    const wholeStageArr = [
                        '凌晨',
                        '早间',
                        '上午',
                        '午间',
                        '下午',
                        '晚间',
                        '深夜',
                    ]
                    const daystageArr = chain(res)
                        .map(d => calculateDayStage(d.time))
                        .uniq()
                        .sortBy(
                            (a, b) =>
                                wholeStageArr.indexOf(a) -
                                wholeStageArr.indexOf(b)
                        )
                        .value()

                    let stageDesc = ''
                    switch (true) {
                        case daystageArr.length === 7:
                            stageDesc = `全时段`
                            break
                        case daystageArr.length === 2 &&
                            daystageArr.includes('上午') &&
                            daystageArr.includes('下午'):
                            stageDesc = '工作时间'
                            break
                        case daystageArr.length >= 3 &&
                            !daystageArr.includes('上午') &&
                            !daystageArr.includes('下午'):
                            stageDesc = `非工作时间`
                            break
                        case daystageArr.length >= 2 &&
                            daystageArr.includes('上午') &&
                            daystageArr.includes('下午') &&
                            !daystageArr.includes('晚间'):
                            stageDesc = `休息时间`
                            break
                        case daystageArr.length > 2 &&
                            daystageArr.filter(
                                d =>
                                    !['早间', '上午', '午间', '下午'].includes(
                                        d
                                    )
                            ).length === 0:
                            stageDesc = '白天'
                            break
                        case daystageArr.length >= 2 &&
                            daystageArr.filter(
                                d => !['凌晨', '晚间', '深夜'].includes(d)
                            ).length === 0:
                            stageDesc = '夜里'
                            break
                        case daystageArr.length >= 5:
                            stageDesc = `除${difference(
                                wholeStageArr,
                                daystageArr
                            ).join('、')}之外`
                            break
                        case daystageArr.length < 5:
                            stageDesc = `${daystageArr.join('、')}`
                            break
                        default:
                            break
                    }

                    const aggreArr = []
                    let aggreRecord = {}

                    for (let i = 0; i < res.length; i += 1) {
                        const thisSt = res[i].time
                        const nextSt = res[i + 1]
                            ? res[i + 1].time
                            : res[i].time

                        if (!aggreRecord.starttime) {
                            aggreRecord.starttime = thisSt
                            aggreArr.push({
                                starttime: thisSt,
                                endtime: thisSt + 300,
                            })
                        }

                        // 没超过4个小时就算是一次连续。
                        if (nextSt - thisSt < 60 * 60 * 4) {
                            aggreArr[aggreArr.length - 1].endtime = nextSt + 300
                        } else {
                            aggreRecord = {}
                        }
                    }

                    aggreArr.forEach((aggreItem, i) => {
                        aggreItem.duration =
                            aggreItem.endtime - aggreItem.starttime
                        aggreItem.gap = aggreArr[i + 1]
                            ? aggreArr[i + 1].starttime - aggreItem.endtime
                            : 0
                    })

                    const longestDuration = aggreArr.length
                        ? Math.max.apply(
                              null,
                              aggreArr.map(d => d.duration)
                          )
                        : 0
                    const timing = {
                        发生日期: <div>{dayDesc}</div>,
                        集中时段: <div>{stageDesc}</div>,
                        行为检出: (
                            <div>
                                {aggreArr.length}
                                <UnitContainer
                                    unit={`次/${
                                        (endtime - starttime + 1) / (3600 * 24)
                                    }天`}
                                />
                            </div>
                        ),
                        最长持续: <div>{formatDuration(longestDuration)}</div>,
                    }
                    // 现在的时间范围是00:00:00 到23:59:59，展示时间段永远会差一秒到24小时（一天），在这里格式化时间时加上1s
                    const statistic = {
                        告警峰值: (
                            <div>
                                {arrangeAlerm(maxValue)}
                                <UnitContainer unit={`${unit}/5分钟`} />
                            </div>
                        ),
                        峰值时间: formatTimestamp(
                            rountTime5Min(maxTime),
                            'MM-DD HH:mm'
                        ),
                        最新告警: (
                            <div>
                                {arrangeAlerm(newValue)}
                                <UnitContainer unit={`${unit}/5分钟`} />
                            </div>
                        ),
                        最新时间: formatTimestamp(
                            rountTime5Min(newTime),
                            'MM-DD HH:mm'
                        ),
                    }

                    setFeatureAnalysis(originState => {
                        return originState.map((d, i) => {
                            return {
                                ...d,
                                content: i ? statistic : timing,
                            }
                        })
                    })
                    setIsLoadChart(true)
                    changeReportData('alarmOriginData', res)
                    changeReportData('alarmTimingData', {
                        eventData: res,
                        starttime,
                        endtime,
                        devid,
                    })
                })
                .finally(() => {
                    setLoading(false)
                })
        },
        [changeReportData, obj, unit, devid]
    )

    const [currenttime, setCurrenttime] = useState([])

    const originEndtime = useMemo(() => {
        return originRecordData.endtime
            ? moment(originRecordData.endtime * 1000)
                  .endOf('day')
                  .unix()
            : ''
    }, [originRecordData.endtime])

    useEffect(() => {
        if (originEndtime) {
            setCurrenttime([
                moment(originEndtime * 1000)
                    .subtract(6, 'day')
                    .startOf('day')
                    .unix(),
                originEndtime,
            ])
        }
    }, [originEndtime])

    useEffect(() => {
        if (currenttime.length) {
            const [starttime, endtime] = currenttime
            eventGetInfo(starttime, endtime)
        }
    }, [eventGetInfo, currenttime])

    return (
        <Section
            className={` analysis-section ${loading ? 'app-loading' : ''}`}
            title='告警行为详细时序变化'
            extraContent={
                <ExtraContent
                    originEndtime={originEndtime}
                    currenttime={currenttime}
                    changeCallback={setCurrenttime}
                />
            }
        >
            <div className='analysis-container'>
                <div className='analysis-chart'>
                    {isLoadChart && <TimeingChangeChart />}
                </div>
                <div className='analysis-desc'>
                    {featureAnalysis.map(featureItem => {
                        return (
                            <div
                                className='analysis-desc-part'
                                key={featureItem.title}
                            >
                                <div className='analysis-desc-secondtitle'>
                                    {featureItem.title}:
                                </div>
                                {Object.entries(featureItem.content).map(d => {
                                    return (
                                        <div
                                            className='analysis-desc-item'
                                            key={d[0]}
                                        >
                                            <div className='analysis-desc-label'>
                                                {d[0]}:
                                            </div>
                                            {d[1]}
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </Section>
    )
}

export default inject(stores => ({
    originRecordData: stores.eventDetailStore.originRecordData,
    changeReportData: stores.eventDetailStore.changeReportData,
}))(observer(AlarmTiming))

export const TimeingChangeChart = inject(stores => ({
    alarmTimingData: stores.eventDetailStore.alarmTimingData,
    setAlarmParams: stores.eventDetailStore.setAlarmParams,
}))(
    observer(({ alarmTimingData, setAlarmParams }) => {
        const itemHeight = useMemo(() => 30, [])
        const limitTime = useMemo(() => ({ maxTime: 7200, minTime: 3600 }), [])
        const { eventData = [], starttime, endtime, devid } = useMemo(
            () => alarmTimingData,
            [alarmTimingData]
        )
        const [height, setHeight] = useState(100)
        const [top, right, bottom, left] = useMemo(() => [10, 10, 20, 90], [])
        const container = useRef(null)
        const [realSize, setRealSize] = useState({
            realHeight: 100,
            realWidth: 100,
        })

        const dayArr = useMemo(() => {
            const [minMoment, maxMoment] = [starttime, endtime].map(d =>
                moment(d * 1000)
            )

            const dayGap = Math.ceil(
                maxMoment
                    .startOf('day')
                    .diff(minMoment.startOf('day'), 'days', true)
            )
            const arr = [
                {
                    text: minMoment.format('MM-DD'),
                    week: calculateWeekday(minMoment.day()),
                    value: minMoment.unix(),
                },
            ]
            for (let i = 0; i < dayGap; i += 1) {
                const newMoment = minMoment.clone().add(i + 1, 'day')
                arr.push({
                    text: newMoment.format('MM-DD'),
                    week: calculateWeekday(newMoment.day()),
                    value: newMoment.unix(),
                })
            }
            return starttime ? arr : []
        }, [starttime, endtime])

        const yLinear = useMemo(() => {
            return scaleBand()
                .domain(map(dayArr, 'value'))
                .range([0, realSize.realHeight])
        }, [dayArr, realSize])

        const heightLinear = useMemo(() => {
            const alarmValueArr = chain(eventData).map('alarm_value').value()
            const [minValue, maxValue] = extent(alarmValueArr)
            return scaleLinear()
                .domain([minValue, maxValue])
                .range([yLinear.bandwidth() / 4, (yLinear.bandwidth() / 4) * 3])
        }, [eventData, yLinear])

        useEffect(() => {
            const autoheight = dayArr.length * itemHeight + top + bottom
            setHeight(autoheight)
        }, [bottom, dayArr, itemHeight, top])

        const xLinear = useMemo(() => {
            return scaleLinear()
                .domain([0, 3600 * 24])
                .range([0, realSize.realWidth])
        }, [realSize])

        const useData = useMemo(() => {
            return chain(eventData)
                .uniqBy('time')
                .map(item => {
                    const nowtime =
                        moment(item.time * 1000).unix() -
                        moment(item.time * 1000)
                            .set({
                                hour: 0,
                                minute: 0,
                                second: 0,
                            })
                            .unix()
                    return {
                        x: xLinear(nowtime),
                        y: yLinear(
                            moment(item.time * 1000)
                                .set({
                                    hour: 0,
                                    minute: 0,
                                    second: 0,
                                })
                                .unix()
                        ),
                        alarmValue: item.alarm_value,
                        time: item.time,
                        valueType: item.value_type,
                    }
                })
                .value()
        }, [eventData, xLinear, yLinear])

        const yOffset = useMemo(() => {
            return yLinear.bandwidth() / 2
        }, [yLinear])

        const opacityScale = useMemo(() => {
            const domain = eventData.length
                ? extent(eventData, d => d.alarm_value)
                : [0, 1]
            return scaleLinear().domain(domain).range([0.1, 1])
        }, [eventData])

        const initTime = useMemo(() => {
            const currentAlaramData = maxBy(eventData, 'time')
            if (currentAlaramData) {
                const { maxTime } = limitTime
                // 1 获取事件结束时间，结束时间默认往后推5分钟把方块包住（否则tcp数据有可能查不出来），往后推完超出当天则取默认时间
                const sameDate = moment(currentAlaramData.time * 1000).date()
                const max =
                    moment((currentAlaramData.time + 300) * 1000).date() >
                    sameDate
                        ? currentAlaramData.time
                        : currentAlaramData.time + 300

                // 2 由结束时间往前推两个小时,如果推了2小时后到了前一天，那开始时间取当天0点
                const min =
                    moment((max - maxTime) * 1000).date() < sameDate
                        ? moment(max * 1000)
                              .startOf('day')
                              .unix()
                        : max - maxTime
                return {
                    day: moment(max * 1000)
                        .set({
                            hour: 0,
                            minute: 0,
                            second: 0,
                        })
                        .unix(),
                    min,
                    max,
                }
            }
            // starttime是时间选择器中的开始时间，这里返回starttime是为了解决当第一次选择时间后有数据，
            // 第二次选择时间后没有数据，造成下方的event_feature和feature接口未更新的问题。
            // 此时传入下方接口的时间参数为starttime，请求的数据为空
            return { day: starttime, min: starttime, max: starttime }
        }, [eventData, limitTime, starttime])

        useEffect(() => {
            const { min, max } = initTime
            if (min && max) {
                setAlarmParams({
                    starttime: min,
                    endtime: max,
                    devid,
                })
            }
        }, [devid, setAlarmParams, initTime])

        useEffect(() => {
            const { maxTime } = limitTime
            const { realWidth } = realSize
            const isExceed = (node, tStart) => {
                // 判断刷取的开始时间是否超过当前时间。这里的当前时间往前推了5分钟，因为取值是5分钟，防止刷取超出后接口报错
                return (
                    moment(
                        (Number(select(node).attr('data-time')) +
                            parseInt(tStart, 10)) *
                            1000
                    ).unix() >
                    moment().unix() - 300
                )
            }
            const brushNode = brushX()
                .extent([
                    [0, 0],
                    [realWidth, itemHeight],
                ])
                .on('start', function a(event) {
                    const { sourceEvent, selection } = event
                    if (!sourceEvent || !selection) return
                    const that = this
                    select(container.current)
                        .selectAll('.brush-x')
                        .each(function qwea() {
                            if (this !== that) {
                                select(this).call(brushX().move, null)
                            }
                        })
                })
                .on('brush', function moveFn(event) {
                    const { selection, sourceEvent } = event
                    if (!sourceEvent || !selection) return

                    const t = selection.map(xLinear.invert)
                    const timeNumer = parseInt(t[1], 10) - parseInt(t[0], 10)
                    const isMax = timeNumer > maxTime
                    // 刷取的开始时间大于当前时间是取消刷取
                    if (isExceed(this, t[0])) {
                        select(this).call(brushX().move, null)
                        return
                    }
                    if (isMax) {
                        const start =
                            selection[1] >= realWidth
                                ? realWidth - xLinear(maxTime)
                                : selection[0]
                        const end =
                            selection[1] >= realWidth
                                ? realWidth
                                : selection[0] + xLinear(maxTime)

                        select(this).call(brushX().move, [
                            start < 0 ? end : start,
                            start < 0 ? end + xLinear(maxTime) : end,
                        ])
                    }
                })
                .on('end', function end(event) {
                    const { sourceEvent, selection = [] } = event

                    if (!sourceEvent || !selection) return
                    const t = selection.map(xLinear.invert)
                    const nowtime = Number(select(this).attr('data-time'))
                    // 当刷取开始时间超过当前时间和select为undefined时 return
                    if (isExceed(this, t[0]) || isNaN(nowtime)) {
                        return
                    }

                    const searchStartTime = moment(
                        (nowtime + parseInt(t[0], 10)) * 1000
                    ).unix()

                    setAlarmParams({
                        starttime: searchStartTime,
                        endtime: moment(
                            (nowtime + parseInt(t[1], 10)) * 1000
                        ).unix(),
                        devid,
                    })
                })
            select(container.current).selectAll('.brush-x').call(brushNode)

            const { day, min, max } = initTime
            if (min && max) {
                const nowStarttime = moment(min * 1000).unix() - day
                const nowEndtime = moment(max * 1000).unix() - day
                selectAll('.brush-x')
                    .filter(function test() {
                        return select(this).attr('data-time') === `${day}`
                    })
                    .call(brushNode.move, [
                        xLinear(nowStarttime),
                        xLinear(nowEndtime),
                    ])
                selectAll('.brush-x')
                    .filter(function test() {
                        return select(this).attr('data-time') !== `${day}`
                    })
                    .each(function qwea() {
                        select(this).call(brushX().move, null)
                    })
            }
        }, [
            dayArr,
            xLinear,
            itemHeight,
            initTime,
            limitTime,
            setAlarmParams,
            devid,
            starttime,
            realSize,
        ])
        const [tipsData, setTipsData] = useState({
            time: '',
            valueType: '',
            alarmValue: '',
        })
        const nowRef = useRef(null)

        return (
            <div
                className={style['alarm-timing-chart']}
                ref={container}
                id='alarm-chart-id'
            >
                <BasicCustomChart
                    chartPadding={{ top, right, bottom, left }}
                    data={useData}
                    parentRef={container}
                    customHeight={height}
                    callbackRealSize={setRealSize}
                >
                    <g transform={`translate(${left}, ${top})`}>
                        <line
                            x1={0}
                            y1={0}
                            x2={realSize.realWidth}
                            y2={0}
                            className='label-line'
                        />
                        <g className='split-g axis-x'>
                            {[0, 6, 9, 12, 14, 18, 22].map(d => {
                                const x = xLinear(d * 3600)
                                return (
                                    <g key={d} transform={`translate(${x}, 0)`}>
                                        {d !== 0 && (
                                            <line
                                                x1={0}
                                                y1={0}
                                                x2={0}
                                                y2={
                                                    realSize.realHeight +
                                                    bottom -
                                                    15
                                                }
                                                key={d}
                                            />
                                        )}
                                        <text y={realSize.realHeight + bottom}>
                                            {`${d}:00`}
                                        </text>
                                    </g>
                                )
                            })}
                        </g>
                        <g transform={`translate(0,${yOffset})`}>
                            {dayArr.map(d => {
                                return (
                                    <g key={d.value}>
                                        <g
                                            transform={`translate(0, ${yLinear(
                                                d.value
                                            )})`}
                                            className='xAxis-item'
                                        >
                                            <text
                                                x={-10}
                                                className='xAxis-label'
                                            >
                                                {`${d.text} (${d.week})`}
                                            </text>
                                        </g>
                                        <g
                                            className='brush-x'
                                            transform={`translate(0, ${
                                                yLinear(d.value) -
                                                itemHeight / 2
                                            })`}
                                            data-time={d.value}
                                        />
                                        <line
                                            transform={`translate(0, ${
                                                yLinear(d.value) + yOffset
                                            })`}
                                            x1={0}
                                            y1={0}
                                            x2={realSize.realWidth}
                                            y2={0}
                                            className='label-line'
                                        />
                                    </g>
                                )
                            })}
                        </g>
                        <line
                            x1={0}
                            y1={0}
                            x2={0}
                            y2={realSize.realHeight}
                            className='label-line'
                        />

                        <g>
                            {useData.map(gItem => {
                                const {
                                    x,
                                    y,
                                    alarmValue,
                                    time,
                                    valueType,
                                } = gItem
                                const nowPath = path()
                                nowPath.rect(
                                    x,
                                    y +
                                        (yOffset * 2 -
                                            heightLinear(alarmValue)) /
                                            2,
                                    xLinear(300),
                                    heightLinear(alarmValue)
                                )
                                return (
                                    <path
                                        key={time}
                                        d={nowPath.toString()}
                                        fillOpacity={opacityScale(alarmValue)}
                                        className='path-node'
                                        onMouseEnter={e => {
                                            setTipsData({
                                                time: moment(
                                                    time * 1000
                                                ).format('YYYY-MM-DD HH:mm:ss'),
                                                alarmValue,
                                                valueType,
                                            })
                                            nowRef.current.openTooltips(
                                                e.nativeEvent,
                                                container.current
                                            )
                                        }}
                                        onMouseOut={() => {
                                            nowRef.current.closeTooltips()
                                        }}
                                    />
                                )
                            })}
                        </g>
                    </g>
                </BasicCustomChart>
                <TooltipsGlobal ref={nowRef}>
                    <div className='tips-time'>{tipsData.time}</div>
                    <div className='tips-container'>
                        告警值
                        <span className='tip-alarm-value'>
                            ：{tipsData.alarmValue}
                        </span>
                        <UnitContainer
                            unit={
                                tipsData.valueType
                                    ? `${tipsData.valueType}`
                                    : 'Bps'
                            }
                        />
                    </div>
                </TooltipsGlobal>
            </div>
        )
    })
)

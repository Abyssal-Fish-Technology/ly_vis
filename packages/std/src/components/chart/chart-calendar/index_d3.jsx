import React, { useState, useCallback } from 'react'
import { extent, utcSunday, utcYear, range, scaleLinear } from 'd3'
import moment from 'moment'
import style from './index.module.less'

function translate(d, type) {
    const obj = {
        week: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        month: [
            '一月',
            '二月',
            '三月',
            '四月',
            '五月',
            '六月',
            '七月',
            '八月',
            '九月',
            '十月',
            '十一月',
            '十二月',
        ],
    }
    return obj[type][d]
}

export default function CalendarChart(props) {
    const { data } = props
    const [width, setwidth] = useState(100)
    const [height, setheight] = useState(100)
    const [top, right, bottom, left] = [20, 10, 10, 30]

    const chartHeight = height - top - bottom
    const chartWidth = width - left - right

    const [startDate, endDate] = extent(data, d => moment(d.name).unix() * 1000)
    const startmonth = moment(startDate).startOf('M')
    const endmonth = moment(endDate).endOf('M')
    const daygap = endmonth.diff(startmonth, 'd') + 1
    const monthgap = endmonth.month() - startmonth.month() + 1
    const startMonthCount = utcSunday.count(utcYear(startmonth), startmonth)
    const endMonthCount = utcSunday.count(utcYear(endmonth), endmonth)

    const [cellwidth, cellheight] = [
        chartWidth / (endMonthCount - startMonthCount + 1),
        chartHeight / 7,
    ]
    const cellGap = 1

    function calWeek(d) {
        return (d.day() + 6) % 7
    }
    function calMonthPath(t) {
        const n = 7
        const d = Math.max(0, Math.min(n, calWeek(t)))
        const w = utcSunday.count(utcYear(t), t) - startMonthCount
        let a = `M${(w + 1) * cellwidth},0V${d * cellheight}H${w * cellwidth}`
        if (d === 0) {
            a = `M${w * cellwidth},0`
        } else if (d === n) {
            a = `M${(w + 1) * cellwidth},0`
        }
        return `${a}V${n * cellheight}`
    }

    const calendarBg = []
    for (let i = 0; i < daygap; i += 1) {
        const item = moment(startmonth.clone().add(i, 'd'))
        const yearWeekCount =
            utcSunday.count(utcYear(item), item) - startMonthCount

        calendarBg.push({
            key: i,
            width: cellwidth,
            height: cellheight,
            x: yearWeekCount * cellwidth + cellGap,
            y: calWeek(item) * cellheight + cellGap,
        })
    }

    const container = useCallback(node => {
        if (node !== null) {
            const {
                width: newWidth,
                height: newHeight,
            } = node.getBoundingClientRect()
            setwidth(newWidth)
            setheight(newHeight)
        }
    }, [])

    const opacityScale = scaleLinear()
        .domain(extent(data, d => d.value))
        .range([0, 1])

    const calendarData = data.map(d => {
        const date = moment(d.name)
        const yearWeekCount =
            utcSunday.count(utcYear(date), date) - startMonthCount
        return {
            ...d,
            props: {
                key: d.name,
                width: cellwidth,
                height: cellheight,
                fill: 'red',
                opacity: opacityScale(d.value),
                x: yearWeekCount * cellwidth + cellGap,
                y: ((moment(date).day() + 6) % 7) * cellheight + cellGap,
            },
        }
    })

    return (
        <div className={`chart-container ${style.chart}`} ref={container}>
            <svg viewBox={[0, 0, width, height]}>
                <g transform={`translate(${left}, ${top})`}>
                    <g className='chart-week'>
                        {range(7).map(d => (
                            <text
                                {...{
                                    x: -20,
                                    y: (d + 0.5) * cellheight,
                                    dy: '0.31em',
                                    key: d,
                                }}
                            >
                                {translate(d, 'week')}
                            </text>
                        ))}
                    </g>
                    <g className='chart-month-name'>
                        {range(monthgap).map((d, i) => {
                            const date = moment(startmonth.clone().add(i, 'M'))
                            return (
                                <text
                                    {...{
                                        x:
                                            (utcSunday.count(
                                                utcYear(date),
                                                date
                                            ) -
                                                startMonthCount) *
                                                cellwidth +
                                            2,
                                        y: -5,
                                        key: d,
                                    }}
                                >
                                    {translate(date.month(), 'month')}
                                </text>
                            )
                        })}
                    </g>
                    <g className='chart-day-bg'>
                        {calendarBg.map(d => {
                            return <rect {...d} />
                        })}
                    </g>
                    <g className='chart-month-day'>
                        {calendarData.map(d => {
                            return <rect {...d.props} />
                        })}
                    </g>
                    <g className='chart-month-path'>
                        {range(monthgap).map((d, i) => {
                            const date = moment(startmonth.clone().add(i, 'M'))
                            return (
                                <path
                                    {...{
                                        key: d,
                                        d: calMonthPath(date),
                                    }}
                                />
                            )
                        })}
                    </g>
                </g>
            </svg>
        </div>
    )
}

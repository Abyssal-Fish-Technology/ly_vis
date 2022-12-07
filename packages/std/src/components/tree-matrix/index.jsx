import { createColorScale } from '@/utils/methods-chart-d3'
import { Spin } from 'antd'
import {
    extent,
    axisBottom,
    select,
    scaleLinear,
    stratify,
    selectAll,
    path,
    event,
    brushX,
    max,
    line,
    mouse,
} from 'd3'
import { chain, sumBy } from 'lodash'
import { toJS } from 'mobx'
import moment from 'moment'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    formatTimestamp,
    rountTime5Min,
} from '@shadowflow/components/utils/universal/methods-time'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import withNoData from '@shadowflow/components/ui/layout/with-nodata'
import style from './index.module.less'

function calShowName(name) {
    const charCount = 18
    const nameStr = name.toString()
    return nameStr.length > charCount
        ? `${name.slice(0, charCount - 3)}...`
        : nameStr
}

function calClass(name, prev) {
    return `${prev}-${name.replace(/\./g, '-')}`
}

function Tooltip({ tooltipAttr }) {
    const { style: tooltipStyle, time, value, name } = tooltipAttr
    return (
        <div className='tooltips' style={tooltipStyle}>
            <div className='tooltips-item'>{time}</div>
            <div className='tooltips-item'>
                <span className='tooltips-label'>{name}: </span>
                <span className='tooltips-value'>{value}</span>
            </div>
        </div>
    )
}

function TreeMatrix({ data, params, loading }) {
    const [top, right, bottom, left] = useMemo(() => [10, 100, 80, 100], [])

    const container = useRef(null)
    // const scaleRef = useRef(false)
    const dayDiff = 24 * 60 * 60

    const opacityScale = useMemo(() => {
        const range = extent(
            chain(data).slice(1).map('eventData').flatten().value(),
            d => d.value
        )
        return scaleLinear().domain(range).range([0.1, 1])
    }, [data])
    const useData = useMemo(() => {
        return stratify()
            .id(d1 => d1.name)
            .parentId(d1 => d1.parent)(data)
            .descendants()
    }, [data])

    const colorScale = useMemo(() => {
        return createColorScale(
            chain(useData)
                .map(d => d.type)
                .filter(d => d)
                .uniq()
                .value()
        )
    }, [useData])

    const groupData = useMemo(() => {
        return chain(useData)
            .reduce((obj, d) => {
                const { depth } = d
                if (depth <= 1) return obj
                const dataArr = obj[depth] ? obj[depth].data : []
                dataArr.push({
                    name: d.data.name,
                    parent: d.parent.data.name,
                    depth,
                    data: toJS(d.data),
                    children: d.children,
                })
                obj[depth] = {
                    depth,
                    data: dataArr,
                }
                return obj
            }, {})
            .values()
            .value()
    }, [useData])

    const lineArr = chain(groupData)
        .filter(d => d.depth >= 3)
        .reduce((arr, d) => {
            d.data.forEach(d1 => arr.push(`${d1.parent}`))
            return arr
        }, [])
        .uniq()
        .value()
    const lineData = useMemo(() => {
        const result = chain(groupData)
            .reduce((arr, d) => {
                d.data.forEach(d1 => {
                    d1.data.eventData.forEach(d2 => arr.push(d2))
                })
                return arr
            }, [])
            .groupBy('time')
            .mapValues(d2 => d2.length)
            .entries()
            .map(d3 => {
                return { time: Number(d3[0]), value: d3[1] }
            })
            .value()
        return result
    }, [groupData])

    const [rectWidth, setrectWidth] = useState(10)
    const rectHeight = 20
    const [size, setsize] = useState({
        height: 100,
        width: 100,
    })

    const [startHour, endHour] = useMemo(
        () =>
            [params.starttime, params.endtime].map(d =>
                moment(d * 1000).unix()
            ),
        [params]
    )
    const timeArr = []
    const yPObj = {}
    const gap = useMemo(() => 3600, [])
    const a = useMemo(
        () =>
            (endHour - startHour) / 3600 < 24
                ? (endHour - startHour) / gap
                : (endHour + 3600 - startHour) / gap,
        [endHour, startHour, gap]
    )
    for (let i = 0; i <= a; i += 1) {
        if ((endHour - startHour) / 3600 < 24 && i === a) break
        const timeStamp = startHour + i * gap
        timeArr.push({
            time: timeStamp,
            name: moment(timeStamp * 1000).format('MM-DD HH:mm'),
        })
        yPObj[timeStamp] = i * rectWidth
    }

    useEffect(() => {
        const { width } = container.current.getBoundingClientRect()
        const height =
            (sumBy(groupData, d => d.data.length) + groupData.length - 1) *
                rectHeight +
            top +
            bottom
        const newrectWidth = (width - left - right) / a
        setrectWidth(newrectWidth < 3 ? 3 : newrectWidth)
        setsize({
            width,
            height,
        })
    }, [params, left, data, right, groupData, top, bottom, a])

    const axisRef = useRef(null)
    const axisBrushRef = useRef(null)
    const brushRef = useRef(null)
    const lineRef = useRef(null)
    const [tooltipAttr, settooltipAttr] = useState({
        style: {
            display: 'none',
        },
        value: '',
        time: '',
        name: '',
    })
    useEffect(() => {
        const maxWidth = size.width - left - right
        const maxHeight = size.height - top - bottom
        if (maxWidth < 0) return
        const initHour = (endHour - startHour) / dayDiff
        const maxTime = initHour > 3 ? startHour + 3 * dayDiff : endHour
        const minTime = startHour + 3600 * 24

        const xLinear = scaleLinear()
            .domain([startHour, endHour])
            .range([0, maxWidth])

        const xLinear2 = scaleLinear()
            .domain([startHour, endHour])
            .range([0, maxWidth])
        const xAxis = axisBottom(xLinear).tickFormat(d =>
            moment(d * 1000).format('MM-DD HH:mm')
        )
        const xAxis2 = axisBottom(xLinear).tickFormat(d =>
            moment(d * 1000).format('MM-DD HH:mm')
        )
        const brushNode = brushX()
            .extent([
                [0, 0],
                [maxWidth, rectHeight * 2],
            ])
            .on('brush', function moveFn() {
                const d = event.selection
                const t = d.map(xLinear2.invert)
                const df = (parseInt(t[1], 10) - parseInt(t[0], 10)) / dayDiff
                const currentMinTime =
                    (parseInt(t[1], 10) - parseInt(t[0], 10)) / 60 / 60
                if ((endHour - startHour) / 3600 < 24) {
                    return
                }
                if (d[1] > maxWidth) {
                    event.target.move(select(this), [d[0], maxWidth])
                    return
                }

                if (df <= 3) {
                    if (currentMinTime < 24) {
                        const start =
                            d[1] >= maxWidth
                                ? maxWidth - xLinear2(minTime)
                                : d[0]
                        const end =
                            d[1] >= maxWidth
                                ? maxWidth
                                : d[0] + xLinear2(minTime)
                        event.target.extent([
                            [start, maxHeight],
                            [end, maxHeight],
                        ])

                        event.target.move(select(this), [start, end])
                    } else {
                        const scale = maxWidth / (d[1] - d[0])
                        setTimeout(() => {
                            selectAll('.group-box').each(function boxFn() {
                                select(this)
                                    .selectAll('.node-group')
                                    .each(function groupFn(item, index) {
                                        select(this).attr(
                                            'transform',
                                            `translate(${-d[0] * scale},${
                                                rectHeight * index
                                            })
                                            `
                                        )
                                        select(this)
                                            .selectAll('.bg-rect,.node-rect')
                                            .each(function eachFn() {
                                                const currentX = Number(
                                                    select(this).attr('a')
                                                )
                                                if (
                                                    currentX < d[0] ||
                                                    currentX >
                                                        d[1] - rectWidth / 1.5
                                                ) {
                                                    select(this).attr(
                                                        'opacity',
                                                        0
                                                    )
                                                } else {
                                                    select(this).attr(
                                                        'opacity',
                                                        1
                                                    )
                                                }
                                                select(this).attr(
                                                    'x',
                                                    currentX * scale
                                                )
                                            })
                                            .attr('width', rectWidth * scale)
                                    })
                            })
                        }, 0)

                        // xLinear.clamp(true)
                        // x轴缩放
                        const s = d || xLinear2.range()
                        xLinear.domain(s.map(xLinear2.invert, xLinear2))
                        select('.axis--x').call(xAxis)
                    }
                } else {
                    event.target.extent([
                        [d[0], maxHeight],
                        [d[0] + xLinear2(maxTime), maxHeight],
                    ])

                    event.target.move(select(this), [
                        d[0],
                        d[0] + xLinear2(maxTime),
                    ])
                }
            })

        const arr = []
        for (let i = startHour; i <= endHour; i += 300) {
            arr.push({ time: i === startHour ? rountTime5Min(startHour) : i })
        }

        arr.forEach(d => {
            for (let i = 0; i < lineData.length; i += 1) {
                if (lineData[i].time === d.time) {
                    d.value = lineData[i].value
                    break
                }
            }
            if (d.value === undefined) {
                d.value = 0
            }
        })

        const yLiner = scaleLinear()
            .domain([0, max(arr, d => d.value) + 2])
            .range([40, 0])
        const valuelineBrush = line()
            .x(d => {
                return xLinear2(d.time)
            })
            .y(d => yLiner(d.value))

        select(lineRef.current)
            .datum(arr)
            .attr('d', d => {
                return valuelineBrush(d)
            })
            .attr('transform', `translate(0,${maxHeight + 20})`)

        select(axisRef.current).call(xAxis)
        select(axisBrushRef.current).call(xAxis2)
        select(brushRef.current)
            .call(brushNode)
            .call(brushNode.move, [0, xLinear2(maxTime)])
            .on('mousemove', function move() {
                const [x] = mouse(select(this).node())
                if (x >= 0 && x <= maxWidth) {
                    const xx = arr.find(d => {
                        return (
                            d.time ===
                            rountTime5Min(parseInt(xLinear2.invert(x), 10))
                        )
                    })
                    select('.line-id')
                        .attr('x1', x - 1)
                        .attr('x2', x - 1)
                        .attr('y1', 0)
                        .attr('y2', 40)
                        .attr('stroke-width', 1)

                    settooltipAttr({
                        style: {
                            display: 'block',
                            left: x,
                            bottom,
                        },
                        value: xx && xx.value ? xx.value : 0,
                        time: formatTimestamp(xx.time, 'min'),
                        name: '事件数量',
                    })
                } else {
                    settooltipAttr({
                        style: {
                            display: 'none',
                        },
                        value: 0,
                        time: 0,
                        name: '',
                    })
                    select('.line-id').attr('stroke-width', 0)
                }
            })
            .on('mouseout', function out() {
                settooltipAttr({
                    style: {
                        display: 'none',
                    },
                    value: 0,
                    time: 0,
                    name: '',
                })
                select('.line-id').attr('stroke-width', 0)
            })
    }, [
        bottom,
        endHour,
        left,
        right,
        size,
        startHour,
        top,
        dayDiff,
        lineData,
        rectWidth,
        rectHeight,
    ])

    const labelPos = useRef({})
    let groupTop = 0

    return (
        <Spin spinning={loading}>
            <div className={`chart-container ${style.chart}`} ref={container}>
                <Tooltip tooltipAttr={tooltipAttr} />
                <svg height={size.height} width={size.width}>
                    <defs>
                        <marker
                            id='arrows'
                            viewBox='-0 -5 10 10'
                            refX='0'
                            refY='0'
                            orient='auto'
                            markerWidth='8'
                            markerHeight='8'
                            xoverflow='visible'
                        >
                            <path
                                d='M0,-5L10,0L0,5'
                                stroke='none'
                                fill='#3a65ff'
                            />
                        </marker>
                    </defs>
                    <g className='bg' transform={`translate(${left}, ${top})`}>
                        {groupData.map((d, i) => {
                            const { depth } = d
                            if (i === 0) groupTop = 0
                            else
                                groupTop +=
                                    (groupData[i - 1].data.length + 1) *
                                    rectHeight

                            const parentNameCount = chain(d.data)
                                .countBy('parent')
                                .entries()
                                .value()
                            const thisNameCount = chain(d.data)
                                .countBy('name')
                                .entries()
                                .value()
                            return (
                                <g
                                    key={depth}
                                    transform={`translate(${0}, ${groupTop})`}
                                    className='group-box'
                                >
                                    {d.data.map((d1, j) => (
                                        <g
                                            key={`${d1.parent}-${d1.name}`}
                                            transform={`translate(${0}, ${
                                                j * rectHeight
                                            })`}
                                            className={`${calClass(
                                                d1.parent,
                                                'group'
                                            )} ${calClass(
                                                d1.name,
                                                'group'
                                            )} node-group`}
                                        >
                                            {timeArr.map((d3, k) => {
                                                return (
                                                    <rect
                                                        className='bg-rect'
                                                        key={`bg-${d3.time}`}
                                                        a={k * rectWidth}
                                                        x={k * rectWidth}
                                                        y={0}
                                                        height={rectHeight}
                                                        width={rectWidth}
                                                    />
                                                )
                                            })}
                                            {d1.data.eventData.map(d3 => {
                                                return (
                                                    <rect
                                                        className='node-rect'
                                                        fillOpacity={opacityScale(
                                                            d3.value
                                                        )}
                                                        fill={colorScale(
                                                            d3.type
                                                        )}
                                                        a={yPObj[d3.time]}
                                                        key={d3.time}
                                                        x={yPObj[d3.time]}
                                                        y={0}
                                                        height={rectHeight}
                                                        width={rectWidth}
                                                        onMouseEnter={() => {
                                                            const tipleft = yPObj[
                                                                d3.time
                                                            ]
                                                                ? yPObj[d3.time]
                                                                : 0 +
                                                                  left +
                                                                  rectWidth

                                                            const tipTop =
                                                                groupTop +
                                                                j * rectHeight +
                                                                top
                                                            settooltipAttr({
                                                                style: {
                                                                    display:
                                                                        'block',
                                                                    left: tipleft,
                                                                    top:
                                                                        tipTop +
                                                                        20,
                                                                },
                                                                value: `${arrangeAlerm(
                                                                    d3.value
                                                                )} ${d3.unit}`,
                                                                time: formatTimestamp(
                                                                    d3.time,
                                                                    'min'
                                                                ),
                                                                name: '告警值',
                                                            })
                                                        }}
                                                        onMouseOut={() => {
                                                            settooltipAttr({
                                                                style: {
                                                                    display:
                                                                        'none',
                                                                },
                                                                value: '',
                                                                time: '',
                                                                name: '',
                                                            })
                                                        }}
                                                    />
                                                )
                                            })}
                                        </g>
                                    ))}
                                    {thisNameCount.map((d1, j) => {
                                        const posTop =
                                            (d1[1] / 2 +
                                                sumBy(
                                                    thisNameCount.slice(0, j),
                                                    d2 => d2[1]
                                                )) *
                                            rectHeight
                                        const posLeft =
                                            size.width - left - right
                                        labelPos.current[`${d1[0]}-child`] = [
                                            posLeft,
                                            posTop + groupTop,
                                        ]
                                        return (
                                            <g
                                                className={`${calClass(
                                                    d1[0],
                                                    'child'
                                                )} device-label`}
                                                key={`${d1[0]}-child`}
                                                transform={`translate(${posLeft}, ${posTop})`}
                                                onMouseEnter={() => {
                                                    selectAll(
                                                        '.track-links'
                                                    ).attr('opacity', 0.1)
                                                    selectAll(
                                                        '.node-group'
                                                    ).attr('opacity', 0.1)
                                                    selectAll(
                                                        `.${calClass(
                                                            d1[0],
                                                            'group'
                                                        )}`
                                                    ).attr('opacity', 1)
                                                    selectAll(
                                                        `.${calClass(
                                                            d1[0],
                                                            'link'
                                                        )}`
                                                    ).attr('opacity', 1)
                                                }}
                                                onMouseLeave={() => {
                                                    selectAll(
                                                        '.node-group'
                                                    ).attr('opacity', 1)
                                                    selectAll(
                                                        '.track-links'
                                                    ).attr('opacity', 1)
                                                }}
                                            >
                                                <text
                                                    dominantBaseline='middle'
                                                    x={14}
                                                    className='device-label'
                                                >
                                                    {d1[0]}
                                                </text>
                                                <path
                                                    className='arrow'
                                                    d='M0,0 L4,3 L0,6'
                                                    transform={`translate(${5}, ${-3})`}
                                                />
                                            </g>
                                        )
                                    })}
                                    {parentNameCount.map((d1, j) => {
                                        const posTop =
                                            (d1[1] / 2 +
                                                sumBy(
                                                    parentNameCount.slice(0, j),
                                                    d2 => d2[1]
                                                )) *
                                            rectHeight
                                        labelPos.current[`${d1[0]}-parent`] = [
                                            0,
                                            posTop + groupTop,
                                            groupTop,
                                        ]
                                        return (
                                            <g
                                                className={`${calClass(
                                                    d1[0],
                                                    'parent'
                                                )} device-label`}
                                                key={`${d1[0]}-parent`}
                                                transform={`translate(${0}, ${posTop})`}
                                                onMouseEnter={() => {
                                                    selectAll(
                                                        '.node-group'
                                                    ).attr('opacity', 0.1)
                                                    selectAll(
                                                        '.track-links'
                                                    ).attr('opacity', 0.1)
                                                    selectAll(
                                                        `.${calClass(
                                                            d1[0],
                                                            'group'
                                                        )}`
                                                    ).attr('opacity', 1)
                                                    selectAll(
                                                        `.${calClass(
                                                            d1[0],
                                                            'link'
                                                        )}`
                                                    ).attr('opacity', 1)
                                                }}
                                                onMouseLeave={() => {
                                                    selectAll(
                                                        '.node-group'
                                                    ).attr('opacity', 1)

                                                    selectAll(
                                                        '.track-links'
                                                    ).attr('opacity', 1)
                                                }}
                                            >
                                                <text
                                                    textAnchor='end'
                                                    dominantBaseline='middle'
                                                    x={-10}
                                                >
                                                    {calShowName(d1[0])}
                                                </text>
                                                <path
                                                    className='arrow'
                                                    d='M0,0 L4,3 L0,6'
                                                    transform={`translate(-9, ${-3})`}
                                                />
                                            </g>
                                        )
                                    })}
                                </g>
                            )
                        })}
                        <g>
                            {lineArr.map(d1 => {
                                const [, sy] = labelPos.current[`${d1}-child`]
                                const [, ey, thisGroupTop] = labelPos.current[
                                    `${d1}-parent`
                                ]
                                const x1 = size.width - left - 40
                                const x2 = size.width - left - 20
                                const pathFun = path()
                                pathFun.moveTo(x1, sy)
                                pathFun.lineTo(x2, sy)
                                pathFun.lineTo(
                                    x2,
                                    thisGroupTop - rectHeight / 2
                                )
                                pathFun.lineTo(
                                    20 - left,
                                    thisGroupTop - rectHeight / 2
                                )
                                pathFun.lineTo(20 - left, ey)
                                pathFun.lineTo(40 - left, ey)
                                return (
                                    <g
                                        className={`${calClass(
                                            d1,
                                            'link'
                                        )} track-links`}
                                        key={`${d1}-link`}
                                    >
                                        <path
                                            d={pathFun.toString()}
                                            markerEnd='url(#arrows)'
                                        />
                                        <circle cx={x1} cy={sy} r='2' />
                                    </g>
                                )
                            })}
                        </g>
                        <g
                            ref={axisRef}
                            transform={`translate(0, ${
                                size.height - top - bottom
                            })`}
                            className='axis axis--x'
                        />
                        <g
                            ref={axisBrushRef}
                            transform={`translate(0, ${
                                size.height - top - bottom + 60
                            })`}
                            className='axis'
                        />
                        <g
                            ref={brushRef}
                            transform={`translate(0, ${
                                size.height - top - bottom + 20
                            })`}
                            className='brush'
                        >
                            <line className='line-id' stroke='rgb(255,0,0)' />
                        </g>
                        <path
                            className='line'
                            stroke='rgb(34, 81, 247)'
                            ref={lineRef}
                            fill='none'
                        />
                    </g>
                </svg>
            </div>
        </Spin>
    )
}

export default withNoData(TreeMatrix)

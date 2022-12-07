import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { select, scaleLinear, axisRight, lineRadial } from 'd3'
import style from './index.module.less'

export default function RadarChart(props) {
    const { data } = props
    const refAxis = useRef(null)
    const [height, setheight] = useState(0)
    const [width, setwidth] = useState(0)

    const [top, right, bottom, left] = [25, 0, 20, 0]
    const chartWidth = width - left - right
    const chartHeight = height - top - bottom

    const CENTER = [chartWidth / 2, chartHeight / 2]

    const R = Math.min(...CENTER)

    const domain = useMemo(() => [0, 100], [])

    const tick = (domain[1] - domain[0]) / 20

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

    const scaleR = useMemo(() => scaleLinear().domain(domain).range([0, R]), [
        R,
        domain,
    ])

    const line = useMemo(
        () =>
            lineRadial()
                .angle(d => {
                    return (
                        data.findIndex(d1 => d1.name === d.name) *
                        ((2 * Math.PI) / data.length)
                    )
                })
                .radius(d => scaleR(d.value)),
        [data, scaleR]
    )

    const refLineData = useMemo(
        () =>
            data.length
                ? new Array(tick).fill().map((d, i) =>
                      data.map(d1 => ({
                          ...d1,
                          value: (i + 1) * 20,
                      }))
                  )
                : [],
        [data, tick]
    )

    const drawAxis = useCallback(() => {
        const angle = 360 / (data.length || 1)
        const axis = select(refAxis.current).attr(
            'transform',
            `translate(${chartWidth / 2}, ${chartHeight / 2})
            rotate(180)
            `
        )
        axis.html('')
        const allAxis = axis
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `rotate(${i * angle})`)

        allAxis
            .append('g')
            .call(axisRight(scaleR).ticks(tick).tickSize(0))
            .classed('axis', true)
            .classed('hide-tick', (d, i) => i !== 0)

        allAxis
            .append('text')
            .text(d => d.name)
            .attr('text-anchor', 'middle')
            .attr(
                'transform',
                (d, i) => `translate(0 ${R + 15}) rotate(${180 - i * angle})`
            )
            .classed('radar-label', true)
    }, [R, chartHeight, chartWidth, data, scaleR, tick])

    useEffect(() => {
        drawAxis()
    }, [drawAxis])

    return (
        <div className={`chart-container ${style.radar}`} ref={container}>
            <svg
                width={`${width}px`}
                height={`${height}px`}
                viewBox={[0, 0, width, height]}
            >
                <g transform={`translate(${left}, ${top})`}>
                    <g ref={refAxis} />
                    <g
                        className='chart-line'
                        fill='none'
                        strokeWidth={1}
                        stroke='black'
                        transform={`translate(${chartWidth / 2}, ${
                            chartHeight / 2
                        })`}
                    >
                        {refLineData.map(d => (
                            <path
                                key={d[0].name + d[0].value}
                                d={`${line(d)}z`}
                            />
                        ))}
                        <path
                            className='radar-line'
                            d={data.length ? `${line(data)}z` : ''}
                        />
                    </g>
                </g>
            </svg>
        </div>
    )
}

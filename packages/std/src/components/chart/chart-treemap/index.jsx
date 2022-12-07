import React, { useState, useCallback, useMemo } from 'react'
import { treemap, hierarchy, scaleOrdinal, treemapBinary } from 'd3'

export default function Treemap(props) {
    const { data, legends = [] } = props
    const [height, setheight] = useState(0)
    const [width, setwidth] = useState(0)

    const [top, right, bottom, left] = [0, 10, 0, 10]
    const chartWidth = width > left + right ? width - left - right : width
    const chartHeight = height > top + bottom ? height - top - bottom : height

    const legendHeight = 20

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

    const color = scaleOrdinal().range([
        '#4ba9f8',
        '#f7d06c',
        '#8e75de',
        '#62c3e5',
        'white',
    ])

    const hdata = useMemo(() => hierarchy(data, d => d.children), [data])

    const treeHeight = useMemo(() => hdata.height, [hdata])

    const treemapLayout = useMemo(
        () =>
            treemap()
                .size([chartWidth, chartHeight - legendHeight])
                .paddingInner(d => {
                    return d.depth === treeHeight - 1 ? 0 : 5
                })
                .paddingTop(d => (d.depth ? 25 : 0))
                .tile(treemapBinary),
        [chartHeight, chartWidth, treeHeight]
    )

    const nodes = useMemo(() => {
        if (!chartHeight || !chartWidth) return []
        return treemapLayout(
            hdata.sum(d => d.data.value).sort((a, b) => a.depth - b.depth)
        ).descendants()
    }, [chartHeight, chartWidth, hdata, treemapLayout])
    return (
        <div className='chart-container' ref={container}>
            <svg viewBox={[0, 0, width, height]} preserveAspectRatio='none'>
                <g transform={`translate(${left}, ${top})`}>
                    <g>
                        {legends.map((l, i) => {
                            return (
                                <g
                                    key={l}
                                    transform={`translate(${80 * i}, ${0})`}
                                    textAnchor='start'
                                    fontSize='12px'
                                    style={{ textTransform: 'uppercase' }}
                                >
                                    <rect
                                        y={legendHeight / 2 - 5}
                                        width={20}
                                        height={10}
                                        fill={color(l)}
                                    />
                                    <text
                                        x={30}
                                        y={legendHeight / 2}
                                        dominantBaseline='middle'
                                    >
                                        {l}
                                    </text>
                                </g>
                            )
                        })}
                    </g>
                    <g transform={`translate(0,${legendHeight})`}>
                        {nodes.map(item => {
                            const { x0, x1, y0, y1, children } = item
                            const fill =
                                item.depth === 1
                                    ? '#afdefc'
                                    : color(item.data.id)
                            const textLength =
                                item.data.id.length >
                                item.value.toString().length
                                    ? item.data.id.length
                                    : item.value.toString().length
                            return (
                                <g
                                    key={`${item.data.id}-${x0}-${x1}-${y0}-${y1}`}
                                    transform={`translate(${x0}, ${y0})`}
                                >
                                    <rect
                                        width={x1 - x0}
                                        height={y1 - y0}
                                        fill={fill}
                                    />
                                    <g
                                        fill='white'
                                        style={{ textTransform: 'uppercase' }}
                                    >
                                        {!children ? (
                                            <text
                                                fontSize='20'
                                                textAnchor='middle'
                                                transform={`translate(${0}, ${
                                                    (y1 - y0) / 2
                                                })`}
                                                style={{
                                                    /* stylelint-disable */
                                                    display:
                                                        x1 - x0 >
                                                        textLength * 20
                                                            ? null
                                                            : 'none',
                                                    /* stylelint-enable */
                                                }}
                                            >
                                                <tspan x={(x1 - x0) / 2}>
                                                    {item.data.id}
                                                </tspan>
                                                <tspan
                                                    x={(x1 - x0) / 2}
                                                    y='1em'
                                                    fontWeight='bolder'
                                                >
                                                    {item.value}
                                                </tspan>
                                            </text>
                                        ) : (
                                            <text
                                                y='1em'
                                                fontSize='16'
                                                style={{
                                                    /* stylelint-disable */
                                                    display:
                                                        x1 - x0 >
                                                        item.data.id.length * 16
                                                            ? null
                                                            : 'none',
                                                    /* stylelint-enable */
                                                }}
                                            >
                                                {item.data.id}
                                            </text>
                                        )}
                                    </g>
                                </g>
                            )
                        })}
                    </g>
                </g>
            </svg>
        </div>
    )
}

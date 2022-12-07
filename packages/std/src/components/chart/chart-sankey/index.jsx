import React, { useState, useCallback } from 'react'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import { schemeSet3, scaleOrdinal } from 'd3'

function calColor(name) {
    return scaleOrdinal(schemeSet3)(name.replace(/ .*/, ''))
}

export default function SankeyChart(props) {
    const { data } = props
    const [height, setheight] = useState(100)
    const [width, setwidth] = useState(100)

    const [top, right, bottom, left] = [0, 0, 0, 0]
    const chartWidth = width - left - right
    const chartHeight = height - top - bottom

    const cal = sankey()
        .nodeSort((a, b) => a.value - b.value)
        .nodeId(d => d.id)
        .linkSort(null)
        .nodeWidth(15)
        .nodePadding(10)
        .extent([
            [1, 5],
            [chartWidth - 1, chartHeight - 5],
        ])
    const { nodes, links } = cal(data)

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

    return (
        <div className='chart-container' ref={container}>
            <svg viewBox={[0, 0, width, height]}>
                <g transform={`translate(${left}, ${top})`}>
                    <g className='link'>
                        {links.map(d => {
                            const path = sankeyLinkHorizontal()(d)
                            const linkprops = {
                                key: d.index,
                                d: path,
                                stroke: 'red',
                                fill: 'none',
                                strokeWidth: Math.max(1, d.width),
                                strokeOpacity: '.2',
                            }
                            return <path {...linkprops} />
                        })}
                    </g>
                    <g className='node'>
                        {nodes.map(d => (
                            <g key={d.id}>
                                <rect
                                    {...{
                                        x: d.x0,
                                        y: d.y0,
                                        height: d.y1 - d.y0,
                                        width: d.x1 - d.x0,
                                        fill: calColor(d.name),
                                    }}
                                />
                                <text
                                    {...{
                                        x:
                                            d.x0 < chartWidth / 2
                                                ? d.x1
                                                : d.x0 - 6,
                                        y: (d.y0 + d.y1) / 2,
                                        dy: '.4em',
                                        textAnchor:
                                            d.x0 < chartWidth / 2
                                                ? 'start'
                                                : 'end',
                                    }}
                                >
                                    {d.name}
                                </text>
                            </g>
                        ))}
                    </g>
                </g>
            </svg>
        </div>
    )
}

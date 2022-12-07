import React, { useState, useCallback } from 'react'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import { schemeSet3, schemeSet1, scaleOrdinal, selectAll, select } from 'd3'
import { chain, sumBy, uniq } from 'lodash'

const color = scaleOrdinal(schemeSet3)
function calColor(name) {
    return color(name.replace(/ .*/, ''))
}

export default function SankeyChart({ data, onClick = () => {} }) {
    const [height, setheight] = useState(100)
    const [width, setwidth] = useState(100)

    const [top, right, bottom, left] = [30, 0, 0, 0]
    const chartWidth = width - left - right
    const chartHeight = height - top - bottom

    const cal = sankey()
        .nodeSort((a, b) => b.value - a.value)
        .nodeId(d => d.id)
        .linkSort(null)
        .nodeWidth(15)
        // .nodePadding(0)
        .extent([
            [1, 5],
            [chartWidth - 1, chartHeight - 5],
        ])

    const { nodes, links } =
        data.nodes.length === 0 ? { nodes: [], links: [] } : cal(data)

    const minHeight = 6
    const useHeight = Math.max(
        minHeight * (sumBy(data.links, 'value') / 3),
        500
    )
    const container = useCallback(
        node => {
            if (node !== null) {
                const {
                    width: newWidth,
                    // height: newHeight,
                } = node.getBoundingClientRect()
                setwidth(newWidth)
                setheight(useHeight)
            }
        },
        [useHeight]
    )

    function mouseover(nodeId) {
        const relationLinks = links.filter(
            l => l.source.id === nodeId || l.target.id === nodeId
        )
        const relationLinksId = uniq(relationLinks.map(l => l.id))
        relationLinksId.forEach(c => {
            selectAll(`path.sankey-link-${c}`).attr('stroke-opacity', 0.6)
        })
        const relationNodesId = chain(links)
            .filter(l => relationLinksId.includes(l.id))
            .map(n => [n.source.id, n.target.id])
            .flatten()
            .uniq()
            .value()
        selectAll('g.sankey-node')
            .filter(function filterFun() {
                const id = select(this).attr('id')
                return !relationNodesId.includes(Number(id))
            })
            .attr('opacity', 0.1)
    }

    function mouseout() {
        selectAll(`path.sankey-link`).attr('stroke-opacity', 0.1)
        selectAll(`g.sankey-node`).attr('opacity', 1)
    }

    function onClickNode(d) {
        const [type, name] = d.name.split('_')
        if (type && name) {
            onClick({ type, name })
        }
    }

    return (
        <div className='chart-container' ref={container}>
            <svg viewBox={[0, 0, width, height]}>
                <g>
                    {[
                        '攻击主机',
                        '事件类型',
                        '受害主机',
                        '受害主机资产类型',
                    ].map((d, i) => {
                        let align = 'middle'
                        if (i === 0) align = 'start'
                        if (i === 3) align = 'end'
                        return (
                            <text
                                key={d}
                                fontSize={12}
                                textAnchor={align}
                                y={20}
                                x={(i * width) / 3}
                            >
                                {d}
                            </text>
                        )
                    })}
                </g>
                <g transform={`translate(${left}, ${top})`}>
                    <g className='link'>
                        {links.map(d => {
                            const path = sankeyLinkHorizontal()(d)
                            const linkprops = {
                                key: d.index,
                                d: path,
                                stroke: schemeSet1[0],
                                className: `sankey-link sankey-link-${d.id}`,
                                fill: 'none',
                                strokeWidth: Math.max(1, d.width),
                                strokeOpacity: '.1',
                            }
                            return <path {...linkprops} />
                        })}
                    </g>
                    <g className='node'>
                        {nodes.map(d => (
                            <g
                                key={d.name}
                                className={`sankey-node sankey-node-${d.id}`}
                                id={d.id}
                                cursor='pointer'
                                onClick={() => onClickNode(d)}
                            >
                                <rect
                                    {...{
                                        x: d.x0,
                                        y: d.y0,
                                        height: d.y1 - d.y0,
                                        width: d.x1 - d.x0,
                                        fill: calColor(d.name),
                                    }}
                                    onMouseOver={() => mouseover(d.id)}
                                    onMouseOut={mouseout}
                                />
                                <text
                                    {...{
                                        x:
                                            d.x0 < chartWidth / 2
                                                ? d.x1 + 6
                                                : d.x0 - 6,
                                        y: (d.y0 + d.y1) / 2,
                                        dy: '.4em',
                                        fontSize: 10,
                                        textAnchor:
                                            d.x0 < chartWidth / 2
                                                ? 'start'
                                                : 'end',
                                    }}
                                >
                                    {d.showName}
                                </text>
                            </g>
                        ))}
                    </g>
                </g>
            </svg>
        </div>
    )
}

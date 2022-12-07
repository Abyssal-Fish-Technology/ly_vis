import React, { useEffect, useMemo, useRef, useState } from 'react'
import { inject, observer } from 'mobx-react'
import { hierarchy, select, nest, scaleOrdinal } from 'd3'
import { voronoiTreemap } from 'd3-voronoi-treemap'
import { chain, sumBy } from 'lodash'
import withNoData from '@/components/with-nodata'
import { computeCenterlineLabel } from './centerline'

function AssetDistribute({ data }) {
    const containerDom = useRef(null)
    const voronoiDom = useRef(null)
    const labelsDom = useRef(null)
    const [size, setsize] = useState({
        width: 400,
        height: 400,
    })
    const [top, right, bottom, left] = useMemo(() => [10, 10, 10, 10], [])

    useEffect(() => {
        const { clientWidth } = containerDom.current
        const min = 35 * 35
        const totalValue = sumBy(data, 'value')
        const graphheight = (totalValue * min) / clientWidth
        const height = Math.max(graphheight, 400)
        setsize({
            width: clientWidth,
            height,
        })
        const data_nested = {
            key: 'root',
            values: nest()
                .key(d => d.desc)
                .key(d => d.ip)
                .entries(data),
        }
        const useData = hierarchy(data_nested, d => d.values).sum(d => d.value)

        const graphHeight = height - top - bottom
        const graphWidth = clientWidth - left - right

        const voronoiTreeMap = voronoiTreemap().clip([
            [0, 0],
            [graphWidth, 0],
            [graphWidth, graphHeight],
            [0, graphHeight],
        ])
        voronoiTreeMap(useData)
        const allNodes = useData
            .descendants()
            .sort((a, b) => b.depth - a.depth)
            .map((d, i) => ({ ...d, id: i }))

        const colorScale = scaleOrdinal(
            chain(data).map('type').uniq().value(),
            [
                '#3a65ff',
                '#5eff5a',
                '#ffba69',
                '#8676ff',
                '#02a4ff',
                // '#17eb8e',
                // '#ff7d4d',
                // '#991bfa',
                // '#e323ff',
            ]
        )
        const voronoiSvg = select(voronoiDom.current)

        voronoiSvg
            .selectAll('path')
            .data(allNodes, d => d.data.key)
            .join('path')
            .classed('path', true)
            .attr('d', d => `M${d.polygon.join('L')}Z`)
            .attr('stroke-width', d => {
                let width = 0
                switch (d.depth) {
                    case 3:
                        width = 0.5
                        break
                    case 2:
                        width = 3
                        break
                    case 1:
                        width = 10
                        break
                    default:
                        break
                }
                return width
            })
            .style('fill', d => {
                return d.depth === 3 ? colorScale(d.data.type) : ''
            })
            .style('fill-opacity', d => (d.depth === 3 ? 1 : 0))

        const labelObj = {}

        select(labelsDom.current).selectAll('g.label').remove()

        const voronoiLabel = select(labelsDom.current)
            .selectAll('g.label')
            .data(allNodes.filter(d => d.depth === 1))
            .enter()
            .append('g')
            .classed('label', true)
            .each(function ap(d) {
                const { polygon } = d
                const lable = computeCenterlineLabel({
                    label: d.data.key,
                    polygon,
                    numPerimeterPoints: 10,
                    simplification: 50,
                    strategy: 'high',
                    offset: 0.5,
                })
                // const { centerline, offset, label, maxFontSize } = lable
                labelObj[d.data.key] = lable
            })
            .style('font-size', d => {
                const { maxFontSize } = labelObj[d.data.key]
                return `${maxFontSize * 0.9}px`
            })

        voronoiLabel
            .append('path')
            .attr('id', d => d.data.key)
            .attr('d', d => labelObj[d.data.key].centerline)

        voronoiLabel
            .append('text')
            .attr('dy', '0.35em')
            .append('textPath')
            .attr('xlink:href', d => `#${d.data.key}`)
            .attr('startOffset', d => `${100 * labelObj[d.data.key].offset}%`)
            .text(d => labelObj[d.data.key].label)
    }, [data, left, right, top, bottom])
    return (
        <div className='chart-container' ref={containerDom}>
            <svg width={size.width} height={size.height}>
                <g transform={`translate(${left}, ${top})`}>
                    <g className='voronoi' ref={voronoiDom} />
                    <g className='labels' ref={labelsDom} />
                </g>
            </svg>
        </div>
    )
}
export default inject(stores => ({
    data: stores.assetStore.distributeData,
}))(observer(withNoData(AssetDistribute)))

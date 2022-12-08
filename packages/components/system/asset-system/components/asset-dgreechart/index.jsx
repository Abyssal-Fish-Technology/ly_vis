import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { graphlib, render as Render } from 'dagre-d3'
import { select, zoom, zoomIdentity, selectAll } from 'd3'
import { chain, uniqBy } from 'lodash'
import { FreshIcon } from '../../../../ui/icon/icon-util'
import style from './index.module.less'
import { BasicCustomChart } from '../../../../charts'

export default function AssetRelation(props) {
    const { data = [] } = props

    const svgRef = useRef(null)
    const grahpRef = useRef(null)
    const [top, left] = useMemo(() => [0, 0], [])
    const [height, setHeight] = useState(0)
    const [realSize, setRealSize] = useState({
        realWidth: 0,
        realHeight: 0,
    })

    const maxCount = 20

    const chartConfig = useMemo(
        () => ({
            nodesep: 10,
            rankdir: 'LR',
            marginx: 20,
            marginy: 20,
        }),
        []
    )

    const [ignorePid, setignorePid] = useState([])

    const ip = useMemo(
        () => (data.length ? data.filter(d => d.type === 'ip')[0].name : ''),
        [data]
    )

    const chartZoom = useMemo(() => {
        return zoom()
            .scaleExtent([1, 1])
            .on('zoom', event => {
                select(grahpRef.current).attr('transform', event.transform)
            })
    }, [])

    useEffect(() => {
        select(svgRef.current).call(chartZoom)
    }, [chartZoom])

    const legendObj = useMemo(() => {
        return chain(data)
            .reduce((obj, d) => {
                if (!obj[d.type]) {
                    obj[d.type] = {
                        data: [],
                        type: d.type,
                    }
                }
                obj[d.type].data.push(d)
                return obj
            }, {})
            .forEach(d => {
                d.value = uniqBy(d.data, 'name').length
                d.realValue = d.data.filter(d1 => d1.isReal).length
            })
            .value()
    }, [data])

    const initIgnore = useCallback(() => {
        const useIgnore = []

        data.forEach(d1 => {
            const children = data.filter(d => {
                const { typeArr, type } = d
                const pType = typeArr[typeArr.length - 2]
                return (
                    d1.nextType === type && d1.name === (d.data[0] || {})[pType]
                )
            })
            if (children.length > maxCount) {
                useIgnore.push({
                    node: d1,
                    count: children.length,
                    children,
                })
            }
        })
        setignorePid(useIgnore)
    }, [data])

    useEffect(() => {
        initIgnore()
    }, [initIgnore])

    const chartData = useMemo(() => {
        const useData = data.filter(d => {
            return !ignorePid.some(
                d1 =>
                    d.id !== d1.node.id &&
                    d.typeArr.join().includes(d1.node.typeArr.join()) &&
                    d1.node.name === (d.data[0] || {})[d1.node.type]
            )
        })

        ignorePid.forEach(d => {
            if (
                ignorePid.some(
                    d1 =>
                        d.id !== d1.id &&
                        d.node.type !== d1.node.type &&
                        d1.node.name === d.node.data[0][d1.node.type]
                )
            )
                return

            if (!useData.find(d1 => d1.id === d.node.id)) return
            const name = `${d.node.nextType}(${d.count}个)`
            const type = d.node.nextType
            const node = {
                id: `${name}-${type}`,
                name,
                type,
                data: chain(d.children)
                    .map('data')
                    .flatten()
                    .uniqBy(d1 => d.node.typeArr.map(k => d1[k]).join())
                    .value(),
                typeArr: [...d.node.typeArr, type],
                isAggre: true,
                pnode: d,
            }
            useData.push(node)
        })
        useData.sort(
            (a, b) => a.name.toString().length - b.name.toString().length
        )
        return useData
    }, [data, ignorePid])

    const draw = useCallback(() => {
        const { realWidth, realHeight } = realSize
        if (!realHeight) return
        const g = new graphlib.Graph().setGraph(chartConfig)

        const render = new Render()

        chartData.forEach(d => {
            g.setNode(d.id, {
                label() {
                    const div = document.createElement('div')

                    if (d.type === 'url' && !d.isAggre && d.data.length) {
                        const retcodeArr = chain(d.data)
                            .map(d1 => String(d1.retcode || '').split(','))
                            .flatten()
                            .uniq()
                            .value()

                        select(div)
                            .selectAll('span.retcode')
                            .data(retcodeArr)
                            .enter()
                            .append('span')
                            .attr('class', 'ant-tag ant-tag-red')
                            .style('padding', '2px 5px')
                            .style('transform', 'scale(.83, .83)')
                            .style('margin-right', '2px')
                            .style('line-height', '16px')
                            .style('display', 'inline-block')
                            .style('border-radius', '4px')
                            .text(d1 => d1)
                    }
                    select(div).append('span').text(d.name.toString())
                    return div
                },
                class: `${d.type} ${!d.isReal ? 'asset-special' : ''}`,
                style: ' stroke: #999;fill: #fff;stroke-width: 1px;',
                labelStyle: 'font-size: 12px',
                data: d.data || false,
            })
        })

        g.nodes().forEach(v => {
            const n = g.node(v)
            n.rx = 5
            n.ry = 5
        })
        chartData.forEach(n1 => {
            const { nextType, id } = n1
            chartData.forEach(n2 => {
                const { type, data: dataArr, typeArr } = n2
                if (nextType === type) {
                    dataArr.forEach(d => {
                        const pType = typeArr[typeArr.length - 2]
                        const pid = pType ? `${d[pType]}-${pType}` : 'unknowid'
                        if (pid === id) {
                            g.setEdge(id, n2.id, {
                                arrowheadClass: 'arrowhead',
                            })
                        }
                    })
                }
            })
        })

        render(select(grahpRef.current), g)

        const initialScale = 1
        const minHeight = 200
        select(svgRef.current).call(
            chartZoom.transform,
            zoomIdentity
                .translate(
                    (realWidth - g.graph().width * initialScale) / 2,
                    minHeight / 2
                )
                .scale(initialScale)
        )

        select(svgRef.current).attr(
            'height',
            g.graph().height * initialScale + minHeight
        )
        setHeight(g.graph().height * initialScale + minHeight)
        selectAll('g.node').on('click', (event, id) => {
            const node = chartData.find(d1 => d1.id === id)
            if (node.isAggre) {
                const useIgnore = ignorePid.filter(
                    d1 => d1.node.id !== node.pnode.node.id
                )
                setignorePid(useIgnore)
            } else {
                const children = data.filter(d1 => {
                    const { typeArr, type } = d1
                    const pType = typeArr[typeArr.length - 2]
                    return (
                        node.nextType === type &&
                        node.name === (d1.data[0] || {})[pType]
                    )
                })
                if (children.length > maxCount) {
                    const useIgnore = uniqBy(
                        [
                            ...ignorePid,
                            { node, count: children.length, children },
                        ],
                        d1 => d1.node.id
                    )
                    setignorePid(useIgnore)
                }
            }
        })
    }, [realSize, chartConfig, chartData, chartZoom.transform, ignorePid, data])

    useEffect(() => {
        draw()
    }, [draw])

    return (
        <div
            className={`chart-container ${style['relation-chart']}`}
            ref={svgRef}
        >
            <BasicCustomChart
                data={data}
                parentRef={svgRef}
                callbackRealSize={setRealSize}
                customHeight={height}
            >
                <g transform={`translate(${left}, ${top})`}>
                    <g ref={grahpRef} />
                </g>
            </BasicCustomChart>

            <div className='asset-relation-toolbar'>
                <FreshIcon onClick={initIgnore} />
            </div>
            <div className='asset-relation-desc'>
                <div className='asset-relation-desc-item'>
                    <span className='asset-relation-key asset-relation-ip'>
                        IP:
                    </span>
                    <span className='asset-relation-ipText'>{ip}</span>
                </div>
                <div className='asset-relation-desc-item'>
                    <span className='asset-relation-key asset-relation-port'>
                        活跃端口
                        <span>:</span>
                    </span>
                    <span className='asset-relation-allPortCount'>
                        {legendObj.port ? legendObj.port.value : 0}
                        <span>个</span>
                    </span>
                </div>
                <div className='asset-relation-desc-item'>
                    <span className='asset-relation-key asset-relation-srv'>
                        服务端口
                        <span>:</span>
                    </span>
                    <span className='asset-relation-portCount'>
                        {legendObj.port ? legendObj.port.realValue : 0}
                        <span>个</span>
                    </span>
                </div>
                <div className='asset-relation-desc-item'>
                    <span className='asset-relation-key asset-relation-host'>
                        Host:
                    </span>
                    <span className='asset-relation-hostCount'>
                        {legendObj.host ? legendObj.host.value : 0}
                        <span>个</span>
                    </span>
                </div>
                <div className='asset-relation-desc-item'>
                    <span className='asset-relation-key asset-relation-url'>
                        Url:
                    </span>
                    <span className='asset-relation-urlCount'>
                        {legendObj.url ? legendObj.url.value : 0}
                        <span>个</span>
                    </span>
                </div>
                <div>
                    <i>* 注 ： 活跃端口 &gt;= port</i>
                </div>
            </div>
        </div>
    )
}

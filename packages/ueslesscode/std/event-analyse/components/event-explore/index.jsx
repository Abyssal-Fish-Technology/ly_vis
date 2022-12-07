import { inject, observer } from 'mobx-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    select,
    zoom,
    forceSimulation,
    pie,
    extent,
    forceRadial,
    arc,
    forceLink,
    forceManyBody,
    mouse,
    forceCenter,
    scaleLinear,
    scaleOrdinal,
    forceCollide,
    drag,
    event,
    zoomIdentity,
    brush,
} from 'd3'
import { chain, intersection } from 'lodash'
import Section from '@shadowflow/components/ui/layout/section'
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import { Slider } from 'antd'
import style from './index.module.less'
import GraphSetting from './components/graph-setting'
import Toolbox from './components/graph-toolbox'

function Chart({
    observableIpEventTree,
    observableIp,
    changeObservableIp,
    changeUseData,
    originData,
    changeTableData,
    graphSetting,
    colorObj,
}) {
    const container = useRef(null)
    const svgContainer = useRef(null)
    const linksContainer = useRef(null)
    const nodesContainer = useRef(null)

    //* ============== 自动生成表格数据 ==============
    const [showInTableNode, setshowInTableNode] = useState([])
    useEffect(() => {
        const newTableData = chain(showInTableNode)
            .map('data')
            .flatten()
            .uniqBy('id')
            .value()
        changeTableData(newTableData)
    }, [showInTableNode, changeTableData])

    //* ============== 获取图表的尺寸 ==============
    const [graphSize, setgraphSize] = useState({
        width: 100,
        height: 100,
    })

    useEffect(() => {
        setTimeout(() => {
            if (container.current) {
                const {
                    width,
                    height,
                } = container.current.getBoundingClientRect()
                setgraphSize({
                    width,
                    height,
                })
            }
        }, 0)
    }, [])

    //* ============== 控制展示的数据 ==============
    const [observerIpArr, setObserverIpArr] = useState([])

    //* ============== 当选中IP进来的时候，默认展开第一层 ==============
    useEffect(() => {
        if (observableIp) {
            const firstLayerChild = observableIpEventTree
                .filter(d => d.parent === observableIp)
                .map(d => d.name)
            setObserverIpArr([observableIp, ...firstLayerChild])
        } else {
            setObserverIpArr(observableIpEventTree.map(d => d.name))
        }
    }, [observableIp, observableIpEventTree])

    //* ============== 计算绘制的 Nodes 和 Links ==============
    const [drawData, setdrawData] = useState({
        nodes: [],
        links: [],
    })

    useEffect(() => {
        const nodes = chain(observableIpEventTree)
            .filter(d => observerIpArr.includes(d.name) || d.parent === 'root')
            .value()
        nodes.forEach(d => {
            const {
                childEventCount,
                parentEventCount,
                parent,
                childArr,
                isFirstLayer,
            } = d
            let isExpand = false
            if (!isFirstLayer) {
                isExpand =
                    intersection(childArr, observerIpArr).length ===
                    childArr.length
            }
            d.isExpand = isExpand

            d.value = parent === 'root' ? childEventCount : parentEventCount
        })

        // childArr保存这它所有的子节点，是网状数据
        const links = chain(nodes)
            .reduce((obj, nodeItem) => {
                const { childData, name: parentName, isFirstLayer } = nodeItem
                childData.forEach(childDataItem => {
                    const { attackNode, victimNode, show_type } = childDataItem
                    const childName =
                        parentName === victimNode ? attackNode : victimNode
                    if (observerIpArr.includes(childName)) {
                        const source =
                            childName === victimNode ? parentName : childName
                        const target =
                            source === childName ? parentName : childName
                        const type = show_type
                        const key = `${source}-${target}-${isFirstLayer}`
                        obj[key] = {
                            source,
                            target,
                            type,
                            key,
                        }
                    }
                })
                return obj
            }, {})
            .values()
            .value()
        console.log('绘制nodes: ', nodes)
        console.log('绘制links:', links)
        setdrawData({
            nodes,
            links,
        })
        setshowInTableNode(nodes)
    }, [observerIpArr])

    //* ============== 比例尺 ==============
    const sizeScale = useMemo(() => {
        const key = graphSetting.size
        const maxCount = chain(observableIpEventTree).map(key).max().value()
        return scaleLinear().domain([1, maxCount]).range([4, 30])
    }, [observableIpEventTree, graphSetting.size])

    const colorScale = useMemo(() => {
        const colorGroup = colorObj[graphSetting.color]
        const colorDomain = []
        const colorRange = []
        Object.keys(colorGroup).forEach(d => {
            colorDomain.push(d)
            colorRange.push(colorGroup[d])
        })
        return scaleOrdinal().domain(colorDomain).range(colorRange)
    }, [graphSetting.color, colorObj])

    // !=============================== 关于力 ===============================
    // * ============== 力的初始化  ==============
    const force = useMemo(() => {
        return forceSimulation()
            .alphaDecay(0.01) // 衰减系数。【0-1】越小 衰减的越慢，但是布局越好,越大 衰减的越快，布局越乱
            .alphaTarget(0) // 衰减系数。【0-1】越小 衰减的越慢，但是布局越好,越大 衰减的越快，布局越乱
    }, [])

    // * ============== 力图的ticked ==============
    useEffect(() => {
        force.on('tick', () => {
            // function resetSize(v, type = 'x') {
            //     const padding = 30
            //     let newv = v
            //     if (type === 'x') {
            //         if (v > graphSize.width - padding)
            //             newv = graphSize.width - padding
            //         if (v < 0) newv = padding
            //     } else {
            //         if (v > graphSize.height - padding)
            //             newv = graphSize.height - padding
            //         if (v < 0) newv = padding
            //     }
            //     return newv
            // }
            function resetSize(v) {
                return v
            }
            select(linksContainer.current)
                .selectAll('g.linkItem')
                .selectAll('line')
                .attr('x1', d => resetSize(d.source.x))
                .attr('y1', d => resetSize(d.source.y, 'y'))
                .attr('x2', d => resetSize(d.target.x))
                .attr('y2', d => resetSize(d.target.y, 'y'))
            select(linksContainer.current)
                .selectAll('g.linkItem')
                .selectAll('.edgepath')
                .attr(
                    'd',
                    d =>
                        `M ${resetSize(d.source.x)} ${resetSize(
                            d.source.y,
                            'y'
                        )} L ${resetSize(d.target.x)} ${resetSize(
                            d.target.y,
                            'y'
                        )}`
                )
            select(nodesContainer.current)
                .selectAll('.nodeItem')
                .attr(
                    'transform',
                    d => `translate(${resetSize(d.x)}, ${resetSize(d.y, 'y')})`
                )
                .selectAll('.nodeLabel')
                .style('text-anchor', d =>
                    resetSize(d.x) > graphSize.width - 100 ? 'end' : 'start'
                )
        })
    }, [force, graphSize, graphSetting.distance])

    // * ============== 力的启动  ==============
    const graphStart = useMemo(() => {
        return () => {
            const alpha = force.alpha()
            const forceAlpha = alpha > 0.02 ? alpha : 1
            force.alpha(forceAlpha).restart()
        }
    }, [force])

    // * ============== 力的暂停  ==============
    const graphStop = useMemo(() => {
        return () => force.stop()
    }, [force])

    // *============== 添加碰撞力 ==============
    useEffect(() => {
        force.force(
            'collide',
            forceCollide() // 圆的碰撞力
                .radius(d => d.r + graphSetting.collide) // 根据指定的半径创建一个碰撞力。默认为 1
        )
    }, [force, graphSetting.collide, graphSetting.size])

    useEffect(() => {
        const radius = Math.min(graphSize.width, graphSize.height) / 2 - 60
        const domain = extent(observableIpEventTree, d => d[graphSetting.size])
        const radiusScale = scaleLinear().domain(domain).range([radius, 0])
        const radialForce = observableIp
            ? null
            : forceRadial()
                  .radius(d => radiusScale(d[graphSetting.size]))
                  .x(graphSize.width / 2)
                  .y(graphSize.height / 2)
        force.force('radial', radialForce)
    }, [
        graphSize,
        force,
        observableIpEventTree,
        observableIp,
        graphSetting.size,
    ])

    // *============== 添加向心力 ==============
    useEffect(() => {
        const centerForce = graphSetting.center
            ? forceCenter(graphSize.width / 2, graphSize.height / 2)
            : null
        force.force('center', centerForce)
    }, [force, graphSize, observableIp, graphSetting.center])

    // *============== 添加链接力 ==============
    useEffect(() => {
        //! 链接力必须和links数据同时更新
        force.force(
            'link',
            forceLink() // 连接线作用力，force的作用是向forceSimulation上面添加力
                .id(d => d.name)
                .distance(graphSetting.distance)
        )
    }, [force, graphSetting.distance, sizeScale])

    // *============== 添加节点作用力 ==============
    useEffect(() => {
        force.force(
            'charge',
            forceManyBody() // 多面体力 主要是指节点间的作用力
                .strength(graphSetting.strength) // 力的大小 正为引力，负为斥力
        )
    }, [graphSetting.strength, force])

    // *============== 每次graphSetting力图重启动 ==============
    useEffect(() => {
        graphStart()
    }, [
        graphStart,
        graphSetting.center,
        graphSetting.collide,
        graphSetting.distance,
        graphSetting.strength,
    ])

    // *============== 控制节点名称展示 ==============
    useEffect(() => {
        select(nodesContainer.current)
            .selectAll('.label-name')
            .attr('opacity', Number(graphSetting.showLabel))
    }, [graphSetting.showLabel])

    // *============== 控制事件类型展示 ==============
    useEffect(() => {
        select(linksContainer.current)
            .selectAll('.edgelabel')
            .attr('opacity', Number(graphSetting.showType))
    }, [graphSetting.showType])

    //* ============== 控制节点 ==============
    useEffect(() => {
        select(nodesContainer.current)
            .selectAll('.nodeItem')
            .each(d => {
                d.fx = null
                d.fy = null
            })
        graphStart()
    }, [graphSetting.drag, graphStart])

    // !=============================== 图形绘制 ===============================
    // * ============== 添加连线  ==============
    const addLinks = useCallback(
        linkData => {
            select(linksContainer.current).selectAll('g.linkItem').remove()
            const enterLinks = select(linksContainer.current)
                .selectAll('g.linkItem')
                .data(linkData)
                .enter()
                .append('g')
                .classed('linkItem', true)

            enterLinks.append('line').attr('marker-end', 'url(#arrow)')

            enterLinks
                .append('path')
                .attr('class', 'edgepath')
                .attr('id', (d, i) => `edgepath${i}`)

            const edgelabels = enterLinks
                .append('text')
                .attr('class', 'edgelabel')
                .attr('id', (d, i) => `edgelabel${i}`)
                .attr('opacity', Number(graphSetting.showType))
                .attr('font-size', 10)
                .attr('fill', '#aaa')

            edgelabels
                .append('textPath') // To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
                .attr('xlink:href', (d, i) => `#edgepath${i}`)
                .attr('startOffset', '50%')
                .text(d => d.type)

            enterLinks
                .on('mouseenter', function linkmove() {
                    graphStop()
                    select(this).select('.edgelabel').attr('opacity', 1)
                })
                .on('mouseout', function linkleave() {
                    graphStart()
                    if (!graphSetting.showType) {
                        select(this)
                            .select('.edgelabel')
                            .attr('opacity', 1)
                            .transition()
                            .duration(1000)
                            .attr('opacity', 0)
                    }
                })
        },
        [graphSetting.showType, graphStart, graphStop]
    )

    // * ============== 添加节点  ==============
    const addNodes = useCallback(
        nodesData => {
            select(nodesContainer.current)
                .selectAll('g.nodeItem')
                .data(nodesData, d => `${d.name}-${d.isFirstLayer}`)
                .join(
                    enter => {
                        const nodeItem = enter
                            .append('g')
                            .classed('nodeItem', true)

                        nodeItem
                            .append('circle')
                            .classed('bg', true)
                            .attr('r', d => d.r)

                        nodeItem
                            .append('g')
                            .classed('nodePie', true)
                            .each(function addPie(d) {
                                const arcFun = arc()
                                    .innerRadius(0)
                                    .outerRadius(d.r)

                                select(this)
                                    .selectAll('path.nodePieItem')
                                    .data(d.colorData, d1 => d1.name)
                                    .enter()
                                    .append('path')
                                    .classed('nodePieItem', true)
                                    .attr('d', d1 => {
                                        return arcFun(d1)
                                    })
                                    .attr('fill', d1 => d1.color)
                                    .attr('stroke', d1 => d1.color)
                            })

                        nodeItem
                            .append('text')
                            .classed('label-name shadow', true)
                            .text(d => d.name)
                            .attr('dy', '4px')
                            .attr('opacity', Number(graphSetting.showLabel))
                            .attr('dx', d => d.r)

                        nodeItem
                            .append('text')
                            .classed('label-name', true)
                            .text(d => d.name)
                            .attr('opacity', Number(graphSetting.showLabel))
                            .attr('dy', '4px')
                            .attr('dx', d => d.r)

                        nodeItem
                            .append('text')
                            .classed('label-expand', true)
                            .text(d => {
                                if (!d.childEventCount) return ''
                                return d.isExpand ? '-' : '+'
                            })
                            .attr('font-size', d => d.r * 2)
                    },
                    update => {
                        update.selectAll('.nodePie').each(function addPie(d) {
                            const arcFun = arc().innerRadius(0).outerRadius(d.r)
                            select(this).selectAll('path.nodePieItem').remove()
                            select(this)
                                .selectAll('path.nodePieItem')
                                .data(d.colorData)
                                .enter()
                                .append('path')
                                .classed('nodePieItem', true)
                                .attr('d', d1 => arcFun(d1))
                                .attr('fill', d1 => d1.color)
                                .attr('stroke', d1 => d1.color)
                        })

                        update.selectAll('circle').attr('r', d => d.r)

                        update
                            .selectAll('.label-name')
                            .attr('dx', d => d.r)
                            .attr('opacity', Number(graphSetting.showLabel))

                        update
                            .selectAll('.label-expand')
                            .text(d => {
                                if (!d.childEventCount) return ''
                                return d.isExpand ? '-' : '+'
                            })
                            .attr('font-size', d => d.r * 2)
                    },
                    exit => exit.remove()
                )
        },
        [graphSetting.showLabel]
    )

    // *============== 绘图 ==============
    useEffect(() => {
        const createPie = pie().value(d1 => d1.value)
        const { nodes, links } = drawData
        graphStop()
        force.nodes(nodes)
        force.force('link').links(links)
        nodes.forEach(d => {
            d.r = sizeScale(d[graphSetting.size])
            const colorData = createPie(d[graphSetting.color])
            colorData.forEach(d1 => {
                d1.color = colorScale(d1.data.name)
            })
            d.colorData = colorData
        })
        addLinks(links)
        addNodes(nodes)
        graphStart()
    }, [
        drawData,
        force,
        sizeScale,
        colorScale,
        graphStart,
        graphStop,
        addLinks,
        addNodes,
        graphSetting.size,
        graphSetting.color,
        graphSetting.distance,
    ])

    // !=============================== 图形数据处理 ===============================
    // *============== 折叠点 ==============
    const foldNode = useCallback(
        node => {
            const { name } = node
            const thisChildNode = chain(observableIpEventTree)
                .filter(treeNodeItem => treeNodeItem.parentArr.includes(name))
                .map('name')
                .value()
            const newObserverIpArr = observerIpArr.filter(
                d1 => !thisChildNode.find(d2 => d2 === d1)
            )
            setObserverIpArr(newObserverIpArr)
        },
        [observableIpEventTree, observerIpArr]
    )

    // *============== 展开点 ==============
    const unfoldNode = useCallback(
        node => {
            const { childArr } = node
            const newObserverIpArr = chain(observerIpArr)
                .concat(childArr)
                .uniq()
                .value()
            setObserverIpArr(newObserverIpArr)
        },
        [observerIpArr]
    )

    // *============== 展开全部点 ==============
    const unfoldAllNode = useCallback(
        node => {
            const { name } = node
            const thisChildNode = chain(observableIpEventTree)
                .filter(treeNodeItem => treeNodeItem.parentArr.includes(name))
                .map('name')
                .value()
            const newObserverIpArr = chain(observerIpArr)
                .concat(thisChildNode)
                .uniq()
                .value()
            setObserverIpArr(newObserverIpArr)
        },
        [observableIpEventTree, observerIpArr]
    )

    // *============== 删除点 ==============
    const delNode = useCallback(
        node => {
            const { name } = node
            const newUseData = originData.filter(
                d => ![d.victimIp, d.attackIp].includes(name)
            )
            changeUseData(newUseData)
        },
        [changeUseData, originData]
    )

    // *============== 保存点 ==============
    const saveNode = useCallback(
        node => {
            changeObservableIp(node.name)
        },
        [changeObservableIp]
    )

    //! =============================== 图的交互 ===============================
    // *============== 右键菜单 ==============
    const [tooltipAttr, settooltipAttr] = useState({
        style: {
            display: 'none',
        },
        node: {},
    })

    function closeContextMenu() {
        settooltipAttr({
            style: {
                display: 'none',
            },
            node: {},
        })
    }
    //* ============== 点的各种事件 ==============
    let isDrag = false
    useEffect(() => {
        select(nodesContainer.current)
            .selectAll('.nodeItem')
            .on('click', d => {
                console.log('节点数据:', d)
                if (d.isFirstLayer) {
                    setObserverIpArr([d.name])
                    changeObservableIp(d.name)
                    return
                }
                if (d.isExpand) {
                    foldNode(d)
                } else {
                    unfoldNode(d)
                    // unfoldAllNode(d)
                }
            })
            .on('mouseenter', () => {
                if (isDrag) return
                graphStop()
            })
            .on('mouseleave', () => {
                graphStart(force.alpha())
            })
            .on('contextmenu', d => {
                event.preventDefault()
                graphStop()
                const [x, y] = mouse(container.current)
                settooltipAttr({
                    style: {
                        top: `${y + 10}px`,
                        left: `${x + 10}px`,
                    },
                    node: d,
                })
            })
            .call(
                drag()
                    .on('start', () => {
                        isDrag = true
                        if (!event.active) graphStart(force.alpha())
                    })
                    .on('drag', d => {
                        d.fx = event.x
                        d.fy = event.y
                    })
                    .on('end', d => {
                        isDrag = false
                        if (!graphSetting.drag) {
                            d.fx = null
                            d.fy = null
                        }
                    })
            )
    }, [
        changeObservableIp,
        force,
        graphStart,
        drawData,
        foldNode,
        unfoldNode,
        graphSetting.drag,
    ])

    //! =============================== 图的各种附加层和功能  ===============================
    //* ============== 图表放大缩小 ==============
    // 缩放回调
    const usezoom = useMemo(
        () =>
            zoom().on('zoom', () => {
                select(nodesContainer.current).attr(
                    'transform',
                    event.transform
                )
                select(linksContainer.current).attr(
                    'transform',
                    event.transform
                )
            }),
        [graphSize]
    )

    const [zoommultiple, setzoommultiple] = useState(1)

    // 主动的去触发缩放
    useEffect(() => {
        select(svgContainer.current).call(
            usezoom.transform,
            zoomIdentity.scale(zoommultiple)
        )
    }, [zoommultiple, usezoom, graphSize])

    function zoomOut() {
        setzoommultiple(zoommultiple - 0.1)
    }
    function zoomIn() {
        setzoommultiple(zoommultiple + 0.1)
    }

    //* ============== 刷选 ==============
    const useBrush = useMemo(() => {
        return brush()
            .extent([
                [0, 0],
                [graphSize.width, graphSize.height],
            ])
            .on('end', () => {
                const { selection, sourceEvent } = event
                if (!sourceEvent) return
                let useNode = drawData.nodes
                if (selection) {
                    const [[x1, y1], [x2, y2]] = selection
                    useNode = drawData.nodes.filter(nodeItem => {
                        const { x, y } = nodeItem
                        // const [newX, newY] = [x, y].map(d => d * zoommultiple)
                        return x >= x1 && x <= x2 && y >= y1 && y <= y2
                        // return (
                        //     newX >= x1 && newX <= x2 && newY >= y1 && newY <= y2
                        // )
                    })
                }
                setshowInTableNode(useNode)
            })
    }, [drawData.nodes, graphSize])

    const brushContainer = useRef(null)
    useEffect(() => {
        select(brushContainer.current).call(useBrush)
    }, [useBrush])

    useEffect(() => {
        select(brushContainer.current).call(useBrush.move, [
            [0, 0],
            [0, 0],
        ])
    }, [drawData, useBrush])

    return (
        <Section title='攻击图' className='an-chart'>
            <div
                className={`${style.analyseChart} chart-container`}
                ref={container}
            >
                <Toolbox />
                <svg
                    onClick={closeContextMenu}
                    ref={svgContainer}
                    className='chart-cotent'
                >
                    <defs>
                        <marker
                            id='arrow'
                            viewBox='-0 -5 10 10'
                            refX='22'
                            refY='0'
                            orient='auto'
                            markerWidth='8'
                            markerHeight='8'
                            xoverflow='visible'
                        >
                            <path
                                d='M0,-5L10,0L0,5'
                                fill='#999'
                                stroke='none'
                            />
                        </marker>
                    </defs>
                    <g ref={brushContainer} />
                    <g ref={linksContainer} className='links' />
                    <g ref={nodesContainer} className='nodes' />
                </svg>
                <div className='zoom-control'>
                    <ZoomInOutlined onClick={zoomIn} />
                    <Slider
                        vertical
                        min={0.1}
                        max={3}
                        step={0.1}
                        value={zoommultiple}
                        onChange={setzoommultiple}
                        tipFormatter={value => `放大${value}倍`}
                    />
                    <ZoomOutOutlined onClick={zoomOut} />
                </div>
                <ContextMenu
                    tooltipAttr={tooltipAttr}
                    delNode={delNode}
                    saveNode={saveNode}
                    unfoldAllNode={unfoldAllNode}
                />
                <GraphSetting />
            </div>
        </Section>
    )
}

function ContextMenu({ tooltipAttr, saveNode, unfoldAllNode }) {
    const { node, style: tooltipStyle } = tooltipAttr
    return (
        <div className='tooltips context-menu' style={tooltipStyle}>
            <div className='menu-title'>{`设备: ${node.name}`}</div>
            <div className='menu-item' onClick={() => saveNode(node)}>
                观察此设备
            </div>
            {!node.isFirstLayer && (
                <div className='menu-item' onClick={() => unfoldAllNode(node)}>
                    展开此设备所有事件
                </div>
            )}

            {/* <div className='menu-item' onClick={() => delNode(node)}>
                移除相关事件
            </div> */}
        </div>
    )
}

export default inject(stores => ({
    observableIpEventTree: stores.eventAnalyseStore.observableIpEventTree,
    changeObservableIp: stores.eventAnalyseStore.changeObservableIp,
    observableIp: stores.eventAnalyseStore.observableIp,
    changeUseData: stores.eventAnalyseStore.changeUseData,
    formatData: stores.eventAnalyseStore.formatData,
    changeTableData: stores.eventAnalyseStore.changeTableData,
    graphSetting: stores.eventLinkStore.graphSetting,
    colorObj: stores.eventLinkStore.colorObj,
}))(observer(Chart))

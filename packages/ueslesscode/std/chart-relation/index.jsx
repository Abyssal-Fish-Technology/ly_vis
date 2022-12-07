import { threatinfo } from '@/service'
import { EVENT_STAGES } from '@/utils/methods-event'
import { calculateIpDesc, isInternal } from '@/utils/methods-data'
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DatabaseOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    DragOutlined,
    GatewayOutlined,
    LeftCircleOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    QuestionCircleOutlined,
    ReloadOutlined,
    RightCircleOutlined,
    SearchOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
} from '@ant-design/icons'
import { message, Tag, Tooltip } from 'antd'
import {
    select,
    zoom,
    zoomIdentity,
    event,
    curveBasis,
    selectAll,
    brush,
    mouse,
    brushSelection,
    scalePoint,
} from 'd3'
import dagreD3 from 'dagre-d3'
import { chain } from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { translateEventType } from '@shadowflow/components/system/event-system'
import style from './index.module.less'

function calculateEventTag(device) {
    // 首先判断设备是不是资产iP
    return new Promise(resolve => {
        const tag = []
        if (isInternal(device)) {
            tag.push(<Tag key='desc'>{calculateIpDesc(device)}</Tag>)
        }
        threatinfo(device, 'ip').then(res => {
            if (res[0]) {
                tag.push(<Tag key='sus'>{res[0].bwclass}</Tag>)
            }
            resolve(tag)
        })
    })
}

function useMount(mountedFn) {
    const mountedFnRef = useRef(null)
    mountedFnRef.current = mountedFn
    useEffect(() => {
        mountedFnRef.current()
    }, [mountedFnRef])
}

export default function RelationChart({
    propData,
    targetDevice,
    callback = undefined,
}) {
    const [height, setheight] = useState(800)
    const [width, setwidth] = useState(400)
    const [top, right, bottom, left] = useMemo(() => [20, 20, 20, 20], [])

    const [mouseTarget, setMouseTarget] = useState(targetDevice)

    const svg = useRef(null)
    const graphic = useRef(null)
    const brushG = useRef(null)

    const [svgContainer, setSvgContainer] = useState(select(svg.current))
    useMount(() => {
        setSvgContainer(select(svg.current))
    })

    const [graphicContainer, setgraphicContainer] = useState(
        select(graphic.current)
    )

    useMount(() => {
        setgraphicContainer(select(graphic.current))
    })

    const newzoom = useMemo(
        () =>
            zoom().on('zoom', () => {
                graphicContainer.attr('transform', event.transform)
            }),
        [graphicContainer]
    )

    useEffect(() => {
        svgContainer.call(newzoom).on('wheel.zoom', null)
    }, [newzoom, svgContainer])

    const [brushContent, setbrushContent] = useState([0, 0])

    useEffect(() => {
        const {
            height: realHeight,
            width: realWidth,
        } = svg.current.getBoundingClientRect()
        const useWidth = realWidth - left - right
        const useHeight = realHeight - top - bottom
        // setbrushContent([realWidth, realHeight])
        setwidth(useWidth)
        setheight(useHeight)
    }, [bottom, left, right, top])

    const [brushContainer, setbrushContainer] = useState(select(brushG.current))

    useMount(() => setbrushContainer(select(brushG.current)))

    const newbrush = useMemo(() => brush().extent([[0, 0], brushContent]), [
        brushContent,
    ])
    useEffect(() => {
        brushContainer.call(newbrush)
    }, [brushContainer, newbrush])

    const [explain, setExplian] = useState([
        { name: '观测对象', value: <Tag>{targetDevice}</Tag> },
        {
            name: '被攻击次数',
            value: propData.filter(d => d.victimDevice.includes(targetDevice))
                .length,
        },
        {
            name: '攻击次数',
            value: propData.filter(d => d.attackDevice.includes(targetDevice))
                .length,
        },
    ])

    const g = useMemo(() => {
        return new dagreD3.graphlib.Graph({
            multigraph: true,
            compound: true,
        })
            .setGraph({
                nodesep: 10,
                ranksep: width / 4,
                rankdir: 'LR',
                marginx: 0,
                marginy: 0,
            })
            .setDefaultEdgeLabel(() => ({}))
    }, [width])

    const render = useMemo(() => {
        const { render: Render } = dagreD3
        return new Render()
    }, [])

    const [tooltipsObj, settooltipsObj] = useState({
        visibility: 'hidden',
    })

    const clearBrush = useCallback(() => {
        brushContainer.call(newbrush.move, [
            [0, 0],
            [0, 0],
        ])
    }, [brushContainer, newbrush.move])

    const [contextMenuStyle, setcontextMenuStyle] = useState({
        visibility: 'visible',
        x: '-999px',
        y: '-999px',
    })

    function hideTips() {
        settooltipsObj({
            visibility: 'hidden',
            x: -100,
            y: -1000,
        })
    }

    function hideContextMenu() {
        setcontextMenuStyle({
            top: '-999px',
            left: '-999px',
            visibility: 'visible',
        })
    }

    const eventHandle = useCallback(() => {
        selectAll('.deviceNode').on('mouseenter', function mouseover(d) {
            select(this).classed('selectNode', true)
            selectAll('.link')
                .style('opacity', 0.1)
                .filter(d1 => {
                    return [d1.v, d1.w].includes(d)
                })
                .classed('selectLink', true)

            calculateEventTag(d).then(tag => {
                setExplian([
                    {
                        name: '观测对象',
                        value: d,
                    },
                    {
                        name: '目标标签',
                        value: tag,
                    },
                    {
                        name: '被攻击次数',
                        value: propData.filter(d1 => d1.victimDevice === d)
                            .length,
                    },
                    {
                        name: '攻击次数',
                        value: propData.filter(d1 => d1.attackDevice === d)
                            .length,
                    },
                ])
            })
            const [x, y] = mouse(svg.current)
            settooltipsObj({
                visibility: 'visible',
                left: `${x + 10}px`,
                top: `${y + 10}px`,
            })
        })

        selectAll('.deviceNode').on('mouseleave', function mouseout() {
            select(this).classed('selectNode', false)
            selectAll('.link').style('opacity', 1).classed('selectLink', false)
            hideTips()
        })

        selectAll('.deviceNode').on('contextmenu', function mouseout(d) {
            event.preventDefault()
            setMouseTarget(d)
            hideTips()
            setcontextMenuStyle({
                top: `${event.layerY + 10}px`,
                left: `${event.layerX + 10}px`,
                visibility: 'visible',
            })
        })
    }, [propData])

    const draw = useCallback(
        data => {
            g.nodes().forEach(d => {
                g.removeNode(d)
            })
            clearBrush()
            hideContextMenu()
            if (callback) {
                callback(data)
            }
            // graphicContainer.select('.output').remove()
            data.sort((a, b) => a.starttime - b.starttime).forEach(d => {
                // time += onetime
                const { attackDevice, victimDevice } = d
                g.setNode(victimDevice, {
                    label: victimDevice,
                    class: 'deviceNode victimDevice',
                    name: victimDevice,
                    data: d,
                })

                g.setNode(attackDevice, {
                    label: attackDevice,
                    class: 'deviceNode attackDevice',
                    data: d,
                    name: attackDevice,
                })

                g.setEdge(attackDevice, victimDevice, {
                    arrowheadClass: 'arrowhead',
                    arrowhead: 'vee',
                    class: `link ${attackDevice} ${victimDevice}`,
                    label: translateEventType(d.type),
                    curve: curveBasis,
                })
            })
            render(graphicContainer, g)
            const { width: graphWidth, height: graphHeight } = g.graph()
            let initialScale = Math.min(
                height / graphHeight,
                width / graphWidth
            )
            if (initialScale > 1.2) {
                initialScale = 1.2
            }
            const xCenterOffset = (width - graphWidth * initialScale) / 2
            const yCenterOffset = (height - graphHeight * initialScale) / 2
            svgContainer.call(
                newzoom.transform,
                zoomIdentity
                    .translate(xCenterOffset, yCenterOffset)
                    .scale(initialScale)
            )
            // .on('wheel.zoom', null)
            eventHandle()
        },
        [
            callback,
            clearBrush,
            eventHandle,
            g,
            graphicContainer,
            height,
            newzoom.transform,
            render,
            svgContainer,
            width,
        ]
    )
    // function draw(data)

    const timeG = useRef(null)
    const [timeCircle, settimeCircle] = useState([])

    const [graphData, setgraphData] = useState([])

    const historyGraphData = useMemo(
        () => ({
            active: 0,
            data: [[]],
        }),
        []
    )

    function addHistory(data) {
        historyGraphData.active += 1
        historyGraphData.data = historyGraphData.data.slice(
            0,
            historyGraphData.active
        )
        historyGraphData.data.push(data)
        historyGraphData.active = historyGraphData.data.length - 1
        console.log(historyGraphData)
    }

    useEffect(() => {
        function initAxis(data) {
            const timeData = chain(data)
                .reduce((obj, d) => {
                    const key = d.starttime
                    const dataTemp = d[key] ? d.data : []
                    dataTemp.push(d)
                    obj[key] = {
                        name: key,
                        data: dataTemp,
                        show_starttime: d.show_starttime,
                    }
                    return obj
                }, {})
                .values()
                .orderBy('name')
                .value()

            const timeArr = timeData.map(d => d.name)

            const timeScale = scalePoint()
                .domain(timeArr)
                .range([0, height])
                .align(1)

            const useTimeCircle = timeData.map(d => ({
                ...d,
                x: width - 10,
                y: timeScale(d.name),
            }))
            settimeCircle(useTimeCircle)
        }
        draw(graphData)
        initAxis(graphData)
    }, [draw, graphData, height, width])

    useEffect(() => {
        const useData = propData.filter(d =>
            [d.victimDevice, d.attackDevice].includes(targetDevice)
        )
        historyGraphData.data = [useData]
        setgraphData(useData)
    }, [historyGraphData, propData, targetDevice])

    const methods = {
        refresh: () => {
            const useData = propData.filter(d =>
                [d.victimDevice, d.attackDevice].includes(targetDevice)
            )
            setgraphData(useData)
        },
        justExplore: () => {
            const newData = propData.filter(d1 =>
                [d1.victimDevice, d1.attackDevice].includes(mouseTarget)
            )
            addHistory(newData)
            setgraphData(newData)
        },
        exploreAndKeep: () => {
            const newData = propData.filter(d1 =>
                [d1.victimDevice, d1.attackDevice].includes(mouseTarget)
            )
            addHistory(newData)
            setgraphData(newData.concat(graphData))
        },
        save: () => {
            const newData = graphData.filter(d1 =>
                [d1.victimDevice, d1.attackDevice].includes(mouseTarget)
            )
            addHistory(newData)
            setgraphData(newData)
        },
        del: () => {
            const newData = graphData.filter(
                d1 => ![d1.victimDevice, d1.attackDevice].includes(mouseTarget)
            )
            addHistory(newData)
            setgraphData(newData)
        },
    }

    const toolsMethods = {
        removeBrush: () => {
            clearBrush()
            setbrushContent([0, 0])
        },
        addBrush: () => {
            setbrushContent([width, height])
        },
        zoomin: () => {
            newzoom.scaleBy(svgContainer, 1.1)
        },
        zoomout: () => {
            newzoom.scaleBy(svgContainer, 0.9)
        },
        saveData: () => {
            const selection = brushSelection(brushContainer.node())
            if (!selection) {
                message.warning('请通过刷子选择数据')
                return false
            }
            const [positionx, positiony, scalesize] = graphicContainer
                .attr('transform')
                .match(/\d+(.\d+)?/g)
                .map(Number)
            const [[x1, y1], [x2, y2]] = selection
            const nodeArr = []
            selectAll('.deviceNode').each(function findNode(d) {
                const [x, y] = select(this)
                    .attr('transform')
                    .match(/\d+(.\d+)?/g)
                    .map(Number)
                const realX = positionx + x * scalesize
                const realY = positiony + y * scalesize
                if (realX >= x1 && realX <= x2 && realY >= y1 && realY <= y2) {
                    nodeArr.push(d)
                }
            })
            if (!nodeArr.length) {
                message.warning('未选择到节点，请检查刷取范围!')
                return false
            }
            const newData = graphData.filter(d1 => {
                return (
                    nodeArr.includes(d1.attackDevice) ||
                    nodeArr.includes(d1.victimDevice)
                )
            })
            addHistory(newData)
            setgraphData(newData)
            return null
        },
        removeData: () => {
            const selection = brushSelection(brushContainer.node())
            if (!selection) {
                message.warning('请通过刷子选择数据')
                return false
            }
            const [positionx, positiony, scalesize] = graphicContainer
                .attr('transform')
                .match(/\d+(.\d+)?/g)
                .map(Number)
            const [[x1, y1], [x2, y2]] = selection
            const nodeArr = []
            selectAll('.deviceNode').each(function findNode(d) {
                const [x, y] = select(this)
                    .attr('transform')
                    .match(/\d+(.\d+)?/g)
                    .map(Number)
                const realX = positionx + x * scalesize
                const realY = positiony + y * scalesize
                if (realX >= x1 && realX <= x2 && realY >= y1 && realY <= y2) {
                    nodeArr.push(d)
                }
            })
            if (!nodeArr.length) {
                message.warning('未选择到节点，请检查刷取范围!')
                return false
            }
            const newData = graphData.filter(d1 => {
                return (
                    !nodeArr.includes(d1.attackDevice) &&
                    !nodeArr.includes(d1.targetDevice)
                )
            })
            addHistory(newData)
            setgraphData(newData)
            return null
        },
        preData: () => {
            console.log(historyGraphData)
            if (historyGraphData.active === 0) {
                return
            }
            historyGraphData.active -= 1
            const data = historyGraphData.data[historyGraphData.active]
            setgraphData(data)
        },
        backData: () => {
            if (historyGraphData.active + 1 === historyGraphData.data.length) {
                return
            }
            historyGraphData.active += 1
            const data = historyGraphData.data[historyGraphData.active]
            setgraphData(data)
        },
        refresh: () => {
            const useData = propData.filter(d =>
                [d.victimDevice, d.attackDevice].includes(targetDevice)
            )
            console.log(useData)
            setgraphData(useData)
        },
        findStage: stage => {
            const newData = graphData.filter(d => {
                return d.stage === stage
            })
            addHistory(newData)
            setgraphData(newData)
            return null
        },
    }
    // 请求数据
    return (
        <div className={style['relation-chart']}>
            <div className='graph-tool'>
                <span className='graph-tool-item'>
                    {brushContent[0] ? (
                        <Tooltip title='拖拽'>
                            <DragOutlined onClick={toolsMethods.removeBrush} />
                        </Tooltip>
                    ) : (
                        <Tooltip title='刷子'>
                            <GatewayOutlined onClick={toolsMethods.addBrush} />
                        </Tooltip>
                    )}
                </span>
                <span className='graph-tool-item'>
                    <div className='graph-tool-item-fa'>
                        <Tooltip title='图操作'>
                            <SearchOutlined />
                        </Tooltip>
                        <div className='graph-tool-item-child'>
                            <ZoomInOutlined onClick={toolsMethods.zoomin} />
                            <ZoomOutOutlined onClick={toolsMethods.zoomout} />
                        </div>
                    </div>
                </span>
                <span className='graph-tool-item'>
                    <div className='graph-tool-item-fa'>
                        <Tooltip title='数据操作'>
                            <DatabaseOutlined />
                        </Tooltip>
                        <div className='graph-tool-item-child'>
                            <CheckCircleOutlined
                                onClick={toolsMethods.saveData}
                            />
                            <CloseCircleOutlined
                                onClick={toolsMethods.removeData}
                            />
                            <LeftCircleOutlined
                                onClick={toolsMethods.preData}
                            />
                            <RightCircleOutlined
                                onClick={toolsMethods.backData}
                            />
                        </div>
                    </div>
                </span>
                <span className='graph-tool-item'>
                    <div className='graph-tool-item-fa'>
                        <Tooltip title='动画操作'>
                            <PlayCircleOutlined />
                        </Tooltip>
                        <div className='graph-tool-item-child'>
                            <PauseCircleOutlined />
                            <DoubleRightOutlined />
                            <DoubleLeftOutlined />
                        </div>
                    </div>
                </span>
                <span className='graph-tool-item'>
                    <Tooltip title='使用指南'>
                        <QuestionCircleOutlined />
                    </Tooltip>
                </span>
                <span className='graph-tool-item'>
                    <ReloadOutlined onClick={toolsMethods.refresh} />
                </span>
            </div>
            <div className='graph-content'>
                <svg
                    width='100%'
                    height='100%'
                    ref={svg}
                    className='graph-content'
                >
                    <g transform={`translate(${top}, ${left})`}>
                        <g>
                            {EVENT_STAGES.map((d, i) => (
                                <g
                                    key={d}
                                    transform={`translate(${0}, ${i * 20})`}
                                    onClick={() => toolsMethods.findStage(d)}
                                >
                                    <circle r={3} cx={0} cy={0} />
                                    <text dominantBaseline='middle' x='10'>
                                        {d}
                                        {
                                            propData.filter(
                                                d1 => d1.stage === d
                                            ).length
                                        }
                                    </text>
                                </g>
                            ))}
                        </g>
                        <g ref={graphic} className='graph-node' />
                        <g ref={brushG} />
                        <g ref={timeG}>
                            <line
                                x1={width - 10}
                                y1='1'
                                x2={width - 10}
                                y2={height}
                                stroke='#D9D9D9'
                            />
                            {timeCircle.map(d => {
                                const { x, y, name, data, show_starttime } = d
                                const descArr = data.map(d1 => {
                                    const { show_type } = d1
                                    // const opDevice =
                                    //     victimDevice === targetDevice
                                    //         ? attackDevice
                                    //         : victimDevice
                                    return ` ${show_type}`
                                })
                                return (
                                    <g
                                        transform={`translate(${x}, ${y})`}
                                        key={name}
                                    >
                                        <circle
                                            r={3}
                                            fill='#fff'
                                            stroke='#F5222D'
                                            strokeWidth={1.5}
                                        />
                                        <text
                                            fontSize='8'
                                            style={{
                                                textAnchor: 'end',
                                                dominantBaseline: 'middle',
                                            }}
                                            x='-4'
                                        >
                                            {show_starttime}
                                            {descArr.join('\n')}
                                        </text>
                                    </g>
                                )
                            })}
                        </g>
                    </g>
                </svg>
                <div className='contextmenu tooltips' style={contextMenuStyle}>
                    <div
                        className='contextmenu-item'
                        onClick={methods.justExplore}
                    >
                        仅查看探索
                    </div>
                    <div
                        className='contextmenu-item'
                        onClick={methods.exploreAndKeep}
                    >
                        保留且探索
                    </div>
                    <div className='contextmenu-item' onClick={methods.save}>
                        只看相关节点
                    </div>
                    <div className='contextmenu-item' onClick={methods.del}>
                        删除相关节点
                    </div>
                </div>
                <div className='tooltips relation-tooltips' style={tooltipsObj}>
                    {explain.map(d => (
                        <div className='tooltips-item' key={d.name}>
                            <div className='tooltips-item-label'>{d.name}</div>
                            <div className='tooltips-item-value'>{d.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

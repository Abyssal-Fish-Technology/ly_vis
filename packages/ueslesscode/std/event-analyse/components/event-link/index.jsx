import Section from '@shadowflow/components/ui/layout/section'
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    select,
    scaleLinear,
    extent,
    drag,
    event,
    mouse,
    selectAll,
    scaleOrdinal,
    forceCollide,
    forceY,
    forceX,
} from 'd3'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { inject, observer } from 'mobx-react'
import {
    Drawer,
    Empty,
    Form,
    Input,
    InputNumber,
    Select,
    Slider,
    Switch,
} from 'antd'
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    FilterOutlined,
    HeatMapOutlined,
    LeftCircleOutlined,
    ReloadOutlined,
    RightCircleOutlined,
    SettingOutlined,
} from '@ant-design/icons'
import { toJS } from 'mobx'
import { chain } from 'lodash'
import { useComponentUnMount } from '@shadowflow/components/utils/universal/methods-hooks'
import { EventConfig } from '@shadowflow/components/system/event-system'
import eventAnalyseStore from '../../store'
import style from './index.module.less'
import forceInABox from './force-inbox'

function EventLink({
    history,
    calcualteEventTrack,
    graphSetting,
    searchDevice,
    changeSearchDevice,
    searchEventType,
    changeSearchEventType,
    restart,
}) {
    const [size, setsize] = useState({
        height: 0,
        width: 0,
    })

    const container = useRef(null)

    const nodesContainer = useRef(null)

    const linksContainer = useRef(null)
    const eventDataLength = history.find(d => d.active).eventData || []
    useEffect(() => {
        const { width, height } = container.current.getBoundingClientRect()
        setsize({
            width,
            height,
        })
    }, [])

    const [tooltipattr, settooltipattr] = useState({
        style: {
            display: 'none',
        },
        name: '',
    })
    const chart = useRef()

    const clickSelct = useRef(false)

    function selectNode(d) {
        const selectData = d || clickSelct.current
        const { path } = eventAnalyseStore.history.find(
            d1 => d1.active
        ).eventRank
        const { id: name, data } = selectData
        let pathArr = chain(path)
            .map(d1 => {
                return {
                    ...d1,
                    path: d1.path.map(d2 => d2.device),
                }
            })
            .filter(d1 => d1.path.includes(name))
            .map('path')
            .flatten()
            .uniq()
            .value()

        if (pathArr.length === 0) {
            pathArr = [name]
        }

        selectAll('.node')
            .style('opacity', 0.1)
            .filter(d1 => pathArr.includes(d1.id))
            .style('opacity', 1)

        selectAll('.link')
            .style('opacity', 0.1)
            .filter(
                d1 =>
                    pathArr.includes(d1.source.id) &&
                    pathArr.includes(d1.target.id)
            )
            .style('opacity', 1)
        eventAnalyseStore.calcaulteDesc({
            设别名称: name,
            事件数量: data.length,
            事件类型: chain(data).map('type').uniq().value().length,
            攻击次数: data.filter(d1 => d1.attackDevice === name).length,
            受害次数: data.filter(d1 => d1.victimDevice === name).length,
            设备数量:
                chain(data)
                    .map(d1 => [d1.attackDevice, d1.victimDevice])
                    .flatten()
                    .uniq()
                    .value().length - 1,
        })
    }

    function cancelSelectNode() {
        selectAll('.node').style('opacity', 1)
        selectAll('.link').style('opacity', 1)
        eventAnalyseStore.calcaulteDesc()
    }

    const force = useMemo(() => {
        return forceSimulation()
            .alphaDecay(0.01) // 衰减系数。【0-1】越小 衰减的越慢，但是布局越好,越大 衰减的越快，布局越乱
            .alphaTarget(0) // 衰减系数。【0-1】越小 衰减的越慢，但是布局越好,越大 衰减的越快，布局越乱
            .force(
                'charge',
                forceManyBody() // 多面体力 主要是指节点间的作用力
                    .strength(10) // 力的大小 正为引力，负为斥力
            )
            .force(
                'link',
                forceLink() // 连接线作用力，force的作用是向forceSimulation上面添加力
                    .id(d => d.id)
                    .distance(50)
                    .strength(1)
            )
            .force(
                'collide',
                forceCollide() // 圆的碰撞力
                    .radius(1) // 根据指定的半径创建一个碰撞力。默认为 1
            )
    }, [])

    const graphStart = useMemo(() => {
        return alpha => {
            const forceAlpha = alpha || 1
            force.alpha(forceAlpha).restart()
        }
    }, [force])

    const graphStop = useMemo(() => {
        return () => force.stop()
    }, [force])

    const sizeScale = useMemo(() => {
        const { nodes } = history.find(d => d.active).relationData
        return scaleLinear()
            .domain([1, extent(nodes, d => d[graphSetting.size])][1])
            .range([4, 20])
    }, [graphSetting.size, history])

    useEffect(() => {
        force.force(
            'charge',
            forceManyBody() // 多面体力 主要是指节点间的作用力
                .strength(0 - graphSetting.strength) // 力的大小 正为引力，负为斥力
        )
    }, [graphSetting.strength, force])

    useEffect(() => {
        force.force(
            'link',
            forceLink() // 连接线作用力，force的作用是向forceSimulation上面添加力
                .id(d => d.id)
                .distance(d => {
                    return (
                        sizeScale(d.source.data.length + d.target.data.length) +
                        graphSetting.distance
                    )
                })
        )
    }, [graphSetting.distance, force, sizeScale])

    useEffect(() => {
        force
            .force('x', forceX(size.width / 2).strength(0.05))
            .force('y', forceY(size.height / 2).strength(0.08))
    }, [size, force])

    useEffect(() => {
        force.force(
            'collide',
            forceCollide() // 圆的碰撞力
                .radius(d => {
                    return sizeScale(d.data.length) * 2 + graphSetting.collide
                }) // 根据指定的半径创建一个碰撞力。默认为 1
        )
        force.restart()
    }, [graphSetting.collide, force, sizeScale])

    useEffect(() => {
        if (graphSetting.showLabel) {
            selectAll('text.nodeLabel').attr('opacity', 1)
        } else {
            selectAll('text.nodeLabel').attr('opacity', 0)
        }
    }, [graphSetting.showLabel])

    useEffect(() => {
        if (graphSetting.showType) {
            selectAll('.edgelabel').attr('opacity', 1)
        } else {
            selectAll('.edgelabel').attr('opacity', 0)
        }
    }, [graphSetting.showType])

    useEffect(() => {
        graphStart()
    }, [
        graphStart,
        graphSetting.collide,
        graphSetting.distance,
        graphSetting.strength,
    ])
    const [dataFilter, setdataFilter] = useState(false)
    const [killChain, setkillChain] = useState(false)

    useEffect(() => {
        const { nodes, links } = history.find(d => d.active).relationData
        const old = new Map(
            selectAll('g.node')
                .data()
                .map(d => [d.id, d])
        )
        let useNodes = nodes
        let useLinks = links
        if (dataFilter) {
            useLinks = links.filter(d => {
                const { source, target } = d
                const nodeType = chain(useNodes)
                    .filter(d1 => d1.id === source || d1.id === target)
                    .map('nodeType')
                    .value()
                return nodeType.includes('资产设备')
            })

            const nodeMap = chain(useLinks)
                .map(d => [d.source, d.target])
                .flatten()
                .countBy()
                .value()
            useNodes = nodes.filter(d => {
                return nodeMap[d.id]
            })
        }

        const memoryNode = useNodes.map(d =>
            Object.assign(old.get(d.id) || {}, d)
        )
        const memoryLink = useLinks.map(d => ({ ...d }))

        force.nodes(memoryNode)
        force.force('link').links(memoryLink)

        graphStart()

        let link = select(linksContainer.current)
            .selectAll('g.link')
            .data(memoryLink, d => d.id)

        link.exit().remove()

        link = link.enter().append('g').classed('link', true)

        link.append('line').attr('marker-end', 'url(#arrow)')

        link.append('path')
            .attr('class', 'edgepath')
            .attr('id', (d, i) => `edgepath${i}`)

        const edgelabels = link
            .append('text')
            .attr('class', 'edgelabel')
            .attr('opacity', graphSetting.showType ? 1 : 0)
            .attr('id', (d, i) => `edgelabel${i}`)
            .attr('font-size', 10)
            .attr('fill', '#aaa')

        edgelabels
            .append('textPath') // To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
            .attr('xlink:href', (d, i) => `#edgepath${i}`)
            .attr('startOffset', '50%')
            .text(d => d.type)

        let isDrag = false
        const node = select(nodesContainer.current)
            .selectAll('g.node')
            .data(memoryNode, d => d.id)

        node.exit().remove()

        const finalNode = node.enter().append('g').classed('node', true)

        finalNode
            .on('click', function click(d) {
                graphStop()
                if (clickSelct.current.id === d.id) {
                    clickSelct.current = false
                    cancelSelectNode()
                    calcualteEventTrack(false)
                    select(this).classed('selected', false)
                } else {
                    clickSelct.current = d
                    selectAll('.selected').classed('selected', false)
                    select(this).classed('selected', true)
                    selectNode()
                    calcualteEventTrack(d.id)
                }
            })
            .on('mouseenter', d => {
                if (isDrag) return
                graphStop()
                selectNode(d)
            })
            .on('mouseleave', () => {
                if (isDrag) return
                if (clickSelct.current) {
                    selectNode()
                } else {
                    cancelSelectNode()
                }
                graphStart(force.alpha())
            })
            .on('contextmenu', d => {
                event.preventDefault()
                graphStop()
                const [x, y] = mouse(container.current)
                settooltipattr({
                    style: {
                        top: `${y + 10}px`,
                        left: `${x + 10}px`,
                    },
                    name: d.id,
                })
            })
            .call(
                drag()
                    .on('start', () => {
                        isDrag = true
                        if (!event.active) graphStart()
                    })
                    .on('drag', d => {
                        d.fx = event.x
                        d.fy = event.y
                    })
                    .on('end', () => {
                        isDrag = false
                    })
            )
        finalNode.append('circle').classed('circlebg', true)

        finalNode.append('circle').classed('circleNode', true)

        finalNode
            .append('text')
            .attr('dy', '4px')
            .classed('nodeLabel shadow', true)
            .attr('opacity', graphSetting.showLabel ? 1 : 0)
            .text(d => {
                if (d.id.length > 20) return `${d.id.substring(0, 27)}...`
                return d.id
            })

        finalNode
            .append('text')
            .attr('dy', '4px')
            .classed('nodeLabel', true)
            .attr('opacity', graphSetting.showLabel ? 1 : 0)
            .text(d => {
                if (d.id.length > 20) return `${d.id.substring(0, 27)}...`
                return d.id
            })

        force.on('tick', () => {
            function resetSize(v, type = 'x') {
                const padding = 20
                let newv = v
                if (type === 'x') {
                    if (v > size.width - padding) newv = size.width - padding
                    if (v < 0) newv = padding
                } else {
                    if (v > size.height - padding) newv = size.height - padding
                    if (v < 0) newv = padding
                }
                return newv
            }
            select(linksContainer.current)
                .selectAll('g.link')
                .selectAll('line')
                .attr('x1', d => resetSize(d.source.x))
                .attr('y1', d => resetSize(d.source.y, 'y'))
                .attr('x2', d => resetSize(d.target.x))
                .attr('y2', d => resetSize(d.target.y, 'y'))
            select(linksContainer.current)
                .selectAll('g.link')
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
                .selectAll('.node')
                .attr(
                    'transform',
                    d => `translate(${resetSize(d.x)}, ${resetSize(d.y, 'y')})`
                )
                .selectAll('.nodeLabel')
                .style('text-anchor', d =>
                    resetSize(d.x) > size.width - 100 ? 'end' : 'start'
                )
        })
    }, [
        calcualteEventTrack,
        force,
        graphSetting,
        graphStart,
        graphStop,
        history,
        size,
        dataFilter,
        killChain,
    ])

    useEffect(() => {
        const groupingForce = forceInABox()
            .strength(0.3)
            .template('treemap')
            .groupBy(killChain)
            .enableGrouping(killChain)
            .size([size.width, size.height])

        const link = force.force('link').links()
        if (killChain) {
            force.force('link').strength(groupingForce.getLinkStrength)
            force.force('group', groupingForce)
            select(nodesContainer.current)
                .selectAll('.node')
                .each(d => {
                    d.fx = null
                    d.fy = null
                })
            groupingForce
                .links(link)
                .drawTreemap(select(linksContainer.current))
        } else {
            force.force('link').strength(1)
            force.force('group', null)
            select(linksContainer.current).selectAll('.cell').remove()
        }
    }, [force, killChain, size])

    useComponentUnMount(graphStop)

    useEffect(() => {
        let colorRange = [
            '#3a65ff',
            '#5eff5a',
            '#ffba69',
            '#8676ff',
            '#02a4ff',
            '#17eb8e',
            '#ff7d4d',
            '#991bfa',
            '#e323ff',
        ]

        const { nodes } = history.find(d => d.active).relationData

        let colorDomain = chain(nodes).map(graphSetting.color).uniq().value()

        switch (graphSetting.color) {
            case 'nodeType':
                colorDomain = ['资产设备', '威胁来源', '未知设备']
                colorRange = ['#3a65ff', '#ff2d2e', '#84859f']
                break
            case 'attackType':
                colorDomain = ['受害目标', '威胁来源']
                colorRange = ['#3a65ff', '#ff2d2e']
                break
            case 'eventType':
                colorDomain = [
                    '受害目标',
                    ...colorDomain.filter(d => d !== '受害目标'),
                ]
                break
            default:
                break
        }

        eventAnalyseStore.changeLegend({
            color: colorDomain.map((d, i) => [d, colorRange[i]]),
        })

        const colorScale = scaleOrdinal().domain(colorDomain).range(colorRange)

        selectAll('g.node')
            .select('.circleNode')
            .attr('fill', d => {
                return colorScale(d[graphSetting.color])
            })
            .attr('stroke', d => colorScale(d[graphSetting.color]))
    }, [graphSetting.color, history, dataFilter])

    useEffect(() => {
        selectAll('g.node')
            .selectAll('circle')
            .attr('r', d => sizeScale(d[graphSetting.size]))
    }, [graphSetting.size, history, dataFilter, sizeScale])

    const [drawerVis, setdrawerVis] = useState(false)
    const [dataFilterVis, setdataFilterVis] = useState(false)

    function closeContextMenu() {
        settooltipattr({
            style: {
                display: 'none',
            },
        })
    }

    function saveData() {
        const { name } = tooltipattr
        const newData = eventAnalyseStore.eventData.filter(d => {
            return [d.attackDevice, d.victimDevice].includes(name)
        })
        eventAnalyseStore.createHistory(newData)
        closeContextMenu()
    }

    function delData() {
        const { name } = tooltipattr
        const newData = eventAnalyseStore.eventData.filter(d => {
            return ![d.attackDevice, d.victimDevice].includes(name)
        })
        eventAnalyseStore.createHistory(newData)
        closeContextMenu()
    }
    const nowActiveIndex = history.findIndex(d => d.active)

    function changeHistory(type = 'prev') {
        let index = 0
        switch (type) {
            case 'prev':
                index = history.findIndex(d => d.active) - 1
                break
            case 'next':
                index = history.findIndex(d => d.active) + 1
                break
            default:
                break
        }
        eventAnalyseStore.choseHistory(index)
    }

    const historyLength = history.length

    const [deviceValue, setdeviceValue] = useState('')
    useEffect(() => {
        setdeviceValue(searchDevice)
    }, [searchDevice])

    const [eventType, seteventType] = useState('')
    useEffect(() => {
        seteventType(searchEventType)
    }, [searchEventType])

    return (
        <Section title='攻击图' className={`${style.module}`}>
            <div className='chart-tools'>
                {/* <div className='chart-tools-item'>
                    <Select
                        defaultValue='force'
                        size='small'
                        onChange={changeGraph}
                    >
                        <Select.Option value='force'>力引导布局</Select.Option>
                        <Select.Option value='aggre'>聚合布局</Select.Option>
                        <Select.Option value='rect'>矩阵布局</Select.Option>
                        <Select.Option value='dgree'>dgree布局</Select.Option>
                        <Select.Option value='arc'>Arc连接图</Select.Option>
                    </Select>
                </div> */}
                <div
                    className={`${dataFilter ? 'active' : ''} chart-tools-item`}
                >
                    <Input.Search
                        onSearch={e => {
                            changeSearchDevice(e)
                            restart()
                        }}
                        onChange={e => {
                            setdeviceValue(e.target.value)
                        }}
                        value={deviceValue}
                    />
                </div>
                <div className='chart-tools-item aggre-select'>
                    <EyeOutlined />
                    事件类型
                    <Select
                        size='small'
                        value={eventType}
                        width='100'
                        mode='multiple'
                        maxTagCount={0}
                        onChange={d => {
                            changeSearchEventType(d)
                            restart()
                        }}
                    >
                        {Object.entries(EventConfig).map(typeItem => {
                            return (
                                <Select.Option value={typeItem[0]}>
                                    {typeItem[1].name}
                                </Select.Option>
                            )
                        })}
                    </Select>
                </div>
                <div
                    className='chart-tools-item'
                    onClick={() => setdrawerVis(true)}
                >
                    <SettingOutlined />
                    图设置
                </div>
                <div
                    className={`${dataFilter ? 'active' : ''} chart-tools-item`}
                    onClick={() => {
                        setdataFilter(!dataFilter)
                    }}
                >
                    <FilterOutlined />
                    资产事件
                </div>
                <div className='chart-tools-item aggre-select'>
                    <HeatMapOutlined />
                    聚类
                    <Select
                        size='small'
                        defaultValue=''
                        width='100'
                        onChange={type => {
                            if (type) {
                                setkillChain(type)
                            } else {
                                setkillChain(false)
                            }
                        }}
                    >
                        <Select.Option value=''>无</Select.Option>
                        <Select.Option value='stage'>攻击链</Select.Option>
                        <Select.Option value='eventType'>
                            事件类型
                        </Select.Option>
                    </Select>
                </div>
                <div className='chart-tools-item chart-tools-op'>
                    <span
                        className={`${
                            nowActiveIndex < 1 ? 'disabledSpan' : ''
                        }`}
                    >
                        <LeftCircleOutlined
                            onClick={() => changeHistory('prev')}
                            className={`${
                                nowActiveIndex < 1 ? 'disabled' : ''
                            }`}
                        />
                    </span>
                    <span
                        className={`${
                            nowActiveIndex === historyLength - 1
                                ? 'disabledSpan'
                                : ''
                        }`}
                    >
                        <RightCircleOutlined
                            onClick={() => changeHistory('next')}
                            className={`${
                                nowActiveIndex === historyLength - 1
                                    ? 'disabled'
                                    : ''
                            }`}
                        />
                    </span>
                    <ReloadOutlined
                        onClick={() =>
                            eventAnalyseStore.createHistory(
                                eventAnalyseStore.formatData,
                                true
                            )
                        }
                    />
                </div>
            </div>
            <div className='chart-container' ref={container}>
                {eventDataLength.length > 0 ? (
                    <>
                        <svg
                            onClick={closeContextMenu}
                            height={size.height}
                            width={size.width}
                            ref={chart}
                        >
                            <g className='links' ref={linksContainer} />
                            <g className='nodes' ref={nodesContainer} />
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
                        </svg>
                        <div
                            className='tooltips context-menu'
                            style={tooltipattr.style}
                        >
                            <div className='menu-title'>{`设备: ${tooltipattr.name}`}</div>
                            <div className='menu-item' onClick={saveData}>
                                保留 <CheckCircleOutlined />
                            </div>
                            <div className='menu-item' onClick={delData}>
                                移除 <CloseCircleOutlined />
                            </div>
                        </div>
                    </>
                ) : (
                    <Empty
                        style={{
                            width: '100%',
                            height: '100%',
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description='暂无数据'
                    />
                )}
            </div>
            <GraphSetting
                visible={drawerVis}
                close={() => setdrawerVis(false)}
            />
            <DataFilter
                visible={dataFilterVis}
                close={() => setdataFilterVis(false)}
            />
        </Section>
    )
}

function DataFilter({ visible, close }) {
    const [form] = Form.useForm()
    function setGraph() {
        const value = form.getFieldsValue()
        eventAnalyseStore.resetDataSetting(value)
    }
    return (
        <Drawer
            getContainer={false}
            title='数据过滤'
            placement='right'
            visible={visible}
            onClose={close}
            width='25%'
            className='an-setting'
        >
            <Form
                onValuesChange={setGraph}
                form={form}
                initialValues={eventAnalyseStore.dataSetting}
            >
                <Form.Item
                    label='移除非资产数据'
                    name='removeUninternal'
                    valuePropName='checked'
                >
                    <Switch />
                </Form.Item>
                <Form.Item label='移除事件数量小于 ' name='removeEventCount'>
                    <InputNumber />
                </Form.Item>
                <Form.Item label='移除相关设备事件 ' name='removeDevice'>
                    <Input />
                </Form.Item>
                <Form.Item label='保留相关设备事件 ' name='keepDevice'>
                    <Input />
                </Form.Item>
            </Form>
        </Drawer>
    )
}

function GraphSetting({ visible, close }) {
    const [form] = Form.useForm()
    function setGraph() {
        const value = form.getFieldsValue()
        eventAnalyseStore.resetGraphSetting(value)
    }
    return (
        <Drawer
            getContainer={false}
            title='图设置'
            placement='right'
            visible={visible}
            onClose={close}
            width='25%'
            className='an-setting'
        >
            <Form
                onValuesChange={setGraph}
                form={form}
                initialValues={eventAnalyseStore.graphSetting}
            >
                <div className='setting-item'>
                    <div className='setting-item-name'>界面显示</div>
                    <div className='setting-item-content'>
                        <Form.Item
                            label='节点名称'
                            name='showLabel'
                            valuePropName='checked'
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            label='攻击类型'
                            name='showType'
                            valuePropName='checked'
                        >
                            <Switch />
                        </Form.Item>
                    </div>
                </div>
                <div className='setting-item'>
                    <div className='setting-item-name'>视觉通道</div>
                    <div className='setting-item-content'>
                        <Form.Item label='颜色' name='color'>
                            <Select>
                                <Select.Option value='nodeType'>
                                    自身属性
                                </Select.Option>
                                <Select.Option value='eventType'>
                                    事件属性
                                </Select.Option>
                                <Select.Option value='attackType'>
                                    攻击属性
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label='大小' name='size'>
                            <Select>
                                <Select.Option value='事件数量'>
                                    攻击次数
                                </Select.Option>
                                <Select.Option value='攻击时长'>
                                    攻击时长
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                </div>
                <div className='setting-item'>
                    <div className='setting-item-name'>图属性</div>
                    <div className='setting-item-content'>
                        <Form.Item label='连线长度' name='distance'>
                            <Slider min={0} max={150} />
                        </Form.Item>
                        <Form.Item label='力的大小' name='strength'>
                            <Slider min={0} max={200} />
                        </Form.Item>
                        <Form.Item label='分离度' name='collide'>
                            <Slider min={0} max={30} />
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </Drawer>
    )
}

export default inject(stores => ({
    history: toJS(stores.eventAnalyseStore.history),
    calcualteEventTrack: stores.eventAnalyseStore.calcualteEventTrack,
    graphSetting: stores.eventAnalyseStore.graphSetting,
    searchDevice: stores.eventAnalyseStore.searchDevice,
    changeSearchDevice: stores.eventAnalyseStore.changeSearchDevice,
    searchEventType: stores.eventAnalyseStore.searchEventType,
    changeSearchEventType: stores.eventAnalyseStore.changeSearchEventType,
    restart: stores.eventAnalyseStore.restart,
}))(observer(EventLink))

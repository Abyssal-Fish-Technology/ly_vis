import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { inject, observer } from 'mobx-react'
import Section from '@shadowflow/components/ui/layout/section'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import {
    scaleOrdinal,
    selectAll,
    select,
    drag,
    // schemeSet3,
} from 'd3'

import { chain, difference, uniq } from 'lodash'
import {
    DragOutlined,
    ReloadOutlined,
    SwapOutlined,
    TableOutlined,
} from '@ant-design/icons'
import { Select } from 'antd'
import SkipContainer from '@/components/skip-container'
import lightTheme from '@/components/chart/theme/light'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import deviceOpMenuStore from '@shadowflow/components/ui/table/device-op-menu-template/store'
import TooltipsGlobal from '@shadowflow/components/ui/tooltips'
import { BasicCustomChart } from '@shadowflow/components/charts'
import UnitContainer from '@shadowflow/components/ui/container/unit-container'
import style from './index.module.less'

const color = scaleOrdinal(lightTheme.color)
// const color = scaleOrdinal(schemeSet3)
function calColor(name) {
    const [type] = name.split('-ly-')
    switch (type) {
        case 'attackDevice':
            return 'rgb(255, 45, 46)'
        case 'asset_desc':
        case 'victimDevice':
            return '#f6f7fb'
        default:
            return color(name.replace(/ .*/, ''))
    }
}

let timeout = null

function EventHost({
    data,
    eventData,
    keys,
    resetKeys,
    selectKeys,
    orderKeys,
    params,
    top10,
}) {
    const [top, right, bottom, left] = useMemo(() => [0, 0, 0, 0], [])
    const [realSize, setRealSize] = useState({
        realWidth: 100,
        realHeight: 100,
    })

    const selectKey = useMemo(() => keys.filter(d => d.select), [keys])

    const [sortObj, setsortObj] = useState(
        selectKey.reduce((obj, d) => {
            obj[d.value] = true
            return obj
        }, {})
    )
    const [initOpacity, hideOpacity, hoverOpacity] = useMemo(
        () => [0.1, 0.05, 1],
        []
    )

    const cal = useMemo(
        () =>
            sankey()
                .nodeSort((a, b) => {
                    if (sortObj[a.type]) return b.value - a.value
                    return a.value - b.value
                })
                .nodeId(d => d.id)
                // .linkSort((a, b) => {
                //     if (sortObj[a.type]) return b.value - a.value
                //     return a.value - b.value
                // })
                .nodeWidth(15)
                .nodePadding(0)
                .extent([
                    [1, 5],
                    [realSize.realWidth - 1, realSize.realHeight - 5],
                ]),
        [realSize, sortObj]
    )

    const { nodes, links } = useMemo(() => {
        return data.nodes.length === 0 ? { nodes: [], links: [] } : cal(data)
    }, [cal, data])

    const [tipsAttr, settipsAttr] = useState({
        content: {},
        data: {},
    })

    const container = useRef(null)

    const tooltipsRef = useRef(null)
    const contentArr = useMemo(() => {
        const { content = {} } = tipsAttr
        return Object.keys(content).map(d => ({
            label: d,
            value: content[d],
        }))
    }, [tipsAttr])

    const filterCondition = useMemo(() => {
        const {
            data: { type = '', showName = '' },
        } = tipsAttr
        return ['attackDevice', 'victimDevice'].includes(type)
            ? {
                  device: {
                      [type]: showName,
                  },
              }
            : {
                  [type]: [showName],
              }
    }, [tipsAttr])

    const mouseover = useCallback(
        (e, nodeId) => {
            const relationLinks = links.filter(
                l => l.source.id === nodeId || l.target.id === nodeId
            )

            const relationLinksId = uniq(relationLinks.map(l => l.lineId))
            relationLinksId.forEach(c => {
                selectAll(`path.sankey-link-${c}`).attr(
                    'stroke-opacity',
                    hoverOpacity
                )
            })
            const relationNodesId = chain(links)
                .filter(l => relationLinksId.includes(l.lineId))
                .map(n => [n.source.id, n.target.id])
                .flatten()
                .uniq()
                .value()

            selectAll('g.sankey-node')
                .filter(function filterFun() {
                    const id = select(this).attr('id')
                    return !relationNodesId.includes(id)
                })
                .attr('opacity', hideOpacity)
            tooltipsRef.current.openTooltips(e.nativeEvent, container.current)
        },
        [hideOpacity, hoverOpacity, links]
    )

    const mouseout = useCallback(() => {
        selectAll(`path.sankey-link`).attr('stroke-opacity', initOpacity)
        // .attr('stroke', schemeSet1[0])
        selectAll(`g.sankey-node`).attr('opacity', 1)
        timeout = setTimeout(() => {
            tooltipsRef.current.closeTooltips()
            settipsAttr({
                content: {},
                data: {},
            })
        }, 400)
    }, [initOpacity])

    useEffect(() => {
        selectAll('.sankey-node-rect').on('mouseenter', function mousemove() {
            if (timeout) clearTimeout(timeout)
            const nodeid = select(this).attr('nodeid')
            const nodeData = nodes.filter(d => d.id === nodeid)[0]
            const { type, showName } = nodeData
            const relationData = eventData.filter(d => {
                if (type === 'asset_desc') {
                    return (
                        difference(showName.split(','), d[type]).length === 0 &&
                        top10.includes(d.victimDevice)
                    )
                }
                return d[type] === showName || d[type].includes(showName)
            })

            const attackDeviceCount = (
                <>
                    {
                        chain(relationData).map('attackDevice').uniq().value()
                            .length
                    }
                    <UnitContainer unit='台' />
                </>
            )
            const victimeDeviceCount = (
                <>
                    {
                        chain(relationData).map('victimDevice').uniq().value()
                            .length
                    }
                    <UnitContainer unit='台' />
                </>
            )
            const eventCount = (
                <>
                    {relationData.length}
                    <UnitContainer unit='件' />
                </>
            )
            let content = {}
            switch (type) {
                case 'attackDevice':
                    content = {
                        威胁来源: showName,
                        事件数: eventCount,
                        受害数: victimeDeviceCount,
                        类型: chain(relationData)
                            .map('show_type')
                            .uniq()
                            .value()
                            .map(d => (
                                <TagAttribute type='event' key={d}>
                                    {d}
                                </TagAttribute>
                            )),
                    }
                    break

                case 'victimDevice':
                    content = {
                        受害目标: showName,
                        事件数: eventCount,
                        威胁来源: attackDeviceCount,
                        类型: chain(relationData)
                            .map('show_type')
                            .uniq()
                            .value()
                            .map(d => (
                                <TagAttribute type='event' key={d}>
                                    {d}
                                </TagAttribute>
                            )),
                    }
                    break

                default:
                    content = {
                        名称: showName,
                        事件数: eventCount,
                        威胁来源: attackDeviceCount,
                        受害目标: victimeDeviceCount,
                    }
                    break
            }
            settipsAttr({
                content,
                data: nodeData,
            })
        })
    }, [data, eventData, nodes, top10])

    const isDrag = useRef(false)

    useEffect(() => {
        selectAll('.chart-title-item').call(
            drag()
                .on('drag', function darging(event) {
                    isDrag.current = true
                    const { x: eventX } = event
                    const originX = Number(select(this).attr('x'))
                    select(this)
                        .attr(
                            'style',
                            `transform:translate(${eventX - originX}px, 0px)`
                        )
                        .attr('realX', originX + eventX - originX)
                })
                .on('end', function dragend() {
                    if (!isDrag.current) return
                    isDrag.current = false
                    select(this).attr('x', select(this).attr('realX'))
                    const arr = []
                    selectAll('.chart-title-item').each(function order() {
                        arr.push({
                            x: select(this).attr('x'),
                            name: select(this).attr('name'),
                        })
                    })
                    const orderName = arr
                        .sort((a, b) => a.x - b.x)
                        .map(d => d.name)
                    orderKeys(orderName)
                })
        )
    }, [orderKeys, isDrag])

    useEffect(() => {
        selectAll('.chart-title-item').each(function resetAttr() {
            select(this)
                .attr('x', select(this).node().offsetLeft)
                .attr('style', null)
                .attr('realX', null)
        })
    }, [keys])

    return (
        <Section
            title='Top10受害目标事件分布'
            className={style.host}
            extraContent={
                <div className='chart-tools'>
                    <span className='chart-select'>
                        显示维度:
                        <Select
                            mode='multiple'
                            maxTagCount={1}
                            value={selectKey.map(d => d.value)}
                            onChange={selectKeys}
                        >
                            {keys.map(d => (
                                <Select.Option key={d.value} value={d.value}>
                                    {d.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </span>
                    <ReloadOutlined
                        onClick={() => {
                            resetKeys()
                            const newObj = Object.keys(sortObj).reduce(
                                (obj, d) => {
                                    obj[d] = true
                                    return obj
                                },
                                {}
                            )
                            setsortObj(newObj)
                        }}
                        className='chart-refresh'
                    />
                </div>
            }
        >
            <div className='sankey-chart'>
                <div className='chart-title'>
                    {selectKey.map(d => (
                        <span
                            name={d.name}
                            key={d.name}
                            className='chart-title-item operate-content-move'
                        >
                            <DragOutlined />
                            <span className='chart-title-name'>
                                {`${d.name} (${
                                    nodes.filter(d1 => d1.type === d.value)
                                        .length
                                })`}
                            </span>
                            <SwapOutlined
                                onClick={() => {
                                    sortObj[d.value] = !sortObj[d.value]
                                    setsortObj({ ...sortObj })
                                }}
                            />
                        </span>
                    ))}
                </div>
                <div className='event-host-container' ref={container}>
                    <BasicCustomChart
                        data={eventData}
                        chartPadding={{ top, right, bottom, left }}
                        parentRef={container}
                        callbackRealSize={setRealSize}
                    >
                        <g transform={`translate(${left}, ${top})`}>
                            <g className='link'>
                                {links
                                    .filter(d => {
                                        return (
                                            d.source.showName !== '' &&
                                            d.target.showName !== ''
                                        )
                                    })
                                    .map(d => {
                                        const path = sankeyLinkHorizontal()(d)
                                        // const nowLink = find(
                                        //     links,
                                        //     function f(o) {
                                        //         return o.lineId === d.lineId
                                        //     }
                                        // )

                                        // const nowType = nowLink.source.name.includes(
                                        //     'show_type'
                                        // )
                                        //     ? nowLink.source.name
                                        //     : nowLink.target.name
                                        const linkprops = {
                                            key: d.index,
                                            d: path,
                                            stroke: '#e41a1c',
                                            className: `sankey-link sankey-link-${d.lineId}`,
                                            fill: 'none',
                                            strokeWidth: Math.max(1, d.width),
                                            strokeOpacity: initOpacity,
                                        }
                                        return <path {...linkprops} />
                                    })}
                            </g>
                            <g className='node'>
                                {nodes
                                    .filter(d => {
                                        return d.showName !== ''
                                    })
                                    .map(d => (
                                        <g
                                            key={d.name}
                                            className={`sankey-node sankey-node-${d.id}`}
                                            id={d.id}
                                            cursor='pointer'
                                        >
                                            <rect
                                                {...{
                                                    x: d.x0,
                                                    y: d.y0,
                                                    height: d.y1 - d.y0,
                                                    width: d.x1 - d.x0,
                                                    fill: calColor(d.name),
                                                }}
                                                nodeid={d.id}
                                                className='sankey-node-rect'
                                                onMouseOver={e => {
                                                    mouseover(e, d.id)
                                                }}
                                                onMouseOut={mouseout}
                                            />
                                            <text
                                                {...{
                                                    x:
                                                        d.x0 <
                                                        realSize.realWidth / 2
                                                            ? d.x1 + 6
                                                            : d.x0 - 6,
                                                    y: (d.y0 + d.y1) / 2,
                                                    dy: '.4em',
                                                    fontSize: 10,
                                                    textAnchor:
                                                        d.x0 <
                                                        realSize.realWidth / 2
                                                            ? 'start'
                                                            : 'end',
                                                    opacity:
                                                        d.y1 - d.y0 < 8 ? 0 : 1,
                                                }}
                                                onClick={e => {
                                                    if (
                                                        d.type ===
                                                            'victimDevice' ||
                                                        d.type ===
                                                            'attackDevice'
                                                    ) {
                                                        deviceOpMenuStore.openDeviceMenu(
                                                            {
                                                                device:
                                                                    d.showName,
                                                                resultParams: params,
                                                            },
                                                            e.nativeEvent
                                                        )
                                                    }
                                                }}
                                            >
                                                {d.showName.length > 16
                                                    ? `${d.showName.substr(
                                                          0,
                                                          16
                                                      )}...`
                                                    : d.showName}
                                            </text>
                                        </g>
                                    ))}
                            </g>
                        </g>
                    </BasicCustomChart>
                    <TooltipsGlobal ref={tooltipsRef} css={{ zIndex: 99 }}>
                        <div
                            onMouseOver={() => {
                                clearTimeout(timeout)
                            }}
                            onMouseLeave={mouseout}
                            className='event-host-tooltips'
                        >
                            <div className='tooltips-item tooltips-op'>
                                <div className='tooltips-op-item'>
                                    <SkipContainer
                                        className='operate-content-active'
                                        to={{
                                            pathname: 'event/list',
                                            search: {
                                                queryParams: params,
                                                filterCondition,
                                            },
                                        }}
                                    >
                                        <TableOutlined />
                                        查看列表
                                    </SkipContainer>
                                </div>
                            </div>
                            {contentArr.map(d => (
                                <div className='tooltips-item' key={d.label}>
                                    <div className='tootlips-label'>
                                        {d.label}:{' '}
                                    </div>
                                    <div className='tootlips-value'>
                                        {d.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TooltipsGlobal>
                </div>
            </div>
        </Section>
    )
}

export default inject(stores => ({
    params: stores.overviewOmStore.params,
    data: stores.overviewOmStore.eventDistribute,
    eventData: stores.overviewOmStore.eventData,
    keys: stores.overviewOmStore.eventDistributeKeys,
    resetKeys: stores.overviewOmStore.resetEventDistributeKeys,
    selectKeys: stores.overviewOmStore.selectEventDistributeKeys,
    orderKeys: stores.overviewOmStore.orderEventDistributeKeys,
    top10: stores.overviewOmStore.top10,
}))(observer(EventHost))

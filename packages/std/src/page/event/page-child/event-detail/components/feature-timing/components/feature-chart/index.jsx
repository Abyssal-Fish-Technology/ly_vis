import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import moment from 'moment'
import {
    axisLeft,
    curveMonotoneX,
    line,
    max,
    range,
    scaleLinear,
    scalePoint,
    select,
} from 'd3'
import { chain, maxBy } from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BasicCustomChart } from '@shadowflow/components/charts'
import style from './index.module.less'

function FeatureChart({ starttime, endtime, featureData, event }) {
    // =============================== 数据处理阶段 ===============================
    /**
     * 有几种Feature，分别是什么
     * aToV：攻击设备 --> 受害设备（当没有数据的时候也展示这个)
     * VtoA：受害设备 --> 攻击设备
     */
    const featureType = useMemo(() => {
        const { victimIp, attackIp } = event
        return featureData.length > 0 &&
            (featureData[0].sip === victimIp || featureData[0].dip === attackIp)
            ? 'vToA'
            : 'aToV'
    }, [event, featureData])
    // 数据处理
    const useData = useMemo(() => {
        return featureData.map(d => {
            const attackIp = featureType === 'aToV' ? d.sip : d.dip
            const attackPort = featureType === 'aToV' ? '发起' : d.dport
            const victimIp = featureType === 'vToA' ? d.sip : d.dip
            const victimPort = featureType === 'vToA' ? '发起' : d.dport
            const [attackA, attackB, attackC, attackD] = attackIp.split('.')
            const [victimA, victimB, victimC, victimD] = victimIp.split('.')
            return {
                ...d,
                attackA,
                attackB,
                attackC,
                attackD,
                attack: attackIp,
                attackPort,
                victim: victimIp,
                victimA,
                victimB,
                victimC,
                victimD,
                victimPort,
            }
        })
    }, [featureData, featureType])

    const attackDevice = useMemo(() => {
        return chain(useData).map('attack').uniq().value()
    }, [useData])

    const victimDevice = useMemo(() => {
        return chain(useData).map('victim').uniq().value()
    }, [useData])

    // =============================== 图表常规属性初始化阶段 ===============================

    const showDetailThreshold = 20
    const showAttackDeviceDetail = useMemo(
        () => attackDevice.length > showDetailThreshold,
        [attackDevice]
    )

    const showVictimDeviceDetail = useMemo(
        () => victimDevice.length > showDetailThreshold,
        [victimDevice]
    )
    const containerRef = useRef(null)

    const [top, right, bottom, left] = useMemo(
        () => [
            10,
            showVictimDeviceDetail ? 20 : 80,
            30,
            showAttackDeviceDetail ? 20 : 80,
        ],
        [showVictimDeviceDetail, showAttackDeviceDetail]
    )

    const [realSize, setRealSize] = useState({
        realWidth: 100,
        realHeight: 100,
    })

    // =============================== 坐标轴初始化阶段 ===============================
    const allAxis = useMemo(() => {
        return [
            {
                key: 'attackA',
                name: 'A段',
                showAxis: true,
                isHide: !showAttackDeviceDetail,
            },
            {
                key: 'attackB',
                name: 'B段',
                showAxis: true,
                isHide: !showAttackDeviceDetail,
            },
            {
                key: 'attackC',
                name: 'C段',
                showAxis: true,
                isHide: !showAttackDeviceDetail,
            },
            {
                key: 'attackD',
                name: 'D段',
                showAxis: true,
                isHide: !showAttackDeviceDetail,
            },
            {
                key: 'attack',
                name: '威胁设备',
                showAxis: false,
                isHide: showAttackDeviceDetail,
            },
            {
                key: 'attackPort',
                name: '端口',
                showAxis: true,
            },
            {
                key: 'time',
                name: '时间',
                showAxis: true,
            },
            {
                key: 'bytes',
                name: '字节',
                showAxis: true,
            },
            {
                key: 'flows',
                name: '流',
                showAxis: true,
            },
            {
                key: 'pkts',
                name: '包',
                showAxis: true,
            },
            {
                key: 'victimPort',
                name: '端口',
                showAxis: true,
            },
            {
                key: 'victim',
                name: '受害设备',
                showAxis: false,
                isHide: showVictimDeviceDetail,
            },
            {
                key: 'victimA',
                name: 'A段',
                showAxis: true,
                isHide: !showVictimDeviceDetail,
            },
            {
                key: 'victimB',
                name: 'B段',
                showAxis: true,
                isHide: !showVictimDeviceDetail,
            },
            {
                key: 'victimC',
                name: 'C段',
                showAxis: true,
                isHide: !showVictimDeviceDetail,
            },
            {
                key: 'victimD',
                name: 'D段',
                showAxis: true,
                isHide: !showVictimDeviceDetail,
            },
        ]
    }, [showAttackDeviceDetail, showVictimDeviceDetail])

    const dimensionXScale = useMemo(() => {
        const domain = allAxis.filter(d => !d.isHide).map(d => d.key)
        return scalePoint().domain(domain).range([0, realSize.realWidth])
    }, [realSize, allAxis])

    const useAxisArr = useMemo(() => {
        const { realHeight } = realSize
        return allAxis
            .filter(d => !d.isHide)
            .map(axisItem => {
                let scale = scaleLinear().range([0, realHeight])
                const axis = axisLeft(scale).tickSize(3)
                const { key } = axisItem
                let { showAxis } = axisItem
                const gap = bottom
                switch (key) {
                    case 'attackA':
                    case 'attackB':
                    case 'attackC':
                    case 'attackD':
                    case 'victimA':
                    case 'victimB':
                    case 'victimC':
                    case 'victimD':
                        scale.domain([255, 0]).range([gap, realHeight - gap])
                        axis.tickValues([0, 64, 128, 192, 255])
                        break
                    case 'attack':
                    case 'victim': {
                        scale = scalePoint()
                            .domain(
                                key === 'attack' ? attackDevice : victimDevice
                            )
                            .range([gap, realHeight - gap])
                        break
                    }
                    case 'time':
                        axis.ticks(5).tickFormat(d =>
                            moment(d * 1000).format('HH:mm')
                        )
                        scale.domain([starttime, endtime])
                        break
                    case 'attackPort':
                        if (featureType === 'aToV') {
                            showAxis = false
                            scale = scalePoint()
                                .domain(['发起'])
                                .range([realHeight / 2, realHeight / 2])
                        } else {
                            scale
                                .domain([0, 1024, 10000, 32768, 65535])
                                .range([
                                    0,
                                    realHeight * 0.25,
                                    realHeight * 0.5,
                                    realHeight * 0.75,
                                    realHeight,
                                ])
                            axis.tickValues([0, 1024, 10000, 32768, 65535])
                        }

                        break
                    case 'victimPort':
                        if (featureType === 'vToA') {
                            showAxis = false
                            scale = scalePoint()
                                .domain(['发起'])
                                .range([realHeight / 2, realHeight / 2])
                        } else {
                            scale
                                .domain([0, 1024, 10000, 32768, 65535])
                                .range([
                                    0,
                                    realHeight * 0.25,
                                    realHeight * 0.5,
                                    realHeight * 0.75,
                                    realHeight,
                                ])
                            axis.tickValues([0, 1024, 10000, 32768, 65535])
                        }

                        break
                    default: {
                        const maxData = useData.length
                            ? max(useData, d => d[key])
                            : 1
                        scale.domain([maxData, 0])
                        const minGap = Math.ceil(maxData / 5)
                        const tickValues = range(
                            0,
                            maxData + minGap,
                            minGap
                        ).splice(0, 6)
                        if (tickValues[tickValues.length - 1] > maxData) {
                            tickValues[tickValues.length - 1] = maxData
                        }
                        axis.tickFormat(d => arrangeAlerm(d)).tickValues(
                            tickValues
                        )
                        break
                    }
                }
                return {
                    ...axisItem,
                    showAxis,
                    y: scale,
                    x: dimensionXScale(key),
                    axis,
                }
            })
    }, [
        allAxis,
        attackDevice,
        bottom,
        dimensionXScale,
        endtime,
        featureType,
        realSize,
        starttime,
        useData,
        victimDevice,
    ])

    const axisObj = useMemo(() => {
        return useAxisArr.reduce((obj, item) => {
            obj[item.key] = item
            return obj
        }, {})
    }, [useAxisArr])

    useEffect(() => {
        useAxisArr
            .filter(d => d.showAxis)
            .forEach(dimensionItem => {
                if (containerRef.current) {
                    select(containerRef.current)
                        .select(`.axis-${dimensionItem.key}`)
                        .call(dimensionItem.axis)
                }
            })
    }, [useAxisArr])

    // =============================== 生成数据阶段 ===============================
    const usePath = useMemo(() => {
        return useData.map(d => {
            const code = useAxisArr.map(d1 => [d1.x, d1.y(d[d1.key])])
            const pathLine = line()
                .x(d1 => d1[0])
                .y(d1 => d1[1])
                .curve(curveMonotoneX)(code)
            return {
                pathAttr: {
                    d: pathLine.toString(),
                    key: JSON.stringify(d),
                    className:
                        featureType === 'aToV'
                            ? 'attck-traffic'
                            : 'victim-traffic',
                },
                data: d,
            }
        })
    }, [useData, useAxisArr, featureType])

    return (
        <div
            ref={containerRef}
            className={`${style['feature-chart']} analysis-chart`}
            id='tcp-chart-id'
        >
            <BasicCustomChart
                data={featureData}
                parentRef={containerRef}
                chartPadding={{ top, right, bottom, left }}
                callbackRealSize={setRealSize}
            >
                <g className='bg' transform={`translate(${left}, ${top})`}>
                    <g className='traffic'>
                        {usePath.map(d => {
                            return <path {...d.pathAttr} />
                        })}
                    </g>
                    <g className='axis'>
                        {useAxisArr
                            .filter(d => d.showAxis)
                            .map(d => {
                                const heightItem = maxBy(d.y.range())
                                return (
                                    <g
                                        key={d.key}
                                        ref={d.ref}
                                        transform={`translate(${d.x}, 0)`}
                                        className={`axis-item axis-${d.key}`}
                                    >
                                        <text
                                            dy={heightItem + bottom / 2}
                                            className='axis-label'
                                        >
                                            {d.name}
                                        </text>
                                    </g>
                                )
                            })}
                        <defs>
                            <marker
                                id='attack-arrow'
                                markerWidth='24'
                                markerHeight='24'
                                orient='auto'
                                refX='0'
                                refY='6'
                            >
                                <path
                                    d='M2,2 L15,6 L2,10 L6,6 L2,2'
                                    className='fill-red'
                                />
                            </marker>
                            <marker
                                id='victim-arrow'
                                markerWidth='24'
                                markerHeight='24'
                                orient='auto'
                                refX='0'
                                refY='6'
                            >
                                <path
                                    d='M2,2 L15,6 L2,10 L6,6 L2,2'
                                    className='fill-blue'
                                />
                            </marker>
                        </defs>
                        {featureType === 'aToV' && (
                            <line
                                x1={dimensionXScale('attackPort') - 14}
                                y1={axisObj.attackPort.y('发起')}
                                x2={dimensionXScale('attackPort')}
                                y2={axisObj.attackPort.y('发起')}
                                markerStart='url(#attack-arrow)'
                                strokeWidth='2'
                            />
                        )}
                        {featureType === 'vToA' && (
                            <line
                                x1={dimensionXScale('victimPort') + 10}
                                y1={axisObj.victimPort.y('发起')}
                                x2={dimensionXScale('victimPort')}
                                y2={axisObj.victimPort.y('发起')}
                                markerStart='url(#victim-arrow)'
                                strokeWidth='2'
                            />
                        )}
                    </g>
                    <g className='device'>
                        {[
                            {
                                key: 'attack',
                                arr: attackDevice,
                                show: !showAttackDeviceDetail,
                            },
                            {
                                key: 'victim',
                                arr: victimDevice,
                                show: !showVictimDeviceDetail,
                            },
                        ].map(obj => {
                            const { key, arr, show } = obj
                            return (
                                show &&
                                arr.map(device => {
                                    return (
                                        <g
                                            key={device}
                                            transform={`translate(${dimensionXScale(
                                                key
                                            )}, ${axisObj[key].y(device)})`}
                                            className={`device-item ${key}-device`}
                                        >
                                            <circle className='device-sign' />
                                            <text>{device}</text>
                                        </g>
                                    )
                                })
                            )
                        })}
                    </g>
                    <g className='group'>
                        {[
                            {
                                type: 'attack',
                                key: showAttackDeviceDetail
                                    ? 'attackA'
                                    : 'attack',
                                showDetail: showAttackDeviceDetail,
                                gap: left,
                            },
                            {
                                type: 'victim',
                                key: showVictimDeviceDetail
                                    ? 'victimA'
                                    : 'victim',
                                showDetail: showVictimDeviceDetail,
                                gap: right,
                            },
                        ].map(d => {
                            const { key, showDetail, gap, type } = d
                            const { realHeight, realWidth } = realSize
                            const itemWidth =
                                realWidth /
                                (dimensionXScale.domain().length - 1)
                            const itemGap = itemWidth / 2
                            const groupWidth =
                                itemWidth * (showDetail ? 3 : 0) + itemGap + gap

                            const transformGap =
                                type === 'attack' ? gap - 1 : itemGap + 1
                            return (
                                <g
                                    key={key}
                                    className={`group-${type}`}
                                    transform={`translate(${
                                        dimensionXScale(key) - transformGap
                                    }, ${0})`}
                                >
                                    <rect
                                        height={realHeight}
                                        width={groupWidth}
                                    />
                                    <text
                                        className='axis-label'
                                        dy={realHeight + bottom / 2}
                                        dx={groupWidth / 2}
                                    >
                                        {`${
                                            key === 'attack' ? '威胁' : '受害'
                                        }设备`}
                                    </text>
                                </g>
                            )
                        })}
                    </g>
                </g>
            </BasicCustomChart>
        </div>
    )
}

export default inject(stores => ({
    featureData: stores.eventDetailStore.featureData,
    starttime: stores.eventDetailStore.alarmParams.starttime,
    endtime: stores.eventDetailStore.alarmParams.endtime,
    event: stores.eventDetailStore.originRecordData,
}))(observer(FeatureChart))

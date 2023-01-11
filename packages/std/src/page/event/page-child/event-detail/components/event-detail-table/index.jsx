import { valueSort } from '@shadowflow/components/utils/universal/methods-table'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { eventFeature } from '@/service'
import { chain, initial, isEmpty } from 'lodash'
import { formatTimestamp } from '@shadowflow/components/utils/universal/methods-time'
import { axisLeft, extent, path, scaleLinear, select } from 'd3'
import moment from 'moment'
import { inject, observer } from 'mobx-react'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import {
    TdFlag,
    AntdTableSuper,
} from '@shadowflow/components/ui/antd-components-super'

import { isDnsTypeEvent } from '@shadowflow/components/system/event-system'
import { calculateIcmpType } from '@/utils/methods-event'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import EvidenceContent from '@shadowflow/components/ui/container/EvidenceContent'
import style from './index.module.less'
import { LimitCom } from '../public-com'

// const TableTopContent = inject(stores => ({
//     changeReportData: stores.eventDetailStore.changeReportData,
// }))(
//     observer(props => {
//         useEffect(() => {
//             const { data, attackIp, victimIp, changeReportData } = props
//             changeReportData('eventFeatureData', { data, attackIp, victimIp })
//         }, [props])
//         return (
//             <div className='table-top-content'>
//                  <FlowChart />
//                  <Descriptions column={1} title='分析解读' size='small'>
//                     <Descriptions.Item label='统计分析'>
//                         放个假和规范空间划分各环节
//                     </Descriptions.Item>
//                     <Descriptions.Item label='时序特征'>
//                         放个假和规范空间划分各环节
//                     </Descriptions.Item>
//                 </Descriptions>
//             </div>
//         )
//     })
// )

function EventDetailTable({ originRecordData, changeReportData, alarmParams }) {
    const { obj, type = '', attackIp, victimIp } = originRecordData
    const searchParams = useMemo(() => {
        return {
            obj,
            type,
            attackIp,
            victimIp,
            ...alarmParams,
        }
    }, [alarmParams, obj, type, attackIp, victimIp])

    const [tableLoading, setTableLoading] = useState(true)

    const [useData, setUseData] = useState([])

    const getData = useCallback(
        limit => {
            if (isEmpty(alarmParams)) return false
            setTableLoading(true)
            return eventFeature({ ...searchParams, limit })
                .then(res => {
                    changeReportData('eventFeatureOriginData', res)
                    const result = chain(initial(res))
                        .forIn(resItem => {
                            const { bytes, flows, pkts, time } = resItem
                            resItem.show_bytes = arrangeAlerm(bytes)
                            resItem.show_flows = arrangeAlerm(flows)
                            resItem.show_pkts = arrangeAlerm(pkts)
                            resItem.show_time = formatTimestamp(time)
                        })
                        .value()
                    setUseData(result)
                })
                .finally(() => {
                    setTableLoading(false)
                })
        },
        [alarmParams, changeReportData, searchParams]
    )

    const columns = useMemo(() => {
        const basicColumns = [
            {
                title: '源IP',
                dataIndex: 'sip',
                sorter: valueSort('sip'),
                width: 150,
                render: d => (
                    <DeviceOperate device={d} resultParams={alarmParams}>
                        <TdFlag ip={d} />
                        <span>{d}</span>
                    </DeviceOperate>
                ),
            },
            {
                title: '源端口',
                dataIndex: 'sport',
                sorter: valueSort('sport'),
                width: 80,
                render: d => (
                    <DeviceOperate device={d} resultParams={alarmParams}>
                        <span>{d}</span>
                    </DeviceOperate>
                ),
                hidden: type === 'icmp_tun',
            },
            {
                title: '目的IP',
                dataIndex: 'dip',
                sorter: valueSort('dip'),
                width: 150,
                render: d => (
                    <DeviceOperate device={d} resultParams={alarmParams}>
                        <TdFlag ip={d} />
                        <span>{d}</span>
                    </DeviceOperate>
                ),
            },
            {
                title: '协议',
                dataIndex: 'protocol',
                sorter: valueSort('protocol'),
            },
            {
                title: '时间',
                dataIndex: 'show_time',
                sorter: valueSort('time'),
            },
            {
                title: 'Bytes',
                dataIndex: 'show_bytes',
                sorter: valueSort('bytes'),
            },
            {
                title: 'Flows',
                dataIndex: 'show_flows',
                sorter: valueSort('flows'),
            },
            {
                title: 'Pkts',
                dataIndex: 'show_pkts',
                sorter: valueSort('pkts'),
            },
        ]

        // dns、dga,dns_tun、icmp_tun、挖矿 需要展示额外的字段
        if (isDnsTypeEvent(type)) {
            basicColumns.splice(4, 0, {
                title: '域名',
                dataIndex: 'domain',
                render: d => (
                    <DeviceOperate device={d} resultParams={alarmParams}>
                        <span>{d}</span>
                    </DeviceOperate>
                ),
            })
            basicColumns.splice(5, 0, {
                title: '查询类型',
                dataIndex: 'qtype',
                render: d => <TagAttribute>{d}</TagAttribute>,
            })
        }
        if (type === 'icmp_tun') {
            basicColumns.splice(4, 0, {
                title: 'Payload',
                dataIndex: 'payload',
            })
        }
        if (type === 'mining') {
            basicColumns.splice(4, 0, {
                title: '域名',
                dataIndex: 'domain',
                render: d => (
                    <DeviceOperate device={d} resultParams={alarmParams}>
                        <span>{d}</span>
                    </DeviceOperate>
                ),
            })
        }
        basicColumns.splice(type === 'icmp_tun' ? 4 : 2, 0, {
            title: type === 'icmp_tun' ? '请求类型' : '目的端口',
            dataIndex: 'dport',
            sorter: valueSort('dport'),
            width: 80,
            render: d =>
                type === 'icmp_tun' ? (
                    <TagAttribute>{calculateIcmpType(d)}</TagAttribute>
                ) : (
                    <DeviceOperate device={d} resultParams={alarmParams}>
                        <span>{d}</span>
                    </DeviceOperate>
                ),
        })
        return basicColumns.filter(d => !d.hidden)
    }, [alarmParams, type])

    const [selection, setSelection] = useState([])

    const selectData = useMemo(() => {
        return useData.filter(item => selection.includes(JSON.stringify(item)))
    }, [useData, selection])

    const expandableConfig = useMemo(() => {
        return originRecordData.model === 3
            ? {
                  expandRowByClick: true,
                  expandedRowRender: row => <CapEvidenceExpand row={row} />,
              }
            : {}
    }, [originRecordData.model])

    return (
        <div
            className={`${style['event-detail-table']} ${
                tableLoading ? 'app-loading' : ''
            }`}
        >
            <AntdTableSuper
                ipKeys={['sip', 'dip']}
                rowKey={d => JSON.stringify(d)}
                headerTitle='事件相关特征'
                columns={columns}
                dataSource={useData}
                toolBarRender={() => [<LimitCom callback={getData} />]}
                exportParams={{
                    fields: chain(columns)
                        .map(item => {
                            return {
                                label: item.title,
                                value: item.dataIndex,
                            }
                        })
                        .value(),
                    exportData: useData,
                    selectData,
                    fileName: '事件相关流量',
                }}
                expandable={expandableConfig}
                selectionCallBack={selectKeys => {
                    setSelection(selectKeys)
                }}
                tableAlertRender={false}
            />
        </div>
    )
}

export default inject(stores => ({
    changeReportData: stores.eventDetailStore.changeReportData,
    alarmParams: stores.eventDetailStore.alarmParams,
    originRecordData: stores.eventDetailStore.originRecordData,
}))(observer(EventDetailTable))

export const FlowChart = inject(stores => ({
    eventFeatureData: stores.eventDetailStore.eventFeatureData,
}))(
    observer(({ eventFeatureData }) => {
        const { data: eventData, attackIp, victimIp } = eventFeatureData
        const [width, setwidth] = useState(1000)

        const container = useRef(null)

        const [height, setheight] = useState(220)
        const [top, right, bottom, left] = useMemo(() => [20, 50, 50, 20], [])
        const realHeight = useMemo(() => height - top - bottom, [
            bottom,
            height,
            top,
        ])
        const realWidth = useMemo(() => {
            return width - left - right
        }, [left, right, width])

        useEffect(() => {
            if (!container.current) return
            const {
                width: newWidth,
                height: newHeight,
            } = container.current.getBoundingClientRect()
            setwidth(newWidth)
            setheight(newHeight)
        }, [])

        const yLinear = useMemo(() => {
            const timeArr = chain(eventData).map('time').flatten().value()
            const [minMoment, maxMoment] = extent(timeArr)
            return scaleLinear()
                .domain([minMoment, maxMoment])
                .range([0, realHeight])
        }, [eventData, realHeight])

        const xLinear = useMemo(() => {
            return scaleLinear()
                .domain([0, 3306, 8080, 10000, 65535])
                .range([
                    0,
                    (realWidth / 2) * 0.25,
                    (realWidth / 2) * 0.5,
                    (realWidth / 2) * 0.75,
                    realWidth / 2,
                ])
        }, [realWidth])

        const calculateData = useCallback(
            (ip, data, type) => {
                return chain(data)
                    .map(leftItem => {
                        const { time, sip, sport, dport } = leftItem
                        const nowPort = ip === sip ? sport : dport
                        let direction = ip === sip ? 'right' : 'left'
                        if (type === 'victim') {
                            direction = ip === sip ? 'left' : 'right'
                        }
                        return {
                            y: yLinear(time),
                            x: xLinear(nowPort),
                            direction,
                        }
                    })
                    .value()
            },
            [xLinear, yLinear]
        )

        const leftData = useMemo(() => {
            return calculateData(attackIp, eventData, 'attack')
        }, [attackIp, calculateData, eventData])

        const rightData = useMemo(() => {
            return calculateData(victimIp, eventData, 'victim')
        }, [calculateData, victimIp, eventData])

        const yAxis = useMemo(() => {
            return axisLeft(yLinear)
                .tickFormat(d => moment(d * 1000).format('HH:mm'))
                .tickSize(0)
                .ticks(5)
                .tickPadding(-15)
        }, [yLinear])

        const yAxisRef = useRef(null)
        useEffect(() => {
            select(yAxisRef.current).call(yAxis)
        }, [yAxis])

        const calculatePath = useCallback(d => {
            const { x, y, direction } = d
            const x1 = direction === 'left' ? x + 2 : x - 2
            const x2 = direction === 'left' ? x + 2 : x - 2
            const x3 = direction === 'left' ? x - 2 : x + 2
            const y1 = y - 5
            const y2 = y + 5
            const y3 = y
            const nowPath = path()
            nowPath.moveTo(x1, y1)
            nowPath.lineTo(x2, y2)
            nowPath.lineTo(x3, y3)
            nowPath.closePath()
            return nowPath.toString()
        }, [])
        return (
            <div className={style['flow-chart']} ref={container}>
                <svg
                    viewBox={[0, 0, width, height]}
                    preserveAspectRatio='none'
                    width='100%'
                    height={height}
                >
                    <g transform={`translate(${left},${top})`}>
                        <line
                            x1={0}
                            y1={0}
                            x2={realWidth + 20}
                            y2={0}
                            className='label-line'
                        />
                        <g transform='translate(0,10)'>
                            {[0, 3306, 8080, 10000, 65535].map(d => {
                                const xOffset = d === 65535 ? -15 : 0
                                return (
                                    <g
                                        key={d}
                                        transform={`translate(${xLinear(
                                            d
                                        )},${realHeight})`}
                                    >
                                        <text
                                            y={25}
                                            x={xOffset}
                                            className='xAxis-label'
                                        >
                                            {d}
                                        </text>
                                        {d !== 65535 && (
                                            <line
                                                x1={0}
                                                y1={-realHeight - 10}
                                                x2={0}
                                                y2={10}
                                                className='dashed-line'
                                            />
                                        )}
                                    </g>
                                )
                            })}
                            {leftData.map(d => {
                                const { x, y, direction } = d
                                return (
                                    <g key={`${x}_${y}`}>
                                        <path
                                            d={calculatePath(d)}
                                            className='red-path'
                                            strokeWidth='1'
                                        />
                                        <line
                                            className={`${
                                                direction === 'left'
                                                    ? 'blue-line'
                                                    : 'red-line'
                                            }`}
                                            x1={`${x + 2}`}
                                            y1={`${y}`}
                                            x2={`${realWidth / 2}`}
                                            y2={`${y}`}
                                        />
                                    </g>
                                )
                            })}
                        </g>
                        <g
                            transform={`translate(${realWidth / 2},10)`}
                            ref={yAxisRef}
                            // strokeWidth='0'
                            className='label-y'
                        />
                        <g transform={`translate(${realWidth / 2},10)`}>
                            <g>
                                {[0, 3306, 8080, 10000, 65535].map(d => {
                                    const xOffset = d === 0 ? 20 : 0
                                    return (
                                        <g
                                            key={d}
                                            transform={`translate(${xLinear(
                                                d
                                            )},${realHeight})`}
                                        >
                                            <text
                                                y={25}
                                                x={xOffset}
                                                className='xAxis-label'
                                            >
                                                {d}
                                            </text>
                                            {d !== 0 && (
                                                <line
                                                    x1={0}
                                                    y1={-realHeight - 10}
                                                    x2={0}
                                                    y2={10}
                                                    className='dashed-line'
                                                />
                                            )}
                                        </g>
                                    )
                                })}
                            </g>

                            {rightData.map(d => {
                                const { x, y, direction } = d
                                return (
                                    <g key={`${x}_${y}`}>
                                        <path
                                            d={calculatePath(d)}
                                            className='blue-path'
                                        />
                                        <line
                                            className={`${
                                                direction === 'left'
                                                    ? 'blue-line'
                                                    : 'red-line'
                                            }`}
                                            x1={`${x - 2}`}
                                            y1={`${y}`}
                                            x2={-30}
                                            y2={`${y}`}
                                        />
                                    </g>
                                )
                            })}
                        </g>
                        <line
                            className='label-line'
                            x1='0'
                            y1={`${realHeight + 20}`}
                            x2={`${realWidth + 20}`}
                            y2={`${realHeight + 20}`}
                        />
                    </g>
                </svg>
            </div>
        )
    })
)

function CapEvidenceExpand({ row }) {
    const params = useMemo(
        () => ({
            time: row.capusec,
            devid: row.devid,
        }),
        [row]
    )
    return (
        <div className={style['evidence-content-box']}>
            <EvidenceContent params={params} />
        </div>
    )
}

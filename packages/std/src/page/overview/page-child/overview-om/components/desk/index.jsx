import Section from '@shadowflow/components/ui/layout/section'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useRef, useState } from 'react'
import { BasicEchart } from '@shadowflow/components/charts'
import EventTableSimple from '@/components/table-event/table-event-simple'
import { LinearGradient } from 'echarts/lib/util/graphic'
import lightTheme from '@/components/chart/theme/light'
import style from './index.module.less'

function DashBoard({ data }) {
    const allData = data.length
    const unprocessData = data.filter(d => d.proc_status !== 'unprocessed')
        .length
    const option = {
        title: {
            show: true,
            text: '处理进度',
            x: '50%',
            y: '57%',
            z: 8,
            textAlign: 'center',
            textStyle: {
                color: '#f1f7fe',
                fontSize: 12,
                fontWeight: 'normal',
            },
        },
        series: [
            {
                name: '内部（环形）进度条',
                type: 'gauge',
                // center: ['20%', '50%'],
                radius: '70%',
                splitNumber: 10,
                axisLine: {
                    lineStyle: {
                        color: [
                            [unprocessData / allData, lightTheme.color[0]],
                            [1, '#FFFFFF'],
                        ],
                        width: 10,
                        opacity: 0.8,
                    },
                },
                axisLabel: {
                    show: false,
                },
                axisTick: {
                    show: false,
                },
                splitLine: {
                    show: false,
                },
                pointer: {
                    show: false,
                },
            },
            {
                name: '外部刻度',
                type: 'gauge',
                //  center: ['20%', '50%'],
                radius: '90%',
                min: 0, // 最小刻度
                max: 100, // 最大刻度
                splitNumber: 10, // 刻度数量
                startAngle: 225,
                endAngle: -45,
                axisLine: {
                    show: false,
                },
                // 仪表盘文字
                axisLabel: {
                    show: true,
                    color: '#868FDF',
                    distance: 20,
                    formatter: v => {
                        switch (`${v}`) {
                            case '0':
                                return '0'
                            case '10':
                                return '10'
                            case '20':
                                return '20'
                            case '30':
                                return '30'
                            case '40':
                                return '40'
                            case '50':
                                return '50'
                            case '60':
                                return '60'
                            case '70':
                                return '70'
                            case '80':
                                return '80'
                            case '90':
                                return '90'
                            case '100':
                                return '100'
                            default:
                                break
                        }
                        return false
                    },
                }, // 刻度标签。
                axisTick: {
                    show: true,
                    splitNumber: 7,
                    lineStyle: {
                        color: lightTheme.color[0],
                        width: 2,
                    },
                    length: -8,
                }, // 刻度样式
                splitLine: {
                    show: true,
                    length: -14,
                    lineStyle: {
                        color: lightTheme.color[0],
                    },
                }, // 分隔线样式
                detail: {
                    show: false,
                },
                pointer: {
                    show: false,
                },
            },
            /* 内部 */
            {
                type: 'pie',
                radius: ['0', '50%'],
                center: ['50%', '50%'],
                z: 8,
                hoverAnimation: false,
                data: [
                    {
                        name: '检查进度',
                        value: ((unprocessData / (allData || 1)) * 100).toFixed(
                            0
                        ),
                        itemStyle: {
                            normal: {
                                color: LinearGradient(0, 0, 0, 1, [
                                    {
                                        offset: 0,
                                        color: '#3398ff',
                                    },
                                    {
                                        offset: 1,
                                        color: '#7db0fd',
                                    },
                                ]),
                            },
                        },
                        label: {
                            normal: {
                                formatter(params) {
                                    return [
                                        `{a|${params.value}}`,
                                        '{b|%}',
                                    ].join(' ')
                                },
                                rich: {
                                    a: {
                                        fontWeight: 'bold',
                                        color: '#FFFFFF',
                                        fontSize: 30,
                                    },
                                    b: {
                                        fontWeight: 'bold',
                                        color: '#FFFFFF',
                                        fontSize: 12,
                                    },
                                },
                                position: 'center',
                                show: true,
                            },
                        },
                        labelLine: {
                            show: false,
                        },
                    },
                ],
            },
            /* 外一层 */
            {
                type: 'pie',
                radius: '55%',
                startAngle: 220,
                endAngle: -40,
                hoverAnimation: false,
                center: ['50%', '50%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                },
                labelLine: {
                    show: false,
                },
                data: [
                    {
                        value: 1,
                        itemStyle: {
                            normal: {
                                color: '#8DC4FD',
                            },
                        },
                    },
                ],
            },
            // 外二层圈
            {
                type: 'pie',
                radius: '60%',
                center: ['50%', '50%'],
                avoidLabelOverlap: false,
                z: 0,
                hoverAnimation: false,
                label: {
                    show: false,
                },
                labelLine: {
                    show: false,
                },
                data: [
                    {
                        value: 1,
                        itemStyle: {
                            normal: {
                                color: '#e3edf8',
                            },
                        },
                    },
                ],
            },
        ],
    }
    return <BasicEchart data={data} option={option} />
}

function Desk({ data, params }) {
    const tableData = data.filter(d => d.proc_status === 'unprocessed')
    const tableRef = useRef(null)
    const [contentHeight, setContentHeight] = useState(200)
    useEffect(() => {
        if (tableRef.current) {
            const { height } = tableRef.current.getBoundingClientRect()
            setContentHeight(height - 120)
        }
    }, [tableRef])
    return (
        <Section title='工作台' className={style.desk}>
            <div className='chart'>
                <DashBoard data={data} />
            </div>
            <div className='desk-table' ref={tableRef}>
                <EventTableSimple
                    title={`待处理事件 (${tableData.length})`}
                    data={tableData}
                    contentHeight={contentHeight}
                    params={params}
                />
            </div>
        </Section>
    )
}

export default inject(stores => ({
    data: stores.overviewOmStore.eventData,
    params: stores.overviewOmStore.params,
}))(observer(Desk))

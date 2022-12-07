import Section from '@shadowflow/components/ui/layout/section'
import React, { useMemo } from 'react'
import { BasicEchart } from '@shadowflow/components/charts'
import { util } from 'echarts/lib/export'
import { inject, observer } from 'mobx-react'
import { Empty } from 'antd'

const hours = new Array(24)
    .fill(null)
    .map((d, i) => `${i < 10 ? '0' : ''}${i}:00`)

function EventLoop({ history }) {
    const data = history.find(d => d.active).eventLoop
    const days = data.map(d => d.name.split('-').splice(1, 2).join('-'))
    const eventData = history.find(d => d.active).eventData || []
    const useData = []
    data.forEach((d, i) => {
        d.data.forEach(d1 => {
            useData.push([i, d1.name, d1.value])
        })
    })
    const maxValue = util.reduce(
        useData,
        (max, item) => Math.max(max, item[2]),
        0
    )
    const option = useMemo(
        () => ({
            tooltip: {
                trigger: 'item',
                formatter: params => {
                    const { color, data: dataItem } = params
                    const [hourIndex, dayIndex, value] = dataItem
                    return `<div>
                    <div>${days[dayIndex]} ${hours[hourIndex]}</div>
                    <div class="dot-item">
                        <span class="dot" style="background: ${color};"></span>
                        <span class="dot-item-name">事件数量</span>
                        <span class="dot-item-value">${value}</span>
                    </div>
                </div>`
                },
            },
            animation: false,
            grid: {
                top: '0px',
                bottom: '0px',
                right: '0px',
                left: '0px',
            },
            xAxis: {
                type: 'category',
                data: hours,
                splitArea: {
                    show: true,
                },
                axisLabel: {
                    interval: 6,
                },
            },
            yAxis: {
                type: 'category',
                data: days,
                splitArea: {
                    show: true,
                },
                axisLabel: {
                    interval:
                        days.length > 5 ? parseInt(days.length / 5, 10) : 0,
                },
            },
            visualMap: {
                show: false,
                min: 0,
                max: maxValue,
                calculable: true,
                top: 'middle',
                right: '0%',
                align: 'left',
            },
            series: [
                {
                    name: 'Punch Card',
                    type: 'heatmap',
                    data: useData.map(d => [d[1], d[0], d[2] || '-']),
                    label: {
                        show: true,
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    },
                },
            ],
        }),
        [days, maxValue, useData]
    )
    return (
        <Section title='事件时间分布'>
            {eventData.length ? (
                <BasicEchart data={data} option={option} />
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
        </Section>
    )
}
export default inject(stores => ({
    history: stores.eventAnalyseStore.history,
}))(observer(EventLoop))

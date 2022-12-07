import React from 'react'
import echarts from 'echarts'
import BasicEchart from '@/components/chart/chart-basic'

function renderItem(params, api) {
    const values = [api.value(0), api.value(1), api.value(2)]
    const coord = api.coord(values)
    const size = api.size([1, 1], values)
    if (!values[2]) return null
    return {
        type: 'sector',
        shape: {
            cx: params.coordSys.cx,
            cy: params.coordSys.cy,
            r0: coord[2] - size[0] / 2,
            r: coord[2] + size[0] / 2,
            startAngle: -(coord[3] + size[1] / 2),
            endAngle: -(coord[3] - size[1] / 2),
        },
        style: api.style({
            fill: api.visual('color'),
        }),
    }
}
const hours = new Array(24)
    .fill(null)
    .map((d, i) => `${i < 10 ? '0' : ''}${i}:00`)

export default function HourHeatMap({ data, type = '0' }) {
    const days = data.map(d => d.name.split('-').splice(1, 2).join('-'))
    const useData = []
    data.forEach((d, i) => {
        d.data.forEach(d1 => {
            useData.push([i, d1.name, d1.value])
        })
    })
    const maxValue = echarts.util.reduce(
        useData,
        (max, item) => Math.max(max, item[2]),
        0
    )
    const option1 = {
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
            top: '10px',
            bottom: '30px',
            right: '60px',
            left: '60px',
        },
        xAxis: {
            type: 'category',
            data: hours,
            splitArea: {
                show: true,
            },
        },
        yAxis: {
            type: 'category',
            data: days,
            splitArea: {
                show: true,
            },
        },
        visualMap: {
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
    }
    const option2 = {
        polar: {},
        tooltip: {
            formatter: params => {
                let node = ``
                params.forEach(item => {
                    if (item.data[2] !== '-') {
                        node += `
                        <div>${item.name} ${item.axisValue}</div>
                        <div class="dot-item">
                            <span class="dot" style="background: ${item.color};"></span>
                            <span class="dot-item-name">事件数量</span>
                            <span class="dot-item-value">${item.data[2]}</span>
                        </div>`
                    }
                })
                return node
            },
        },
        visualMap: {
            min: 0,
            max: maxValue,
            calculable: true,
            top: 'middle',
            right: '0%',
            align: 'left',
            logBase: 20,
        },
        angleAxis: {
            type: 'category',
            data: hours,
            boundaryGap: true,
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#ddd',
                    type: 'dashed',
                },
            },
            axisLine: {
                show: false,
            },
            axisLabel: {
                interval: 1,
            },
        },
        radiusAxis: {
            type: 'category',
            data: days,
            z: 2,
            axisLabel: {
                interval: days.length > 5 ? 3 : 0,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#ddd',
                    type: 'dashed',
                },
            },
        },
        series: [
            {
                name: 'Punch Card',
                type: 'custom',
                coordinateSystem: 'polar',
                itemStyle: {
                    color: '#d14a61',
                },
                renderItem,
                data: useData.map(d => [d[0], d[1], d[2] || '-']),
            },
        ],
    }

    return (
        <BasicEchart
            data={data}
            option={[option1, option2][type]}
            beforeRender={chart => chart.clear()}
        />
    )
}

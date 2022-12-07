import React, { useMemo } from 'react'
import { BasicEchart } from '@shadowflow/components/charts'

function GaugeChart({ data }) {
    const [gaugeData, values] = [[], []]
    let [other, ratio] = [0, 0]
    const option = useMemo(() => {
        const colors = [
            '#00BFFF',
            '#FF6A6A',
            '#FF8C00',
            '#FFD700',
            '#00FA9A',
            '#FF4040',
        ]
        // const data = [{name:"极低",value:100},{name:"低",value:200},{name:"高",value:300},{name:"极高",value:400}];

        data.forEach((item, index) => {
            values.push(item.value)
            item.itemStyle = { color: colors[index] }
            other += item.value
        })

        data.forEach((item, index) => {
            ratio += item.value / other
            gaugeData.push([ratio, colors[index]])
        })
        const pieData = [
            ...data,
            {
                name: '',
                value: (other / 0.75) * 0.25,
                itemStyle: { opacity: 0 },
            },
        ]
        return {
            tooltip: {
                formatter: params => {
                    if (params.name === '' || params.componentSubType !== 'pie')
                        return ''
                    return `<span style="font-weight:bold;">${params.seriesName}</span><p style="margin:5px 0;padding:0;">${params.name}：${params.value}</p>`
                },
                textStyle: {
                    color: 'auto',
                },
            },
            legend: {
                show: false,
            },
            series: [
                {
                    type: 'gauge',
                    startAngle: 225,
                    endAngle: -45,
                    radius: '60%',
                    min: 0,
                    max: other,
                    splitNumber: 10,
                    cussor: 'default',
                    axisLine: {
                        lineStyle: {
                            width: 0,
                            color: gaugeData,
                        },
                    },

                    pointer: {
                        // icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                        width: 10,
                        offsetCenter: [0, '0%'],
                        itemStyle: {
                            color: 'auto',
                        },
                    },
                    axisTick: {
                        splitNumber: 1,
                        lineStyle: {
                            color: 'auto',
                            width: 2,
                        },
                    },
                    splitLine: {
                        length: 12,
                        lineStyle: {
                            color: 'auto',
                            width: 3,
                        },
                    },
                    axisLabel: {},
                    title: {
                        offsetCenter: [0, '45%'],
                        fontSize: 12,
                    },
                    detail: {
                        fontSize: 50,
                        offsetCenter: [0, '65%'],
                        valueAnimation: true,
                        formatter(value) {
                            return value
                        },
                        color: 'auto',
                    },
                    markArea: {},
                    data: [
                        {
                            value: other,
                            name: '待处理事件',
                        },
                    ],
                },
                {
                    name: '事件',
                    type: 'pie',
                    radius: ['60%', '80%'],
                    selectedMode: 'single',
                    startAngle: 225,
                    label: {
                        fontSize: 20,
                        formatter(params) {
                            if (params.name !== '') return params.name
                            return ''
                        },
                    },
                    labelLine: {
                        show: false,
                    },
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: 'rgba(255,255,255,0)',
                        borderWidth: 5,
                    },
                    data: pieData,
                },
            ],
        }
    }, [data])

    let selectType
    function selectChanged(params) {
        selectType = params.fromAction
    }

    function clickFn(params) {
        if (params.name === '') return
        const currentData = JSON.parse(JSON.stringify(data))
        const currentIndex = values.indexOf(params.value)
        if (selectType === 'select') {
            currentData.forEach((item, index) => {
                if (index !== currentIndex) {
                    item.itemStyle.opacity = 0.3
                }
            })
        }
        // currentGaugeValue = currentIndex !== 0 ? values.slice(0,currentIndex).reduce((total,num)=>total+num):0;
        option.series[0].data[0].value = params.value
        option.series[1].data = [
            ...currentData,
            {
                name: '',
                value: (other / 0.75) * 0.25,
                itemStyle: { opacity: 0 },
            },
        ]
    }

    return (
        <BasicEchart
            data={data}
            option={option}
            EventArr={[
                {
                    type: 'selectchanged',
                    part: { seriesIndex: 1 },
                    callback: selectChanged,
                },
                {
                    type: 'click',
                    part: { seriesIndex: 1 },
                    callback: clickFn,
                },
            ]}
        />
    )
}

export default GaugeChart

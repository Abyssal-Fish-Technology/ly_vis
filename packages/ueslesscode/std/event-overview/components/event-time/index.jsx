import React, { useCallback } from 'react'
import { inject, observer } from 'mobx-react'
import echarts from 'echarts'
import Section from '@/components/section'
import moment from 'moment'
import { extent, scaleLinear } from 'd3'
// eslint-disable-next-line import/no-unresolved
import style from './index.module.less'

function EventTime(props) {
    const { data } = props
    let [min, max] = extent(data, d => d.value || 0)
    min = min || 0
    max = max || 0
    const scale = scaleLinear().domain([min, max]).range([15, 30])
    const timeRange =
        data.length > 0
            ? [
                  moment(data[0].name).startOf('month'),
                  moment(data[data.length - 1].name).endOf('month'),
              ]
            : [moment().startOf('month'), moment().endOf('month')]
    const option = {
        tooltip: {
            position: 'top',
        },
        visualMap: {
            min,
            max,
            calculable: true,
            orient: 'horizontal',
            itemWidth: 20,
            left: 'center',
        },
        calendar: {
            orient: 'horizontal',
            top: 25,
            left: 50,
            right: 10,
            bottom: 40,
            yearLabel: {
                show: false,
            },
            monthLabel: {
                nameMap: 'cn',
                margin: 10,
            },
            range: timeRange.map(d => d.format('YYYY-MM-DD')),
            dayLabel: {
                firstDay: 1,
                margin: 10,
                nameMap: [
                    '周日',
                    '周一',
                    '周二',
                    '周三',
                    '周四',
                    '周五',
                    '周六',
                ],
            },
        },
        series: [
            {
                type: 'ori',
                coordinateSystem: 'calendar',
                symbolSize: val => {
                    return scale(val[1])
                },
                data: data.map(d => [d.name, d.value]),
            },
        ],
    }
    const container = useCallback(
        node => {
            if (node !== null) {
                const myChart = echarts.init(node, 'light')
                myChart.setOption(option)
            }
        },
        [option]
    )
    return (
        <div className={style.time}>
            <Section title='事件时序分布'>
                <div className='chart'>
                    <div className='chart-container' ref={container} />
                </div>
            </Section>
        </div>
    )
}
export default inject(stores => ({
    data: stores.eventOverviewStore.timeData,
}))(observer(EventTime))

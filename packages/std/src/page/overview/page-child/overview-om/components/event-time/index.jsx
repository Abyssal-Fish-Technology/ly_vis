import { inject, observer } from 'mobx-react'
import React, { useMemo } from 'react'
import Section from '@shadowflow/components/ui/layout/section'
import moment from 'moment'
import { BarChart } from '@shadowflow/components/charts'
import style from './index.module.less'

function EventTime({ data }) {
    const option = useMemo(() => {
        return {
            tooltip: {
                formatter: params => {
                    const [
                        { marker, value, seriesName, axisValueLabel },
                    ] = params
                    return `<div class='echart-tooltips'>
                    <div class='title'>${axisValueLabel.replace(
                        '\n',
                        ' '
                    )}</div>
                            <div class="dot-item">
                                ${marker}
                                <span class="dot-item-name">${seriesName}</span>: <span class="dot-item-value" style="">${
                        value[1]
                    }</span>
                            </div>
                        </div>`
                },
            },
            xAxis: {
                type: 'time',
                axisLabel: {
                    formatter: d => moment(d).format('MM/DD HH:mm'),
                },
            },
            yAxis: {
                type: 'value',
                splitNumber: 2,
                inverse: false,
                minInterval: 1,
            },
            series: [
                {
                    name: '事件发生数量',
                    barMaxWidth: 10,
                },
            ],
        }
    }, [])
    return (
        <Section title='事件时间趋势' className={style['event-time']}>
            <BarChart data={data} option={option} isPage={false} />
        </Section>
    )
}
export default inject(stores => ({
    data: stores.overviewOmStore.eventTimeArr,
}))(observer(EventTime))

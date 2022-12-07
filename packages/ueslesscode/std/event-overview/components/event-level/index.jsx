import React, { useMemo } from 'react'
import { observer, inject } from 'mobx-react'
import Section from '@/components/section'
import { skipPage } from '@shadowflow/components/utils/universal/methods-ui'
import BasicEchart from '@/components/chart/chart-basic'
import style from './index.module.less'

function EventLevel(props) {
    const { data } = props
    const option = useMemo(() => {
        const typeArr = data.map(d => d.name)
        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
                formatter: params => {
                    return params.some(d => d.value)
                        ? `
                        <div>
                            <div>${params[0].name}</div>
                            ${params
                                .map(item =>
                                    item.value
                                        ? `
                                <div class="dot-item">
                                ${item.marker}
                                    <span class="dot-item-name" style="width: 50px">${item.seriesName}</span>
                                    <span class="dot-item-value">${item.value}</span>
                                </div>
                            `
                                        : ''
                                )
                                .join('')}
                        </div>
                    `
                        : ''
                },
            },
            legend: {
                data: typeArr,
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true,
            },
            xAxis: {
                type: 'value',
            },
            yAxis: {
                type: 'category',
                data: ['极低', '低', '中', '高', '极高'],
            },
            series: data.map(d => {
                const { 极高, 高, 中, 低, 极低 } = d.level
                return {
                    name: d.name,
                    type: 'bar',
                    stack: '总量',
                    data: [极低, 低, 中, 高, 极高],
                }
            }),
        }
    }, [data])
    return (
        <div className={style.bar}>
            <Section title='事件级别'>
                <div className='chart'>
                    <BasicEchart
                        data={data}
                        option={option}
                        eventArr={[
                            {
                                type: 'click',
                                part: 'series',
                                callback: params => {
                                    skipPage('event/list', {
                                        type: 'show_level',
                                        name: params.name,
                                    })
                                },
                            },
                        ]}
                    />
                </div>
            </Section>
        </div>
    )
}
export default inject(stores => ({
    data: stores.eventOverviewStore.levelData,
}))(observer(EventLevel))

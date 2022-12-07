import React, { useMemo, useState } from 'react'
import { arrangeAlerm } from '@/utils/methods-data'
import { Pagination } from 'antd'
import BasicEchart from '@/components/chart/chart-basic'

export default function Rank(props) {
    const { data, options = {}, onClick } = props

    const [currentPage, setCurrentPage] = useState(1)
    const defaultPageSize = 10

    const useData = useMemo(() => {
        const index = currentPage - 1
        return data.slice(
            index * defaultPageSize,
            (index + 1) * defaultPageSize
        )
    }, [currentPage, data])

    const option = {
        grid: {
            left: 0,
            right: 20,
            top: 0,
            bottom: 0,
            containLabel: true,
        },
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
                                <span class="dot-item-name" style="width: 50px">${
                                    item.seriesName
                                }</span>
                                <span class="dot-item-value">${arrangeAlerm(
                                    item.value
                                )}</span>
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
        yAxis: {
            type: 'category',
            data: useData.map(d => d.name),
            inverse: true,
            triggerEvent: true,
        },
        xAxis: {
            type: 'value',
            axisLabel: {
                formatter: d => arrangeAlerm(d),
            },
        },
        series: [
            {
                data: useData.map(d => d.value),
                type: 'bar',
                name: '流量',
            },
        ],
        ...options,
    }

    return (
        <div className='chart-withpage'>
            <BasicEchart
                data={useData}
                option={option}
                eventArr={[
                    {
                        type: 'click',
                        part: 'series.bar',
                        callback: onClick,
                    },
                    {
                        type: 'mouseover',
                        part: { yAxisIndex: 0 },
                    },
                    {
                        type: 'mouseout',
                        part: { yAxisIndex: 0 },
                    },
                ]}
            />
            <Pagination
                simple
                className='chart-page'
                defaultCurrent={1}
                defaultPageSize={defaultPageSize}
                total={data.length}
                current={currentPage}
                onChange={page => {
                    setCurrentPage(page)
                }}
            />
        </div>
    )
}

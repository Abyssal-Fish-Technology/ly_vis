import React, { useState, useMemo } from 'react'
import { Select } from 'antd'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import { chain, map } from 'lodash'
import DeviceBarChart from '../../../../charts/echarts-components/device-bar-chart'

export default function AssetBarChart({
    data,
    onClick,
    title,
    options = {},
    showTips = true,
}) {
    const [dataType, setDataType] = useState(Object.keys(options)[0])

    const currentLabel = useMemo(() => options[dataType] || dataType, [
        dataType,
        options,
    ])

    const currentData = useMemo(() => {
        return chain(data)
            .map(d => {
                return {
                    ...d,
                    value: d[dataType],
                    valueLabel: currentLabel,
                }
            })
            .value()
    }, [data, dataType, currentLabel])
    const integerList = ['URL数量', '主机数量', '网站数量', '端口数量']

    const useOption = useMemo(() => {
        return {
            tooltip: {
                formatter: params => {
                    const {
                        marker,
                        name,
                        value,
                        data: { valueLabel },
                    } = params[0]

                    return `<div class="echart-tooltips">
                        <div class="title">${name}</div>
                        <div class="dot-item">
                            ${marker}
                            <span class="dot-item-name">${valueLabel}</span>
                            <span class="dot-item-value">${
                                integerList.includes(valueLabel)
                                    ? value
                                    : arrangeAlerm(value)
                            }</span>
                        </div>
                    </div>`
                },
            },
            xAxis: {
                axisLabel: {
                    formatter: value => {
                        return integerList.includes(currentData[0].valueLabel)
                            ? value
                            : arrangeAlerm(value)
                    },
                },
            },
        }
    }, [currentData, integerList])

    return (
        <DeviceBarChart
            data={currentData}
            title={
                <div>
                    {title}
                    {
                        <Select
                            size='small'
                            value={dataType}
                            onChange={v => {
                                setDataType(v)
                            }}
                            style={{
                                margin: '0 5px',
                                minWidth: '80px',
                                textAlign: 'left',
                            }}
                        >
                            {map(options, (d, k) => (
                                <Select.Option key={k} value={k}>
                                    {d}
                                </Select.Option>
                            ))}
                        </Select>
                    }
                    排行（{data.length}）
                </div>
            }
            onClick={onClick}
            showTips={showTips}
            option={useOption}
        />
    )
}

import { map } from 'lodash'
import React, { useMemo } from 'react'
import BasicEchart, { extendObj, extendSeries } from '../chart-basic'

/**
 * echart折线图基础组件
 * @param {data | Array} 数据，数组:[{name:'xxx',value:'xxxx'}]
 * @param {option | Object} 配置信息
 * @param {eventArr | Array} 图表绑定的一些event事件集合，例如：onclick
 * @param {beforeRender | Function} 图表加载前可执行的函数
 * @param {afterRender | Function} 图表渲染后可执行的函数
 * @returns
 */
export default function LineChart({
    option = {},
    data = [],
    eventArr = [],
    beforeRender = () => {},
    afterRender = () => {},
}) {
    const useOption = useMemo(() => {
        const useData = map(data, 'value')
        const axisData = map(data, 'name')
        const initConfig = {
            grid: {
                left: 0,
                right: 0,
                top: 10,
                bottom: 10,
                containLabel: false,
            },
            xAxis: {
                type: 'category',
                data: axisData,
            },
            yAxis: {
                type: 'value',
                data: useData,
            },
            series: [],
        }
        const resultOption = extendObj(initConfig, option)
        resultOption.series = extendSeries(
            { type: 'line', data: useData },
            option
        )
        return resultOption
    }, [data, option])
    return (
        <BasicEchart
            afterRender={afterRender}
            beforeRender={beforeRender}
            data={data}
            option={useOption}
            eventArr={eventArr}
        />
    )
}

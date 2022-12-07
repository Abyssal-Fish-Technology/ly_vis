import React, { useMemo, useRef, useState, useEffect } from 'react'
import echarts from 'echarts'
import darkTheme from '@/components/chart/theme/dark'
import lightTheme from '@/components/chart/theme/light'
import { has, isArray } from 'lodash'
import { getThemeParams } from '../../../utils/universal/methods-storage'
import withNoData from '../../../ui/layout/with-nodata'
import useResizeChart from '../../chart-resize'

export function extendObj(father, children) {
    function traverse(obj1, obj2) {
        Object.keys(obj1).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
                obj2[key] = obj1[key]
            }
            if (
                Object.prototype.toString.call(obj1[key]) === '[object Object]'
            ) {
                traverse(obj1[key], obj2[key])
            }
        })
    }
    if (
        Object.prototype.toString.call(father) === '[object Object]' &&
        Object.prototype.toString.call(children) === '[object Object]'
    ) {
        const newChildren = { ...children }
        traverse(father, newChildren)
        return newChildren
    }
    return {}
}

// 处理自定义的series参数为数组的情况
export function extendSeries(initSeries, option) {
    if (has(option, 'series')) {
        if (isArray(option.series)) {
            return option.series.map(d => ({
                ...initSeries,
                ...d,
            }))
        }
        return [{ ...initSeries, ...option.series }]
    }
    return [initSeries]
}

/**
 * @param {eventArr} chart交互事件 格式为[{type: 'click', part: 'axis', callback: () => {}}]
 */
echarts.registerTheme('darkTheme', darkTheme)
echarts.registerTheme('lightTheme', lightTheme)

/**
 * echart图表基础组件
 * @param {option | Object} 配置信息
 * @param {data | Array} 数据，用于无数据展示判断
 * @param {eventArr | Array} 图表绑定的事件集合
 * @param {afterRender | Function} 图加载前的函数
 * @param {beforeRender | Function} 图加载后的函数
 * @returns
 */
function BasicEchart({
    option,
    data,
    eventArr = [],
    afterRender,
    beforeRender,
}) {
    const baseOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                // 坐标轴指示器，坐标轴触发有效
                type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
            },
        },
        grid: {
            left: 0,
            right: 10,
            bottom: 0,
            top: 10,
            containLabel: true,
        },
    }

    const useOption = useMemo(() => {
        return extendObj(baseOption, option)
    }, [option, baseOption])

    // Container
    const container = useRef(null)
    const [chart, setchart] = useState(null)

    const [theme, setTheme] = useState(
        getThemeParams('theme') === 'dark' ? 'darkTheme' : 'lightTheme'
    )

    useEffect(() => {
        const handeleStoreage = e => {
            const { key, newValue } = e
            if (key === 'theme') {
                setTheme(
                    JSON.parse(newValue) === 'light'
                        ? 'lightTheme'
                        : 'darkTheme'
                )
            }
        }
        window.addEventListener('setItemEvent', handeleStoreage)
        return () => {
            window.removeEventListener('setItemEvent', handeleStoreage)
        }
    }, [])

    useEffect(() => {
        if (chart && chart._theme.themeName !== theme) {
            chart.dispose()
        }
        const nowChart = echarts.init(container.current, theme)
        setchart(nowChart)
    }, [chart, theme])
    // 事件监听
    useEffect(() => {
        if (!chart) return () => {}
        const useEventArr = eventArr.filter(d => d.callback)
        useEventArr.forEach(e => {
            chart.on(e.type, e.part, e.callback)
        })
        return () => {
            useEventArr.forEach(e => {
                chart.off(e.type, e.callback)
            })
        }
    }, [chart, eventArr])

    useEffect(() => {
        if (chart && !chart._disposed) {
            if (beforeRender) beforeRender(chart)
            chart.setOption(useOption, true)
            if (afterRender) afterRender(chart)
        }
    }, [useOption, chart, afterRender, beforeRender, theme])

    // 自适应
    useResizeChart(() => {
        if (chart) {
            chart.resize()
        }
    }, container.current)

    return (
        <div data={data.length} className='chart-container' ref={container} />
    )
}

export default withNoData(BasicEchart)

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import BarChart from '../chart-bar'
import deviceOpMenuStore from '../../../ui/table/device-op-menu-template/store'

/**
 * 基于设备信息操作提取出来的柱状图组件，目前用到的地方：事件列表、资产列表
 * @param {data | Array} 数据，数组:[{name:'xxx',value:'xxxx'}]
 * @param {onClick | Function} 柱状图条码点击事件
 * @param {title | String Object} 图表上方的内容，一般放title
 * @param {showTips | Boolean} 柱状图的label是否可以操作（设备操作）
 * @param {option | Object} 配置信息
 * @returns
 */
export default function DeviceBarChart({
    data = [],
    onClick,
    title,
    showTips = true,
    option = {},
    resultParams = false,
}) {
    const useOption = useMemo(() => {
        const basicConfig = {
            yAxis: {
                triggerEvent: true,
            },
            xAxis: {
                max: 'dataMax',
                splitLine: {
                    show: false,
                },
            },
            series: {
                showBackground: true,
                backgroundStyle: {
                    opacity: 0.4,
                },
            },
        }
        Object.entries(option).forEach(optionItem => {
            const [key, valueObj] = optionItem
            if (basicConfig[key]) {
                basicConfig[key] = { ...basicConfig[key], ...valueObj }
            } else {
                basicConfig[key] = valueObj
            }
        })
        return basicConfig
    }, [option])
    const eventArr = useMemo(() => {
        return showTips
            ? [
                  {
                      type: 'click',
                      part: { yAxisIndex: 0 },
                      callback: e => {
                          deviceOpMenuStore.openDeviceMenu(
                              { device: e.value, resultParams },
                              e.event.event
                          )
                      },
                  },
              ]
            : []
    }, [resultParams, showTips])

    // 条形、柱状图背景点击事件
    const [chart, setchart] = useState(null)

    useEffect(() => {
        if (onClick && chart) {
            chart.getZr().on('mousedown', params => {
                const pointInPixel = [params.offsetX, params.offsetY]

                let xIndex // x轴索引
                if (chart.containPixel('grid', pointInPixel)) {
                    ;[, xIndex] = chart.convertFromPixel({ seriesId: 'bar' }, [
                        params.offsetX,
                        params.offsetY,
                    ])
                }
                if (typeof xIndex !== 'number') {
                    return
                }
                const dataArr = chart.getOption().series[0].data
                const currentSelectedData = dataArr[xIndex]
                onClick(currentSelectedData)
            })
        }
        return () => {
            if (chart && !chart._disposed) {
                chart.getZr().off('mousedown')
            }
        }
    }, [chart, onClick])

    const useAfterRender = useCallback(
        nowChart => {
            if (onClick) {
                setchart(nowChart)
            }
        },
        [onClick]
    )

    return (
        <BarChart
            title={title}
            data={data}
            option={useOption}
            eventArr={eventArr}
            afterRender={useAfterRender}
        />
    )
}

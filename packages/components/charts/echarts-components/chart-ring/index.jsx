import React, { useCallback, useMemo } from 'react'
import { orderBy } from 'lodash'
import BasicEchart, { extendObj, extendSeries } from '../chart-basic'
import style from './index.module.less'

/**
 * echart环形图基础组件
 * @param {headTitle | String/Object} 图上方的内容，一般为title
 * @param {title | String} 环形图内容的title，也可以放在option中传入，由于目前所用到的title中subText和series中的name都是title，所以这里额外加了这么一个参数，减少重复代码
 * @param {data | Array} 数据，数组:[{name:'xxx',value:'xxxx'}]
 * @param {option | Object} 配置信息
 * @param {eventArr | Array} 图表绑定的一些event事件集合，例如：onclick
 * @param {beforeRender | Function} 图表加载前可执行的函数
 * @param {afterRender | Function} 图表渲染后可执行的函数
 * @returns
 */
function RingChart({
    headTitle = '',
    title = '',
    data,
    option = {},
    eventArr = [],
    beforeRender = () => {},
    afterRender = () => {},
}) {
    // 响应式调整环内径和外经
    const resizeRing = useCallback(
        chart => {
            afterRender(chart)
            const [width, height] = [chart.getWidth(), chart.getHeight()]
            const minref = Math.min(width * 0.666, height)
            const perc = minref === height ? 1 : minref / height
            const fontSize = parseInt(minref / 5, 10)
            chart.setOption({
                series: {
                    id: 'pieChart',
                    radius: [0.65, 0.85].map(d => `${perc * d * 100}%`),
                },
                title: {
                    textStyle: {
                        fontSize,
                        lineHeight: fontSize,
                    },
                    itemGap: 0 - fontSize / 4,
                },
            })
        },
        [afterRender]
    )

    const useOption = useMemo(() => {
        const useData = orderBy(data, 'value', 'desc')
        const initConfig = {
            title: {
                text: useData.length,
                subtext: `${title}`,
                textAlign: 'center',
                textStyle: {
                    fontWeight: 'normal',
                    fontSize: 30,
                },
                subtextStyle: {
                    fontSize: 12,
                },
                x: '38%',
                y: 'center',
            },
            tooltip: {
                trigger: 'item',
                formatter: params => {
                    const { marker, percent, value, name } = params
                    return `<div class='echart-tooltips'><div class="dot-item">
                                ${marker}
                                <span class="dot-item-name">${name}</span> |
                                <span class="dot-item-percent" >${percent}%</span>
                                <span class="dot-item-value" >${value}</span>
                            </div></div>`
                },
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                data: useData.map(d => d.name),
                icon: 'circle',
                top: 'center',
                right: 0,
                itemWidth: 10,
                itemHeight: 10,
                itemGap: 16,
                formatter: name => {
                    const dataItem = useData.find(d => d.name === name)
                    return `{a|${
                        name.length <= 6 ? name : `${name.slice(0, 5)}...`
                    }} {c|${dataItem.value}}`
                },
                textStyle: {
                    fontSize: 12,
                    rich: {
                        a: {
                            align: 'left',
                            width: 70,
                        },
                        c: {
                            align: 'right',
                            padding: [0, 0, 0],
                        },
                    },
                },
            },
            series: [],
        }
        const resultOption = extendObj(initConfig, option)
        const initSeries = {
            id: 'pieChart',
            radius: ['65%', '85%'], // 相对于宽度与高度中较小项
            center: ['30%', '50%'], // [相对容器宽度, 相对容器高度]
            name: title,
            type: 'pie',
            left: '12%',
            avoidLabelOverlap: false,
            clockwise: false,
            minAngle: 3,
            itemStyle: {
                // 图形样式
                normal: {
                    borderColor: 'rgba(0,0,0,0)',
                    borderWidth: 1,
                },
            },
            label: {
                normal: {
                    show: false,
                    position: 'center',
                },
            },
            labelLine: {
                normal: {
                    show: false,
                },
            },
            data: useData,
        }
        // 处理series为数组的情况
        resultOption.series = extendSeries(initSeries, option)
        return resultOption
    }, [data, option, title])

    return (
        <div className={style['chart-ring']}>
            {headTitle && <div className='chart-ring-title'>{headTitle}</div>}
            <BasicEchart
                beforeRender={beforeRender}
                afterRender={resizeRing}
                data={data}
                option={useOption}
                eventArr={eventArr}
            />
        </div>
    )
}

export default RingChart

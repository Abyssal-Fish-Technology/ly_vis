import { Pagination } from 'antd'
import { orderBy } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import BasicEchart, { extendObj, extendSeries } from '../chart-basic'
import style from './index.module.less'

/**
 * echart柱状图基础组件
 * @param {title | String Object} 图表上方的内容，一般放title
 * @param {data | Array} 数据，数组:[{name:'xxx',value:'xxxx'}]
 * @param {eventArr | Array} 图表绑定的一些event事件集合，例如：onclick
 * @param {option | Object} 配置信息
 * @param {size | Number} 每页展示的数据条数
 * @param {isPage | Boolean} 是否开启分页功能
 * @param {beforeRender | Function} 图表加载前可执行的函数
 * @param {afterRender | Function} 图表渲染后可执行的函数
 * @returns
 */
function BarChart({
    title = '',
    data = [],
    eventArr = [],
    option = {},
    size = 10,
    isPage = true,
    beforeRender = () => {},
    afterRender = () => {},
}) {
    const [page, setPage] = useState(1)

    const useOptions = useMemo(() => {
        const index = page - 1
        const nowchartData = orderBy(data, 'value', 'desc')
        const useData = isPage
            ? nowchartData.slice(index * size, (index + 1) * size)
            : nowchartData
        const axisData = useData.map(d => d.name || d)

        const initConfig = {
            legend: false,
            grid: {
                right: 20,
                containLabel: true,
            },
            tooltip: {
                trigger: 'axis',
                confine: true,
                axisPointer: {
                    type: 'shadow',
                },
            },
            yAxis: {
                type: 'category',
                inverse: true,
                axisLabel: {
                    formatter: value => {
                        const s = value.toString()
                        return s.length > 18 ? `${s.slice(0, 13)}...` : s
                    },
                    interval: 0,
                },
            },
            xAxis: {
                type: 'value',
                axisLabel: {
                    formatter: d => d,
                },
                minInterval: 1,
                fontSzie: 10,
            },
            series: [],
        }
        const resultOption = extendObj(initConfig, option)

        // 为了应对series为数组的情况，所以series单独做了处理
        const initSeries = {
            id: 'bar',
            data: useData,
            type: 'bar',
            name: '数量',
            barMaxWidth: 40,
        }

        resultOption.series = extendSeries(initSeries, option)

        // y轴和x轴所代表的的作用会不同，这里需要做一下判断，另外当type ='time'时，设置data没有作用，所以不考虑为time时data为的值为undefined的情况
        if (resultOption.yAxis.type === 'category') {
            resultOption.yAxis.data = axisData
        } else {
            resultOption.xAxis.data = axisData
        }

        return resultOption
    }, [data, isPage, option, page, size])

    useEffect(() => {
        setPage(1)
    }, [data])

    return (
        <div className={style['bar-chart-withpage']}>
            {title && <div className='bar-chart-title'>{title}</div>}
            <BasicEchart
                option={useOptions}
                data={data}
                eventArr={eventArr}
                beforeRender={beforeRender}
                afterRender={afterRender}
            />
            {isPage && (
                <div className='bar-chart-page'>
                    <Pagination
                        simple
                        defaultCurrent={1}
                        defaultPageSize={size}
                        total={data.length}
                        current={page}
                        onChange={nowPage => {
                            setPage(nowPage)
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export default BarChart

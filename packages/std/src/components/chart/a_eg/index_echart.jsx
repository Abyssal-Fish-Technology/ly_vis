/* eslint-disable no-unused-vars */
import React, { useCallback } from 'react'
import echarts from 'echarts'

export default function Calendar(props) {
    const { data } = props
    const option = []
    const container = useCallback(
        node => {
            if (node !== null) {
                const myChart = echarts.init(node, 'light')
                myChart.setOption(option)
            }
        },
        [option]
    )
    return <div className='chart-container' ref={container} />
}

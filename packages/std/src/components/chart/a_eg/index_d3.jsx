/* eslint-disable no-unused-vars */
import React, { useState, useCallback } from 'react'

export default function BarChart(props) {
    const { data } = props
    const [height, setheight] = useState(100)
    const [width, setwidth] = useState(100)

    const [top, right, bottom, left] = [0, 0, 0, 0]
    const chartWidth = width - left - right
    const chartHeight = height - top - bottom

    const container = useCallback(node => {
        if (node !== null) {
            const {
                width: newWidth,
                height: newHeight,
            } = node.getBoundingClientRect()
            setwidth(newWidth)
            setheight(newHeight)
        }
    }, [])

    return (
        <div className='chart-container' ref={container}>
            <svg viewBox={[0, 0, width, height]}>
                <g transform={`translate(${left}, ${top})`} />
            </svg>
        </div>
    )
}

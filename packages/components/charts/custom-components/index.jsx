import React, { useEffect, useMemo, useState } from 'react'
import withNoData from '../../ui/layout/with-nodata'

/**
 * d3图表的基础组件，里面放了一下共有属性、方法
 * @param {children | object} 图表的元素集合
 * @param {data | Array} 判断是否为空数据，用于withNoData高阶组件
 * @param {parentRef | Object} 父元素的ref对象，用于监听父元素大小变化，然后重新渲染图表以及获取width和height
 * @param {resizeCallBack | Function} 父元素大小发生变化后的回调函数，传回的参数是当前父元素的宽度
 * @param {customHeight | Number} 控制图表高度有两种情况，一种是父元素高度，在内部获取，一种是从外部传入高度，和父元素高度无关，此参数应对第二种情况（高度需要额外计算）
 * @param {chartPadding | Object} 图表的padding值，{top,right,bottom,left}
 * @param {callbackRealSize | Function} 返回的是图表的真实宽度和高度，去除padding之后的值：realWidth、realHeight
 * @param {className | String} 自定义的class，当需要对内部的svg进行样式定义或者其它操作时可用
 * @returns
 */
function BasicCustomChart({
    children = null,
    data = [],
    parentRef = null,
    resizeCallBack = () => {},
    customHeight = '',
    chartPadding = {},
    callbackRealSize = () => {},
    className = '',
}) {
    const [width, setWidth] = useState(100)
    const [height, setHeight] = useState(100)
    const { top = 0, right = 0, bottom = 0, left = 0 } = chartPadding
    const [isResize, setIsResize] = useState(0)

    useEffect(() => {
        const {
            width: newWidth,
            height: newHeight,
        } = parentRef.current.getBoundingClientRect()

        if (newWidth > 0 && newHeight > 0) {
            setWidth(newWidth)
            setHeight(customHeight || newHeight)
        }
    }, [customHeight, parentRef, isResize])

    useEffect(() => {
        const monitorNode = parentRef.current
        let resizeObserver = new ResizeObserver(entries => {
            const { contentRect } = entries[0]
            resizeCallBack(contentRect.width)
            setIsResize(contentRect.width)
        })
        if (monitorNode) {
            resizeObserver.observe(monitorNode)
        }

        return () => {
            resizeObserver.disconnect()
            resizeObserver = null
        }
    }, [parentRef, resizeCallBack])

    const realWidth = useMemo(() => width - left - right, [left, right, width])
    const realHeight = useMemo(() => height - top - bottom, [
        bottom,
        height,
        top,
    ])

    useEffect(() => {
        callbackRealSize({ realWidth, realHeight })
    }, [realWidth, realHeight, callbackRealSize])

    return (
        <svg
            data={data.length}
            viewBox={[0, 0, width, height]}
            preserveAspectRatio='none'
            width='100%'
            height={height}
            className={className}
        >
            {children}
        </svg>
    )
}

export default withNoData(BasicCustomChart)

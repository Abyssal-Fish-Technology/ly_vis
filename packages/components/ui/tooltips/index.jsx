import React, { useImperativeHandle, useRef, useState } from 'react'
import { calcualtePosition } from '../../utils/universal/methods-ui'
import '../../style/tooltip.less'
/**
 * 全局tooltips
 * @param {children} children  每个tooltips里面自己的子内容
 * @param {*} ref 引用tooltips的组件定义的ref对象
 * 在用到tooltips的地方，通过ref.current.openTooltips()的方式引用方法，对tooltips进行操作
 */
function TooltipsGlobal({ children, css }, ref) {
    const [visible, setVisible] = useState(false)
    const [position, setPosition] = useState({})
    const container = useRef(null)
    useImperativeHandle(ref, () => {
        return {
            // 1、这里的e必须是原生的事件对象
            // 2、parentElement是父元素对象，可以是ref.current，也可以是dom对象，tooltips相对于父元素进行定位
            openTooltips: (e, parentElement) => {
                setVisible(true)
                calcualtePosition(e, container.current, parentElement).then(
                    positionObj => {
                        setPosition(positionObj)
                    }
                )
            },
            closeTooltips: () => {
                setVisible(false)
            },
        }
    })

    return (
        <>
            <div
                ref={container}
                className='global-tooltips'
                style={{
                    ...position,
                    visibility: visible ? 'visible' : 'hidden',
                    zIndex: 2,
                    ...css,
                }}
            >
                {children}
            </div>
        </>
    )
}

export default React.forwardRef(TooltipsGlobal)

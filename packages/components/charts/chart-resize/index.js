import { useEffect, useRef } from 'react'

/**
 * 自定义hooks，监听resize
 * @param {Function} callback 回调
 * @param {Element} observedEle 被监听的元素
 * @param {Boolean} hidden overflow: hidden
 */
export default function useResizeChart(callback, observedEle, hidden = false) {
    const cb = useRef(callback)
    cb.current = callback

    useEffect(() => {
        let resizeTimeout = null

        function resizeThrottler(entries) {
            if (!resizeTimeout) {
                resizeTimeout = setTimeout(() => {
                    const { contentRect } = entries[0]
                    if (cb.current && contentRect.width) {
                        cb.current(contentRect)
                    }
                    resizeTimeout = null
                }, 100)
            }
        }

        let ro = new ResizeObserver(resizeThrottler)

        if (observedEle) {
            ro.observe(observedEle)
            if (hidden) observedEle.style.overflowX = 'hidden'
        }

        return () => {
            clearTimeout(resizeTimeout)
            ro.disconnect()
            ro = null
        }
    }, [hidden, observedEle])
}

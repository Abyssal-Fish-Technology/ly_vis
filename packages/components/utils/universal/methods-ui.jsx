import { message } from 'antd'
import { isObject } from 'lodash'

/**
 * 将复制内容直接写入剪切板，仅支持文本内容
 */
export async function copy(copytext) {
    // try {
    //     await navigator.clipboard.writeText(copytext)
    //     message.success('复制成功!')
    // } catch (err) {
    //     console.log(err)
    //     message.error('复制失败!')
    // }
    const aux = document.createElement('input')
    aux.setAttribute('value', copytext)
    aux.setAttribute('style', 'position:fixed;top:0;left:0;')

    document.body.appendChild(aux)
    aux.select()
    const tag = document.execCommand('copy')
    document.body.removeChild(aux)
    if (tag) {
        message.success('复制成功！')
    }
}

export function calcualtePosition(event, node, parentElement = null) {
    return new Promise(resolve => {
        setTimeout(() => {
            const { pageX, pageY, clientX, clientY } = event
            const currentNode = isObject(node)
                ? node
                : document.querySelector(node)
            const currentParent = isObject(parentElement)
                ? parentElement
                : document.querySelector(parentElement)
            const { clientHeight: tooltipsHeight, clientWidth: tooltipsWidth } =
                currentNode || {}
            const gap = 10
            let [left, top, right, bottom] = [
                pageX + gap,
                pageY + gap,
                'auto',
                'auto',
            ]

            if (!currentParent) {
                if (tooltipsWidth + clientX >= window.innerWidth) {
                    left = 'auto'
                    right = document.body.clientWidth - pageX + gap
                }

                if (tooltipsHeight + clientY >= window.innerHeight) {
                    top = 'auto'
                    bottom = window.innerHeight - pageY + gap
                }
            } else {
                // 当前元素相对于父元素定位的计算方法
                // 1、获取父元素的视口信息，top，left，width，height
                // 2、正常计算。top：当前元素的pageY-父元素的top-滚动距离window.scrollY(不滚动则为0,视口信息随着滚动会变化)
                // 3、临界值计算，和上面的一样，只是参考的值变了
                const {
                    top: pTop,
                    left: pLeft,
                    width,
                    height,
                } = currentParent.getBoundingClientRect()
                const cTop = clientY - pTop + gap
                const cLeft = clientX - pLeft + gap
                top = cTop
                left = cLeft
                if (tooltipsWidth + cLeft >= width) {
                    left = 'auto'
                    right = width - cLeft + gap
                }
                if (tooltipsHeight + cTop >= height) {
                    top = 'auto'
                    bottom = height + pTop - clientY + gap
                }
            }
            resolve({
                left,
                right,
                top,
                bottom,
            })
        }, 0)
    })
}

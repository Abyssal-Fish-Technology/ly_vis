import React, { useEffect, useMemo, useState } from 'react'
import { AntdEmptySuper } from '../../antd-components-super'

export default function withNoData(
    Component,
    propName = 'data',
    valid = data => data
) {
    return props => {
        return valid(props[propName]).length ? (
            <Component {...props} />
        ) : (
            <AntdEmptySuper />
        )
    }
}

/**
 * 自定义hooks，无数据时切换到无数据组件
 * @param {ReactElement} C 需要渲染的组件或元素
 * @param {Boolean} isShow 是否渲染组件
 * @return {ReactElement}
 */
export function useNoData(C, isShow) {
    // 强制刷新一次，防止element的ref未能同步
    const [, forceUpdate] = useState()
    useEffect(() => {
        if (isShow) forceUpdate({})
    }, [isShow])

    return useMemo(() => (isShow ? C : <AntdEmptySuper />), [C, isShow])
}

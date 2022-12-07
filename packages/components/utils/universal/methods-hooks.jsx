import React, { useEffect, useMemo, useRef } from 'react'
import { Select } from 'antd'

/** ********************************************************************** LifecycleHooks start ***********************************************************************
 ** 生命周期相关的hooks集合
 ** 关键字： Mount、willMount、UnMount
 * */

/**
 * 组件加载前生命周期
 * @param {Function} func
 */
export function useComponentWillMount(func) {
    const willMount = useRef(true)

    if (willMount.current) func()

    willMount.current = false
}

/**
 * 组件卸载前生命周期
 * @param {Function} func
 */
export function useComponentUnMount(func) {
    const usefunc = useRef(null)
    usefunc.current = func
    useEffect(() => {
        return () => {
            usefunc.current()
        }
    }, [usefunc])
}

/**
 * 组件加载成功后生命周期
 * @param {Function} mountedFn
 */
export function useMount(mountedFn) {
    const mountedFnRef = useRef(null)
    mountedFnRef.current = mountedFn
    useEffect(() => {
        mountedFnRef.current()
    }, [mountedFnRef])
}

/** ***********************************************************************  end ************************************************************************* */

/** ********************************************************************** ComponentHooks start ***********************************************************************
 ** 和组件内容相关的hooks集合
 ** 关键字： components
 * */

/**
 * 创建可能会动态更新的下拉框选择项，大部分用在config场景中
 * @param {*} data options值
 * @param {*} valueKey value
 * @param {*} showkey  text
 * @returns
 */
const { Option } = Select
export function useSelectOptions(data, valueKey, showkey) {
    return useMemo(
        () =>
            data.map(d => (
                <Option key={d[valueKey]} value={d[valueKey]}>
                    {d[showkey]}
                </Option>
            )),
        [data, showkey, valueKey]
    )
}

/** ***********************************************************************  end ************************************************************************* */

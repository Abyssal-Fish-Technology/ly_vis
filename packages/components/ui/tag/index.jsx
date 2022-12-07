import {
    translateTiTag,
    getTiId,
} from '@shadowflow/components/utils/business/methods-ti'
import { Tag } from 'antd'
import React, { useMemo } from 'react'

/**
 * 根据type返回不同颜色的Tag
 * @param {*} props
 * 颜色种类:
 * 紫色（mo），红色（事件类型。ti：威胁情报），橙色（事件详细类型），绿色（safeTi：安全情报），黑色（黑名单），蓝色（资产，数据来源，检出种类），默认颜色（白名单，资产属性，事件属性）
 * tagProps tag组件自有属性，也可以传入color来设置颜色
 * @return Tag
 */
export function TagAttribute(props) {
    const {
        children, // 包裹的内容
        type = 'default', // Tag类型
        className = '', // 额外的类名
        style = {}, // 额外的样式
        onClick = null, // Tag的事件，目前只加了点击事件
        ...tagProps
    } = props
    const resultClassName = useMemo(() => {
        const classObj = {
            mo: 'ant-tag-purple', // 紫色
            event: 'ant-tag-red', // 红色
            asset: 'ant-tag-blue', // 蓝色
            eventDetail: 'ant-tag-orange', // 橙色
            sfaeTi: 'ant-tag-green', // 绿色
            black: 'ant-tag-black', // 黑色
        }
        let nowClass = classObj[type]
        if (type === 'ti') {
            const id = getTiId(children)
            nowClass = classObj.event
            if (id === 0) {
                nowClass = classObj.asset
            }
            if (id > 1000 && id < 1100) {
                nowClass = classObj.sfaeTi
            }
        }
        return `${nowClass || ''} ${className}`
    }, [children, className, type])

    const resultChildren = useMemo(() => {
        return type === 'ti' ? translateTiTag(children) : children
    }, [children, type])

    return (
        <>
            {children ? (
                <Tag
                    className={resultClassName}
                    style={style}
                    onClick={onClick}
                    {...tagProps}
                >
                    {resultChildren}
                </Tag>
            ) : null}
        </>
    )
}

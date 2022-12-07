import { Empty } from 'antd'
import React from 'react'

/**
 * 自定义样式的Empty组件
 * 1、有默认样式，也可以通过comStyle传入自定义的样式
 * 2、可以传入antd的Empty组件的所有参数
 * 3、还可以传入children，如果有特殊需求的话
 */
export default function AntdEmptySuper({
    description = '暂无数据',
    comStyle = {},
    imageStyle = {},
    image = null,
    children = null,
}) {
    return (
        <Empty
            style={{
                width: '100%',
                height: '100%',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                ...comStyle,
            }}
            imageStyle={imageStyle}
            image={image || Empty.PRESENTED_IMAGE_SIMPLE}
            description={description}
        >
            {children}
        </Empty>
    )
}

import { skipPage } from '@/utils/methods-ui'
import { DoubleRightOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import React from 'react'
import style from './index.module.less'

/**
 *
 * @param {类名} className
 * @param {hover的提示信息}} message
 * @param {内部包裹}} children
 * @param {跳转对象，格式和router的跳转一致} to
 * @param {不展示后面的>>内容} noAfter
 * @returns
 */
export default function SkipContainer({
    className = '',
    message = '',
    children,
    to = {},
    noAfter = false,
    onClick = false,
}) {
    return (
        <div
            className={`${className} ${style.skipContainer}`}
            onClick={() => {
                if (onClick) {
                    onClick()
                } else {
                    skipPage(to.pathname, to.search)
                }
            }}
        >
            <div className='container operate-content-default'>
                <Tooltip title={message}>
                    {children}
                    {!noAfter && <DoubleRightOutlined />}
                </Tooltip>
            </div>
        </div>
    )
}

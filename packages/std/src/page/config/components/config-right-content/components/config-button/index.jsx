import { EditOutlined } from '@ant-design/icons'
import { skipPage } from '@/utils/methods-ui'
import { Button, Popconfirm, Tooltip } from 'antd'
import React from 'react'

export function AddTrigger({ text }) {
    return <Button>{text}</Button>
}

export function DeleteTrigger(props) {
    const { callback, children } = props
    return (
        <Popconfirm
            title='你确定要删除吗？'
            okText='确定'
            cancelText='取消'
            onConfirm={callback}
        >
            <Tooltip placement='top' title='删除'>
                {children}
            </Tooltip>
        </Popconfirm>
    )
}

export function EditTrigger({ callback, children = null }) {
    return (
        <Tooltip placement='top' title='编辑'>
            <EditOutlined onClick={callback} />
            {children}
        </Tooltip>
    )
}

export function JumpSpan({ text, path, search }) {
    return (
        <span
            className='operate-content-active'
            onClick={() => {
                skipPage(path, search || '')
            }}
        >
            {text}
        </span>
    )
}

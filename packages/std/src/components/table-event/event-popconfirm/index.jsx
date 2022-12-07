import { singleHandleEvent } from '@/utils/methods-event'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Popconfirm } from 'antd'
import React, { useCallback } from 'react'

export default function EventConfirm({
    children,
    okText = '已处理',
    calText = '已确认',
    okStatus = 'processed',
    calStatus = 'assigned',
    id,
    changeLoading,
}) {
    const handleEvent = useCallback(
        nowStatus => {
            singleHandleEvent({
                id,
                proc_status: nowStatus,
                changeLoading,
            })
        },
        [changeLoading, id]
    )
    return (
        <Popconfirm
            title='修改处理状态'
            icon={<ExclamationCircleOutlined />}
            okText={okText}
            cancelText={calText}
            onCancel={() => {
                handleEvent(calStatus)
            }}
            onConfirm={() => {
                handleEvent(okStatus)
            }}
            placement='bottomRight'
        >
            {children}
        </Popconfirm>
    )
}

import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, message, Popconfirm } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import {
    TdFlag,
    AntdTableSuper,
} from '@shadowflow/components/ui/antd-components-super'
import { batchHandleEvent } from '@/utils/methods-event'
import SkipContainer from '@/components/skip-container'

export default function EventTableSimple({
    data,
    title,
    contentHeight,
    params,
}) {
    const [loading, setloading] = useState(false)
    useEffect(() => {
        setloading(false)
    }, [data])

    const columns = useMemo(() => {
        return [
            {
                title: '威胁来源',
                dataIndex: 'attackDevice',
                width: 130,
                render: (d, row) => (
                    <DeviceOperate device={d} resultParams={params}>
                        <TdFlag ip={row.attackIp} />
                        <span
                            style={{ width: '100px' }}
                            className='table-ellipsis'
                        >
                            {d}
                        </span>
                    </DeviceOperate>
                ),
            },
            {
                title: '受害目标',
                dataIndex: 'victimDevice',
                width: 130,
                render: (d, row) => (
                    <DeviceOperate device={d} resultParams={params}>
                        <TdFlag ip={row.victimIp} />
                        <span
                            style={{ width: '100px' }}
                            className='table-ellipsis'
                        >
                            {d}
                        </span>
                    </DeviceOperate>
                ),
            },
            {
                title: '类型',
                dataIndex: 'show_type',
                render: d => <TagAttribute type='event'>{d}</TagAttribute>,
            },
            {
                title: 'ID',
                dataIndex: 'id',
                fixed: 'right',
                width: 'auto',
                render: d => {
                    return (
                        <SkipContainer
                            className='operate-content-active'
                            message='查看事件详情'
                            to={{
                                pathname: 'event/detail',
                                search: {
                                    pageParams: {
                                        event_id: d,
                                    },
                                },
                            }}
                        >
                            {`#${d}`}
                        </SkipContainer>
                    )
                },
            },
        ]
    }, [params])

    const [selectRowKey, setselectRowKey] = useState([])

    const processEvent = useCallback(
        status => {
            if (selectRowKey.length < 1) {
                message.warning('请选择待处理数据。')
                return
            }
            batchHandleEvent({
                idList: selectRowKey,
                status,
                changeLoading: setloading,
                changeIdlist: setselectRowKey,
            })
        },
        [selectRowKey]
    )

    return (
        <AntdTableSuper
            ipKeys={['attackIp', 'victimIp']}
            loading={loading}
            headerTitle={title}
            rowKey='id'
            rowSelection={{
                type: 'checkbox',
                columnWidth: 30,
                fixed: 'left',
            }}
            pagination={{
                position: ['bottomRight'],
                size: 'small',
                showLessItems: true,
            }}
            options={false}
            tableLayout='fixed'
            size='small'
            dataSource={data}
            columns={columns}
            scroll={{
                y: contentHeight,
                x: true,
            }}
            selectionCallBack={keys => {
                setselectRowKey(keys)
            }}
            tableAlertRender={false}
            showBoxShadow={false}
            toolBarRender={() => [
                <Button
                    key='auth'
                    size='small'
                    type='primary'
                    disabled={selectRowKey.length < 1}
                >
                    <Popconfirm
                        title='修改处理状态'
                        icon={
                            <ExclamationCircleOutlined
                                style={{ color: 'orange' }}
                            />
                        }
                        okText='已处理'
                        cancelText='已确认'
                        onCancel={() => {
                            processEvent('assigned')
                        }}
                        onConfirm={() => {
                            processEvent('processed')
                        }}
                    >
                        批量处理
                    </Popconfirm>
                </Button>,
            ]}
        />
    )
}

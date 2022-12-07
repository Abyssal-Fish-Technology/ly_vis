import {
    openAddDeviceModal,
    openAddProxyModal,
    openAddUserModal,
    openEditUseModal,
} from '@shadowflow/components/ui/modal'
import { deviceApi, proxyApi, userApi } from '@/service'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { Button, message, Popconfirm, Switch } from 'antd'
import { formatTimestamp } from '@shadowflow/components/utils/universal/methods-time'
import { inject, observer } from 'mobx-react'
import React, { useCallback, useState } from 'react'
import moment from 'moment'
import { valueSort } from '@shadowflow/components/utils/universal/methods-table'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import ConfigTemplate from '../../components/config-template'
import { DeviceCell } from '../../components/table-cell'

const ControlDisabled = inject('configStore')(
    observer(({ configStore, dataName, api, record }) => {
        const { changeData } = configStore
        const [switchLoading, setSwitchLoading] = useState(false)
        const checked = record.disabled !== 'N'
        return (
            <Popconfirm
                placement='topRight'
                title={`确定要${checked ? '启用' : '禁用'}吗`}
                onConfirm={() => {
                    setSwitchLoading(true)
                    api({
                        op: 'mod',
                        ...record,
                        disabled: checked ? 'N' : 'Y',
                    }).then(() => {
                        message.success('操作成功！')
                        api().then(res => {
                            changeData({ [dataName]: res })
                            setSwitchLoading(false)
                        })
                    })
                }}
                okText='确定'
                cancelText='取消'
            >
                <Switch
                    checkedChildren='是'
                    unCheckedChildren='否'
                    size='small'
                    checked={checked}
                    loading={switchLoading}
                />
            </Popconfirm>
        )
    })
)

const LockedComponent = inject('configStore')(
    observer(({ record, configStore }) => {
        const { changeData } = configStore
        const lockedStatus = record.lockedtime !== 0
        const [lockoutLoading, setLockoutLoading] = useState(false)
        const settingLockOut = useCallback(
            lockout => {
                setLockoutLoading(true)
                userApi({
                    op: 'mod',
                    ...record,
                    lockedtime: lockout ? 0 : moment().unix(),
                }).then(() => {
                    message.success('操作成功！')
                    userApi().then(res => {
                        changeData({ userList: res })
                        setLockoutLoading(false)
                    })
                })
            },
            [changeData, record]
        )

        return (
            <span>
                <Popconfirm
                    placement='topRight'
                    title={
                        lockedStatus ? '确定要解除锁定吗？' : '确定要锁定吗？'
                    }
                    onConfirm={() => {
                        settingLockOut(lockedStatus)
                    }}
                    okText='确定'
                    cancelText='取消'
                >
                    <Button
                        icon={
                            lockedStatus ? <LockOutlined /> : <UnlockOutlined />
                        }
                        type='link'
                        loading={lockoutLoading}
                        danger={lockedStatus}
                        size='small'
                    />
                </Popconfirm>
            </span>
        )
    })
)

const deviceColumns = [
    {
        title: '名称',
        dataIndex: 'name',
        sorter: valueSort('name'),
    },
    {
        title: '设备类型',
        dataIndex: 'device_type',
        sorter: valueSort('device_type'),
    },
    {
        title: '模型',
        dataIndex: 'model',
        sorter: valueSort('model'),
    },
    {
        title: 'flowtype',
        dataIndex: 'flowtype',
        sorter: valueSort('flowtype'),
    },
    {
        title: 'agentid',
        dataIndex: 'agentid',
        sorter: valueSort('agentid'),
    },
    {
        title: '创建者',
        dataIndex: 'creator',
        sorter: valueSort('creator'),
    },
    {
        title: '注释',
        dataIndex: 'comment',
        sorter: valueSort('comment'),
    },
    {
        title: 'port',
        dataIndex: 'port',
        width: 80,
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '禁止使用',
        dataIndex: 'disabled',
        sorter: valueSort('disabled'),
        render: (t, row) => (
            <ControlDisabled record={row} dataName='device' api={deviceApi} />
        ),
    },
]

const proxyColumns = [
    {
        title: '名称',
        dataIndex: 'name',
        sorter: valueSort('name'),
    },
    {
        title: '创建者',
        dataIndex: 'creator',
        sorter: valueSort('creator'),
    },
    {
        title: '状态',
        dataIndex: 'status',
        sorter: valueSort('status'),
    },
    {
        title: '注释',
        dataIndex: 'comment',
        sorter: valueSort('comment'),
    },
    {
        title: 'ip',
        dataIndex: 'ip',
        sorter: valueSort('ip'),
        width: 150,
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '禁止使用',
        dataIndex: 'disabled',
        sorter: valueSort('disabled'),
        render: (t, row) => (
            <ControlDisabled record={row} dataName='proxy' api={proxyApi} />
        ),
    },
]

const userColumns = [
    {
        title: 'name',
        dataIndex: 'name',
        sorter: valueSort('name'),
    },
    {
        title: '级别',
        dataIndex: 'level',
        sorter: valueSort('level'),
    },
    {
        title: '资源',
        dataIndex: 'reso',
        sorter: valueSort('reso'),
        render: t => <DeviceCell id={t} />,
    },
    {
        title: '最后登陆IP',
        dataIndex: 'lastip',
        sorter: valueSort('lastip'),
        width: 130,
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '最后登陆时间',
        dataIndex: 'lasttime',
        sorter: valueSort('lasttime'),
        render: (t, d) =>
            d.lasttime ? formatTimestamp(d.lasttime) : d.lasttime,
    },
    {
        title: '禁止使用',
        dataIndex: 'disabled',
        sorter: valueSort('disabled'),
        render: (t, row) => (
            <ControlDisabled record={row} dataName='userList' api={userApi} />
        ),
    },
    {
        title: '创建者',
        dataIndex: 'creator',
        sorter: valueSort('creator'),
    },
    {
        title: '注释',
        dataIndex: 'comm',
        sorter: valueSort('comm'),
    },
    {
        title: '锁定操作',
        dataIndex: 'lockedtime',
        align: 'center',
        sorter: valueSort('lockedtime'),
        render: (t, row) => <LockedComponent record={row} />,
    },
]

const publicProperty = {
    addAuth: ['sysadmin', 'analyser'],
    editAuth: ['sysadmin', 'analyser'],
    deleteAuth: ['sysadmin', 'analyser'],
}

export const systemConfigData = {
    title: '系统',
    path: '/config/system',
    children: [
        {
            title: '部署',
            children: [
                {
                    title: '数据节点',
                    key: 'device',
                    describe: '介绍：这是数据节点',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置数据节点，根据不同的数据节点采集对应的数据返回分析结果。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddDeviceModal,
                    api: deviceApi,
                    isActive: true,
                    columns: deviceColumns,
                    ...publicProperty,
                },
                {
                    title: '分析节点',
                    key: 'proxy',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置分析节点，对应数据节点中的分析功能。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    api: proxyApi,
                    openModalFun: openAddProxyModal,
                    isActive: false,
                    columns: proxyColumns,
                    ...publicProperty,
                },
            ],
        },
        {
            title: '用户',
            children: [
                {
                    title: '用户',
                    key: 'userList',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置用户登录账号，包括账号、密码、权限、指定用户访问的数据节点，当用户账号被系统锁定后，可在此页面进行解除锁定操作。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddUserModal,
                    editFn: openEditUseModal,
                    api: userApi,
                    isActive: false,
                    columns: userColumns,
                    ...publicProperty,
                },
            ],
        },
    ],
}

export default function ConfigSystem() {
    return <ConfigTemplate data={systemConfigData.children} />
}

import React from 'react'
import { Tooltip } from 'antd'
import {
    GetColumnSearchProps,
    valueSort,
    calculateTags,
} from '@shadowflow/components/utils/universal/methods-table'
import { TdFlag } from '@shadowflow/components/ui/antd-components-super'
import { inject, observer } from 'mobx-react'
import { DeviceOperate } from '../../ui/table/device-op-menu-template'

const ellipsisCell = {
    display: 'inline-block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}

export const rowKey = ({ name, ip, port, host, url, time, bytes }) =>
    `${name}-${ip}-${String(port)}-${host}-${url}-${time}-${bytes}`

const publicColumn = [
    {
        title: 'Bytes',
        dataIndex: 'show_bytes',
        sorter: valueSort('bytes'),
    },
    {
        title: 'Pkts',
        dataIndex: 'show_pkts',
        sorter: valueSort('pkts'),
    },
    {
        title: 'Flows',
        dataIndex: 'show_flows',
        sorter: valueSort('flows'),
    },
]

const DeviceContent = inject(stores => ({
    params: stores.assetListStore.currentParams,
}))(
    observer(({ device, params }) => {
        return (
            <DeviceOperate device={device} resultParams={params}>
                <TdFlag ip={device} />
                <span>{device}</span>
            </DeviceOperate>
        )
    })
)

export default {
    ip: [
        {
            title: 'IP',
            dataIndex: 'ip',
            sorter: valueSort('ip'),
            fixed: 'left',
            className: 'no-wrap',
            ...GetColumnSearchProps('ip', (...args) => (
                <DeviceContent device={args[0]} />
            )),
        },
        {
            title: '资产标签',
            dataIndex: 'desc',
            sorter: valueSort('desc'),
            render: d => calculateTags(d, '', 'asset'),
        },
        // {
        //     title: '设备类型',
        //     dataIndex: 'dev_type',
        //     hide: true,
        //     sorter: valueSort('dev_type'),
        //     render: calculateTags,
        // },
        // {
        //     title: '设备/应用系统',
        //     dataIndex: 'show_dev_name',
        //     sorter: valueSort('show_dev_name'),
        //     render: calculateTags,
        // },

        // {
        //     title: '设备厂商',
        //     dataIndex: 'dev_vendor',
        //     sorter: valueSort('dev_vendor'),
        //     hide: true,
        //     render: calculateTags,
        // },
        // {
        //     title: '操作系统类型',
        //     dataIndex: 'os_type',
        //     hide: true,
        //     sorter: valueSort('os_type'),
        //     render: calculateTags,
        // },
        // {
        //     title: '操作系统',
        //     dataIndex: 'show_os_name',
        //     sorter: valueSort('show_os_name'),
        //     render: calculateTags,
        // },
        // {
        //     title: 'MAC地址',
        //     dataIndex: 'mac',
        //     sorter: valueSort('mac'),
        // },
        {
            title: '活跃次数',
            dataIndex: 'activeCount',
            sorter: valueSort('activeCount'),
        },
        {
            title: '活跃时间',
            dataIndex: 'show_starttime',
            sorter: valueSort('starttime'),
            width: 180,
        },
        ...publicColumn,
    ],
    srv: [
        {
            title: '主机',
            dataIndex: 'ip',
            sorter: valueSort('ip'),
            width: 150,
            fixed: 'left',
            ...GetColumnSearchProps('ip', (...args) => (
                <div style={{ whiteSpace: 'nowrap', maxWidth: '150px' }}>
                    <DeviceContent device={args[0]} />
                </div>
            )),
        },
        {
            title: '端口',
            dataIndex: 'port',
            sorter: valueSort('port'),
            width: 80,
            fixed: 'left',
            ...GetColumnSearchProps('port', (...args) => (
                <div style={{ maxWidth: '80px' }}>
                    <DeviceContent device={args[0]} />
                </div>
            )),
        },
        {
            title: '资产标签',
            dataIndex: 'desc',
            sorter: valueSort('desc'),
            render: d => calculateTags(d, '', 'asset'),
        },
        {
            title: '服务类型',
            dataIndex: 'srv_type',
            hide: true,
            sorter: valueSort('srv_type'),
            render: calculateTags,
        },
        {
            title: '服务名称',
            dataIndex: 'show_srv_name',
            sorter: valueSort('show_srv_name'),
            render: calculateTags,
        },
        {
            title: '中间件',
            dataIndex: 'show_midware_name',
            sorter: valueSort('desc'),
            render: calculateTags,
        },
        {
            title: '中间件类型',
            dataIndex: 'midware_type',
            hide: true,
            sorter: valueSort('midware_type'),
            render: calculateTags,
        },
        {
            title: '设备/应用系统',
            dataIndex: 'show_dev_name',
            sorter: valueSort('desc'),
            render: calculateTags,
        },
        {
            title: '设备/应用系统类型',
            dataIndex: 'dev_type',
            hide: true,
            sorter: valueSort('dev_type'),
            render: calculateTags,
        },
        {
            title: '设备/应用系统厂商',
            dataIndex: 'dev_vendor',
            hide: true,
            sorter: valueSort('dev_vendor'),
            render: calculateTags,
        },
        {
            title: '操作系统',
            dataIndex: 'show_os_name',
            sorter: valueSort('desc'),
            render: calculateTags,
        },
        {
            title: '操作系统类型',
            dataIndex: 'os_type',
            hide: true,
            sorter: valueSort('os_type'),
            render: calculateTags,
        },
        // {
        //     title: 'MAC地址',
        //     dataIndex: 'mac',
        //     sorter: valueSort('mac'),
        // },
        {
            title: '传输层协议',
            dataIndex: 'protocol',
            render: calculateTags,
            sorter: valueSort('protocol'),
        },
        {
            title: '应用层协议',
            dataIndex: 'app_proto',
            render: calculateTags,
            sorter: valueSort('app_proto'),
        },
        ...publicColumn,
    ],
    host: [
        {
            title: '网站',
            dataIndex: 'host',
            width: 200,
            fixed: 'left',
            sorter: valueSort('host'),
            ...GetColumnSearchProps('host', (t, d, i, H) => (
                <Tooltip title={t}>
                    <div style={{ ...ellipsisCell, maxWidth: '200px' }}>
                        <H>{t}</H>
                    </div>
                </Tooltip>
            )),
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            sorter: valueSort('ip'),
            width: 150,
            fixed: 'left',
            ...GetColumnSearchProps('ip', (...args) => (
                <div style={{ whiteSpace: 'nowrap', maxWidth: '150px' }}>
                    <DeviceContent device={args[0]} />
                </div>
            )),
        },
        {
            title: '端口',
            dataIndex: 'showPort',
            width: 80,
            fixed: 'left',
            sorter: valueSort('showPort'),
            ...GetColumnSearchProps('showPort', (t, d, i, H) => {
                return (
                    <Tooltip title={t}>
                        <div style={{ ...ellipsisCell, maxWidth: '80px' }}>
                            <H>{t}</H>
                        </div>
                    </Tooltip>
                )
            }),
        },
        {
            title: '资产标签',
            dataIndex: 'desc',
            sorter: valueSort('desc'),
            render: d => calculateTags(d, '', 'asset'),
        },
        {
            title: '检出次数',
            dataIndex: 'activeCount',
            sorter: valueSort('activeCount'),
        },
        ...publicColumn,
    ],
    url: [
        {
            title: '网站',
            dataIndex: 'host',
            width: 200,
            fixed: 'left',
            sorter: valueSort('host'),
            ...GetColumnSearchProps('host', (t, d, i, H) => (
                <Tooltip title={t}>
                    <div style={{ ...ellipsisCell, maxWidth: '200px' }}>
                        <H>{t}</H>
                    </div>
                </Tooltip>
            )),
        },
        {
            title: 'URL',
            dataIndex: 'show_url',
            width: 200,
            fixed: 'left',
            sorter: valueSort('show_url'),
            ...GetColumnSearchProps('show_url', (t, d, i, H) => (
                <Tooltip title={t}>
                    <div style={{ ...ellipsisCell, maxWidth: '200px' }}>
                        <H>{t}</H>
                    </div>
                </Tooltip>
            )),
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            sorter: valueSort('ip'),
            width: 150,
            fixed: 'left',
            ...GetColumnSearchProps('ip', (...args) => (
                <div style={{ whiteSpace: 'nowrap', maxWidth: '150px' }}>
                    <DeviceContent device={args[0]} />
                </div>
            )),
        },
        {
            title: '端口',
            dataIndex: 'showPort',
            width: 80,
            sorter: valueSort('showPort'),
            fixed: 'left',
            ...GetColumnSearchProps('showPort', (t, d, i, H) => {
                const str = d.port.join()
                return (
                    <Tooltip title={str}>
                        <div style={{ ...ellipsisCell, maxWidth: '80px' }}>
                            <H>{str}</H>
                        </div>
                    </Tooltip>
                )
            }),
        },
        {
            title: '资产标签',
            dataIndex: 'desc',
            sorter: valueSort('desc'),
            render: d => calculateTags(d, '', 'asset'),
        },
        {
            title: '检出次数',
            dataIndex: 'activeCount',
            sorter: valueSort('activeCount'),
        },
        {
            title: '返回码',
            dataIndex: 'showRetCode',
            ...GetColumnSearchProps('showRetCode', (t, d, i, H) => {
                const str = d.retcode.join()
                return (
                    <div
                        style={{
                            width: '100px',
                            ...ellipsisCell,
                        }}
                    >
                        <Tooltip title={str}>
                            <H>{str}</H>
                        </Tooltip>
                    </div>
                )
            }),
        },
        ...publicColumn,
    ],
}

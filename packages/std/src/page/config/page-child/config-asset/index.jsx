import { openAddInternalIpModal } from '@shadowflow/components/ui/modal'
import { internalApi } from '@/service'
import { valueSort } from '@shadowflow/components/utils/universal/methods-table'
import React from 'react'
import ConfigTemplate from '../../components/config-template'
import { DeviceCell } from '../../components/table-cell'

const internalIpColumns = [
    {
        title: 'IP',
        dataIndex: 'ip',
        sorter: valueSort('ip'),
    },
    {
        title: '描述',
        dataIndex: 'desc',
        sorter: valueSort('desc'),
    },
    {
        title: '数据源',
        dataIndex: 'devid',
        sorter: valueSort('devid'),
        render: t => <DeviceCell id={t} />,
    },
]

export const assetConfigData = {
    title: '资产',
    path: '/config/asset',
    children: [
        {
            title: '资产配置',
            children: [
                {
                    title: '资产IP',
                    key: 'internal',
                    describe: '介绍：这是资产IP',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置IP资产组。
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
                    openModalFun: openAddInternalIpModal,
                    api: internalApi,
                    isActive: true,
                    columns: internalIpColumns,
                },
            ],
        },
    ],
}

export default function ConfigBwlist() {
    return <ConfigTemplate data={assetConfigData.children} />
}

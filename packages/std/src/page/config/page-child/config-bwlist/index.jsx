import { openAddBlackModal, openAddWhiteModal } from '@/components/modals'
import { blacklistApi, whitelistApi } from '@/service'
import { valueSort } from '@shadowflow/components/utils/universal/methods-table'
import { formatTimestamp } from '@shadowflow/components/utils/universal/methods-time'
import React from 'react'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import { JumpSpan } from '../../components/config-right-content/components/config-button'
import ConfigTemplate from '../../components/config-template'

const bwlistColumns = [
    {
        title: '描述',
        dataIndex: 'desc',
        sorter: valueSort('desc'),
    },
    {
        title: '创建时间',
        dataIndex: 'time',
        sorter: valueSort('time'),
        render: (t, d) => formatTimestamp(d.time),
    },
    {
        title: 'ip',
        dataIndex: 'ip',
        sorter: valueSort('ip'),
        width: 130,
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '端口',
        dataIndex: 'port',
        sorter: valueSort('port'),
        width: 80,
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
]

export const bwlistConfigData = {
    title: '黑白名单',
    path: '/config/bwlist',
    children: [
        {
            title: '黑白名单',
            children: [
                {
                    title: '白名单',
                    key: 'white',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置IP白名单。
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
                    openModalFun: openAddWhiteModal,
                    api: whitelistApi,
                    isActive: true,
                    columns: bwlistColumns,
                },
                {
                    title: '黑名单',
                    key: 'black',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置IP黑名单，通过
                                    <JumpSpan
                                        text='黑名单告警规则'
                                        path='/config/event'
                                        search={{
                                            pageParams: {
                                                active: 'eventblack',
                                            },
                                        }}
                                    />
                                    中的配置，当达到告警值后会产生告警事件。
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
                    api: blacklistApi,
                    openModalFun: openAddBlackModal,
                    isActive: false,
                    columns: bwlistColumns,
                },
            ],
        },
    ],
}

export default function ConfigBwlist() {
    return <ConfigTemplate data={bwlistConfigData.children} />
}

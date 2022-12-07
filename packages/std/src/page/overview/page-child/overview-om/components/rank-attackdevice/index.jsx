import { TableOutlined } from '@ant-design/icons'
import { inject, observer } from 'mobx-react'
import React from 'react'
import SkipContainer from '@/components/skip-container'
import { valueSort } from '@shadowflow/components/utils/universal/methods-table'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import { AntdTableSuper } from '@shadowflow/components/ui/antd-components-super'

function RankTable({ data, title, skipKey, params }) {
    const columns = [
        {
            title: title === '受害资产' ? '资产组' : '设备名',
            dataIndex: 'name',
            width: '40%',
            render: d => {
                if (title === '受害资产') return d.toString()
                return (
                    <DeviceOperate device={d} resultParams={params}>
                        <span>{d}</span>
                    </DeviceOperate>
                )
            },
        },
        {
            title: '事件数',
            dataIndex: 'eventCount',
            sorter: valueSort('eventCount'),
        },
        {
            title: '设备数',
            dataIndex: 'peerDeviceCount',
            // sorter: valueSort('peerDeviceCount'),
        },
        // {
        //     title: '攻击时长',
        //     dataIndex: 'duration',
        //     // sorter: valueSort('duration'),
        //     ellipsis: true,
        // },
        {
            title: '操作',
            width: '40px',
            align: 'center',
            render: (d, row) => {
                const filterCondition =
                    skipKey === 'asset_desc'
                        ? {
                              [skipKey]: row.name,
                          }
                        : {
                              device: {
                                  [skipKey]: row.name,
                              },
                          }
                return (
                    <SkipContainer
                        className='operate-content-active'
                        to={{
                            pathname: '/event/list',
                            search: {
                                filterCondition,
                                queryParams: params,
                            },
                        }}
                        noAfter
                        message='查看列表'
                    >
                        <TableOutlined />
                    </SkipContainer>
                )
            },
        },
    ]

    return (
        <AntdTableSuper
            headerTitle={`${title} Top 5`}
            options={false}
            dataSource={data}
            rowKey='name'
            size='small'
            columns={columns}
            pagination={false}
        />
    )
}

function RankAttackDevice({ rankData, params }) {
    return rankData.map(d => {
        return (
            <RankTable
                params={params}
                key={d.key}
                skipKey={d.key}
                title={d.title}
                data={d.data}
            />
        )
    })
}

export default inject(stores => ({
    params: stores.overviewOmStore.params,
    rankData: [
        stores.overviewOmStore.rankAttackDevice,
        stores.overviewOmStore.rankVictimDevice,
        stores.overviewOmStore.rankAssetDesc,
    ],
}))(observer(RankAttackDevice))

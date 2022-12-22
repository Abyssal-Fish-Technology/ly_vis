import { TriggerEventModal } from '@/components/modals'
import { showImportModal } from '@/components/modals/modal-import'
import { moApi } from '@/service'
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    SettingOutlined,
    SwapOutlined,
    DeleteOutlined,
    PlusOutlined,
    UploadOutlined,
    InfoCircleFilled,
    EditOutlined,
} from '@ant-design/icons'
import { AntdTableSuper } from '@shadowflow/components/ui/antd-components-super'
import { valueSort } from '@shadowflow/components/utils/universal/methods-table'
import { chain } from 'lodash'
import { Button, Menu, Popconfirm, message, Dropdown } from 'antd'
import { inject, observer } from 'mobx-react'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { openMoModal } from '@/components/modals/modal-config-mo'

import { TagAttribute } from '@shadowflow/components/ui/tag'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import RowOperate from '@shadowflow/components/ui/table/row-op'
import withAuth from '@shadowflow/components/ui/container/with-auth'
import ExpandCard from '../expand-card'
import { UpdateGroup } from '../group-modal'

function DeleteTrigger(props) {
    const { callback, children } = props
    return (
        <Popconfirm
            title='你确定要删除吗？'
            okText='确定'
            cancelText='取消'
            onConfirm={callback}
        >
            {children}
        </Popconfirm>
    )
}

function TableMo({ data, params, changeData, devid, userAuth = {} }) {
    const { handle_auth = false } = useMemo(() => userAuth, [userAuth])
    const [pageData, setPageData] = useState({})
    const updateList = useCallback(() => {
        moApi().then(res => {
            changeData({ mo: res })
        })
    }, [changeData])

    const deleteMo = useCallback(
        ids => {
            const promiseArr = []
            ids.forEach(id => {
                promiseArr.push(
                    moApi({
                        op: 'del',
                        moid: id,
                    })
                )
            })
            return Promise.all(promiseArr).then(() => {
                message.success('操作成功！')
                updateList()
            })
        },
        [updateList]
    )

    function calculateCellColor(eventInfoNumber, sortList, isEvent = true) {
        const [first, second, three] = sortList
        let color = ''
        if (eventInfoNumber === first) {
            color = isEvent ? '#FF6A6A' : 'rgb(34, 81, 247,.5)'
        }
        if (eventInfoNumber === second) {
            color = isEvent ? '#FFC1C1' : 'rgb(34, 81, 247,.3)'
        }
        if (eventInfoNumber === three) {
            color = isEvent ? '#FFE4E1' : 'rgb(34, 81, 247,.1)'
        }
        return color
    }

    function getEventInfoSortData(page, pageSize, currentData) {
        const nowData = currentData.slice(
            (page - 1) * pageSize,
            pageSize * page
        )
        const sortFun = field => {
            return chain(nowData)
                .orderBy(item => {
                    return field === 'eventInfo'
                        ? item.eventInfo.length
                        : item.featureInfo[`avg_${field}`]
                }, 'desc')
                .map(item => {
                    return field === 'eventInfo'
                        ? item.eventInfo.length
                        : item.featureInfo[field]
                })
                .filter(d => d !== 0)
                .uniq()
                .value()
        }

        const eventSort = sortFun('eventInfo')
        const bytesSort = sortFun('bytes')
        const pktsSort = sortFun('pkts')
        const flowsSort = sortFun('flows')

        return {
            eventSort,
            bytesSort,
            pktsSort,
            flowsSort,
        }
    }

    const [eventInfoSortData, setEventInfoSortData] = useState({
        eventSort: [],
        bytesSort: [],
        pktsSort: [],
        flowsSort: [],
    })
    const columns = useMemo(() => {
        const { eventSort, bytesSort, pktsSort, flowsSort } = eventInfoSortData
        return [
            {
                title: '描述',
                dataIndex: 'desc',
                sorter: valueSort('desc'),
                fixed: 'left',
                width: 120,
                onCell: record => {
                    return {
                        style: {
                            backgroundColor: calculateCellColor(
                                record.eventInfo.length,
                                eventSort
                            ),
                        },
                    }
                },
            },
            {
                title: '追踪目标IP',
                dataIndex: 'moip',
                sorter: valueSort('moip'),
                render: t => (
                    <DeviceOperate device={t} resultParams={params}>
                        <span>{t}</span>
                    </DeviceOperate>
                ),
                fixed: 'left',
                width: 120,
                onCell: record => {
                    return {
                        style: {
                            backgroundColor: calculateCellColor(
                                record.eventInfo.length,
                                eventSort
                            ),
                        },
                    }
                },
            },
            {
                title: '追踪目标端口',
                dataIndex: 'moport',
                sorter: valueSort('moport'),
                render: t => (
                    <DeviceOperate device={t} resultParams={params}>
                        <span>{t}</span>
                    </DeviceOperate>
                ),
                fixed: 'left',
                width: 80,
                onCell: record => {
                    return {
                        style: {
                            backgroundColor: calculateCellColor(
                                record.eventInfo.length,
                                eventSort
                            ),
                        },
                    }
                },
            },
            {
                title: '方向',
                dataIndex: 'direction',
                sorter: valueSort('direction'),
                render: direction => {
                    switch (direction) {
                        case 'IN':
                            return <ArrowLeftOutlined />
                        case 'OUT':
                            return <ArrowRightOutlined />
                        default:
                            return <SwapOutlined />
                    }
                },
                fixed: 'left',
                width: 60,
                onCell: record => {
                    return {
                        style: {
                            backgroundColor: calculateCellColor(
                                record.eventInfo.length,
                                eventSort
                            ),
                        },
                    }
                },
            },
            {
                title: '对端端口',
                dataIndex: 'pport',
                sorter: valueSort('pport'),
                render: t => (
                    <DeviceOperate device={t} resultParams={params}>
                        <span>{t}</span>
                    </DeviceOperate>
                ),
                fixed: 'left',
                width: 80,
                onCell: record => {
                    return {
                        style: {
                            backgroundColor: calculateCellColor(
                                record.eventInfo.length,
                                eventSort
                            ),
                        },
                    }
                },
            },
            {
                title: '对端IP',
                dataIndex: 'pip',
                sorter: valueSort('pip'),
                render: t => (
                    <DeviceOperate device={t} resultParams={params}>
                        <span>{t}</span>
                    </DeviceOperate>
                ),
                fixed: 'left',
                width: 120,
                onCell: record => {
                    return {
                        style: {
                            backgroundColor: calculateCellColor(
                                record.eventInfo.length,
                                eventSort
                            ),
                        },
                    }
                },
            },
            {
                title: '协议',
                dataIndex: 'protocol',
                width: 60,
                sorter: valueSort('protocol'),
            },
            {
                title: '事件命中',
                dataIndex: 'show_eventInfo',
                width: 80,
                sorter: valueSort('show_eventInfo'),
            },
            {
                title: '事件类型',
                dataIndex: 'show_eventType',
                sorter: valueSort('eventTypeArr'),
                render: d => (
                    <span>
                        {d.map(d2 => (
                            <TagAttribute key={d2} type='event'>
                                {d2}
                            </TagAttribute>
                        ))}
                    </span>
                ),
            },
            {
                title: '追踪分组',
                dataIndex: 'mogroup',
                width: 120,
                sorter: valueSort('groupid'),
                render: d => <TagAttribute type='mo'>{d}</TagAttribute>,
            },
            {
                title: '持续时间',
                dataIndex: 'show_duration',
                width: 120,
                sorter: valueSort('featureInfo', ['duration']),
            },
            {
                title: 'Bytes',
                dataIndex: 'show_bytes',
                width: 60,
                sorter: valueSort('featureInfo', ['bytes']),
                onCell: record => {
                    return {
                        style: {
                            backgroundColor: calculateCellColor(
                                record.featureInfo.bytes,
                                bytesSort,
                                false
                            ),
                        },
                    }
                },
            },
            {
                title: 'Pkts',
                dataIndex: 'show_pkts',
                width: 60,
                sorter: valueSort('featureInfo', ['pkts']),
                onCell: record => {
                    return {
                        style: {
                            backgroundColor: calculateCellColor(
                                record.featureInfo.pkts,
                                pktsSort,
                                false
                            ),
                        },
                    }
                },
            },
            {
                title: 'Flows',
                dataIndex: 'show_flows',
                width: 60,
                sorter: valueSort('featureInfo', ['flows']),
                onCell: record => {
                    return {
                        style: {
                            backgroundColor: calculateCellColor(
                                record.featureInfo.flows,
                                flowsSort,
                                false
                            ),
                        },
                    }
                },
            },
            {
                title: '告警配置',
                dataIndex: 'configInfo',
                width: 60,
                align: 'center',
                sorter: valueSort('configInfo'),
                render: (t, row) => (
                    <div
                        onClick={e => e.stopPropagation()}
                        className={handle_auth ? 'operate-content-active' : ''}
                    >
                        <Dropdown
                            disabled={!handle_auth}
                            arrow
                            placement='bottomCenter'
                            overlay={
                                <Menu>
                                    <Menu.Item>
                                        <TriggerEventModal
                                            type='mo'
                                            op='add'
                                            data={{
                                                eventConfig: {
                                                    moid: row.id,
                                                },
                                            }}
                                        >
                                            新增配置
                                        </TriggerEventModal>
                                    </Menu.Item>
                                    {t.map(configItem => (
                                        <Menu.Item key={configItem.id}>
                                            <TriggerEventModal
                                                type='mo'
                                                id={configItem.id}
                                                op='mod'
                                            >
                                                {configItem.desc}
                                            </TriggerEventModal>
                                        </Menu.Item>
                                    ))}
                                </Menu>
                            }
                        >
                            <div>
                                <span
                                    style={{
                                        marginRight: '10px',
                                    }}
                                >
                                    {t.length}
                                </span>
                                {handle_auth && <SettingOutlined />}
                            </div>
                        </Dropdown>
                    </div>
                ),
                fixed: 'right',
            },
            {
                title: '操作',
                dataIndex: 'id',
                key: 'auth_operate',
                width: 60,
                render: (t, d) => (
                    <RowOperate
                        operations={[
                            {
                                click: () => {
                                    return openMoModal({
                                        op: 'mod',
                                        data: d,
                                        id: d.id,
                                    })
                                },
                                icon: <EditOutlined />,
                                child: '修改',
                                key: 'auth_mod',
                            },
                            {
                                key: 'auth_del',
                                child: (
                                    <Popconfirm
                                        title='你确定要删除吗？'
                                        okText='确定'
                                        cancelText='取消'
                                        onConfirm={() => {
                                            deleteMo([d.id])
                                        }}
                                    >
                                        <span
                                            onClick={e2 => {
                                                e2.stopPropagation()
                                            }}
                                        >
                                            <DeleteOutlined />
                                            删除
                                        </span>
                                    </Popconfirm>
                                ),
                            },
                        ]}
                    />
                ),
                fixed: 'right',
            },
        ]
    }, [deleteMo, eventInfoSortData, handle_auth, params])
    const [selection, setselection] = useState([])
    const [expandedRowKeys, setExpandedRowKeys] = useState([])

    // 当表头排序后，data要根据排序变化，
    const [sortMoData, setSortMoData] = useState([])

    useEffect(() => {
        setExpandedRowKeys([])
        setselection([])
        setSortMoData(data)
    }, [data])

    const exportFields = useMemo(() => {
        return chain(columns)
            .map(item => {
                return { label: item.title, value: item.dataIndex }
            })
            .initial()
            .initial()
            .value()
    }, [columns])

    const selectData = useMemo(() => {
        return data.filter(item => selection.includes(item.id))
    }, [data, selection])

    useEffect(() => {
        const { page, size } = pageData
        setEventInfoSortData(getEventInfoSortData(page, size, sortMoData))
    }, [pageData, sortMoData])
    return (
        <AntdTableSuper
            rowKey='id'
            headerTitle='追踪条目列表'
            onChange={(pagination, filters, sorter, extra) => {
                const { currentDataSource, action } = extra
                if (action === 'sort') {
                    setSortMoData(currentDataSource)
                }
            }}
            dataSource={data}
            columns={columns}
            toolBarRender={() => [
                <Button
                    key='add'
                    icon={<PlusOutlined />}
                    onClick={() => {
                        openMoModal()
                    }}
                >
                    新增追踪条目
                </Button>,
                <Button
                    key='batch_add'
                    icon={<UploadOutlined />}
                    onClick={() => {
                        showImportModal(devid, updateList)
                    }}
                >
                    批量新增
                </Button>,
            ]}
            exportParams={{
                fields: exportFields,
                exportData: data,
                selectData,
                fileName: '追踪条目导出数据',
            }}
            tableAlertOptionRender={() => {
                return (
                    <div className='select-option'>
                        <DeleteTrigger
                            callback={() => {
                                deleteMo(selection)
                            }}
                        >
                            <Button
                                type='link'
                                danger
                                size='small'
                                icon={<InfoCircleFilled />}
                            >
                                批量删除
                            </Button>
                        </DeleteTrigger>
                        <UpdateGroup selection={selection} />
                    </div>
                )
            }}
            selectionCallBack={keys => setselection(keys)}
            expandedRowKeys={expandedRowKeys}
            expandable={{
                expandRowByClick: true,
                expandIconColumnIndex: -1,
                onExpand: (expanded, record) => {
                    if (expanded) {
                        setExpandedRowKeys([record.id])
                    } else {
                        setExpandedRowKeys([])
                    }
                },
                expandedRowRender: row => {
                    return <ExpandCard moinfo={row} params={params} />
                },
            }}
            changePageCallBack={page => setPageData(page)}
        />
    )
}
export default withAuth(
    inject(stores => ({
        data: stores.trackStore.tableData,
        params: stores.trackStore.params,
        changeData: stores.configStore.changeData,
        devid: stores.trackStore.params.devid,
    }))(observer(TableMo))
)

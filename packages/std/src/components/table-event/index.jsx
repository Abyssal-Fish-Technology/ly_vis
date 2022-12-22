import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react'
import { ExclamationCircleOutlined, ToolOutlined } from '@ant-design/icons'
import { Button, Popover, Space, Tooltip } from 'antd'
import { valueSort } from '@shadowflow/components/utils/universal/methods-table'
import { batchHandleEvent, formatEventData } from '@/utils/methods-event'
import {
    TdFlag,
    AntdTableSuper,
} from '@shadowflow/components/ui/antd-components-super'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import SkipContainer from '@/components/skip-container'

import style from './index.module.less'
import EventConfirm from './event-popconfirm'

/**
 * 事件表格
 * @param {data | Array} 传入的table原始数据
 * @param {isFormat | Boolean} 传入的table原始数据是否需要再次进行格式化处理
 * @returns
 */
function EventTable({ data, isFormat = false, resultParams = false }) {
    const [loading, setloading] = useState(false)
    useEffect(() => {
        setloading(false)
    }, [data])

    const [selection, setSelection] = useState([])

    const tableContainer = useRef(null)

    /**
     * 给当前跳转事件详情的行添加标记
     * 传入当前行的rowkey，ant-table的tr有一个data-row-key的属性，用这个属性值可以找到当前的行，添加ant-table自带的hover样式class(ant-table-row-selected)
     * 此时出了当前点击行需要添加selected样式之外还有本身就select的行有这个样式，排除一下，剩下的remove掉就行了
     */
    const calculateSelected = useCallback(
        rowid => {
            const rowList = tableContainer.current.querySelectorAll('tr')
            rowList.forEach(rowItem => {
                const nowRowId = rowItem.getAttribute('data-row-key')
                if (nowRowId === `${rowid}`) {
                    rowItem.classList.add('ant-table-row-selected')
                } else if (!selection.includes(Number(nowRowId))) {
                    rowItem.classList.remove('ant-table-row-selected')
                }
            })
        },
        [selection]
    )

    // 普通表格列
    const columns = useMemo(
        () => [
            {
                title: '规则描述',
                dataIndex: 'desc',
                width: 'auto',
                fixed: 'left',
            },
            {
                title: '威胁来源',
                dataIndex: 'attackDevice',
                fixed: 'left',
                sorter: valueSort('attackDevice'),
                width: '160px',
                render: (d, row) => (
                    <DeviceOperate device={d} resultParams={resultParams}>
                        <TdFlag ip={row.attackIp} />
                        <span>{d}</span>
                    </DeviceOperate>
                ),
            },
            {
                title: '受害目标',
                dataIndex: 'victimDevice',
                fixed: 'left',
                sorter: valueSort('victimDevice'),
                width: '160px',
                render: (d, row) => (
                    <DeviceOperate device={d} resultParams={resultParams}>
                        <TdFlag ip={row.victimIp} />
                        <span>{d}</span>
                    </DeviceOperate>
                ),
            },
            {
                title: '事件类型',
                dataIndex: 'show_type',
                sorter: valueSort('show_type'),
                render: d => {
                    const typeArr = d instanceof Array ? d : [d]
                    const result = typeArr.map(d1 => (
                        <TagAttribute type='event' key={d1}>
                            {d1}
                        </TagAttribute>
                    ))
                    return result
                },
            },
            {
                title: '详细类型',
                dataIndex: 'detailType',
                sorter: valueSort('detailType'),
                render: d => {
                    const result = d.map(d1 => (
                        <TagAttribute type='eventDetail' key={d1}>
                            {d1}
                        </TagAttribute>
                    ))
                    return result
                },
            },
            {
                title: '检测方法',
                dataIndex: 'show_model',
                render: d => {
                    return <TagAttribute type='asset'>{d}</TagAttribute>
                },
                sorter: valueSort('model'),
            },
            {
                title: '事件级别',
                dataIndex: 'show_level',
                render: d => <TagAttribute>{d}</TagAttribute>,
                sorter: valueSort('sort_level'),
            },
            {
                title: '发生时间',
                dataIndex: 'show_starttime',
                sorter: valueSort('starttime'),
            },
            {
                title: '持续时长',
                dataIndex: 'show_duration',
                sorter: valueSort('duration'),
            },
            {
                title: '是否活跃',
                dataIndex: 'show_is_alive',
                render: d => <TagAttribute>{d}</TagAttribute>,
                filters: [
                    { text: '活跃', value: '活跃' },
                    { text: '不活跃', value: '不活跃' },
                ],
                onFilter(v, d) {
                    return d.show_is_alive === v
                },
                filterMultiple: false,
            },
            {
                title: '处理状态',
                dataIndex: 'show_proc_status',
                fixed: 'right',
                width: 'auto',
                render: (d, row) => {
                    const obj = {
                        unprocessed: '激活',
                        processed: '处理',
                        assigned: '确认',
                    }
                    const [okStatus, calStatus] = Object.keys(obj).filter(
                        d1 => d1 !== row.proc_status
                    )

                    return (
                        <EventConfirm
                            okText={obj[okStatus]}
                            calText={obj[calStatus]}
                            okStatus={okStatus}
                            calStatus={calStatus}
                            id={row.id}
                            changeLoading={setloading}
                        >
                            <Tooltip title={row.proc_comment || '无描述'}>
                                <span
                                    className={`operate-content-active event-proc ${
                                        d === '未处理' ? 'unprocess' : ''
                                    }`}
                                >
                                    {d}
                                </span>
                            </Tooltip>
                        </EventConfirm>
                    )
                },
            },
            {
                title: 'ID',
                dataIndex: 'id',
                fixed: 'right',
                width: 'auto',
                render: d => {
                    return (
                        <span
                            className='event-id'
                            onClick={() => {
                                calculateSelected(d)
                            }}
                        >
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
                        </span>
                    )
                },
            },
        ],
        [calculateSelected, resultParams]
    )
    // 格式化表格原始数据
    const tabledata = useMemo(() => {
        return isFormat ? formatEventData(data) : data
    }, [data, isFormat])

    function processEvent(status) {
        batchHandleEvent({
            idList: selection,
            status,
            changeLoading: setloading,
            changeIdlist: setSelection,
        })
    }

    const PopoverContent = (
        <Space>
            <Button
                size='small'
                onClick={() => {
                    processEvent('unprocessed')
                }}
            >
                激活
            </Button>
            <Button
                size='small'
                type='primary'
                ghost
                onClick={() => {
                    processEvent('assigned')
                }}
            >
                确认
            </Button>
            <Button
                size='small'
                type='primary'
                onClick={() => {
                    processEvent('processed')
                }}
            >
                处理
            </Button>
        </Space>
    )

    const exportFields = useMemo(() => {
        const fieldsObj = {
            attackDevice: '威胁来源',
            victimDevice: '受害目标',
            stage: '事件阶段',
            show_type: '事件类型',
            show_starttime: '发生时间',
            show_endtime: '结束时间',
            show_duration: '持续时长',
            show_level: '事件级别',
            show_proc_status: '处理状态',
            show_is_alive: '活跃状态',
            desc: '描述信息',
        }
        return Object.keys(fieldsObj).map(d => ({
            label: fieldsObj[d],
            value: d,
        }))
    }, [])

    const selectExportData = useMemo(() => {
        return tabledata.filter(d => selection.includes(d.id))
    }, [selection, tabledata])

    return (
        <div className={style['event-table']} ref={tableContainer}>
            <AntdTableSuper
                ipKeys={['attackIp', 'victimIp']}
                loading={loading}
                rowKey='id'
                headerTitle='事件列表'
                dataSource={tabledata}
                columns={columns}
                exportParams={{
                    fields: exportFields,
                    exportData: tabledata,
                    selectData: selectExportData,
                    fileName: '事件数据',
                }}
                tableAlertOptionRender={() => {
                    return (
                        <Popover
                            key='plcl'
                            content={PopoverContent}
                            trigger='click'
                            overlayClassName='popover-style'
                            title={() => (
                                <>
                                    <ExclamationCircleOutlined />
                                    修改处理状态
                                </>
                            )}
                            getPopupContainer={() => tableContainer.current}
                        >
                            <Button icon={<ToolOutlined />} type='link'>
                                批量处理
                            </Button>
                        </Popover>
                    )
                }}
                selectionCallBack={selectKeys => {
                    setSelection(selectKeys)
                }}
            />
        </div>
    )
}

export default EventTable

import React, { useMemo, useState } from 'react'
import { Icon, message, Tooltip } from 'antd'
import { chain, cloneDeep } from 'lodash'
import { formateUTC } from '@shadowflow/components/utils/universal/methods-time'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { AntdTableSuper } from '@shadowflow/components/ui/antd-components-super'
import style from './index.module.less'

export default function TableList({ tableData = [] }) {
    const [expanded, setExpanded] = useState([])

    const useTableData = useMemo(() => {
        return chain(tableData)
            .map(d => {
                const { data } = d
                const newData = data.map(d2 => {
                    const { time = [] } = d2
                    return {
                        ...d2,
                        showTime: formateUTC(time[0]),
                        sortTime: time[0],
                    }
                })
                return {
                    ...d,
                    data: newData,
                }
            })
            .value()
    }, [tableData])

    const calculateFilterArr = (data, key) => {
        return chain(data)
            .map(key)
            .uniq()
            .map(d => {
                return {
                    text: d,
                    value: d,
                }
            })
            .value()
    }

    const srcColumns = useMemo(
        () => [
            {
                title: '最新更新时间',
                dataIndex: 'showTime',
                width: 250,
                sorter: 'sortTime',
            },
            {
                title: '标签',
                dataIndex: 'tag',
                width: 150,
                render: val => <TagAttribute type='event'>{val}</TagAttribute>,
                onFilter: (val, d) => d.tag === val,
                sorter: (a, b) => {
                    return a.tag.localeCompare(b.tag)
                },
            },
            {
                title: '扩展信息',
                dataIndex: 'ext',
                render: (d, val) => (
                    <ExclamationCircleFilled
                        style={{
                            color: val.ext.length > 0 ? '#1890ff' : '#c3c3c3',
                        }}
                    />
                ),
                width: 150,
            },
            {
                title: '描述信息',
                dataIndex: 'desc',
                className: 'table-cmp-desc',
                render: d => {
                    let result = (
                        <div>
                            {`1、${d.length ? d[0] : ''}...`}
                            <Tooltip
                                title={d.map((d1, i) => {
                                    return (
                                        <div key={d1}>{`${i + 1}、${d1}`}</div>
                                    )
                                })}
                            >
                                <Icon type='caret-down' />
                            </Tooltip>
                        </div>
                    )
                    if (d.length === 0) result = ''
                    if (d.length === 1) {
                        ;[result] = d
                    }
                    return result
                },
            },
        ],
        []
    )

    const handleExpand = (e, d) => {
        if (d.ext.length === 0) {
            message.warning('暂无扩展信息')
            return
        }
        setExpanded(e ? [`${d.src}-${d.tag}`] : [])
    }

    return (
        <div className={style['tableList-cmp']}>
            {useTableData.map(sd => {
                const columns = cloneDeep(srcColumns)
                const key = sd.type === 'tag' ? 'src' : 'tag'
                if (sd.type === 'tag') {
                    columns[1] = {
                        title: '来源',
                        dataIndex: 'src',
                        width: 150,
                        render: val => (
                            <TagAttribute type='asset'>{val}</TagAttribute>
                        ),
                        onFilter: (val, d) => d.src === val,
                        sorter: (a, b) => {
                            return a.src.localeCompare(b.tag)
                        },
                    }
                }
                const filters = calculateFilterArr(sd.data, key)
                columns[1].filters = filters
                return (
                    <div id={sd.name} className='list-item' key={sd.name}>
                        <div className='list-item-header'>
                            <span>{sd.name}</span>
                        </div>
                        <div className='list-item-table'>
                            <AntdTableSuper
                                pagination={{
                                    size: 'small',
                                }}
                                options={false}
                                dataSource={sd.data}
                                columns={columns}
                                rowKey={d => `${d.src}-${d.tag}`}
                                onExpand={handleExpand}
                                expandIconAsCell={false}
                                expandIconColumnIndex={-1}
                                expandRowByClick
                                expandedRowRender={record => (
                                    <div
                                        key={`${record.src}-${record.tag}-expand`}
                                        className='list-item-expand'
                                    >
                                        {record.ext.map(d => `${d}\n`)}
                                    </div>
                                )}
                                expandedRowKeys={expanded}
                                showBoxShadow={false}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

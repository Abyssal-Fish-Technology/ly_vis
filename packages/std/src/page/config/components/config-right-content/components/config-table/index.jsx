import RowOperate from '@shadowflow/components/ui/table/row-op'
import {
    DeleteOutlined,
    EditOutlined,
    InfoCircleFilled,
} from '@ant-design/icons'
import { Button, message, Popconfirm } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { AntdTableSuper } from '@shadowflow/components/ui/antd-components-super'
import { translateEventLevel } from '@shadowflow/components/system/event-system'
import { find } from 'lodash'
import { DeleteTrigger } from '../config-button'

function ConfigTable({
    columns, // 表格列
    api, // 删除用的api
    openModalFun, // 添加弹窗打开方法
    ExpandableCard = null, // 展开信息组件
    deleteCallback = null, // 删除方法回调
    configDataKey = '', // 当前table数据在configStore中变量名称
    modalType = '', // 弹窗的type，主要用于规则页面配置
    deleteDataFn = null, // 外部传入的删除方法，用于需要额外删除方法的页面
    editFn = null, // 外部传入的编辑方法，和删除方法一样
    configStore, // inject传入的configStore
}) {
    const { changeData, moGroup = [] } = configStore
    const [nowConfigKey = '', configDataType = ''] = useMemo(
        () => configDataKey.split('|'),
        [configDataKey]
    )

    const useConfigTableData = useMemo(
        () => {
            const typeKey = nowConfigKey === 'mo' ? 'mogroup' : 'event_type'
            return ['mo', 'event'].includes(nowConfigKey)
                ? configStore[`${nowConfigKey}`].filter(
                      d => d[typeKey] === configDataType
                  )
                : configStore[`${nowConfigKey}`] || []
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [configStore[`${nowConfigKey}`], configDataType]
    )

    const [selection, setselection] = useState([])

    useEffect(() => {
        useConfigTableData.forEach(d => {
            if (d.event_level) {
                d.sort_level = translateEventLevel(d.event_level, true)
            }
        })
    }, [useConfigTableData])

    /**
     * 列表数据删除方法
     *  @param {Array} ids 数据id数组
     *  api 是从外部传入的，每个页面自己的api
     * dataKey 当前页面的key，对应configStore中变量名称
     * changeData 更新configStore数据的方法 {key:value} key：变量名 value：data
     */
    const onDelete = useCallback(
        ids => {
            const promiseArr = []
            ids.forEach(rowsId => {
                promiseArr.push(
                    api({
                        op: 'del',
                        id: rowsId,
                    })
                )
            })
            return Promise.all(promiseArr).then(() => {
                api().then(res => {
                    message.success('操作成功！')
                    changeData({ [configDataKey]: res })
                    setselection([])
                    if (deleteCallback) {
                        deleteCallback()
                    }
                })
            })
        },
        [api, changeData, configDataKey, deleteCallback]
    )

    const [expandedRowKeys, setExpandedRowKeys] = useState([])
    const currentColumns = useMemo(() => {
        const nowColumns = [
            ...columns,
            {
                title: '操作',
                key: 'auth',
                align: 'center',
                fixed: 'right',
                width: 80,
                render: (t, row) => (
                    <RowOperate
                        operations={[
                            {
                                key: nowConfigKey === 'userList' ? '' : 'auth',
                                click: () => {
                                    return editFn
                                        ? editFn(row)
                                        : openModalFun({
                                              op: 'mod',
                                              data: row,
                                              id: row.id,
                                              type: modalType || '',
                                          })
                                },
                                icon: <EditOutlined />,
                                child: '修改',
                            },
                            {
                                key:
                                    nowConfigKey === 'userList'
                                        ? 'auth_admin'
                                        : 'auth',
                                child: (
                                    <Popconfirm
                                        title='你确定要删除吗？'
                                        okText='确定'
                                        cancelText='取消'
                                        onConfirm={() => {
                                            return deleteDataFn
                                                ? deleteDataFn(
                                                      [row],
                                                      modalType,
                                                      changeData
                                                  ).then(() => {
                                                      setselection([])
                                                  })
                                                : onDelete([row.id])
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
            },
        ]
        return nowColumns
    }, [
        columns,
        nowConfigKey,
        editFn,
        openModalFun,
        modalType,
        deleteDataFn,
        changeData,
        onDelete,
    ])

    const buttonText = useMemo(() => {
        const textObj = {
            event: '告警规则',
            eventAction: '事件动作',
            eventIgnore: '事件忽略',
            white: '白名单',
            black: '黑名单',
            internal: '资产组',
            mo: '追踪条目',
            moGroup: '追踪分组',
            device: '数据节点',
            proxy: '分析节点',
            userList: '用户',
        }
        return textObj[nowConfigKey]
    }, [nowConfigKey])

    return (
        <AntdTableSuper
            rowKey='id'
            columns={currentColumns}
            dataSource={useConfigTableData}
            toolBarRender={() => [
                <Button
                    key='add'
                    type='primary'
                    onClick={() => {
                        const addParams = { type: modalType || '' }
                        if (modalType === 'mo') {
                            const { id = '' } =
                                find(moGroup, d => d.name === configDataType) ||
                                {}
                            addParams.data = { groupid: id }
                        }
                        openModalFun(addParams)
                    }}
                >
                    新增{buttonText}
                </Button>,
            ]}
            selectionCallBack={keys => {
                setselection(keys)
            }}
            tableAlertRender={({ selectedRowKeys, onCleanSelected }) => {
                return (
                    <div className='select-info-box'>
                        已选择
                        <span className='select-number'>
                            {selectedRowKeys.length}
                        </span>
                        项目
                        <Button type='link' onClick={() => onCleanSelected()}>
                            取消选择
                        </Button>
                    </div>
                )
            }}
            tableAlertOptionRender={() => {
                return (
                    <div className='select-option'>
                        <DeleteTrigger
                            callback={() => {
                                return deleteDataFn
                                    ? deleteDataFn(
                                          useConfigTableData.filter(d =>
                                              selection.includes(d.id)
                                          ),
                                          modalType,
                                          changeData
                                      ).then(() => {
                                          setselection([])
                                      })
                                    : onDelete(selection)
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
                    </div>
                )
            }}
            expandedRowKeys={expandedRowKeys}
            expandable={
                ExpandableCard
                    ? {
                          expandIconColumnIndex: -1,
                          expandRowByClick: true,
                          onExpand: (expanded, record) => {
                              if (expanded) {
                                  setExpandedRowKeys([record.id])
                              } else {
                                  setExpandedRowKeys([])
                              }
                          },
                          expandedRowRender: rd => {
                              return <ExpandableCard record={rd} />
                          },
                      }
                    : null
            }
            showBoxShadow={false}
            onlyAdmin={['device', 'proxy', 'userList'].includes(nowConfigKey)}
        />
    )
}

export default inject('configStore')(observer(ConfigTable))

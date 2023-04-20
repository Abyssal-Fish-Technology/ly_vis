import { openMoGroupModal } from '@/components/modals/modal-mo-group'
import { openMoModal } from '@/components/modals/modal-config-mo'
import configStore from '@/layout/components/config/store'
import { moApi, mogroupApi } from '@/service'
import { formatTimestamp } from '@shadowflow/components/utils/universal/methods-time'
import { Descriptions, message } from 'antd'
import { action, observable, reaction } from 'mobx'
import { inject, observer } from 'mobx-react'
import React, { useCallback } from 'react'
import { formatterMoField } from '@shadowflow/components/utils/universal/methods-form'
import find from 'lodash.find'
import { valueSort } from '@shadowflow/components/utils/universal/methods-table'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import ConfigTemplate from '../../components/config-template'
import { DeviceCell } from '../../components/table-cell'
import { JumpSpan } from '../../components/config-right-content/components/config-button'

const moColumns = [
    {
        title: 'ID',
        dataIndex: 'id',
        sorter: valueSort(''),
    },
    {
        title: '描述',
        dataIndex: 'desc',
        sorter: valueSort('desc'),
    },
    {
        title: '追踪目标IP',
        dataIndex: 'moip',
        sorter: valueSort('moip'),
        width: 130,
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '追踪目标端口',
        dataIndex: 'moport',
        sorter: valueSort('moport'),
        width: 80,
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: 'pip',
        dataIndex: 'pip',
        sorter: valueSort('pip'),
        width: 130,
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: 'p端口',
        dataIndex: 'pport',
        sorter: valueSort('pport'),
        width: 80,
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '协议',
        dataIndex: 'protocol',
        sorter: valueSort('protocol'),
    },
    {
        title: '标签',
        dataIndex: 'tag',
        sorter: valueSort('tag'),
    },
    {
        title: '添加时间',
        dataIndex: 'addtime',
        sorter: valueSort('addtime'),
        render: (t, d) => formatTimestamp(d.addtime),
    },
    {
        title: '数据源',
        dataIndex: 'devid',
        sorter: valueSort('devid'),
        render: t => <DeviceCell id={t} />,
    },
    {
        title: '方向',
        dataIndex: 'direction',
        sorter: valueSort('direction'),
    },
]

const moGroupColumns = [
    {
        title: 'ID',
        dataIndex: 'id',
        sorter: valueSort('id'),
        width: 120,
    },
    {
        title: '名称',
        dataIndex: 'name',
        sorter: valueSort('name'),
    },
]

function deleteFn(rows, modalType, changeData) {
    const api = modalType === 'moGroup' ? mogroupApi : moApi
    const promiseArr = []
    rows.forEach(d => {
        promiseArr.push(
            api({
                op: modalType === 'moGroup' ? 'gdel' : 'del',
                [`${modalType === 'moGroup' ? 'id' : 'moid'}`]: d.id,
            })
        )
    })
    return Promise.allSettled(promiseArr).then(promises => {
        if (!find(promises, d => d.status === 'rejected')) {
            message.success('操作成功！')
        }

        if (modalType !== 'moGroup') {
            moApi().then(res => {
                changeData({ mo: res })
            })
        } else {
            mogroupApi().then(res => {
                changeData({ moGroup: res })
            })
        }
    })
}

const ExpandableCard = inject('configStore')(
    observer(function ExpandableCard({ record }) {
        const { device } = configStore

        const formatterMo = useCallback(
            (field, value) => {
                let result = ''
                switch (field) {
                    case 'addtime':
                        result = value ? formatTimestamp(value) : ''
                        break
                    case 'devid':
                        result = value
                            ? find(device, d => d.id === Number(value)).name
                            : ''
                        break
                    default:
                        result = value
                        break
                }
                return result
            },
            [device]
        )
        return (
            <Descriptions
                column='1'
                labelStyle={{
                    fontWeight: 'bolder',
                }}
            >
                {Object.entries(record).map(objItem => {
                    const [field, value] = objItem
                    return (
                        <Descriptions.Item
                            span={3}
                            label={formatterMoField(field)}
                            key={field}
                        >
                            {formatterMo(field, value)}
                        </Descriptions.Item>
                    )
                })}
            </Descriptions>
        )
    })
)

class ConfigMoStore {
    @observable moConfigData = {
        title: '追踪',
        path: '/config/mo',
        children: [],
    }

    @action.bound change(groupData) {
        const newData = {
            title: '追踪',
            path: '/config/mo',
            children: [
                {
                    title: '追踪条目',
                    children: groupData.map(d1 => {
                        return {
                            title: d1.name,
                            key: `mo|${d1.name}`,
                            describe: `介绍：这是${d1.name}`,
                            CreateDescribe: () => {
                                return (
                                    <>
                                        <div>功能简介：</div>
                                        <div className='paragraph-content'>
                                            本页面是配置
                                            <span className='strong-text'>
                                                {d1.name}
                                            </span>
                                            组的追踪目标，通过
                                            <JumpSpan
                                                text='追踪事件告警'
                                                path='/config/event'
                                                search={{
                                                    pageParams: {
                                                        active: 'eventmo',
                                                    },
                                                }}
                                            />
                                            配置，对追踪目标进行监控，当达到告警条件后即生成追踪告警事件。
                                        </div>
                                        <div className='paragraph-content '>
                                            支持
                                            <span className='strong-text'>
                                                新增
                                            </span>
                                            、
                                            <span className='strong-text'>
                                                修改
                                            </span>
                                            、
                                            <span className='strong-text'>
                                                删除
                                            </span>
                                            操作。
                                        </div>
                                    </>
                                )
                            },
                            openModalFun: openMoModal,
                            deleteDataFn: deleteFn,
                            modalType: `mo`,
                            isActive: true,
                            columns: moColumns,
                            ExpandableCard,
                        }
                    }),
                },
                {
                    title: '追踪分组',
                    children: [
                        {
                            title: '分组信息',
                            key: 'moGroup',
                            CreateDescribe: () => {
                                return (
                                    <>
                                        <div>功能简介：</div>
                                        <div className='paragraph-content'>
                                            本页面是配置追踪分组，主要用于追踪条目分组。
                                        </div>
                                        <div className='paragraph-content '>
                                            支持
                                            <span className='strong-text'>
                                                新增
                                            </span>
                                            、
                                            <span className='strong-text'>
                                                删除
                                            </span>
                                            操作。
                                        </div>
                                    </>
                                )
                            },
                            modalType: `moGroup`,
                            openModalFun: openMoGroupModal,
                            deleteDataFn: deleteFn,
                            isActive: false,
                            columns: moGroupColumns,

                            editAuth: [],
                        },
                    ],
                },
            ],
        }
        this.moConfigData = newData
    }
}

export const configMoStore = new ConfigMoStore()

reaction(
    () => configStore.moGroup,
    d => {
        configMoStore.change(d)
    }
)

export default observer(function ConfigMo() {
    return <ConfigTemplate data={configMoStore.moConfigData.children} />
})

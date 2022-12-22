import { MoSelect } from '@/components/form-components'
import Section from '@shadowflow/components/ui/layout/section'
import FormFilter from '@shadowflow/components/ui/form/form-filter'
import { Col, Input, Row } from 'antd'
import { chain } from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useMemo, useState } from 'react'

/**
 * 自定义设备查询
 * @param {Object} value
 * 表单值，有两种
 * 模糊模式:
 *  {
 *      allDevice:''
    }
 * 精准模式:
    {
        attackDevice: '',
        victimDevice: ''
    }
* @returns
 */
function EventDeviceFilter({ value = { allDevice: '' }, onChange }) {
    const translateDict = {
        attackDevice: '威胁来源',
        victimDevice: '受害目标',
        allDevice: '设备信息',
    }
    const [isExact, setisExact] = useState(false)

    useEffect(() => {
        let newisExact = true
        if (
            Object.hasOwnProperty.call(value, 'attackDevice') ||
            Object.hasOwnProperty.call(value, 'victimDevice')
        ) {
            newisExact = false
        }

        if (newisExact !== isExact) setisExact(newisExact)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    const keyArr = useMemo(() => {
        return !isExact ? ['attackDevice', 'victimDevice'] : ['allDevice']
    }, [isExact])

    function triggerChange(key, newValue) {
        const valueObj = {
            ...value,
            [key]: newValue,
        }
        const result = keyArr.reduce((obj, keyItem) => {
            obj[keyItem] = valueObj[keyItem]
            return obj
        }, {})
        onChange(result)
    }

    return (
        <Row align='middle' gutter={10}>
            {keyArr.map((keyItem, i) => {
                return [
                    <Col span={6} key={keyItem}>
                        <Input
                            placeholder={translateDict[keyItem]}
                            value={value[keyItem]}
                            onChange={e => {
                                triggerChange(keyItem, e.target.value)
                            }}
                            allowClear
                        />
                    </Col>,
                    i % 2 === 0 && keyArr.length > 1 && ':',
                ]
            })}

            <span
                onClick={() => {
                    setisExact(!isExact)
                    const newkeyArr = !isExact
                        ? ['allDevice']
                        : ['attackDevice', 'victimDevice']
                    onChange(
                        newkeyArr.reduce((obj, d) => {
                            obj[d] = ''
                            return obj
                        }, {})
                    )
                }}
                style={{ cursor: 'pointer', color: 'var(--text-blue)' }}
            >
                {isExact ? '精准查询' : '模糊查询'}
            </span>
        </Row>
    )
}

function EventIdInput({ value = '', onChange }) {
    return (
        <Row>
            <Col span={16}>
                <Input
                    allowClear
                    value={value}
                    onChange={e => {
                        onChange(e.target.value)
                    }}
                />
            </Col>
        </Row>
    )
}

function EventFitler({
    formatData,
    changeFilterCondition,
    getForm,
    filterContainer,
}) {
    const filterCondition = useMemo(() => {
        const eventTypeArr = chain(formatData)
            .uniqBy('show_type')
            .map(d => ({
                value: d.show_type,
                name: d.show_type,
            }))
            .value()

        const protocolArr = chain(formatData)
            .uniqBy('protocol')
            .map(d => ({
                name: d.protocol,
                value: d.protocol,
            }))
            .filter(d => d.value)
            .value()

        const assetDescArr = chain(formatData)
            .map('asset_desc')
            .flatten()
            .uniq()
            .map(d => ({
                name: d,
                value: d,
            }))
            .value()

        const detailTypeArr = chain(formatData)
            .map('detailType')
            .flatten()
            .uniq()
            .filter(d => d)
            .map(d => ({
                name: d,
                value: d,
            }))
            .value()

        return [
            {
                name: 'id',
                label: '事件ID',
                content: <EventIdInput />,
                type: 'custom',
                basic: true,
            },
            {
                name: 'device',
                label: '设备查询',
                content: <EventDeviceFilter />,
                type: 'custom',
                basic: true,
                colSize: 2,
            },
            {
                name: 'moid',
                label: '追踪目标',
                content: (
                    <MoSelect
                        inputProps={{
                            style: {
                                width: '160px',
                            },
                        }}
                        name='moid'
                        initialValue=''
                    />
                ),
                type: 'custom',
                colSize: 3,
            },
            {
                name: 'level',
                label: '事件级别',
                tagArr: [
                    {
                        name: '极高',
                        value: 'extra_high',
                    },
                    {
                        name: '高',
                        value: 'high',
                    },
                    {
                        name: '中',
                        value: 'middle',
                    },
                    {
                        name: '低',
                        value: 'low',
                    },
                    {
                        name: '极低',
                        value: 'extra_low',
                    },
                ],
                type: 'tag',
            },
            {
                name: 'proc_status',
                label: '处理状态',
                type: 'tag',
                tagArr: [
                    {
                        name: '未处理',
                        value: 'unprocessed',
                    },
                    {
                        name: '已处理',
                        value: 'processed',
                    },
                    {
                        name: '已确认',
                        value: 'assigned',
                    },
                ],
            },
            {
                name: 'is_alive',
                label: '活跃状态',
                type: 'tag',
                tagArr: [
                    {
                        name: '活跃',
                        value: 1,
                    },
                    {
                        name: '不活跃',
                        value: 0,
                    },
                ],
            },
            {
                name: 'show_type',
                label: '事件类型',
                type: 'tag',
                tagArr: eventTypeArr,
                basic: true,
            },
            {
                name: 'detailType',
                label: '详细类型',
                type: 'tag',
                tagArr: detailTypeArr,
                basic: true,
            },
            {
                name: 'protocol',
                label: '协议',
                type: 'tag',
                tagArr: protocolArr,
            },
            {
                name: 'asset_desc',
                label: '资产组',
                type: 'tag',
                tagArr: assetDescArr,
            },
        ]
    }, [formatData])

    return (
        <Section title='筛选查询' className='filter-form'>
            <FormFilter
                getForm={getForm}
                formContent={filterCondition}
                callback={changeFilterCondition}
                filterBarWrapperSelector={filterContainer}
            />
        </Section>
    )
}

export default inject(stores => ({
    getForm: stores.eventListStore.getForm,
    changeFilterCondition: stores.eventListStore.changeFilterCondition,
    formatData: stores.eventListStore.formatData,
}))(observer(EventFitler))

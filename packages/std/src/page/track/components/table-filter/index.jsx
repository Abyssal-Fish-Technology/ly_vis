import Section from '@shadowflow/components/ui/layout/section'
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    SwapOutlined,
} from '@ant-design/icons'
import { chain } from 'lodash'
import { Input, Row, Col } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useMemo, useState } from 'react'
import FormFilter from '@shadowflow/components/ui/form/form-filter'

function MoDeviceFilter({ value = {}, onChange }) {
    const {
        ip = '',
        port = '',
        moip = '',
        moport = '',
        pip = '',
        pport = '',
    } = value
    const [isExact, setisExact] = useState(false)
    const keyArr = useMemo(() => {
        return isExact ? ['moip', 'moport', 'pip', 'pport'] : ['ip', 'port']
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

    function resetValue() {
        onChange(
            keyArr.reduce((obj, d) => {
                obj[d] = ''
                return obj
            }, {})
        )
    }

    return (
        <Row align='middle' gutter={10}>
            {!isExact ? (
                <>
                    <Col span={4}>
                        <Input
                            placeholder='IP'
                            value={ip}
                            onChange={e => {
                                triggerChange('ip', e.target.value)
                            }}
                        />
                    </Col>
                    <Col span={3}>
                        <Input
                            placeholder='端口'
                            value={port}
                            onChange={e => {
                                triggerChange('port', e.target.value)
                            }}
                        />
                    </Col>
                </>
            ) : (
                <>
                    <Col span={4}>
                        <Input
                            placeholder='追踪目标IP'
                            value={moip}
                            onChange={e => {
                                triggerChange('moip', e.target.value)
                            }}
                        />
                    </Col>
                    <Col span={3}>
                        <Input
                            placeholder='追踪目标端口'
                            value={moport}
                            onChange={e => {
                                triggerChange('moport', e.target.value)
                            }}
                        />
                    </Col>
                    <Col span={4}>
                        <Input
                            placeholder='对端IP'
                            value={pip}
                            onChange={e => {
                                triggerChange('pip', e.target.value)
                            }}
                        />
                    </Col>
                    <Col span={3}>
                        <Input
                            placeholder='对端端口'
                            value={pport}
                            onChange={e => {
                                triggerChange('pport', e.target.value)
                            }}
                        />
                    </Col>
                </>
            )}

            <span
                onClick={() => {
                    setisExact(!isExact)
                    resetValue()
                }}
                style={{ cursor: 'pointer', color: 'var(--text-blue)' }}
            >
                {isExact ? '模糊查询' : '精准查询'}
            </span>
        </Row>
    )
}

function MoFilter({ moGroupData, moData, changeFilterCondition }) {
    const filterCondition = useMemo(() => {
        const protocolArr = chain(moData)
            .map('protocol')
            .uniq()
            .map(d => ({
                name: d || '无协议',
                value: d,
            }))
            .value()
        return [
            {
                name: 'mo',
                label: '设备查询',
                content: <MoDeviceFilter />,
                type: 'custom',
                basic: true,
                colSize: 3,
            },
            {
                name: 'mogroup',
                label: '追踪分组',
                tagArr: moGroupData.map(groupItem => ({
                    name: groupItem.name,
                    value: groupItem.name,
                })),
                type: 'tag',
                basic: true,
            },
            {
                name: 'isEvent',
                label: '事件命中',
                type: 'tag',
                tagArr: [
                    {
                        name: '有命中',
                        value: true,
                    },
                    {
                        name: '无命中',
                        value: false,
                    },
                ],
            },
            {
                name: 'isConfig',
                label: '告警配置',
                type: 'tag',
                tagArr: [
                    {
                        name: '已配置',
                        value: true,
                    },
                    {
                        name: '无配置',
                        value: false,
                    },
                ],
            },
            {
                name: 'isFeature',
                label: '有无流量',
                type: 'tag',
                tagArr: [
                    {
                        name: '有流量',
                        value: true,
                    },
                    {
                        name: '无流量',
                        value: false,
                    },
                ],
            },
            {
                name: 'protocol',
                label: '协议',
                type: 'tag',
                tagArr: protocolArr,
            },
            {
                name: 'direction',
                label: '方向',
                type: 'tag',
                tagArr: [
                    {
                        name: <SwapOutlined />,
                        value: 'ALL',
                    },
                    {
                        name: <ArrowLeftOutlined />,
                        value: 'IN',
                    },
                    {
                        name: <ArrowRightOutlined />,
                        value: 'OUT',
                    },
                ],
            },
        ]
    }, [moData, moGroupData])
    return (
        <Section title='查询条件'>
            <FormFilter
                formContent={filterCondition}
                callback={changeFilterCondition}
                filterBarWrapperSelector='.mo-filter-condition'
            />
        </Section>
    )
}

export default inject(stores => ({
    moGroupData: stores.trackStore.moGroupData,
    moData: stores.trackStore.moData,
    changeFilterCondition: stores.trackStore.changeFilterCondition,
}))(observer(MoFilter))

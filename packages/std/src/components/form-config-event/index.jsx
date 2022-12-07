import React, { Fragment } from 'react'
import { Input, Select, Form, Tooltip } from 'antd'
import { EventConfig } from '@shadowflow/components/system/event-system'
import { PlusOutlined, QuestionCircleFilled } from '@ant-design/icons'
import { MoSelect } from '../form-components'
import { openMoModal } from '../modals/modal-config-mo'

export default function EventConfigForm({
    eventType,
    namespace = 'eventConfig',
    ...props
}) {
    if (!EventConfig[eventType]) return () => '暂无此类型'
    const { forms } = EventConfig[eventType].config
    const initValue = {}
    forms.forEach(d => {
        if (d.valueKey !== 'moid') {
            initValue[d.valueKey] = d.options ? d.options[0] : ''
        }
    })

    return (
        <Form
            {...props}
            initialValues={{
                [namespace]: initValue,
            }}
        >
            {forms.map(d => {
                const {
                    label,
                    valueKey,
                    options,
                    placeholder,
                    required = false,
                } = d
                return valueKey === 'moid' && eventType === 'mo' ? (
                    <Fragment key='moid'>
                        <MoSelect
                            name={[namespace, 'moid']}
                            label={label}
                            rules={[
                                {
                                    required,
                                    message: `请选择${label}`,
                                },
                            ]}
                        />
                        <Tooltip title='添加监控追踪条目'>
                            <PlusOutlined
                                onClick={() => {
                                    openMoModal()
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '50%',
                                    zIndex: 1,
                                    fontSize: '16px',
                                }}
                            />
                        </Tooltip>
                        <Form.Item />
                    </Fragment>
                ) : (
                    <Form.Item
                        key={valueKey}
                        name={[namespace, valueKey]}
                        label={label}
                        rules={[
                            {
                                required,
                                message: `请输入${label}`,
                            },
                        ]}
                    >
                        {options ? (
                            <Select>
                                {options.map(o => {
                                    return (
                                        <Select.Option key={o} value={o}>
                                            {o || '全部'}
                                        </Select.Option>
                                    )
                                })}
                            </Select>
                        ) : (
                            <Input
                                suffix={
                                    <>
                                        {placeholder && (
                                            <Tooltip title={placeholder}>
                                                <QuestionCircleFilled className='suffix-icon' />
                                            </Tooltip>
                                        )}
                                    </>
                                }
                            />
                        )}
                    </Form.Item>
                )
            })}
        </Form>
    )
}

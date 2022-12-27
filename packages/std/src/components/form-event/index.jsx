import React, { useEffect } from 'react'
import { Form, Input } from 'antd'
import moment from 'moment'
import { commonFormProps } from '@/components/modals/utils'
import {
    WeekSelect,
    HourPicker,
    DeviceSelect,
} from '@shadowflow/components/ui/form/form-components'
import {
    EventLevelSelect,
    // EventActionSelect,
    EventStatus,
} from '@/components/form-components'
import style from './index.module.less'

export default function EventForm({
    eventType,
    className,
    form,
    namespace,
    ...props
}) {
    useEffect(() => {
        form.setFieldsValue({
            [namespace]: {
                stime: moment('00:00:00', 'HH:mm:ss'),
                etime: moment('23:59:59', 'HH:mm:ss'),
                status: 'ON',
                weekday: new Array(7).fill().map((d, i) => i),
                event_type: eventType,
            },
        })
    }, [eventType, form, namespace])
    return (
        <Form
            form={form}
            className={`form-in-modal ${style['event-config-form']} ${className}`}
            {...commonFormProps}
            {...props}
        >
            <DeviceSelect
                name={[namespace, 'devid']}
                label='数据源'
                initialValue=''
                inputProps={{ needAll: true }}
            />
            <EventLevelSelect
                name={[namespace, 'event_level']}
                label='事件级别'
            />
            <EventStatus
                name={[namespace, 'status']}
                label='事件状态'
                initialValue='ON'
            />
            {/* <EventActionSelect name={[namespace, 'action_id']} label='行动' /> */}
            <WeekSelect name={[namespace, 'weekday']} label='监控星期' />

            <HourPicker
                name={[namespace, 'stime']}
                label='开始时间'
                inputProps={{ allowClear: false }}
            />
            <HourPicker
                name={[namespace, 'etime']}
                label='结束时间'
                inputProps={{ allowClear: false }}
            />
            <Form.Item
                name={[namespace, 'desc']}
                label='描述'
                initialValue=''
                rules={[
                    {
                        required: true,
                        message: '事件描述不能为空',
                    },
                ]}
            >
                <Input allowClear />
            </Form.Item>
            <Form.Item
                name={[namespace, 'event_type']}
                label='事件类型'
                initialValue=''
                style={{ display: 'none' }}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name={[namespace, 'config_id']}
                label='配置id'
                initialValue=''
                style={{ display: 'none' }}
            >
                <Input disabled />
            </Form.Item>
        </Form>
    )
}

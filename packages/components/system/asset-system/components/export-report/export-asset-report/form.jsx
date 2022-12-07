import React from 'react'
import { DatePicker, Form } from 'antd'
import moment from 'moment'
import { DeviceSelect } from '../../../../../ui/form/form-components'

export default function ReportForm({ form }) {
    return (
        <Form form={form} name='asset-report'>
            <Form.Item label='时间范围' name='time'>
                <DatePicker.RangePicker
                    allowClear={false}
                    showTime={{
                        minuteStep: 5,
                        format: 'hh:mm',
                    }}
                    initialValue={[moment(), moment()]}
                    format='YYYY/MM/DD HH:mm'
                    ranges={{
                        '4小时': [moment().subtract(4, 'hour'), moment()],
                        '12小时': [moment().subtract(12, 'hour'), moment()],
                        今天: [moment().startOf('d'), moment()],
                    }}
                    disabledDate={value => {
                        return (
                            moment(value).startOf('day').valueOf() >
                            moment().startOf('day').valueOf()
                        )
                    }}
                    disabledTime={(dates, partial) => {
                        if (!Array.isArray(dates)) return null
                        return {
                            disabledHours: () => {
                                const selectTime = moment(
                                    partial === 'start' ? dates[0] : dates[1]
                                )
                                const nowHours = moment().hour()
                                return selectTime
                                    .startOf('day')
                                    .isSame(moment().startOf('day'))
                                    ? new Array(23 - nowHours)
                                          .fill()
                                          .map((d, i) => nowHours + 1 + i)
                                    : []
                            },
                            disabledMinutes: () => {
                                const selectTime = moment(
                                    partial === 'start' ? dates[0] : dates[1]
                                )
                                const nowMinutes = moment().minute()
                                return selectTime
                                    .startOf('hour')
                                    .isSame(moment().startOf('hour'))
                                    ? new Array(59 - nowMinutes)
                                          .fill()
                                          .map((d, i) => nowMinutes + 1 + i)
                                          .filter(d => !(d % 5))
                                    : []
                            },
                        }
                    }}
                />
            </Form.Item>
            <DeviceSelect
                label='采集节点'
                name='devid'
                wrapperCol={{ span: 8 }}
            />
        </Form>
    )
}

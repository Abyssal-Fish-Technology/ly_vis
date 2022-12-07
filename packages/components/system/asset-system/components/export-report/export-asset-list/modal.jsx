import React, { useState, useReducer, useContext } from 'react'
import { DatePicker, Checkbox, Form, Divider, Select, Radio } from 'antd'
import moment from 'moment'
import { MobXProviderContext } from 'mobx-react'
import { srvFields, otherInfoFields, allFields } from './config'
import { DeviceSelect } from '../../../../../ui/form/form-components'

function reducer(state, action) {
    const { selected, origin } = action.payload
    return {
        indeterminate: !!selected.length && selected.length !== origin.length,
        checkAll: selected.length === origin.length,
    }
}

export default function ModalContent({ form }) {
    const { configStore } = useContext(MobXProviderContext)
    const { device } = configStore

    const [currentType, setcurrentType] = useState('srv')

    const [checkAllState, dispatchCheckAll] = useReducer(reducer, {
        indeterminate: true,
        checkAll: false,
    })

    const srvInitialFields = srvFields
        .map(d => d.value)
        .filter(d => !otherInfoFields.includes(d))

    const basicFields = srvFields.filter(
        d => !otherInfoFields.includes(d.value)
    )
    const otherFields = srvFields.filter(d => otherInfoFields.includes(d.value))

    const originFields = allFields[currentType].map(d => d.value)

    function onTypeChange(value) {
        const fields =
            value === 'srv'
                ? srvInitialFields
                : allFields[value].map(d => d.value)
        setcurrentType(value)
        form.setFieldsValue({
            fields,
        })
        dispatchCheckAll({
            payload: {
                selected: fields,
                origin: allFields[value].map(d => d.value),
            },
        })
    }

    function onCheckAllChange(e) {
        const { checked } = e.target
        const selectedFields = checked ? originFields : []
        form.setFieldsValue({
            fields: selectedFields,
        })
        dispatchCheckAll({
            payload: {
                selected: selectedFields,
                origin: originFields,
            },
        })
    }

    function onAllValueChange(changed) {
        if (changed.fields) {
            dispatchCheckAll({
                payload: {
                    selected: changed.fields,
                    origin: originFields,
                },
            })
        }
    }

    return (
        <Form
            form={form}
            name='export-asset-list-form'
            layout='horizontal'
            onValuesChange={onAllValueChange}
        >
            <Form.Item
                label='时间范围'
                name='time'
                initialValue={[moment().subtract(4, 'hour'), moment()]}
            >
                <DatePicker.RangePicker
                    ranges={{
                        '4小时': [moment().subtract(4, 'hour'), moment()],
                        '12小时': [moment().subtract(12, 'hour'), moment()],
                        今天: [moment().startOf('d'), moment()],
                    }}
                    showTime={{
                        minuteStep: 5,
                        format: 'hh:mm',
                    }}
                    disabledDate={value => {
                        return (
                            moment(value).startOf('day').valueOf() >
                            moment().startOf('day').valueOf()
                        )
                    }}
                    format='YYYY/MM/DD HH:mm'
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
                initialValue={device[0] ? device[0].id : ''}
                wrapperCol={{ span: 8 }}
            />
            <Form.Item
                label='资产类型'
                name='assetType'
                className='form-item-type'
                initialValue={currentType}
            >
                <Select onChange={onTypeChange}>
                    <Select.Option value='ip'>IP</Select.Option>
                    <Select.Option value='srv'>端口</Select.Option>
                    <Select.Option value='host'>网站</Select.Option>
                    <Select.Option value='url'>URL</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item label='活跃状态' name='is_alive' initialValue=''>
                <Radio.Group>
                    <Radio value=''>全部</Radio>
                    <Radio value={1}>活跃</Radio>
                    <Radio value={0}>非活跃</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item label='文件类型' name='filetype' initialValue='xlsx'>
                <Radio.Group>
                    <Radio value='xlsx'>XLSL</Radio>
                    <Radio value='csv'>CSV</Radio>
                </Radio.Group>
            </Form.Item>
            {/* <Form.Item label='可信度' name='reliability' initialValue='high'>
                <Radio.Group>
                    <Radio value=''>全部</Radio>
                    <Radio value='high'>可信资产</Radio>
                </Radio.Group>
            </Form.Item> */}
            <Checkbox
                indeterminate={checkAllState.indeterminate}
                checked={checkAllState.checkAll}
                onChange={onCheckAllChange}
            >
                全选
            </Checkbox>
            <Form.Item
                label='导出字段'
                name='fields'
                className='form-item-fields'
                initialValue={srvInitialFields}
            >
                {currentType === 'srv' ? (
                    <Checkbox.Group>
                        <Divider orientation='left' plain className='divider'>
                            <span>基本信息</span>
                        </Divider>
                        <div className='fields-checkbox-group'>
                            {basicFields.map(d => (
                                <Checkbox key={d.value} value={d.value}>
                                    {d.label}
                                </Checkbox>
                            ))}
                        </div>
                        <Divider orientation='left' plain className='divider'>
                            <span>其它信息</span>
                        </Divider>
                        <div className='fields-checkbox-group'>
                            {otherFields.map(d => (
                                <Checkbox key={d.value} value={d.value}>
                                    {d.label}
                                </Checkbox>
                            ))}
                        </div>
                    </Checkbox.Group>
                ) : (
                    <Checkbox.Group
                        className='fields-checkbox-group'
                        options={allFields[currentType]}
                    />
                )}
            </Form.Item>
        </Form>
    )
}

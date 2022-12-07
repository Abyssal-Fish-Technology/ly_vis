import React, { useEffect } from 'react'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import {
    DefaultFormItem,
    HourPicker,
    IpInput,
    PortInput,
    ReverseFields,
    WeekSelect,
} from '@shadowflow/components/ui/form/form-components'
import { eventConfigApiIgnore } from '@/service'
import { Form } from 'antd'
import AddConfigModal, {
    AddConfigModalStore,
} from '@shadowflow/components/ui/modal/modal-config'
import { commonFormProps, getConfirmInfo, getFormDict } from '../utils'

const eventIgnoreModalStore = new AddConfigModalStore()

const formArr = [
    <IpInput
        name='lip'
        key='lip'
        label='发起IP'
        inputProps={{ allowClear: true }}
        rules={[
            {
                required: true,
                message: '请输入发起IP',
            },
        ]}
    />,
    <IpInput
        name='tip'
        key='tip'
        label='目标IP'
        inputProps={{ allowClear: true }}
    />,
    <PortInput
        name='tport'
        key='tport'
        label='目标端口'
        inputProps={{ allowClear: true }}
    />,
    <DefaultFormItem
        name='domain'
        key='domain'
        label='域名'
        inputProps={{ allowClear: true }}
    />,
    <DefaultFormItem
        name='protocol'
        key='protocol'
        label='协议'
        inputProps={{ allowClear: true }}
    />,
    <DefaultFormItem
        name='desc'
        key='desc'
        label='描述'
        rules={[
            {
                required: true,
                whitespace: true,
                message: '请输入描述信息',
            },
        ]}
        inputProps={{ allowClear: true }}
    />,
    <WeekSelect name='weekday' key='weekday' label='周期' />,
    <HourPicker
        name='stime'
        key='stime'
        label='开始时间'
        inputProps={{ allowClear: false }}
    />,
    <HourPicker
        name='etime'
        key='etime'
        label='结束时间'
        inputProps={{ allowClear: false }}
    />,
]

const dict = getFormDict(formArr)

function EventIgnoreForm({ form, setDisabledNext }) {
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])
    return (
        <Form
            form={form}
            style={{ position: 'relative', marginRight: '20px' }}
            className='form-in-modal'
            name='ignoreModalForm'
            initialValues={{
                lip: '',
                tip: '',
                tport: '',
                domain: '',
                desc: '',
                protocol: '',
                weekday: new Array(7).fill().map((d, i) => i),
                stime: moment().startOf('day'),
                etime: moment().endOf('day'),
            }}
            {...commonFormProps}
        >
            <ReverseFields
                style={{ fontSize: '18px' }}
                onClick={(() => {
                    let sport = ''
                    return () => {
                        let { lip, tip, tport } = form.getFieldsValue()
                        ;[lip, tip, tport, sport] = [tip, lip, sport, tport]
                        form.setFieldsValue({
                            lip,
                            tip,
                            tport,
                        })
                    }
                })()}
            />
            {formArr}
        </Form>
    )
}

const forms = [
    {
        title: '事件忽略配置',
        content: EventIgnoreForm,
    },
]

export default inject('configStore')(
    observer(function AddEventIgnoreModal({ configStore }) {
        const {
            op,
            visible,
            data,
            onClose,
            init,
            confirm,
        } = eventIgnoreModalStore
        const { changeData } = configStore

        useEffect(() => {
            init(eventConfigApiIgnore, res => {
                changeData({ eventIgnore: res })
            })
        }, [changeData, init])

        function onConfirm(values) {
            return confirm(values)
        }
        return (
            <AddConfigModal
                op={op}
                title='事件忽略配置'
                visible={visible}
                forms={forms}
                initialValues={data}
                onClose={onClose}
                onConfirm={onConfirm}
                getConfirmInfo={values => getConfirmInfo(values, dict)}
            />
        )
    })
)

export function openAddEventIgnoreModal(params) {
    eventIgnoreModalStore.onOpen(params)
}

/**
 * @prop {String} op 默认值 `add`
 * @prop {{lip, tip, tport, domain, protocol, desc}} data
 * @prop {Function} callback
 */
export function TriggerEventIgnoreModal({ op, data, callback, children }) {
    return (
        <span
            onClick={e => {
                e.stopPropagation()
                openAddEventIgnoreModal({
                    op,
                    data,
                    callback,
                })
            }}
        >
            {children}
        </span>
    )
}

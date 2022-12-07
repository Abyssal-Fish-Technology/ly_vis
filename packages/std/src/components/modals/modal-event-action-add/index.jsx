import { EventActSelect } from '@/components/form-components'
import { DefaultFormItem } from '@shadowflow/components/ui/form/form-components'
import { eventConfigApiAction } from '@/service'
import { Form } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'
import AddConfigModal, {
    AddConfigModalStore,
} from '@shadowflow/components/ui/modal/modal-config'
import { commonFormProps, getConfirmInfo, getFormDict } from '../utils'

const eventActionModalStore = new AddConfigModalStore()

const formArr = [
    <DefaultFormItem
        name='desc'
        key='desc'
        label='描述'
        inputProps={{ placeholder: '描述' }}
        rules={[
            {
                required: true,
                message: '请输入描述信息',
            },
        ]}
    />,
    <DefaultFormItem
        name='mail'
        key='mail'
        label='邮件'
        rules={[
            { type: 'email', message: '不是规范的邮件地址' },
            {
                required: true,
                message: '请输入邮件',
            },
        ]}
        inputProps={{ placeholder: '邮件' }}
    />,
    <DefaultFormItem
        name='phone'
        key='phone'
        label='电话'
        inputProps={{ placeholder: '电话' }}
    />,
    <DefaultFormItem
        name='uid'
        key='uid'
        label='uid'
        inputProps={{ placeholder: 'uid' }}
    />,
    <EventActSelect
        name='act'
        key='act'
        label='动作'
        normalize={value =>
            Number.isNaN(Number(value)) ? value : Number(value)
        }
    />,
]

const dict = getFormDict(formArr)

function EventActionForm({ form, setDisabledNext }) {
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])
    return (
        <Form
            form={form}
            className='form-in-modal'
            name='eventActionModalForm'
            initialValues={{
                act: 1,
                desc: '',
                mail: '',
                phone: '',
                uid: '',
            }}
            {...commonFormProps}
        >
            {formArr}
        </Form>
    )
}

const forms = [
    {
        title: '事件动作配置',
        content: EventActionForm,
    },
]

export default inject('configStore')(
    observer(function AddEventActionModal({ configStore }) {
        const {
            op,
            visible,
            onClose,
            init,
            confirm,
            data,
        } = eventActionModalStore
        const { changeData } = configStore
        useEffect(() => {
            init(eventConfigApiAction, res => {
                changeData({ eventAction: res })
            })
        }, [changeData, init])

        return (
            <AddConfigModal
                op={op}
                title='事件动作配置'
                visible={visible}
                forms={forms}
                initialValues={data}
                onClose={onClose}
                onConfirm={confirm}
                getConfirmInfo={values => getConfirmInfo(values, dict)}
            />
        )
    })
)

export function openAddEventActionModal(params) {
    eventActionModalStore.onOpen(params)
}

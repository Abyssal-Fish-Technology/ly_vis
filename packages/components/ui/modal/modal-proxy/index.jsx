import { proxyApi } from '@/service'
import { Form } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'
import {
    DefaultFormItem,
    DisabledSelect,
    IpInput,
} from '../../form/form-components'
import AddConfigModal, { AddConfigModalStore } from '../modal-config'
import { commonFormProps, getConfirmInfo, getFormDict } from '../utils'

const proxyModalStore = new AddConfigModalStore()

const formArr = [
    <DefaultFormItem
        name='name'
        key='name'
        label='名称'
        rules={[
            {
                required: true,
                message: '请输入名称！',
            },
        ]}
    />,
    <IpInput
        name='ip'
        key='ip'
        label='IP地址'
        rules={[
            {
                required: true,
                message: '请输入IP地址！',
            },
        ]}
    />,
    <DisabledSelect name='disabled' key='disabled' label='禁止使用' />,
    <DefaultFormItem name='comment' key='comment' label='注释' />,
]

function ProxyForm({ form, setDisabledNext }) {
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])
    return (
        <Form
            form={form}
            className='form-in-modal'
            name='proxyModalForm'
            initialValues={{
                name: '',
                creator: '',
                comment: '',
                ip: '',
                status: 'disconnected',
                disabled: 'N',
            }}
            {...commonFormProps}
        >
            {formArr}
        </Form>
    )
}

const dict = getFormDict(formArr)

const forms = [
    {
        title: '分析节点配置',
        content: ProxyForm,
    },
]

export default inject('configStore')(
    observer(function AddProxyModal({ configStore }) {
        const { op, visible, onClose, init, confirm, data } = proxyModalStore
        const { changeData } = configStore

        useEffect(() => {
            init(proxyApi, res => {
                changeData({ proxy: res })
            })
        }, [changeData, init])

        return (
            <AddConfigModal
                op={op}
                title='分析节点配置'
                visible={visible}
                forms={forms}
                onClose={onClose}
                onConfirm={confirm}
                getConfirmInfo={values => getConfirmInfo(values, dict)}
                initialValues={data}
            />
        )
    })
)

export function openAddProxyModal(params) {
    proxyModalStore.onOpen(params)
}

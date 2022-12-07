import { deviceApi } from '@/service'
import { Form } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'
import {
    DefaultFormItem,
    DeviceFlowType,
    DeviceType,
    DisabledSelect,
    PortInput,
    ProxySelect,
} from '../../form/form-components'
import AddConfigModal, { AddConfigModalStore } from '../modal-config'
import { commonFormProps, getConfirmInfo, getFormDict } from '../utils'

const deviceModalStore = new AddConfigModalStore()

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
    <DefaultFormItem name='model' key='model' label='模型' />,
    <DefaultFormItem name='creator' key='creator' label='创建者' />,
    <DefaultFormItem name='comment' key='comment' label='注释' />,
    <PortInput name='port' key='port' label='端口' />,
    <DeviceType name='device_type' key='device_type' label='设备类型' />,
    <DeviceFlowType name='flowtype' key='flowtype' label='数据类型' />,
    <ProxySelect name='agentid' key='agentid' label='分析节点' />,
    <DisabledSelect name='disabled' key='disabled' label='禁止使用' />,
]

const dict = getFormDict(formArr)

function DeviceForm({ form, setDisabledNext }) {
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])
    return (
        <Form
            form={form}
            className='form-in-modal'
            name='DeviceModalForm'
            initialValues={{
                name: '',
                model: '',
                creator: '',
                comment: '',
                ip: '',
                port: '',
                device_type: 'router',
                flowtype: 'netflow',
                disabled: 'N',
            }}
            {...commonFormProps}
        >
            {formArr}
        </Form>
    )
}

const forms = [
    {
        title: '数据节点配置',
        content: DeviceForm,
    },
]

export default inject('configStore')(
    observer(function AddDeviceModal({ configStore }) {
        const { op, visible, onClose, init, confirm, data } = deviceModalStore
        const { changeData } = configStore
        useEffect(() => {
            init(deviceApi, res => {
                changeData({ device: res })
            })
        }, [changeData, init])

        return (
            <AddConfigModal
                op={op}
                title='数据节点配置'
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

export function openAddDeviceModal(params) {
    deviceModalStore.onOpen(params)
}

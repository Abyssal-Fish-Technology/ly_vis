import { deviceApi } from '@/service'
import { Form } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'
import {
    DefaultFormItem,
    DefaultFormItemSelect,
    DisabledSelect,
    IpInput,
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
    <ProxySelect name='agentid' key='agentid' label='分析节点' />,
    <IpInput name='ip' key='ip' label='IP' />,
    <PortInput name='port' key='port' label='端口' />,
    <DefaultFormItemSelect
        name='pcap_level'
        key='pcap_level'
        label='数据包留存级别'
        inputProps={{
            options: [
                {
                    key: 0,
                    value: '不留存',
                },
                {
                    key: 1,
                    value: '只留存威胁',
                },
                {
                    key: 2,
                    value: '威胁和资产',
                },
                {
                    key: 3,
                    value: '所有会话一对',
                },
            ],
        }}
    />,
    <DefaultFormItem name='interface' key='interface' label='采集网卡名称' />,
    <DefaultFormItem name='filter' key='filter' label='流量采集过滤' />,
    <DefaultFormItem name='template' key='template' label='流量元数据模板' />,
    <DisabledSelect name='disabled' key='disabled' label='禁止使用' />,
    <DefaultFormItem name='comment' key='comment' label='注释' />,
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
                creator: '',
                comment: '',
                ip: '',
                port: '',
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

import { internalApi } from '@/service'
import { DeviceSelect } from '@shadowflow/components/ui/form/form-components'
import { Form } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { DefaultFormItem, IpInput } from '../../form/form-components'
import AddConfigModal, { AddConfigModalStore } from '../modal-config'
import { commonFormProps, getConfirmInfo, getFormDict } from '../utils'

const internalIpModalStore = new AddConfigModalStore()

const formArr = [
    <IpInput
        key='ip'
        name='ip'
        label='IP地址'
        rules={[
            {
                required: true,
                message: '请输入IP地址',
            },
        ]}
        inputProps={{ placeholder: 'IP地址' }}
    />,
    <DefaultFormItem
        key='desc'
        name='desc'
        label='描述'
        inputProps={{ placeholder: '描述' }}
    />,
    <DeviceSelect
        key='devid'
        name='devid'
        label='数据源'
        inputProps={{ needAll: true }}
        initialValue=''
    />,
]

const dict = getFormDict(formArr)

function InternalIpForm({ form, setDisabledNext }) {
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])
    return (
        <Form
            form={form}
            className='form-in-modal'
            name='internalIpModalForm'
            initialValues={{
                ip: '',
                desc: '',
            }}
            {...commonFormProps}
        >
            {formArr}
        </Form>
    )
}

const forms = [
    {
        title: '资产配置',
        content: InternalIpForm,
    },
]

export default inject('configStore')(
    observer(function AddInternalIpModal({ configStore }) {
        const {
            op,
            visible,
            data,
            onClose,
            init,
            confirm,
        } = internalIpModalStore
        const { changeData } = configStore

        useEffect(() => {
            init(internalApi, res => {
                changeData({ internal: res })
            })
        }, [changeData, init])

        return (
            <AddConfigModal
                op={op}
                title='资产组'
                visible={visible}
                initialValues={data}
                forms={forms}
                onClose={onClose}
                onConfirm={confirm}
                getConfirmInfo={values => getConfirmInfo(values, dict)}
            />
        )
    })
)

export function openAddInternalIpModal(params) {
    internalIpModalStore.onOpen(params)
}

/**
 * @prop {String} op 默认值 `add`
 * @prop {{ip, desc}} data
 * @prop {Function} callback
 */
export function TriggerInternalIpModal({ op, data, callback, children }) {
    return (
        <span
            onClick={() => {
                openAddInternalIpModal({
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

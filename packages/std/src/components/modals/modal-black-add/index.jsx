import {
    DefaultFormItem,
    IpInput,
    PortInput,
} from '@shadowflow/components/ui/form/form-components'
import { blacklistApi } from '@/service'
import { Form } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'
import AddConfigModal, {
    AddConfigModalStore,
} from '@shadowflow/components/ui/modal/modal-config'
import { commonFormProps, getConfirmInfo, getFormDict } from '../utils'

const blackModalStore = new AddConfigModalStore()

const formArr = [
    <IpInput
        name='ip'
        key='ip'
        label='IP地址'
        rules={[
            {
                required: true,
                message: '请输入IP地址',
            },
        ]}
    />,
    <PortInput name='port' key='port' label='端口' />,
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
]

const dict = getFormDict(formArr)

function BlackForm({ form, setDisabledNext }) {
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])
    return (
        <Form
            form={form}
            className='form-in-modal'
            name='blackModalForm'
            initialValues={{
                ip: '',
                port: '',
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
        title: '黑名单配置',
        content: BlackForm,
    },
]

export default inject('configStore')(
    observer(function AddBlackModal({ configStore }) {
        const { op, visible, data, onClose, init, confirm } = blackModalStore
        const { changeData } = configStore

        useEffect(() => {
            init(blacklistApi, res => {
                changeData({ black: res })
            })
        }, [changeData, init])
        return (
            <AddConfigModal
                op={op}
                title='黑名单配置'
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

export function openAddBlackModal(params) {
    blackModalStore.onOpen(params)
}

/**
 *
 * @prop {String} op 默认值 `add`
 * @prop {{ip, port, desc}} data
 * @prop {Function} callback
 */
export function TriggerBlackModal({ op, data, callback, children }) {
    return (
        <span
            onClick={e => {
                e.stopPropagation()
                openAddBlackModal({
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

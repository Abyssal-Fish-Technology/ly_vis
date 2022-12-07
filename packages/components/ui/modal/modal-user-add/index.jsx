import React, { useEffect } from 'react'
import { Form, Input, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import md5 from 'md5'
import { userApi } from '@/service'
import { DeviceSelect } from '@shadowflow/components/ui/form/form-components'
import { DefaultFormItem, DisabledSelect } from '../../form/form-components'
import AddConfigModal, { AddConfigModalStore } from '../modal-config'
import { commonFormProps, getConfirmInfo, getFormDict } from '../utils'

const userModalStore = new AddConfigModalStore()

const validPsw = ({ getFieldValue }) => ({
    validator(rule, value) {
        if (getFieldValue('passwd') === value) {
            return Promise.resolve()
        }
        return Promise.reject(new Error('密码不一致，请检查'))
    },
})

const validReso = ({ getFieldValue }) => ({
    validator(rule, value) {
        const level = getFieldValue('level')
        if (level !== 'sysadmin' && !value.toString().length)
            return Promise.reject(new Error('请选择资源'))
        return Promise.resolve()
    },
})

const formArr = [
    <DefaultFormItem
        name='name'
        key='name'
        label='用户名'
        rules={[{ required: true, message: '请输入用户名!' }]}
        initialValue=''
    />,
    <DefaultFormItem name='comm' key='comm' label='注释' initialValue='' />,
    <Form.Item
        name='passwd'
        key='passwd'
        label='密码'
        hasFeedback
        rules={[{ required: true, message: '请输入密码!' }]}
        initialValue=''
    >
        <Input.Password placeholder='密码' autoComplete='new-password' />
    </Form.Item>,
    <Form.Item
        name='repasswd'
        key='repasswd'
        label='重复密码'
        hasFeedback
        dependencies={['passwd']}
        validateFirst
        rules={[{ required: true, message: '请再次输入密码!' }, validPsw]}
        initialValue=''
    >
        <Input.Password placeholder='重复密码' />
    </Form.Item>,
    <Form.Item name='level' key='level' label='角色' initialValue='viewer'>
        <Select>
            <Select.Option value='viewer'>Viewer</Select.Option>
            <Select.Option value='analyser'>Analyser</Select.Option>
            <Select.Option value='sysadmin'>Sysadmin</Select.Option>
        </Select>
    </Form.Item>,
    <DisabledSelect
        name='disabled'
        key='disabled'
        label='是否禁用'
        initialValue='N'
    />,
    <DeviceSelect
        name='reso'
        key='reso'
        label='资源'
        rules={[validReso]}
        dependencies={['level']}
        inputProps={{ mode: 'multiple' }}
    />,
]

const dict = getFormDict(formArr)

function UserForm({ form, setDisabledNext }) {
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])

    return (
        <Form
            form={form}
            className='form-in-modal'
            name='UserModalForm'
            {...commonFormProps}
        >
            {formArr}
        </Form>
    )
}

const forms = [
    {
        title: '用户配置',
        content: UserForm,
    },
]

export default inject('configStore')(
    observer(function AddUserModal({ configStore }) {
        const { op, visible, onClose, init, confirm } = userModalStore
        const { changeData } = configStore

        useEffect(() => {
            init(userApi, res => {
                changeData({ userList: res })
            })
        }, [changeData, init])

        function onConfirm(values) {
            const params = { ...values }
            delete params.repasswd
            params.passwd = md5(params.passwd)
            return confirm(params)
        }
        return (
            <AddConfigModal
                op={op}
                title='用户配置'
                visible={visible}
                forms={forms}
                onClose={onClose}
                onConfirm={onConfirm}
                getConfirmInfo={values => getConfirmInfo(values, dict)}
            />
        )
    })
)

export function openAddUserModal() {
    userModalStore.onOpen()
}

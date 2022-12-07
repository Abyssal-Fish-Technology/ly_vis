import React, { useEffect, useState } from 'react'
import { Form, Input, Select, Switch, Tabs } from 'antd'
import { DeviceSelect } from '@shadowflow/components/ui/form/form-components'

const { Option } = Select

export default function EditUserForm({ form, isSysAdmin, visible }) {
    const [activeKey, setActiveKey] = useState('basic')

    useEffect(() => {
        if (visible) {
            setActiveKey('basic')
        }
    }, [visible])

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
            if (level !== 'sysadmin' && !value.length)
                return Promise.reject(new Error('请选择资源！'))
            return Promise.resolve()
        },
    })
    return (
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 12 }}>
            <Tabs
                tabPosition='left'
                activeKey={activeKey}
                onChange={key => setActiveKey(key)}
            >
                <Tabs.TabPane key='basic' tab='基本信息' forceRender>
                    {isSysAdmin && (
                        <Form.Item
                            name='name'
                            label='用户名'
                            rules={[
                                { required: true, message: '请输入用户名!' },
                            ]}
                        >
                            <Input placeholder='用户名' disabled />
                        </Form.Item>
                    )}
                    {isSysAdmin && (
                        <Form.Item name='comm' label='注释'>
                            <Input placeholder='' />
                        </Form.Item>
                    )}
                    <Form.Item
                        name='passwd'
                        label='密码'
                        hasFeedback
                        placeholder='密码'
                        dependencies={['repasswdd']}
                        rules={[
                            {
                                required: !isSysAdmin,
                                message: '请输入密码!',
                            },
                        ]}
                        initialValue=''
                    >
                        <Input.Password autoComplete='new-password' />
                    </Form.Item>
                    <Form.Item
                        name='repasswd'
                        label='重复密码'
                        hasFeedback
                        dependencies={['passwd']}
                        validateFirst
                        rules={[
                            {
                                required: !isSysAdmin,
                                message: '请再次输入密码!',
                            },
                            validPsw,
                        ]}
                        initialValue=''
                    >
                        <Input.Password
                            placeholder='重复密码'
                            autoComplete='new-password'
                        />
                    </Form.Item>
                </Tabs.TabPane>
                {isSysAdmin && (
                    <Tabs.TabPane key='other' tab='权限信息' forceRender>
                        <Form.Item name='level' label='角色'>
                            <Select>
                                <Option value='viewer'>Viewer</Option>
                                <Option value='analyser'>Analyser</Option>
                                <Option value='sysadmin'>Sysadmin</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name='disabled' label='是否禁用'>
                            <Select>
                                <Option value='N'>No</Option>
                                <Option value='Y'>Yes</Option>
                            </Select>
                        </Form.Item>
                        <DeviceSelect
                            name='reso'
                            label='资源'
                            inputProps={{ mode: 'multiple' }}
                            rules={[validReso]}
                            initialValue={[]}
                        />
                        <Form.Item
                            name='userLock'
                            label='解除锁定'
                            valuePropName='checked'
                            dependencies={['level']}
                            initialValue={false}
                        >
                            <Switch />
                        </Form.Item>
                    </Tabs.TabPane>
                )}
            </Tabs>
        </Form>
    )
}

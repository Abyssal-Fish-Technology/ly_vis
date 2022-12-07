import React, { useEffect } from 'react'
import md5 from 'md5'
import { withRouter } from 'react-router-dom'
import {
    UserOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from '@ant-design/icons'
import { Form, Input, Button, message } from 'antd'
import { deviceApi, login } from '@/service'
import { getCodeMessage } from '@shadowflow/components/utils/business/methods-auth'
import {
    getPrevLocationParams,
    setUserName,
} from '@shadowflow/components/utils/universal/methods-storage'
import { useAliveController } from 'react-activation'
import pageTabStore from '@/layout/components/page-tab/store'
import { stringify } from 'qs'
import { isArray } from 'lodash'
import style from './index.module.less'

const { company, subName, version, capabilityDescription } = window.appConfig
function LoginPage(props) {
    const onFinish = val => {
        login({
            ...val,
            auth_pass: md5(val.auth_pass),
        })
            .then(() => {
                message.success('登录成功')
                setUserName(val.auth_user)
                const { pathname = '', urlParams = {} } =
                    getPrevLocationParams() || {}
                props.history.replace(
                    `${pathname || '/'}?${stringify(urlParams)}`
                )
            })
            .catch(err => {
                const [{ code = '' }] = isArray(err) ? err : []
                message.error(getCodeMessage(code))
            })
    }
    const { clear } = useAliveController()
    // 登录页面自检测
    useEffect(() => {
        deviceApi()
            .then(() => {
                props.history.replace('/')
                message.warning('已登陆')
            })
            .catch(() => {
                clear()
                pageTabStore.reset()
            })
    }, [clear, props.history])
    return (
        <div className={style['login-page']}>
            <div className='login_left'>
                <div className='login-left-top'>
                    <div className='login-left-logo'>流影</div>
                    <div className='login-left-logo-tip'>
                        <div>FLOW</div>
                        <div>SHADOW</div>
                    </div>
                </div>
                <div className='login-left-center'>
                    {capabilityDescription.map(d => {
                        return (
                            <div
                                className='login-left-center-item'
                                key={d.title}
                            >
                                <div className='item-title'>{d.title}</div>
                                <div className='item-text'>{d.text}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className='login_right'>
                <Form
                    name='normal_login'
                    className='login-form'
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout='vertical'
                >
                    <Form.Item className='logo-item'>
                        <div className='login-title'>
                            <div className='login-title-logo'>
                                <div>流影</div>
                                <div>FLOW SHADOW</div>
                            </div>
                            <div className='version-text'>
                                {subName} v {version}
                            </div>
                        </div>
                    </Form.Item>
                    <Form.Item
                        name='auth_user'
                        rules={[
                            {
                                required: true,
                                message: '请输入用户名!',
                            },
                        ]}
                        label='用户名'
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder='请输入用户名'
                            size='large'
                        />
                    </Form.Item>
                    <Form.Item
                        name='auth_pass'
                        rules={[
                            {
                                required: true,
                                message: '请输入密码!',
                            },
                        ]}
                        label='密码'
                        className='password-item'
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            type='password'
                            placeholder='请输入密码'
                            size='large'
                            iconRender={visible =>
                                visible ? (
                                    <EyeTwoTone />
                                ) : (
                                    <EyeInvisibleOutlined />
                                )
                            }
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type='primary'
                            htmlType='submit'
                            className='login-form-button'
                            size='large'
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>
                <p className='company-text'>{company}</p>
            </div>
        </div>
    )
}
export default withRouter(LoginPage)

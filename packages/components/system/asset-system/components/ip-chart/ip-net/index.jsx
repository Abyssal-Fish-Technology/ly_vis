import React, { useState, useEffect } from 'react'
import { Form, Checkbox, Radio } from 'antd'
import style from './index.module.less'

function IpNet({ handleFn }) {
    const [form] = Form.useForm()

    const [v4Disabled, setV4Disabled] = useState(false)
    const [v6Disabled, setV6Disabled] = useState(false)

    useEffect(() => {
        handleFn(form.getFieldsValue())
    }, [handleFn, form])

    function onValuesChange(changed, allValues) {
        const {
            v4: { isShow: v4IsShow } = {},
            v6: { isShow: v6IsShow } = {},
        } = changed
        if (v4IsShow !== undefined) {
            setV4Disabled(!v4IsShow)
        }
        if (v6IsShow !== undefined) {
            setV6Disabled(!v6IsShow)
        }
        handleFn(allValues)
    }

    return (
        <Form
            className={style['ip-net']}
            form={form}
            name='asset-list-ipNet-form'
            onValuesChange={onValuesChange}
        >
            <div className='ip-net-type'>
                <div className='ip-net-type-title'>IPv4</div>
                <div className='ip-net-slider ip-net-ipv4'>
                    <Form.Item noStyle name={['v4', 'mask']} initialValue={32}>
                        <Radio.Group disabled={v4Disabled}>
                            <Radio value={8}>A段(/8)</Radio>
                            <Radio value={16}>B段(/16)</Radio>
                            <Radio value={24}>C段(/24)</Radio>
                            <Radio value={32}>主机(/32)</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        className='switch-button'
                        name={['v4', 'isShow']}
                        initialValue
                        valuePropName='checked'
                        label='展示'
                    >
                        <Checkbox />
                    </Form.Item>
                </div>
            </div>
            <div className='ip-net-type'>
                <div className='ip-net-type-title'>IPv6</div>
                <div className='ip-net-slider ip-net-ipv6'>
                    <Form.Item noStyle name={['v6', 'mask']} initialValue={128}>
                        <Radio.Group disabled={v6Disabled}>
                            <Radio value={48}>/48(组织)</Radio>
                            <Radio value={64}>/64(机构)</Radio>
                            <Radio value={128}>/128(主机)</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item
                        className='switch-button'
                        name={['v6', 'isShow']}
                        initialValue
                        valuePropName='checked'
                        label='展示'
                    >
                        <Checkbox />
                    </Form.Item>
                </div>
            </div>
        </Form>
    )
}

export default IpNet

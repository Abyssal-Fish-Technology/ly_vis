import React, { useContext } from 'react'
import { Result, Button } from 'antd'
import StepFormContext from '../context'

export default function Success() {
    const { dispatch, form, onClose, op } = useContext(StepFormContext)
    return (
        <Result
            className='step-form-success'
            status='success'
            title={op.indexOf('add') >= 0 ? '增加成功' : '编辑成功'}
            extra={[
                <Button
                    type='primary'
                    key='back'
                    onClick={() => {
                        form.resetFields()
                        dispatch('reset')
                    }}
                >
                    再来一条
                </Button>,
                <Button key='close' onClick={onClose}>
                    关闭
                </Button>,
            ]}
        />
    )
}

import React, { useContext, useState, useRef } from 'react'
import { Button } from 'antd'
import StepFormContext from '../context'

export default function FormController() {
    const {
        current,
        forms,
        dispatch,
        form,
        formValue,
        setFormValue,
        onConfirm,
        disabledNext,
        setDisabledNext,
    } = useContext(StepFormContext)

    const [confirmLoading, setConfirmLoading] = useState(false)

    const [nextLoading, setNextLoading] = useState(false)

    const eleRef = useRef(null)

    const handle = {
        prev: () => {
            const currentFormValue = form.getFieldsValue()
            setFormValue(currentFormValue)
            dispatch('prev')
            setDisabledNext(false)
        },
        next: () => {
            const { onNext } = forms[current]
            new Promise(resolve => {
                setNextLoading(true)
                const promise = onNext ? onNext(form) : form.validateFields()
                resolve(promise)
            }).then(
                value => {
                    setNextLoading(false)
                    setFormValue(value)
                    dispatch('next')
                },
                () => {
                    setNextLoading(false)
                }
            )
        },
        confirm: () => {
            setConfirmLoading(true)
            new Promise(resolve => {
                const promise = onConfirm
                    ? onConfirm(formValue)
                    : Promise.resolve()
                resolve(promise)
            }).then(
                () => {
                    setConfirmLoading(false)
                    dispatch('next')
                },
                () => {
                    setConfirmLoading(false)
                }
            )
        },
    }
    const { length: stepLength } = forms

    return (
        <div className='step-form-controller' ref={eleRef}>
            {current > 0 && <Button onClick={handle.prev}>上一步</Button>}
            {current < stepLength - 1 && (
                <Button
                    className='controller-next-btn'
                    type='primary'
                    onClick={handle.next}
                    disabled={disabledNext}
                    loading={nextLoading}
                >
                    下一步
                </Button>
            )}
            {current === stepLength - 1 && (
                <Button
                    loading={confirmLoading}
                    type='primary'
                    onClick={handle.confirm}
                >
                    提交
                </Button>
            )}
        </div>
    )
}

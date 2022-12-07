import React, { useReducer, useEffect } from 'react'
import { Form } from 'antd'
import StepFormContext from './context'
import FormHeader from './components/form-header'
import FormContent from './components/form-content'
import FormFooter from './components/form-footer'
import Confirm from './components/confirm'
import style from './index.module.less'

function reducer(state, action) {
    const { type, payload = {} } = action
    switch (type) {
        case 'init': {
            return {
                ...state,
                ...payload,
            }
        }
        case 'next': {
            return {
                ...state,
                current: state.current + 1,
            }
        }
        case 'prev': {
            return {
                ...state,
                current: state.current - 1,
            }
        }
        case 'reset': {
            return {
                ...state,
                current: 0,
            }
        }
        case 'formValue': {
            return {
                ...state,
                formValue: payload,
            }
        }
        case 'disabledNext': {
            return {
                ...state,
                disabledNext: payload,
            }
        }
        case 'setConfirmInfo': {
            return {
                ...state,
                confirmInfo: payload,
            }
        }
        default:
            return new Error()
    }
}

export default function StepFrom({
    forms,
    initialValues = null,
    onConfirm,
    onClose,
    getConfirmInfo,
    op,
}) {
    const [form] = Form.useForm()
    const [state, dispatch] = useReducer(reducer, {
        current: 0,
        forms,
        form,
        onConfirm,
        onClose,
        formValue: initialValues || {},
        setFormValue: () => {},
        disabledNext: true,
        confirmInfo: {},
        getConfirmInfo,
        op,
    })

    useEffect(() => {
        dispatch({
            type: 'init',
            payload: {
                forms: [...forms, { title: '确认', content: Confirm }],
                dispatch: type => {
                    dispatch({ type })
                },
                setFormValue: formValue => {
                    // event-mo配置，treeselect组件中的父节点和子节点id可能会重复导致渲染出错，所以给子节点id添加了‘mo-’前缀，在这把前缀去掉
                    const currentKey = Object.keys(formValue)[0]
                    const currentValue = Object.values(formValue)[0]
                    let result = formValue
                    if (currentKey === 'moEventConfig') {
                        currentValue.moid = Number(
                            currentValue.moid.split('-')[1]
                        )
                        result = {
                            moEventConfig: currentValue,
                        }
                    }
                    dispatch({
                        type: 'formValue',
                        payload: {
                            ...state.formValue,
                            ...result,
                        },
                    })
                },
                clearFormValue: () => {
                    dispatch({ type: 'formValue', payload: {} })
                },
                setDisabledNext: isDisabld => {
                    dispatch({ type: 'disabledNext', payload: isDisabld })
                },
                setConfirmInfo: info => {
                    dispatch({ type: 'setConfirmInfo', payload: info })
                },
            },
        })
    }, [forms, state.formValue])

    const { Provider } = StepFormContext

    return (
        <Provider value={state}>
            <div className={style['step-form']}>
                <FormHeader />
                <FormContent />
                <FormFooter />
            </div>
        </Provider>
    )
}

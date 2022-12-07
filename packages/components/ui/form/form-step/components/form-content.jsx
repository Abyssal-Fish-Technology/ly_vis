import { pickBy } from 'lodash'
import React, { useContext, useEffect } from 'react'
import StepFormContext from '../context'
import FormController from './form-controller'
import Success from './success'

export default function FormContent() {
    const { current, forms, form, formValue, setDisabledNext } = useContext(
        StepFormContext
    )
    const Content = forms[current] ? forms[current].content : () => null

    useEffect(() => {
        form.setFieldsValue(
            pickBy(formValue, d => d !== null && d !== undefined)
        )
    }, [form, formValue])

    return (
        <div className='step-form-container'>
            {current < forms.length ? (
                <>
                    <div className='step-form-container-content'>
                        <Content
                            form={form}
                            formValue={formValue}
                            setDisabledNext={setDisabledNext}
                        />
                    </div>
                    <FormController />
                </>
            ) : (
                <Success />
            )}
        </div>
    )
}

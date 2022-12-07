import React, { useContext } from 'react'
import { Steps } from 'antd'
import StepFormContext from '../context'

const { Step } = Steps

export default function FormHeader() {
    const { current, forms } = useContext(StepFormContext)
    return (
        <div className='step-form-header'>
            <Steps current={current}>
                {forms.map(step => (
                    <Step key={step.title} title={step.title} disabled />
                ))}
            </Steps>
        </div>
    )
}

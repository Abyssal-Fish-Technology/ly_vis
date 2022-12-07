import React from 'react'
import { Modal } from 'antd'
import StepFrom from '../../form/form-step'

export { default as AddConfigModalStore } from './store'

export default function AddConfigModal({
    op = 'add',
    title,
    className,
    forms,
    initialValues,
    onConfirm,
    onClose,
    getConfirmInfo,
    ...props
}) {
    return (
        <Modal
            title={`${op.indexOf('add') >= 0 ? '新增' : '编辑'}${title}`}
            className={className}
            width={700}
            footer={false}
            onCancel={onClose}
            maskClosable={false}
            destroyOnClose
            bodyStyle={{ overflow: 'auto', height: '60vh' }}
            {...props}
        >
            <StepFrom
                forms={forms}
                initialValues={initialValues}
                onConfirm={onConfirm}
                onClose={onClose}
                getConfirmInfo={getConfirmInfo}
                op={op}
            />
        </Modal>
    )
}

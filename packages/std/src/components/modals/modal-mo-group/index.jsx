import { mogroupApi } from '@/service'
import { Form, Input } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'
import AddConfigModal, {
    AddConfigModalStore,
} from '@shadowflow/components/ui/modal/modal-config'
import { commonFormProps, getConfirmInfo, getFormDict } from '../utils'

const moGroupModalStore = new AddConfigModalStore()

const formArr = [
    <Form.Item
        name='mogroup'
        label='名称'
        key='mogroup'
        rules={[
            {
                required: true,
                message: '请输入名称',
            },
        ]}
    >
        <Input placeholder='名称' />
    </Form.Item>,
]

const dict = getFormDict(formArr)

function MoGroupForm({ form, setDisabledNext }) {
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])
    return (
        <Form
            form={form}
            className='form-in-modal'
            initialValues={{
                mogroup: '',
            }}
            name='moGroupModalForm'
            {...commonFormProps}
        >
            {formArr}
        </Form>
    )
}

const forms = [
    {
        title: '追踪分组配置',
        content: MoGroupForm,
    },
]

export default inject('configStore')(
    observer(function MoGroupModal({ configStore }) {
        const { op, visible, data, onClose, init, confirm } = moGroupModalStore
        const { changeData } = configStore

        useEffect(() => {
            init(mogroupApi, res => {
                changeData({ moGroup: res })
            })
        }, [changeData, init])

        return (
            <AddConfigModal
                op={op}
                title='追踪分组配置'
                visible={visible}
                forms={forms}
                initialValues={data}
                onClose={onClose}
                onConfirm={confirm}
                getConfirmInfo={values => getConfirmInfo(values, dict)}
            />
        )
    })
)

export function openMoGroupModal(params) {
    moGroupModalStore.onOpen({ ...params, op: 'gadd' })
}

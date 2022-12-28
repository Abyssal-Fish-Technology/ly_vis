import {
    MoGroupSelect,
    MoGroupSelectAdd,
    ProtocolSelect,
} from '@/components/form-components'
import {
    IpInput,
    PortInput,
    ReverseFields,
    DeviceSelect,
} from '@shadowflow/components/ui/form/form-components'
import { moApi } from '@/service'
import { Form, Input, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import AddConfigModal, {
    AddConfigModalStore,
} from '@shadowflow/components/ui/modal/modal-config'
import { commonFormProps, getConfirmInfo, getFormDict } from '../utils'

const { Option } = Select

const moModalStore = new AddConfigModalStore()

const formArr = [
    <IpInput
        name='moip'
        key='moip'
        label='追踪目标IP'
        rules={[
            {
                required: true,
            },
        ]}
    />,
    <PortInput
        name='moport'
        key='moport'
        label='追踪目标端口'
        rules={[
            {
                required: true,
            },
        ]}
    />,
    <IpInput name='pip' key='pip' label='对端IP' />,
    <PortInput name='pport' key='pport' label='对端端口' />,
    <ProtocolSelect name='protocol' key='protocol' label='协议' />,
    <MoGroupSelect name='groupid' key='groupid' label='追踪分组' />,
    <Form.Item name='direction' key='direction' label='方向'>
        <Select>
            <Option value='ALL'>ALL</Option>
            <Option value='IN'>IN</Option>
            <Option value='OUT'>OUT</Option>
        </Select>
    </Form.Item>,
    <DeviceSelect name='devid' key='devid' label='数据源' />,
    <Form.Item name='desc' key='desc' label='描述'>
        <Input allowClear />
    </Form.Item>,
]

const dict = getFormDict(formArr)

function MoForm({ form, setDisabledNext, configStore }) {
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])

    const { getFieldsValue, setFieldsValue } = form

    const handleClickReverse = e => {
        e.stopPropagation()
        let { moip, moport, pip, pport } = getFieldsValue()
        ;[moip, moport, pip, pport] = [pip, pport, moip, moport]
        setFieldsValue({
            moip,
            moport,
            pip,
            pport,
        })
    }

    return (
        <Form
            form={form}
            initialValues={{
                moip: '',
                moport: '',
                pip: '',
                pport: '',
                protocol: '',
                direction: 'IN',
                // devid: '',
                desc: '',
            }}
            name='moModalForm'
            className='form-in-modal'
            {...commonFormProps}
        >
            {formArr}
            <ReverseFields onClick={handleClickReverse} />
            <MoGroupSelectAdd
                callback={res => {
                    configStore.changeData({ moGroup: res })
                }}
            />
        </Form>
    )
}

const forms = [
    {
        title: '追踪条目配置',
        content: MoForm,
    },
]

export default inject('configStore')(
    observer(function MoConfigModal({ configStore }) {
        const { op, visible, data, onClose, init, confirm, type } = moModalStore
        const { changeData } = configStore
        useEffect(() => {
            init(moApi, res => {
                return changeData({
                    mo: res,
                })
            })
        }, [changeData, init, type])

        const initialValues = useMemo(() => {
            const {
                id,
                moip,
                moport,
                protocol,
                pip,
                pport,
                desc,
                groupid,
                direction,
                devid,
            } = data
            return {
                moid: id,
                moip,
                moport,
                protocol,
                pip,
                pport,
                desc,
                groupid,
                direction,
                devid,
            }
        }, [data])

        return (
            <AddConfigModal
                op={op}
                title='追踪条目配置'
                visible={visible}
                forms={forms}
                initialValues={initialValues}
                onClose={onClose}
                onConfirm={confirm}
                getConfirmInfo={values => getConfirmInfo(values, dict)}
            />
        )
    })
)

export function openMoModal(params) {
    moModalStore.onOpen(params)
}

import React, { useCallback, useMemo } from 'react'
import { Modal } from 'antd'
import { inject, observer, Provider } from 'mobx-react'
import {
    EventConfig,
    eventConfigFormDict,
} from '@shadowflow/components/system/event-system'
import StepFrom from '@shadowflow/components/ui/form/form-step'
import Event from './components/event'
import EventForm from './components/event-config'
import eventModalStore from './store'
import style from './index.module.less'
import { getConfirmInfo } from '../utils'

function AddEventModal({ configStore }) {
    const {
        visible,
        op,
        id,
        data,
        onClose,
        onConfirm,
        eventType,
    } = eventModalStore

    const commondict = eventConfigFormDict
    const detaildict = EventConfig[eventType]
        ? EventConfig[eventType].config.dict
        : {}
    const dict = {
        eventConfig: '详细配置',
        event: '事件配置',
        ...commondict,
        ...detaildict,
    }

    const { changeData, event } = configStore

    const initialValues = useMemo(() => {
        if (op === 'add') return data || null
        const eventItem = event.find(d => String(d.id) === String(id))
        if (!eventItem) return null

        const { id: event_id, config_id, event_type } = eventItem
        const eventConfigItem = configStore[`eventConfig${event_type}`].find(
            d => String(d.id) === String(config_id)
        )
        return {
            event: {
                ...eventItem,
                event_id,
            },
            eventConfig: eventConfigItem,
        }
    }, [configStore, data, event, id, op])

    const confirmCallback = useCallback(
        values => {
            return onConfirm(values, changeData)
        },
        [changeData, onConfirm]
    )

    const useForms = useMemo(() => {
        const forms = EventConfig[eventType].detailConfigForms.length
            ? [
                  {
                      title: '告警阈值配置',
                      content: EventForm,
                  },
              ]
            : []
        forms.push({
            title: '告警规则配置',
            content: Event,
        })
        return forms
    }, [eventType])

    return (
        <Provider eventModalStore={eventModalStore}>
            <Modal
                className={style['event-step-modal']}
                title={`${op === 'add' ? '新增' : '编辑'}告警规则配置`}
                width={700}
                footer={false}
                onCancel={onClose}
                visible={visible}
                maskClosable={false}
                destroyOnClose
                bodyStyle={{ overflow: 'auto', height: '60vh' }}
            >
                <StepFrom
                    forms={useForms}
                    initialValues={initialValues}
                    onConfirm={confirmCallback}
                    onClose={onClose}
                    getConfirmInfo={values => getConfirmInfo(values, dict)}
                    op={op}
                />
            </Modal>
        </Provider>
    )
}

export default inject('configStore')(observer(AddEventModal))

export function openAddEventModal(params) {
    eventModalStore.onOpen(params)
}

/**
 * 打开事件弹窗的包裹按钮组件
 * @prop {String} type 事件类型，必须
 * @prop {String} op 操作类型， 默认值`add`
 * @prop {Object} data 新增的默认字段
 * @prop {Number} id 事件id，`op === 'mod'`时必须
 * @prop {Function} callback 完成后的回调
 */
export function TriggerEventModal({ type, op, data, id, callback, children }) {
    return (
        <span
            onClick={() => {
                openAddEventModal({
                    type,
                    op,
                    data,
                    id,
                    callback,
                })
            }}
        >
            {children}
        </span>
    )
}

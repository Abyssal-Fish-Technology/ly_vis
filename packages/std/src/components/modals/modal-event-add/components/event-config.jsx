import React, { useEffect } from 'react'
import { inject } from 'mobx-react'
import EventConfigForm from '@/components/form-config-event'
import { commonFormProps } from '../../utils'
import style from './index.module.less'

function EventForm({ form, setDisabledNext, eventModalStore }) {
    const { eventType } = eventModalStore

    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])
    return (
        <div className={style['event-config']}>
            <EventConfigForm
                className='form-in-modal'
                namespace='eventConfig'
                eventType={eventType}
                form={form}
                {...commonFormProps}
            />
        </div>
    )
}

export default inject('eventModalStore')(EventForm)

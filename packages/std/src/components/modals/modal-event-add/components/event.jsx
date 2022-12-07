import { inject } from 'mobx-react'
import EventForm from '@/components/form-event'
import React, { useEffect } from 'react'

function Event({ form, setDisabledNext, eventModalStore }) {
    const { eventType } = eventModalStore
    useEffect(() => {
        if (setDisabledNext) setDisabledNext(false)
    }, [setDisabledNext])

    return (
        <EventForm
            eventType={eventType}
            namespace='event'
            form={form}
            className='event-config-form-step'
        />
    )
}

export default inject('eventModalStore')(Event)

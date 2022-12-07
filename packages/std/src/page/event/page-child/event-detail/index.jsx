import { Provider } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import { getUrlParams } from '@shadowflow/components/utils/universal/methods-router'
import { useEventUpdate } from '@/utils/methods-event'
import AlarmTiming from './components/alarm-timing'
import DeviceInfo from './components/device-info'
import EventDetailTable from './components/event-detail-table'
import EventInfo from './components/event-info'
import EventDetailStore from './store'
import style from './index.module.less'
import FeatureTiming from './components/feature-timing'

function EventDetailPage() {
    const eventDetailStore = useMemo(() => new EventDetailStore(), [])

    useEffect(() => {
        eventDetailStore.changeRecordData(getUrlParams('pageParams').event_id)
    }, [eventDetailStore])

    useEventUpdate(eventDetailStore.changeRecordData)

    return (
        <Provider eventDetailStore={eventDetailStore}>
            <div className={style['event-detail']}>
                <div className='page-top'>
                    <div className='page-top-center'>
                        <DeviceInfo />
                        <AlarmTiming />
                        <FeatureTiming />
                    </div>
                    <div className='page-top-right'>
                        <EventInfo />
                    </div>
                </div>
                <EventDetailTable />
            </div>
        </Provider>
    )
}

export default EventDetailPage

import React, { useMemo } from 'react'
import { inject, observer } from 'mobx-react'
import EventTable from '@/components/table-event'
import moment from 'moment'

function EventInfo({ eventInfo, eventLoading, params }) {
    const resultParams = useMemo(() => {
        const {
            devid,
            starttime: [time1, time2],
        } = params
        return {
            devid,
            starttime: moment(time1).unix(),
            endtime: moment(time2).unix(),
        }
    }, [params])
    return (
        <div className={`${eventLoading ? 'app-loading' : ''}`}>
            <EventTable data={eventInfo} isFormat resultParams={resultParams} />
        </div>
    )
}

export default inject(stores => ({
    eventInfo: stores.resultStore.eventInfo,
    eventLoading: stores.resultStore.eventLoading,
    params: stores.resultStore.conditionValue,
}))(observer(EventInfo))

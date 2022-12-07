import React, { useEffect } from 'react'
import { reaction } from 'mobx'
import { inject, observer, Provider } from 'mobx-react'
import eventOverviewStore from './store'
import EventClassify from './components/event-classify'
import Card from './components/card'
import EventLevel from './components/event-level'
import EventHour from './components/event-hour'
import style from './index.module.less'
import EventHost from './components/event-host'

const EventOverviewPage = props => {
    const { eventStore } = props
    useEffect(() => {
        const dispose = reaction(
            () => eventStore.data,
            val =>
                eventOverviewStore.start({
                    data: val,
                    params: eventStore.params,
                })
        )
        return dispose
    }, [eventStore.data, eventStore.params])
    // 请求数据
    return (
        <div className={style.page}>
            <Provider eventOverviewStore={eventOverviewStore}>
                <div className='section section-1'>
                    <Card />
                </div>
                <div className='section section-2'>
                    <EventClassify />
                </div>
                <div className='section section-3'>
                    <EventHour />
                    <EventLevel />
                </div>
                <div className='section section-4'>
                    <EventHost />
                </div>
            </Provider>
        </div>
    )
}

export default inject('eventStore')(observer(EventOverviewPage))

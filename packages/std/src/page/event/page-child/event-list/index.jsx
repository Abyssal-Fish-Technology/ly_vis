import React, { useMemo, useRef } from 'react'
import { observer, Provider } from 'mobx-react'
import EventTable from '@/components/table-event'
import Toptoolbox from '@shadowflow/components/ui/form/toptoolbox'

import { useEventUpdate } from '@/utils/methods-event'
import style from './index.module.less'
import EventlistStore from './store'
import EventFitler from './components/event-filter'
import EventChart from './components/event-chart'

const EventListPage = () => {
    const store = useMemo(() => new EventlistStore(), [])

    useEventUpdate(store.changeProcessed)
    const filterContainer = useRef(null)
    return (
        <div className={style['event-list']}>
            <Toptoolbox callback={store.start} />
            <Provider eventListStore={store}>
                <EventFitler filterContainer={filterContainer.current} />
                <EventChart />
                <div ref={filterContainer} />
                <EventTable data={store.useData} resultParams={store.params} />
            </Provider>
        </div>
    )
}

export default observer(EventListPage)

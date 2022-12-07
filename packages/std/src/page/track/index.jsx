import React, { useEffect, useMemo } from 'react'
import { inject, observer, Provider } from 'mobx-react'
import Toptoolbox from '@shadowflow/components/ui/form/toptoolbox'
import TrackStore from './store'
import style from './index.module.less'
import TableMo from './components/table-mo'
import MoFilter from './components/table-filter'
import Statistic from './components/statistic'

function TrackPage({ configStore }) {
    const pageStore = useMemo(() => new TrackStore(), [])
    const { mo, moGroup, eventConfigmo, event } = configStore

    useEffect(() => {
        pageStore.getMoData(mo)
    }, [mo, pageStore])

    useEffect(() => {
        pageStore.getMoGroupData(moGroup)
    }, [moGroup, pageStore])

    useEffect(() => {
        pageStore.getEventConfigData(
            eventConfigmo,
            event.filter(d => d.event_type === 'mo')
        )
    }, [eventConfigmo, event, pageStore])

    return (
        <div className={style.trackPage}>
            <Toptoolbox
                callback={pageStore.changeParams}
                extra={[
                    <span>注释：带有*号的是在选择时间范围内的统计数据。</span>,
                ]}
            />
            <Provider trackStore={pageStore}>
                <div className='track-layout-item'>
                    <Statistic />
                </div>
                <div className='track-layout-item'>
                    <MoFilter />
                </div>
                <div className='mo-filter-condition' />
                <div className='track-layout-item'>
                    <TableMo />
                </div>
            </Provider>
        </div>
    )
}
export default inject('configStore')(observer(TrackPage))

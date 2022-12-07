import React, { useEffect, useMemo } from 'react'
import { observer, Provider } from 'mobx-react'
import Toptoolbox from '@shadowflow/components/ui/form/toptoolbox'
import EventTable from '@/components/table-event'
import { reaction } from 'mobx'
import { chain } from 'lodash'
import { scaleOrdinal } from 'd3-scale'
import { getUrlParams } from '@shadowflow/components/utils/universal/methods-router'
import style from './index.module.less'
import Chart from './components/event-explore'
import EventDesc from './components/event-desc'
import EventType from './components/event-type'
import EventLegend from './components/event-legend'
import { EventanalyseStore, EventLinkStore } from './store'

const EventAnalysisPage = () => {
    const eventAnalyseStore = useMemo(() => new EventanalyseStore(), [])
    const eventLinkStore = useMemo(() => new EventLinkStore(), [])
    useEffect(() => {
        const searchObj = getUrlParams('pageParams')
        if (searchObj && searchObj.device) {
            eventAnalyseStore.changeObservableIp(searchObj.device)
        }
    }, [eventAnalyseStore])

    useEffect(() => {
        const dispose = reaction(
            () => eventAnalyseStore.tableData,
            data => {
                const [blue, red, gray] = ['#3a65ff', '#ff2d2e', '#84859f']
                const eventType = chain(data)
                    .countBy('show_type')
                    .entries()
                    .orderBy(d => d[1], 'desc')
                    .map(d => d[0])
                    .value()
                const typeColorScale = scaleOrdinal()
                    .domain(eventType)
                    .range([
                        '#3a65ff',
                        '#5eff5a',
                        '#ffba69',
                        '#8676ff',
                        '#02a4ff',
                        '#17eb8e',
                        '#ff7d4d',
                        '#991bfa',
                        '#e323ff',
                    ])
                eventLinkStore.colorObj = {
                    nodeType: {
                        asset: blue,
                        threat: red,
                        unknown: gray,
                    },
                    attackType: {
                        attack: red,
                        victim: blue,
                    },
                    eventType: eventType.reduce((obj, typeItem) => {
                        obj[typeItem] = typeColorScale(typeItem)
                        return obj
                    }, {}),
                }
            }
        )
        return dispose
    }, [])

    return (
        <div className={style.page}>
            <Toptoolbox callback={eventAnalyseStore.getData} />
            <Provider
                eventAnalyseStore={eventAnalyseStore}
                eventLinkStore={eventLinkStore}
            >
                <div className='an-content'>
                    <div className='an-desc'>
                        <EventDesc />
                        <EventType />
                        <EventLegend />
                    </div>
                    <Chart />
                </div>

                <div>
                    <EventTable
                        data={eventAnalyseStore.tableData}
                        callback={eventAnalyseStore.changeProcessed}
                    />
                </div>
            </Provider>
        </div>
    )
}

export default observer(EventAnalysisPage)

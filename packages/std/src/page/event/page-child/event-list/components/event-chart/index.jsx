import { RingChart } from '@shadowflow/components/charts'
import Section from '@shadowflow/components/ui/layout/section'
import { inject, observer } from 'mobx-react'
import React from 'react'
import EventRank from '../event-rank'

function EventChart({ classifyData, changeFormCondition }) {
    return (
        <Section style={{ marginBottom: '20px' }}>
            <div className='event-list-chart'>
                <div className='event-list-chart-item'>
                    <EventRank type='attackDevice' />
                </div>
                <div className='event-list-chart-item'>
                    <EventRank type='victimDevice' />
                </div>
                <div className='event-list-chart-item'>
                    <RingChart
                        title='事件类型'
                        headTitle={`事件类型分布(${classifyData.length})`}
                        data={classifyData}
                        eventArr={[
                            {
                                type: 'click',
                                part: 'series',
                                callback: ({ name }) => {
                                    changeFormCondition({ show_type: [name] })
                                },
                            },
                        ]}
                    />
                </div>
            </div>
        </Section>
    )
}
export default inject(stores => ({
    classifyData: stores.eventListStore.classifyData,
    changeFormCondition: stores.eventListStore.changeFormCondition,
}))(observer(EventChart))

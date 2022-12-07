import { RingChart } from '@shadowflow/components/charts'
import Section from '@shadowflow/components/ui/layout/section'
import SkipContainer from '@/components/skip-container'
import React from 'react'

export default function EventInfo({ moinfo, params }) {
    const { starttime, endtime, devid } = params
    const { eventTypeArr, id } = moinfo
    return (
        <Section
            title='事件信息'
            extraContent={
                <div className='operate-content-default'>
                    <SkipContainer
                        message='查看事件列表'
                        className='operate-content-active'
                        to={{
                            pathname: '/event/list',
                            search: {
                                queryParams: {
                                    starttime,
                                    endtime,
                                    devid,
                                },
                                filterCondition: {
                                    moid: id,
                                },
                            },
                        }}
                    >
                        查看事件列表
                    </SkipContainer>
                </div>
            }
        >
            <RingChart title='事件类型' data={eventTypeArr} />
        </Section>
    )
}

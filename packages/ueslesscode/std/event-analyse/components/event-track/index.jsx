import Section from '@shadowflow/components/ui/layout/section'
import TreeMatrix from '@/components/tree-matrix'
import { inject, observer } from 'mobx-react'
import React from 'react'
import style from './index.module.less'

function EventTrack({ params, data }) {
    return (
        <Section title='事件攻击路径' className={style['event-track']}>
            <TreeMatrix
                data={data.length <= 1 ? [] : data}
                params={params}
                loading={false}
            />
        </Section>
    )
}

export default inject(stores => ({
    data: stores.eventAnalyseStore.eventTrackData,
    params: stores.eventAnalyseStore.params,
}))(observer(EventTrack))

import React from 'react'
import { inject, observer } from 'mobx-react'
import Section from '@/components/section'
import { useNoData } from '@/components/with-nodata'
import { skipPage } from '@shadowflow/components/utils/universal/methods-ui'
import { calculateEventType } from '@/utils/methods-event'
import style from './index.module.less'
import SankeyChart from './chart'

function EventHost(props) {
    const { data } = props

    function onClick(params) {
        const sParams =
            params.type === 'type'
                ? {
                      type: 'show_type',
                      name: calculateEventType(params.name),
                  }
                : {
                      type: 'device',
                      name: params.name,
                  }
        skipPage('/event/list', sParams)
    }

    const chart = useNoData(
        <SankeyChart data={data} onClick={onClick} />,
        !!data.nodes.length
    )

    return (
        <div className={style.host}>
            <Section title='事件主机分布'>
                <div className='chart'>{chart}</div>
            </Section>
        </div>
    )
}
export default inject(stores => ({
    data: stores.eventOverviewStore.hostData,
}))(observer(EventHost))

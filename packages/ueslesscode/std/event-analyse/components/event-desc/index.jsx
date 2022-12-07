import Section from '@shadowflow/components/ui/layout/section'
import { formatTimestamp } from '@shadowflow/components/utils/universal/methods-time'
import { chain, entries } from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useMemo } from 'react'

function EventDesc({ data, params }) {
    const descData = useMemo(() => {
        const { starttime, endtime } = params
        const obj = {
            开始时间: starttime ? formatTimestamp(starttime) : '',
            结束时间: endtime ? formatTimestamp(endtime) : '',
            设备数量: chain(data)
                .map(d => [d.attackNode, d.victimNode])
                .flatten()
                .uniq()
                .value().length,
            事件类型: chain(data).map('type').uniq().value().length,
        }
        return entries(obj)
    }, [data, params])
    return (
        <Section title='描述信息' className='an-desc-statistic'>
            {descData.map(d => {
                return (
                    <div className='desc-item' key={`${d[0]}-${d[1]}`}>
                        <span className='desc-item-label'>{`${d[0]}: `}</span>
                        <span className='desc-item-value'>{`${d[1]}`}</span>
                    </div>
                )
            })}
        </Section>
    )
}

export default inject(stores => ({
    data: stores.eventAnalyseStore.tableData,
    params: stores.eventAnalyseStore.params,
}))(observer(EventDesc))

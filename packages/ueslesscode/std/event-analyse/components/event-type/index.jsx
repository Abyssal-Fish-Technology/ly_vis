import RingChart from '@shadowflow/components/ui/chart/chart-ring'
import Section from '@shadowflow/components/ui/layout/section'
import { chain } from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useMemo } from 'react'

function EventType({ data }) {
    const chartData = useMemo(() => {
        return chain(data)
            .countBy('show_type')
            .entries()
            .reduce((arr, d) => {
                const [name, value] = d
                arr.push({
                    name,
                    value,
                })
                return arr
            }, [])
            .value()
    }, [data])
    return (
        <Section title='事件类型' className='an-desc-type'>
            <RingChart data={chartData} title='事件类型' />
        </Section>
    )
}
export default inject(stores => ({
    data: stores.eventAnalyseStore.tableData,
}))(observer(EventType))

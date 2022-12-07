import React from 'react'
import { inject, observer } from 'mobx-react'
import RingChart from '@/components/chart/chart-ring'
import Section from '@/components/section'
import { skipPage } from '@shadowflow/components/utils/universal/methods-ui'
import style from './index.module.less'

function EventClassify(props) {
    const { data } = props
    function onClick(key, params) {
        skipPage('/event/list', {
            type: key,
            name: params.name,
        })
    }
    return (
        <div className={style.ring}>
            {data.map(d => {
                const { title, data: chartData, key } = d
                return (
                    <div className='ring-item' key={title}>
                        <Section title={title}>
                            <div className='ring-body'>
                                <RingChart
                                    title={title}
                                    data={chartData}
                                    onClick={params => onClick(key, params)}
                                />
                            </div>
                        </Section>
                    </div>
                )
            })}
        </div>
    )
}
export default inject(stores => ({
    data: stores.eventOverviewStore.ringData,
}))(observer(EventClassify))

import Section from '@/components/section'
import { Switch } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useState } from 'react'

import HourHeatMap from './chart'
import style from './index.module.less'

function EventHour({ data }) {
    const [chartType, setchartType] = useState(0)
    return (
        <div className={style.time}>
            <Section
                title='事件时序分布'
                extraContent={
                    <Switch
                        checkedChildren='热力图'
                        unCheckedChildren='雷达图'
                        defaultChecked
                        size='small'
                        onChange={bol => {
                            setchartType(bol ? 0 : 1)
                        }}
                    />
                }
            >
                <div className='chart'>
                    <HourHeatMap data={data} type={chartType} />
                </div>
            </Section>
        </div>
    )
}

export default inject(stores => ({
    data: stores.eventOverviewStore.hourData,
}))(observer(EventHour))

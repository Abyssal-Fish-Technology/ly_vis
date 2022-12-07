import React from 'react'
import { RingChart } from '../../../../charts'

export default function AssetPieChart(props) {
    const { data = [], callback = false, title = '' } = props
    return (
        <RingChart
            headTitle={title}
            title={title}
            data={data}
            eventArr={[
                {
                    type: 'click',
                    part: 'series',
                    callback: ({ name }) => {
                        if (callback) callback(name)
                    },
                },
            ]}
        />
    )
}

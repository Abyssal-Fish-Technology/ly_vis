import { inject, observer } from 'mobx-react'
import React from 'react'
import IpNet from './ip-net'
import AssetBarChart from '../asset-barchart'

function IpChart({ data, changeIpNetCondition, changeFormCondition }) {
    return (
        <div className='asset-chart-2'>
            <IpNet handleFn={changeIpNetCondition} />
            <AssetBarChart
                data={data}
                onClick={({ name: ip }) => {
                    changeFormCondition([
                        {
                            name: 'device',
                            value: {
                                ip,
                            },
                        },
                    ])
                }}
                title='IP'
                options={{
                    bytes: '流量',
                    flows: '访问量',
                }}
            />
        </div>
    )
}

export default inject(stores => ({
    data: stores.assetListStore.useData,
    changeIpNetCondition: stores.assetListStore.changeIpNetCondition,
    changeFormCondition: stores.assetListStore.changeFormCondition,
}))(observer(IpChart))

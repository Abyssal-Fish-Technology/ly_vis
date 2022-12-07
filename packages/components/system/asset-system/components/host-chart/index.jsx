import React, { useMemo } from 'react'
import { chain, sumBy, uniqBy } from 'lodash'
import { inject, observer } from 'mobx-react'

import AssetBarChart from '../asset-barchart'
import AssetPieChart from '../asset-piechart'

function HostChart({ currentData, handleFn }) {
    const assetBarData = useMemo(
        () =>
            chain(currentData)
                .reduce((obj, d) => {
                    const key = d.host
                    if (!obj[key]) {
                        obj[key] = {
                            data: [],
                            name: key,
                        }
                    }
                    obj[key].data.push(d)
                    return obj
                }, {})
                .values()
                .map(d => {
                    return {
                        name: d.name,
                        data: chain(['bytes', 'flows', 'pkts'])
                            .reduce((obj, k) => {
                                obj[k] = sumBy(d.data, k)
                                return obj
                            }, {})
                            .value(),
                        valueLabel: '流量',
                        ipCount: uniqBy(d.data, 'ip').length,
                        bytes: sumBy(d.data, 'bytes'),
                        flows: sumBy(d.data, 'flows'),
                    }
                })
                .orderBy('value', 'desc')
                .value(),
        [currentData]
    )

    const hostBardata = useMemo(
        () =>
            chain(currentData)
                .reduce((obj, d) => {
                    const key = d.ip
                    if (!obj[key]) {
                        obj[key] = {
                            data: [],
                            name: key,
                        }
                    }
                    obj[key].data.push(d)
                    return obj
                }, {})
                .values()
                .map(d => {
                    return {
                        name: d.name,
                        data: chain(['bytes', 'flows', 'pkts'])
                            .reduce((obj, k) => {
                                obj[k] = sumBy(d.data, k)
                                return obj
                            }, {})
                            .value(),
                        valueLabel: 'Name数量',
                        hostCount: uniqBy(d.data, 'host').length,
                        bytes: sumBy(d.data, 'bytes'),
                        flows: sumBy(d.data, 'flows'),
                    }
                })
                .orderBy('value', 'desc')
                .value(),
        [currentData]
    )

    const assetPieData = useMemo(
        () =>
            chain(currentData)
                .reduce((obj, d) => {
                    const key = d.formType
                    if (!obj[key]) {
                        obj[key] = {
                            data: [],
                            name: key,
                        }
                    }
                    obj[key].data.push(d)
                    return obj
                }, {})
                .values()
                .map(d => {
                    return {
                        name: d.name,
                        value: d.data.length,
                    }
                })
                .orderBy('value', 'desc')
                .value(),
        [currentData]
    )

    return (
        <div className='asset-chart-3'>
            <AssetBarChart
                data={assetBarData}
                onClick={({ name: host }) => {
                    handleFn([
                        {
                            name: 'host',
                            value: {
                                host,
                            },
                        },
                    ])
                }}
                title='网站'
                options={{
                    flows: '会话量',
                    bytes: '流量',
                    ipCount: '主机数量',
                }}
            />
            <AssetBarChart
                data={hostBardata}
                onClick={({ name: ip }) => {
                    handleFn([
                        {
                            name: 'device',
                            value: {
                                ip,
                            },
                        },
                    ])
                }}
                title='主机'
                options={{
                    hostCount: '网站数量',
                    flows: '会话量',
                    bytes: '流量',
                }}
            />
            <AssetPieChart
                data={assetPieData}
                callback={formType => {
                    handleFn([
                        {
                            name: 'formType',
                            value: formType,
                        },
                    ])
                }}
                title='访问形式分布'
            />
        </div>
    )
}

export default inject(stores => ({
    currentData: stores.assetListStore.useData,
    handleFn: stores.assetListStore.changeFormCondition,
}))(observer(HostChart))

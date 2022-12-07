import React, { useMemo } from 'react'
import { chain, sumBy, uniqBy } from 'lodash'
import { inject, observer } from 'mobx-react'
import AssetBarChart from '../asset-barchart'
import AssetPieChart from '../asset-piechart'

function SrvChart({ currentData, handleFn }) {
    const flowBarData = useMemo(
        () =>
            chain(currentData)
                .reduce((obj, d) => {
                    const key = d.port
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
                        value: sumBy(d.data, 'bytes'),
                        data: chain(['bytes', 'flows', 'pkts'])
                            .reduce((obj, k) => {
                                obj[k] = sumBy(d.data, k)
                                return obj
                            }, {})
                            .value(),
                        valueLabel: '流量',
                        flows: sumBy(d.data, 'flows'),
                        bytes: sumBy(d.data, 'bytes'),
                        ipCount: uniqBy(d.data, 'ip').length,
                    }
                })
                .orderBy('value', 'desc')
                .value(),
        [currentData]
    )

    const srvBarData = useMemo(
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
                        valueLabel: '活跃数量',
                        portCount: uniqBy(d.data, 'port').length,
                        bytes: sumBy(d.data, 'bytes'),
                        flows: sumBy(d.data, 'flows'),
                    }
                })
                .orderBy('value', 'desc')
                .value(),
        [currentData]
    )

    const pieData = useMemo(
        () =>
            chain(currentData)
                .reduce((obj, d) => {
                    const app_proto = d.app_proto || '其它'
                    app_proto.forEach(key => {
                        if (!obj[key]) {
                            obj[key] = {
                                data: [],
                                name: key,
                            }
                        }
                        obj[key].data.push(d)
                    })
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
                data={flowBarData}
                onClick={({ name: port }) => {
                    handleFn([
                        {
                            name: 'device',
                            value: {
                                port,
                            },
                        },
                    ])
                }}
                title='端口'
                options={{
                    flows: '会话量',
                    bytes: '流量',
                    ipCount: '主机数量',
                }}
            />
            <AssetBarChart
                data={srvBarData}
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
                    portCount: '端口数量',
                    bytes: '流量',
                    flows: '会话量',
                }}
            />
            <AssetPieChart
                data={pieData}
                callback={app_proto => {
                    handleFn([
                        {
                            name: 'app_proto',
                            value: [app_proto],
                        },
                    ])
                }}
                title='应用服务分布'
            />
        </div>
    )
}

export default inject(stores => ({
    currentData: stores.assetListStore.useData,
    handleFn: stores.assetListStore.changeFormCondition,
}))(observer(SrvChart))

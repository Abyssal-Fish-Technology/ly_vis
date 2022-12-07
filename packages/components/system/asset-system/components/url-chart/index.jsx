import React, { useMemo } from 'react'
import { chain, sumBy, uniqBy } from 'lodash'
import { inject, observer } from 'mobx-react'
import AssetBarChart from '../asset-barchart'
import AssetPieChart from '../asset-piechart'
import { getHostOrUrlFn } from '../../data-processor'

function UrlChart({ currentData, handleFn }) {
    const assetBarData = useMemo(
        () =>
            chain(currentData)
                .reduce((obj, d) => {
                    const key = d.url
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
                        ipCount: uniqBy(d.data, 'ip').length,
                        bytes: sumBy(d.data, 'bytes'),
                        flows: sumBy(d.data, 'flows'),
                    }
                })
                .orderBy('value', 'desc')
                .value(),
        [currentData]
    )

    const urlCountBarData = useMemo(
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
                        valueLabel: 'url数量',
                        urlCount: uniqBy(d.data, 'url').length,
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
                    String(d.retcode)
                        .split(',')
                        .forEach(key => {
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
                data={assetBarData}
                onClick={({ name: url }) => {
                    handleFn([
                        {
                            name: 'show_url',
                            value: {
                                show_url: getHostOrUrlFn(url, 'url'),
                            },
                        },
                    ])
                }}
                showTips={false}
                title='URL'
                options={{
                    flows: '会话量',
                    bytes: '流量',
                    ipCount: '主机数量',
                }}
            />
            <AssetBarChart
                data={urlCountBarData}
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
                    urlCount: 'URL数量',
                    flows: '会话量',
                    bytes: '流量',
                }}
            />
            <AssetPieChart
                data={pieData}
                callback={retcode => {
                    handleFn([
                        {
                            name: 'retcode',
                            value: [retcode],
                        },
                    ])
                }}
                title='URL返回码分布'
            />
        </div>
    )
}

export default inject(stores => ({
    currentData: stores.assetListStore.useData,
    handleFn: stores.assetListStore.changeFormCondition,
}))(observer(UrlChart))

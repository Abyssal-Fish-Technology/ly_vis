import React, { useEffect, useState } from 'react'
import { inject, observer } from 'mobx-react'
import { chain, last } from 'lodash'
import { Spin } from 'antd'
import AssetRelation from '../asset-dgreechart'
import Section from '../../../../ui/layout/section'

function RelationChart({ assetListStore }) {
    const { ip, srvData, hostData, urlData, relationLoading } = assetListStore
    const [chartData, setChartData] = useState([])
    useEffect(() => {
        const data = [
            {
                type: ['ip', 'port'],
                nextType: 'host',
                data: srvData,
            },
            {
                type: ['ip', 'port', 'host'],
                nextType: 'url',
                data: hostData,
            },
            {
                type: ['ip', 'port', 'host', 'url'],
                nextType: '',
                data: urlData.map(d => ({ ...d, host: d.url.split('/')[0] })),
            },
        ].reduce(
            (arr, d) => {
                const { type, data: dataArr, nextType } = d
                const currentType = last(type)
                chain(dataArr)
                    .filter(d1 => d1.ip === ip)
                    .forEach((d1, i, filteredArr) => {
                        const currentName = d1[currentType]
                        if (!arr.find(d2 => d2.name === currentName)) {
                            const aggreData = chain(filteredArr)
                                .filter(d2 => d2[currentType] === currentName)
                                .uniqBy(d2 => type.map(k => d2[k]).join('-'))
                                .value()
                            arr.push({
                                type: currentType,
                                nextType,
                                typeArr: type,
                                name: currentName,
                                id: `${currentName}-${currentType}`,
                                isReal: true,
                                data: aggreData,
                            })
                        }

                        // 除服务外的端口
                        if (currentType !== 'port') {
                            const portArr = arr
                                .filter(d2 => d2.type === 'port')
                                .map(d2 => d2.name)
                            if (!portArr.includes(d1.port)) {
                                arr.push({
                                    name: d1.port,
                                    id: `${d1.port}-port`,
                                    type: 'port',
                                    nextType: 'host',
                                    typeArr: ['ip', 'port'],
                                    data: [d1],
                                    isReal: false,
                                })
                            }
                        }
                        // url中提取host
                        if (currentType === 'url') {
                            const hostIdArr = arr
                                .filter(d2 => d2.type === 'host')
                                .map(d2 => d2.name)
                            if (!hostIdArr.includes(d1.host)) {
                                arr.push({
                                    type: 'host',
                                    nextType: 'url',
                                    name: d1.host,
                                    id: `${d1.host}-host`,
                                    typeArr: ['ip', 'port', 'host'],
                                    data: [d1],
                                    isReal: false,
                                })
                            }
                        }
                    })
                    .value()
                return arr
            },
            [
                {
                    name: ip,
                    id: `${ip}-ip`,
                    type: 'ip',
                    nextType: 'port',
                    typeArr: ['ip'],
                    data: [],
                },
            ]
        )
        setChartData(data)
    }, [hostData, ip, srvData, urlData])

    return ip ? (
        <Section title='资产关联图' style={{ marginTop: '20px' }}>
            <Spin spinning={relationLoading}>
                <AssetRelation data={chartData} />
            </Spin>
        </Section>
    ) : null
}

export default inject('assetListStore')(observer(RelationChart))

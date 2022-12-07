import React, { useMemo, useRef } from 'react'
import { chain } from 'lodash'
import { stratify } from 'd3'
import { Col, Row, Form } from 'antd'
import { inject, observer } from 'mobx-react'
import Treemap from '@/components/chart/chart-treemap'
import Section from '@/components/section'
import ToolBox from './toolbox'
import style from './index.module.less'

function AssetDistribute({ assetStore }) {
    const chartRef = useRef()
    const [form] = Form.useForm()
    const {
        ipData,
        ipAggreData,
        srvAggreData,
        hostAggreData,
        urlAggreData,
    } = assetStore

    const chartData = useMemo(() => {
        const data = chain(ipData)
            .map('desc')
            .flatten()
            .uniq()
            .map(d => ({
                name: d,
                parent: 'asset',
            }))
            .value()

        const leaves = data
            .map(item => {
                return [
                    { name: 'ip', data: ipAggreData },
                    { name: 'srv', data: srvAggreData },
                    { name: 'host', data: hostAggreData },
                    { name: 'url', data: urlAggreData },
                ].map(d => {
                    const useArr = chain(d.data)
                        .map('data')
                        .flatten()
                        .filter(d1 => d1.desc.includes(item.name))
                        .value()
                    return {
                        name: d.name,
                        parent: item.name,
                        data: useArr,
                        value: useArr.length,
                    }
                })
            })
            .flat(1)

        const useData = data.concat(leaves)
        useData.push({
            name: 'asset',
        })

        const useChartData = stratify()
            .id(d => {
                return d.name
            })
            .parentId(d => {
                return d.parent
            })(useData)

        return useChartData
    }, [hostAggreData, ipAggreData, ipData, srvAggreData, urlAggreData])

    return (
        <div className={style['tree-map']}>
            <Section title='资产分布'>
                <Row className='tree-map-container'>
                    <Col span={21} className='chart' ref={chartRef}>
                        <Treemap
                            data={chartData}
                            legends={['ip', 'srv', 'host', 'url']}
                        />
                    </Col>
                    <Col span={3} className='tree-map-tool'>
                        <ToolBox form={form} chartEle={chartRef} />
                    </Col>
                </Row>
            </Section>
        </div>
    )
}

export default inject('assetStore')(observer(AssetDistribute))

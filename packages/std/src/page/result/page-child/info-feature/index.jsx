import React, { useEffect, useMemo, useState } from 'react'
import { Statistic, Tabs } from 'antd'
import { map } from 'lodash'
import { inject, observer } from 'mobx-react'
import { AntdTableSuper } from '@shadowflow/components/ui/antd-components-super'
import UnitContainer from '@shadowflow/components/ui/container/unit-container'
import { translateDataType } from '@shadowflow/components/utils/universal/methods-traffic'
import FeatureInfoStore from './store'
import style from './index.module.less'

const { TabPane } = Tabs

const featureLabelMap = {
    sbytes: '发送流量',
    dbytes: '接收流量',
    bytes: '流量总量',
}

function ResultFeature({
    featureInfo,
    searchValue,
    featureType,
    conditionValue,
    featureLoading,
}) {
    const { featureData, start } = useMemo(() => new FeatureInfoStore(), [])

    const currentFeatureData = useMemo(() => {
        const { feature = [] } = conditionValue
        return featureData.filter(d => feature.includes(d.key))
    }, [conditionValue, featureData])

    const defaultKey = useMemo(
        () =>
            (currentFeatureData.find(d => d.aggreData.length) || {}).key ||
            currentFeatureData[0].key,
        [currentFeatureData]
    )

    const [activeKey, setActiveKey] = useState(defaultKey)

    useEffect(() => {
        setActiveKey(featureType || defaultKey)
    }, [defaultKey, featureType])

    useEffect(() => {
        start(featureInfo, searchValue)
    }, [featureInfo, searchValue, start])

    return (
        <div className={`${style.page} ${featureLoading ? 'app-loading' : ''}`}>
            <Tabs
                type='card'
                activeKey={activeKey}
                onChange={key => setActiveKey(key)}
            >
                {currentFeatureData.map(data => {
                    const {
                        aggreData,
                        key,
                        name,
                        columns,
                        detailColumns,
                        connectCount,
                        flowRate,
                        flowCount,
                    } = data
                    const tableDetail = datas => {
                        return (
                            <AntdTableSuper
                                ipKeys={['sip', 'dip', 'ip']}
                                columns={detailColumns}
                                dataSource={datas}
                                options={false}
                                rowKey={d => `${d.sip || ''}-${d.ip || ''}
                                    -${d.dip || ''}-${d.port || ''}
                                    -${d.dport || ''}-${d.qname || ''}
                                    -${d.time || ''}-${d.ti_mark || ''}
                                    -${d.srv_mark || ''}-${d.bytes}}-${
                                    d.qtype || ''
                                }`}
                            />
                            // <h1>111</h1>
                        )
                    }
                    return (
                        <TabPane
                            tab={
                                <div
                                    className={`tab-bar-button ${
                                        aggreData.length ? '' : 'disabled'
                                    }`}
                                >
                                    {`${name} ( ${aggreData.length} )`}
                                </div>
                            }
                            key={key}
                        >
                            <div className='feature-static'>
                                {[
                                    {
                                        data: connectCount,
                                        key: '连接行为',
                                        unit: '个',
                                    },
                                    {
                                        data: flowCount,
                                        key: '流量情况',
                                        unit: '',
                                    },
                                    { data: flowRate, key: '最大传输速率' },
                                ].map(item => {
                                    return (
                                        item.data && (
                                            <div
                                                key={item.key}
                                                className='feature-static-item'
                                            >
                                                <div className='feature-static-item-name'>
                                                    {item.key}
                                                </div>
                                                <div className='feature-static-item-data'>
                                                    {map(item.data, (v, k) => (
                                                        <span
                                                            key={k}
                                                            className='feature-static-item-data-item'
                                                        >
                                                            {item.unit !==
                                                                undefined && (
                                                                <span className='feature-static-item-data-item-label'>
                                                                    {featureLabelMap[
                                                                        k
                                                                    ] || k}
                                                                </span>
                                                            )}
                                                            <span className='feature-static-item-data-item-value'>
                                                                <Statistic
                                                                    className='feature-static-item-data-item-value-stattics'
                                                                    value={v}
                                                                />
                                                                <UnitContainer
                                                                    unit={translateDataType(
                                                                        item.unit ===
                                                                            undefined
                                                                            ? k
                                                                            : item.unit
                                                                    )}
                                                                />
                                                                {/* <span className='feature-static-item-data-item-unit'>
                                                                    {item.unit ===
                                                                    undefined
                                                                        ? k
                                                                        : item.unit}
                                                                </span> */}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    )
                                })}
                            </div>
                            <AntdTableSuper
                                ipKeys={['sip', 'dip', 'ip']}
                                options={false}
                                className='feature-table'
                                rowKey={d => `${d.sip || ''}-${d.ip || ''}
                                 -${d.dip || ''}-${d.port || ''}
                                 -${d.dport || ''}-${d.qname || ''}
                                 -${d.time || ''}-${d.ti_mark || ''}
                                 -${d.srv_mark || ''}-${d.bytes}`}
                                dataSource={aggreData}
                                columns={columns}
                                expandable={{
                                    expandedRowRender: record => {
                                        return tableDetail(record.data)
                                    },
                                }}
                            />
                        </TabPane>
                    )
                })}
            </Tabs>
        </div>
    )
}
export default inject(stores => ({
    featureInfo: stores.resultStore.featureInfo,
    searchValue: stores.resultStore.searchValue,
    featureType: stores.resultStore.featureType,
    conditionValue: stores.resultStore.conditionValue,
    featureLoading: stores.resultStore.featureLoading,
}))(observer(ResultFeature))

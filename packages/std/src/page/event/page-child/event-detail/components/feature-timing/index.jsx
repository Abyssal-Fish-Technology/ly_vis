import Section from '@shadowflow/components/ui/layout/section'
import { Space } from 'antd'
import React, { useState, useCallback, useEffect } from 'react'
import { inject, observer } from 'mobx-react'
import {
    getEventFeatureParams,
    isDnsTypeEvent,
} from '@shadowflow/components/system/event-system'
import { initial, isEmpty, isEqual } from 'lodash'
import { featureGet } from '@/service'
import { LimitCom } from '../public-com'
import FeatureDesc from './components/feature-desc'
import FeatureChart from './components/feature-chart'

function ExtraContent({ callback }) {
    return (
        <div className='extra-content'>
            <Space size='large'>
                <div className='legend-item'>
                    威胁设备行为
                    <div className='red-legend' />
                </div>
                <div className='legend-item'>
                    受害设备行为
                    <div className='blue-legend' />
                </div>
                <LimitCom callback={callback} />
                <div className='analysis-title'>数据特征</div>
            </Space>
        </div>
    )
}

function FeatureTiming({ originRecordData, alarmParams, changeReportData }) {
    const [loading, setLoading] = useState(true)

    const {
        attackDevice,
        victimDevice,
        type,
        obj,
        devid,
        model,
    } = originRecordData

    const [title, settitle] = useState('TCP主动握手时序分布')
    useEffect(() => {
        settitle(
            isDnsTypeEvent({ type }) || (type === 'mining' && model === 2)
                ? 'DNS请求时序分布'
                : 'TCP主动握手时序分布'
        )
    }, [model, type])

    const startSearch = useCallback(
        limit => {
            const simpleEventData = {
                type,
                obj,
                devid,
                model,
            }
            if (isEmpty(alarmParams)) return false
            const { endtime, starttime } = alarmParams
            const attackParams = getEventFeatureParams(
                simpleEventData,
                attackDevice
            )
            setLoading(true)
            const promise1 = new Promise(resolve => {
                return featureGet({
                    ...attackParams,
                    limit,
                    starttime,
                    endtime,
                })
                    .then(res => {
                        resolve(res)
                    })
                    .catch(() => {
                        setLoading(false)
                    })
            })
            const victimParams = getEventFeatureParams(
                simpleEventData,
                victimDevice
            )
            const nowIsOnlyOne = isEqual(attackParams, victimParams)
            const promise2 = new Promise(resolve => {
                return nowIsOnlyOne
                    ? resolve([])
                    : featureGet({
                          ...victimParams,
                          limit,
                          starttime,
                          endtime,
                      })
                          .then(res => {
                              resolve(res)
                          })
                          .catch(() => {
                              setLoading(false)
                          })
            })
            return Promise.all([promise1, promise2])
                .then(([data1, data2]) => {
                    const useData = data2.length > data1.length ? data2 : data1
                    changeReportData('featureData', initial(useData))
                })
                .finally(() => {
                    setLoading(false)
                })
        },
        [
            type,
            obj,
            devid,
            model,
            alarmParams,
            attackDevice,
            victimDevice,
            changeReportData,
        ]
    )

    return (
        <Section
            className={`${loading ? 'app-loading' : ''} analysis-section`}
            title={title}
            extraContent={<ExtraContent callback={startSearch} />}
        >
            <div className='analysis-container'>
                <FeatureChart />
                <FeatureDesc />
            </div>
        </Section>
    )
}

export default inject(stores => ({
    alarmParams: stores.eventDetailStore.alarmParams,
    changeReportData: stores.eventDetailStore.changeReportData,
    originRecordData: stores.eventDetailStore.originRecordData,
}))(observer(FeatureTiming))

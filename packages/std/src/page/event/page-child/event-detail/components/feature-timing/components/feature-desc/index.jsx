import UnitContainer from '@shadowflow/components/ui/container/unit-container'
import {
    formatTimestamp,
    rountTime5Min,
} from '@shadowflow/components/utils/universal/methods-time'
import { chain, maxBy, minBy, sumBy } from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'

function FeatureDesc({ featureData, alarmParams }) {
    const [featureAnalysis, setFeatureAnalysis] = useState({})

    useEffect(() => {
        const useData = chain(featureData).sortBy('time').value()
        const dataStarttime = useData.length ? minBy(useData, 'time').time : 0
        const dataEndtime = useData.length ? maxBy(useData, 'time').time : 0

        // 计算访问强度，拿到真实数据中的最大、最小时间。按整5分钟分割，结束时间往后推5分钟（针对12:05:16这种情况），
        // 遍历真实数据，把它们放到各自的5分钟时间段内，比较flows和的大小，取最大值为最大访问强度。
        const timeArr = []
        let defaultTime = rountTime5Min(dataStarttime)
        while (defaultTime <= rountTime5Min(dataEndtime, 'back')) {
            timeArr.push([defaultTime, defaultTime + 300])
            defaultTime += 300
        }
        const resultTimeArr = []
        timeArr.forEach(item => {
            const [time1, time2] = item
            resultTimeArr.push(
                useData.filter(d => d.time >= time1 && d.time <= time2)
            )
        })
        const accessIntensity = chain(resultTimeArr)
            .map(d => sumBy(d, 'flows'))
            .max()
            .value()

        const totalFlows = sumBy(useData, 'flows')

        const dipArr = chain(useData).map('dip').uniq().value()
        const dportArr = chain(useData).map('dport').uniq().value()
        let averageVisits = dportArr.length
            ? `${Math.floor(totalFlows / dportArr.length)}&次/端口`
            : '0&次'
        if (dipArr.length > 1 && dportArr.length <= 1) {
            averageVisits = `${Math.floor(totalFlows / dipArr.length)}&次/ip`
        }
        const { starttime: time1 = 0, endtime: time2 = 0 } = alarmParams
        const rangeObj = {
            starttime: dataStarttime || time1,
            endtime: dataStarttime ? dataEndtime : time2,
        }

        const newFeatureAnalysis = {
            时间范围: `${formatTimestamp(
                rountTime5Min(rangeObj.starttime),
                'onlyHourMin'
            )}至${formatTimestamp(
                rountTime5Min(rangeObj.endtime, 'back'),
                'onlyHourMin'
            )}`,
            行为次数: `${totalFlows}&次`,
            [`对端IP${dipArr.length > 1 ? '(数)' : ''}`]:
                dipArr.length === 1 ? dipArr[0] : `${dipArr.length}&个`,
            [`对端端口${dportArr.length > 1 ? '(数)' : ''}`]:
                dportArr.length === 1
                    ? `${dportArr[0]}`
                    : `${dportArr.length}&个`,
            平均访问量: averageVisits,
            最大频率: `${accessIntensity}&次/5分钟`,
        }
        setFeatureAnalysis(newFeatureAnalysis)
    }, [featureData, alarmParams])

    return (
        <div className='analysis-desc'>
            <div className='analysis-desc-part'>
                {Object.entries(featureAnalysis).map(d => {
                    const [value, valueUnit] = d[1].split(['&'])
                    const [rangeStarttime, rangeEndtime] = value.split('至')
                    return (
                        <div className='analysis-desc-item' key={d[0]}>
                            <div className='analysis-desc-label'>{d[0]}:</div>
                            <div className='analysis-desc-value'>
                                {d[0] === '时间范围' ? (
                                    <>
                                        {rangeStarttime}
                                        <span className='split-tag'>至</span>
                                        {rangeEndtime}
                                    </>
                                ) : (
                                    value
                                )}
                                {valueUnit && (
                                    <UnitContainer unit={valueUnit} />
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default inject(stores => ({
    featureData: stores.eventDetailStore.featureData,
    alarmParams: stores.eventDetailStore.alarmParams,
}))(observer(FeatureDesc))

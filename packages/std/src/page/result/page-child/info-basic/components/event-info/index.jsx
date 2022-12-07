import React, { useMemo } from 'react'
import { inject, observer } from 'mobx-react'
import { chain } from 'lodash'
import { AlertOutlined } from '@ant-design/icons'
import {
    HackerIcon,
    VictimIcon,
} from '@shadowflow/components/ui/icon/icon-util'
import { createColorScale } from '@/utils/methods-chart-d3'
import SkipContainer from '@/components/skip-container'
import style from './index.module.less'

function EventInfo({ eventInfo, changeCurrentTabKey }) {
    const { eventData, value } = eventInfo
    const victimData = eventData.filter(d => d.victimDevice.includes(value))
    const attackDeviceCount = chain(victimData)
        .map('attackDevice')
        .uniq()
        .value().length
    const attackData = eventData.filter(d => d.attackDevice.includes(value))
    const victimDeviceCount = chain(attackData)
        .map('victimDevice')
        .uniq()
        .value().length
    const type = chain(eventData).countBy('showType').entries().value()

    const colorScale = useMemo(() => {
        return createColorScale(
            chain(eventData)
                .map('showType')
                .filter(d => d)
                .uniq()
                .value()
        )
    }, [eventData])

    return (
        <div className={`${style.event}`}>
            <div className='event-header'>
                <div className='event-classic'>
                    <div className='event-icon'>
                        <AlertOutlined />
                    </div>
                    <div className='event-detail'>
                        <SkipContainer
                            className='operate-content-active'
                            message='查看事件列表'
                            onClick={() => {
                                changeCurrentTabKey('事件')
                            }}
                        >
                            共
                            <span className='event-value'>
                                {eventData.length}
                            </span>
                            次告警
                        </SkipContainer>
                    </div>
                </div>
                <div className='event-classic'>
                    <div className='event-icon'>
                        <HackerIcon />
                    </div>
                    <div className='event-detail'>
                        <div>
                            作为受害目标
                            <span className='event-value'>
                                {victimData.length}
                            </span>
                            次
                        </div>
                        <div>
                            涉及设备
                            <span className='event-value'>
                                {attackDeviceCount}
                            </span>
                            台
                        </div>
                    </div>
                </div>
                <div className='event-classic'>
                    <div className='event-icon'>
                        <VictimIcon />
                    </div>
                    <div className='event-detail'>
                        <div>
                            作为威胁来源
                            <span className='event-value'>
                                {attackData.length}
                            </span>
                            次
                        </div>
                        <div>
                            涉及设备
                            <span className='event-value'>
                                {victimDeviceCount}
                            </span>
                            台
                        </div>
                    </div>
                </div>
                <div className='event-legend'>
                    {type.map(d => {
                        const color = colorScale(d[0])
                        return (
                            <div className='type-item' key={d[0]}>
                                <div
                                    className='type-legend'
                                    style={{
                                        backgroundColor: color,
                                    }}
                                />
                                <div className='type-label'>
                                    {`${d[0]}(${d[1]})`}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className='event-content'>
                {/* {trackData.length > 1 && (
                    <>
                        <div className='event-cotent-title'>攻击时序图</div>
                        <TreeMatrix
                            data={trackData}
                            params={params}
                            loading={loading}
                        />
                    </>
                )} */}
            </div>
        </div>
    )
}
export default inject(stores => ({
    eventInfo: stores.basicInfoStore.basicInfo.eventInfo,
    changeCurrentTabKey: stores.resultStore.changeCurrentTabKey,
}))(observer(EventInfo))

import React, { useCallback, useMemo } from 'react'
import { chain } from 'lodash'
import { translateEventType } from '@shadowflow/components/system/event-system'
import { DeviceBarChart } from '@shadowflow/components/charts'
import { inject, observer } from 'mobx-react'

function EventRank({
    tableData,
    type,
    changeFormCondition,
    attackDeviceData,
    victimDeviceData,
    resultParams,
}) {
    const useData = useMemo(() => {
        return {
            data: type === 'attackDevice' ? attackDeviceData : victimDeviceData,
            title:
                type === 'attackDevice'
                    ? `威胁来源排行(${attackDeviceData.length})`
                    : `受害目标排行(${victimDeviceData.length})`,
        }
    }, [attackDeviceData, type, victimDeviceData])
    const option = useMemo(
        () => ({
            tooltip: {
                formatter: params => {
                    const { marker, name, value } = params[0]
                    const eventTypeObj = chain(tableData)
                        .filter(d => d[type] === name)
                        .map('type')
                        .countBy()
                        .value()
                    let eventTypeNodes = ''
                    Object.entries(eventTypeObj).forEach(d => {
                        const [nowKey, nowValue] = d
                        eventTypeNodes += `
                        <div class='dot-item'>
                            <span style="display:inline-block;margin-right:5px;border-radius:8px;width:8px;height:8px;background-color:#FF4040;"></span>
                            <span class='dot-item-name' style="font-size:12px">
                                ${translateEventType(nowKey)}
                            </span>
                            <span class='dot-item-value' style="font-size:12px">${nowValue}</span>
                        </div>
                        `
                    })
                    return `<div class="echart-tooltips">
                            <div class="title">${name}</div>
                            <div class="dot-item">
                                ${marker}
                                <span class="dot-item-name">事件次数</span>
                                <span class="dot-item-value">${value}</span>
                            </div>
                            <div style="padding-left:15px;">
                            ${eventTypeNodes}
                            </div>
                        </div>`
                },
            },
            grid: { top: 0 },
            xAxis: {
                title: '事件次数',
            },
            series: {
                name: '事件次数',
                stack: '总量',
            },
        }),
        [tableData, type]
    )

    const onClickFun = useCallback(
        selectData => {
            changeFormCondition({
                device: {
                    allDevice: '',
                    [type]: selectData.name,
                },
            })
        },
        [changeFormCondition, type]
    )

    return (
        <DeviceBarChart
            title={useData.title}
            option={option}
            data={useData.data}
            onClick={onClickFun}
            resultParams={resultParams}
        />
    )
}

export default inject(stores => ({
    changeFormCondition: stores.eventListStore.changeFormCondition,
    tableData: stores.eventListStore.useData,
    attackDeviceData: stores.eventListStore.attackDeviceData,
    victimDeviceData: stores.eventListStore.victimDeviceData,
    resultParams: stores.eventListStore.params,
}))(observer(EventRank))

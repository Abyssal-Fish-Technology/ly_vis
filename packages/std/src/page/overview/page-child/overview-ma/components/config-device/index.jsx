import Section from '@shadowflow/components/ui/layout/section'
import { deviceApi, proxyApi, sctlRestart, sctlStart } from '@/service'
import RequestStore from '@/service/store'
import {
    ContainerOutlined,
    DatabaseOutlined,
    DeploymentUnitOutlined,
    ReloadOutlined,
} from '@ant-design/icons'
import { Button, message, Switch } from 'antd'
import { sankeyLinkHorizontal } from 'd3-sankey'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useRef, useState } from 'react'
import { useActivate, useUnactivate } from 'react-activation'
import { BasicCustomChart } from '@shadowflow/components/charts'
import style from './index.module.less'

const legendData = [
    {
        name: '运行正常',
        class: 'normal',
    },
    {
        name: '运行异常',
        class: 'unnoraml',
    },
    {
        name: '未启用',
        class: 'disabled',
    },
]

const deviceIcon = {
    probe: {
        name: '采集结点',
        icon: <ContainerOutlined />,
    },
    agent: {
        name: '分析节点',
        icon: <DeploymentUnitOutlined />,
    },
    server: {
        name: 'Server',
        icon: <DatabaseOutlined />,
    },
}

function calPosition(data) {
    return data.map((d, i) => {
        const sourceDom = document.getElementById(d.source)
        const targetDom = document.getElementById(d.target)
        const {
            offsetLeft: source_x,
            offsetTop: source_y,
            offsetHeight: source_height,
            offsetWidth: source_width,
        } = sourceDom
        const {
            offsetLeft: target_x,
            offsetTop: target_y,
            offsetHeight: target_height,
        } = targetDom
        const sourceColor = getComputedStyle(sourceDom, null)[
            'background-color'
        ]
        const targetColor = getComputedStyle(targetDom, null)[
            'background-color'
        ]
        return {
            id: `${d.source}-${d.target}`,
            source: { x1: source_x + source_width },
            target: { x0: target_x },
            index: i,
            value: 1,
            width: 30,
            y0: source_y + source_height / 2,
            y1: target_y + target_height / 2,
            sourceColor,
            targetColor,
        }
    })
}
function ConfigDevice({ deviceData }) {
    const [links, setlinks] = useState([])
    const [isActivate, setIsActivate] = useState(true)
    useActivate(() => {
        setIsActivate(true)
    })

    useUnactivate(() => {
        setIsActivate(false)
    })

    const [graphWidth, setGraphWidth] = useState(0)

    useEffect(() => {
        let timer = null
        if (isActivate) {
            const arr = []
            deviceData
                .filter(d => d.type === 'probe')
                .forEach(d => {
                    arr.push({
                        source: d.id,
                        target: d.agentid,
                        value: 1,
                    })
                })

            const serverData = deviceData.filter(d => d.type === 'server')[0]
            deviceData
                .filter(d => d.type === 'agent')
                .forEach(d => {
                    arr.push({
                        source: d.id,
                        target: serverData.id,
                        value: 1,
                    })
                })
            timer = setTimeout(() => {
                const newlinks = calPosition(arr)
                setlinks(newlinks)
            }, 20)
        }
        return () => {
            clearTimeout(timer)
        }
    }, [deviceData, isActivate, graphWidth])

    const container = useRef(null)

    return (
        <Section title='系统状态' className={style['config-device']}>
            <div className='device-legend'>
                {legendData.map(legendItem => (
                    <div className='device-legend-item' key={legendItem.name}>
                        <span className={`legend-sign ${legendItem.class}`} />
                        <span className='legend-label'>{legendItem.name}</span>
                    </div>
                ))}
            </div>
            <div className='device-icon'>
                {Object.entries(deviceIcon).map(d => (
                    <div className='device-icon-item' key={d[1].name}>
                        <div className='device-icon-sign'>{d[1].icon}</div>
                        <div className='device-icon-label'>{d[1].name}</div>
                    </div>
                ))}
            </div>
            <div className='device-graph' ref={container}>
                <BasicCustomChart
                    data={deviceData}
                    parentRef={container}
                    resizeCallBack={setGraphWidth}
                    className='device-svg'
                >
                    <g className='ship'>
                        {links.map(d => (
                            <linearGradient
                                id={`color${d.id}`}
                                key={d.id}
                                gradientUnits='userSpaceOnUse'
                            >
                                <stop
                                    offset='0%'
                                    stopColor={`${d.sourceColor}`}
                                />
                                <stop
                                    offset='100%'
                                    stopColor={`${d.targetColor}`}
                                />
                            </linearGradient>
                        ))}
                    </g>
                    <g className='link'>
                        {links.map(d => {
                            const path = sankeyLinkHorizontal()(d)
                            const linkprops = {
                                key: d.id,
                                d: path,
                                stroke: `url(#color${d.id})`,
                                fill: 'none',
                                strokeWidth: Math.max(1, d.width),
                            }
                            return <path {...linkprops} />
                        })}
                    </g>
                </BasicCustomChart>
                <div className='device-graph-space device-graph-probe'>
                    {deviceData
                        .filter(d => d.type === 'probe')
                        .map(d => {
                            return <DeviceItem key={d.id} data={d} />
                        })}
                </div>
                <div className='device-graph-space device-graph-agent'>
                    {deviceData
                        .filter(d => d.type === 'agent')
                        .map(d => {
                            return <DeviceItem key={d.id} data={d} />
                        })}
                </div>
                <div className='device-graph-space device-graph-server'>
                    {deviceData
                        .filter(d => d.type === 'server')
                        .map(d => {
                            return <DeviceItem key={d.id} data={d} />
                        })}
                </div>
                {/* {nodes.map(d => {
                    return (
                        <DeviceItem
                            key={d.id}
                            css={{
                                transform: `translate(${d.x0}px, ${d.y0}px)`,
                            }}
                        />
                    )
                })} */}
            </div>
        </Section>
    )
}
export default inject(stores => ({
    deviceData: stores.overviewMaStore.deviceData,
}))(observer(ConfigDevice))

const DeviceItem = inject(stores => ({
    changeData: stores.configStore.changeData,
    changeDeviceDetailData: stores.overviewMaStore.changeDeviceDetailData,
}))(function DeviceItem({ css, data, changeData, changeDeviceDetailData }) {
    const { name, status, id, type, detailInfo, tid, realId } = data
    const [loadingObj, setloadingObj] = useState(
        detailInfo.reduce((obj, d) => {
            obj[d.id] = false
            return obj
        }, {})
    )

    function changeLoading(key, isloading) {
        const newObj = {
            ...loadingObj,
            [key]: isloading,
        }
        setloadingObj(newObj)
    }

    const [loading, setloading] = useState(false)

    const callback = {
        agent: {
            api: proxyApi,
            type: 'proxy',
        },
        probe: {
            api: deviceApi,
            type: 'device',
        },
    }

    return (
        <div
            className={`device-item ${status === '正常' ? '' : 'disabled'}`}
            style={{ ...css }}
            id={id}
        >
            {/* <SettingOutlined className='device-item-setting' /> */}
            <div className='device-item-icon'>
                {deviceIcon[type].icon}
                <span>
                    {name}
                    {type !== 'server' && (
                        <Switch
                            size='small'
                            checkedChildren='启用'
                            unCheckedChildren='禁用'
                            checked={status === '正常'}
                            loading={loading}
                            onChange={isDisabled => {
                                setloading(true)
                                callback[type]
                                    .api({
                                        op: 'mod',
                                        id: realId,
                                        disabled: isDisabled ? 'N' : 'Y',
                                    })
                                    .then(res => {
                                        if (res === '[{executed}]') {
                                            setloading(false)
                                            callback[type]
                                                .api({
                                                    op: 'get',
                                                })
                                                .then(res2 => {
                                                    changeData({
                                                        [callback[type]
                                                            .type]: res2,
                                                    })
                                                })
                                        }
                                    })
                            }}
                        />
                    )}
                </span>
            </div>
            <div className='device-item-info'>
                {detailInfo.map(d => {
                    return (
                        <span key={d.id} className='device-item-info-item'>
                            <span className='device-item-info-label'>
                                {d.name}:
                            </span>
                            <span className='device-item-info-value'>
                                {d.type === 'disk' && d.status}
                                {d.type === 'http' && (
                                    <div className='device-item-restart'>
                                        {d.status === 'active'
                                            ? '开启中'
                                            : '已关闭'}
                                        <Button
                                            ghost
                                            size='small'
                                            icon={<ReloadOutlined />}
                                            loading={loadingObj[d.id]}
                                            onClick={() => {
                                                changeLoading(d.id, true)
                                                sctlRestart({
                                                    type: 'http',
                                                    tid,
                                                })
                                                RequestStore.cancel()
                                                setTimeout(() => {
                                                    changeLoading(d.id, false)
                                                    message.success(
                                                        '重启成功, 请在2分钟后刷新页面!'
                                                    )
                                                }, 1000)
                                                // const test = setInterval(() => {
                                                //     sctlStat({
                                                //         type: 'http',
                                                //         tid,
                                                //     }).then(res => {
                                                //         console.log(res)
                                                //         clearInterval(test)
                                                //         overviewMaStore.changeDeviceDetailData(
                                                //             id,
                                                //             d.id,
                                                //             res[0].status
                                                //         )
                                                //         message.success(
                                                //             '重启成功'
                                                //         )
                                                //     })
                                                // }, 500)
                                            }}
                                        />
                                    </div>
                                )}
                                {!['disk', 'http'].includes(d.type) && (
                                    <Switch
                                        onChange={turnOn => {
                                            changeLoading(d.id, true)
                                            sctlStart({
                                                type: d.type,
                                                tid,
                                                op: turnOn ? 'start' : 'stop',
                                            })
                                                .then(res => {
                                                    if (
                                                        res[0] &&
                                                        res[0].result ===
                                                            'succeed'
                                                    ) {
                                                        changeDeviceDetailData(
                                                            id,
                                                            d.id,
                                                            res[0].status
                                                        )
                                                        message.success(
                                                            '修改成功!'
                                                        )
                                                    } else {
                                                        message.warning(
                                                            '修改失败!'
                                                        )
                                                    }
                                                })
                                                .finally(() => {
                                                    changeLoading(d.id, false)
                                                })
                                        }}
                                        loading={loadingObj[d.id]}
                                        size='small'
                                        checked={d.status === 'active'}
                                        checkedChildren='开'
                                        unCheckedChildren='关'
                                    />
                                )}
                            </span>
                        </span>
                    )
                })}
            </div>
        </div>
    )
})

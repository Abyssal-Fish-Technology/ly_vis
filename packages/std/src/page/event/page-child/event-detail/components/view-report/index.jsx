/* eslint-disable jsx-a11y/alt-text */
import { Button, Modal } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
    HackerIcon,
    VictimIcon,
} from '@shadowflow/components/ui/icon/icon-util'
import XLSX from 'xlsx'
import JSZip from 'jszip'
import { CloudDownloadOutlined, SaveOutlined } from '@ant-design/icons'
import html2Doc from 'html-docx-js/dist/html-docx'
import html2canvas from 'html2canvas'
import moment from 'moment'
import { isDnsTypeEvent } from '@shadowflow/components/system/event-system'
import { getThemeParams } from '@shadowflow/components/utils/universal/methods-storage'
import style from './index.module.less'

function setTableStyle(table) {
    if (!table || table.tagName.toLowerCase() !== 'table') return
    const tds = table.querySelectorAll('td')
    const ths = table.querySelectorAll('th')
    ;[table, ...tds, ...ths].forEach(node => {
        node.style.border = '1px solid'
    })
    table.style.borderCollapse = 'collapse'
    table.style.padding = '8px'
    table.style.width = `100%`
}

function getHtml(element) {
    const cloneElement = element.cloneNode(true)
    const parentContainer = element.parentNode
    parentContainer.replaceChild(cloneElement, element)

    const promiseArr = []
    const text = cloneElement.querySelector('#comment-id').value
    const textareaContent = cloneElement.querySelector('.textarea-content')
    textareaContent.innerHTML = text
    textareaContent.style.borderRadius = '8px'
    const chartList = cloneElement.querySelectorAll('.chart-item')
    chartList.forEach(node => {
        promiseArr.push(
            new Promise(resolve => {
                html2canvas(node, {
                    allowTaint: true,
                }).then(canvas => {
                    const img = document.createElement('img')
                    img.src = canvas.toDataURL()
                    const { width, height } = canvas
                    const ratio = width / height
                    img.width = 600
                    img.height = 600 / ratio
                    img.style.width = '100%'
                    node.innerHTML = img.outerHTML
                    resolve()
                })
            })
        )
    })

    const iconlist = cloneElement.querySelectorAll('.td-icon')
    iconlist.forEach(node => {
        promiseArr.push(
            new Promise(resolve => {
                html2canvas(node, {
                    allowTaint: true,
                }).then(canvas => {
                    const img = document.createElement('img')
                    img.src = canvas.toDataURL()
                    const { width, height } = canvas
                    img.width = width
                    img.height = height
                    img.style.width = '100%'
                    node.innerHTML = img.outerHTML
                    resolve()
                })
            })
        )
    })

    const appendixContainer = cloneElement.querySelector('.appendix-container')
    appendixContainer.innerHTML = '附件详情见压缩包内其它文件。'

    const tableList = cloneElement.querySelectorAll('table')

    tableList.forEach(table => {
        setTableStyle(table)
    })

    return Promise.all(promiseArr).then(() => {
        parentContainer.replaceChild(element, cloneElement)
        return `<!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /></head>
        <body>${cloneElement.outerHTML}<body>
        </html>`
    })
}

function ViewReport({
    eventData,
    attackDeviceInfo,
    victimDeviceInfo,
    alarmOriginData,
    featureData,
    eventFeatureOriginData,
}) {
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        if (visible) {
            setLoading(true)
            setTimeout(() => {
                const alarmNode = document.getElementById('alarm-chart-id')
                const tcpNode = document.getElementById('tcp-chart-id')
                ;[
                    { node: alarmNode, id: '#alarm-img' },
                    { node: tcpNode, id: '#tcp-img' },
                ].forEach((item, index) => {
                    const { id, node } = item
                    return html2canvas(node, {
                        allowTaint: true,
                        backgroundColor:
                            getThemeParams() === 'dark'
                                ? 'rgb(20, 20, 43)'
                                : 'rgb(255,255,255)',
                    }).then(canvas => {
                        const img = document.querySelector(id)
                        img.src = canvas.toDataURL()
                        const { width, height } = canvas
                        const [usewidth, useHeight] = [width, height].map(
                            d => d / window.devicePixelRatio
                        )
                        img.width = usewidth
                        img.height = useHeight
                        img.style.width = '100%'
                        if (index === 1) {
                            setLoading(false)
                        }
                    })
                })
            }, 400)
        }
    }, [visible])
    const container = useRef(null)
    const basicEventData = useMemo(() => {
        const {
            attackDevice,
            victimDevice,
            show_starttime,
            show_endtime,
            show_duration,
            detailType,
            show_level,
            show_model,
            show_proc_status,
            show_type,
            extraInfo,
            desc,
            stage,
        } = eventData

        const leftResult = Object.values(
            attackDeviceInfo.leftInfo || {}
        ).filter(d => d)
        const rightResult = Object.values(
            victimDeviceInfo.leftInfo || {}
        ).filter(d => d)
        const {
            threatInfo: leftThreatInfo = [],
            portInfo: leftPortInfo = [],
            assetInfo: leftAssetInfo = [],
        } = attackDeviceInfo.rightData || {}
        const {
            threatInfo: rightThreatInfo = [],
            portInfo: rightPortInfo = [],
            assetInfo: rightAssetInfo = [],
        } = victimDeviceInfo.rightData || {}

        const calculateRightText = (threatInfo, portInfo, assetInfo) => {
            let result = ''
            switch (true) {
                case threatInfo.length > 0:
                    result = threatInfo[0].bwclass
                    break
                case portInfo.length > 0:
                    result = portInfo[0].desc
                    break
                case assetInfo.length > 0:
                    result = assetInfo.join()
                    break
                default:
                    break
            }
            return result
        }

        return [
            [
                {
                    label: '威胁设备',
                    value: attackDevice,
                },
                {
                    label: '补充信息',
                    value: `${
                        leftResult.length ? leftResult.slice(0, 3) : ''
                    } ${calculateRightText(
                        leftThreatInfo,
                        leftPortInfo,
                        leftAssetInfo
                    )}`,
                },
            ],
            [
                {
                    label: '受害设备',
                    value: victimDevice,
                },
                {
                    label: '补充信息',
                    value: `${
                        rightResult.length ? rightResult.slice(0, 3) : ''
                    } ${calculateRightText(
                        rightThreatInfo,
                        rightPortInfo,
                        rightAssetInfo
                    )}`,
                },
            ],
            [
                {
                    label: '发生时间',
                    value: `${show_starttime} 至 ${show_endtime} (持续 ${show_duration})`,
                },
            ],
            [
                {
                    label: '威胁类型',
                    value: show_type,
                },
                {
                    label: '告警级别',
                    value: show_level,
                },
            ],
            [
                {
                    label: '详细类型',
                    value: detailType ? detailType.join() : '',
                },
                {
                    label: '扩展信息',
                    value: extraInfo,
                },
            ],
            [
                {
                    label: '攻击阶段',
                    value: stage,
                },
                {
                    label: '描述信息',
                    value: desc,
                },
            ],
            [
                {
                    label: '检出手段',
                    value: show_model,
                },
                {
                    label: '事件状态',
                    value: show_proc_status,
                },
            ],
        ]
    }, [eventData, attackDeviceInfo, victimDeviceInfo])
    const exportOriginData = useCallback(
        (type, isZip = false) => {
            const dataObj = {
                alarm: alarmOriginData,
                tcp: featureData,
                eventFeature: eventFeatureOriginData,
            }
            const exportList =
                type === 'tcp'
                    ? {
                          data: [
                              [dataObj[type].attack, '攻击设备'],
                              [dataObj[type].victim, '受害设备'],
                          ],
                          name: 'TCP主动握手数据详情',
                      }
                    : {
                          data: [
                              [
                                  dataObj[type],
                                  type === 'alarm'
                                      ? '事件告警数据详情'
                                      : '事件相关流量数据详情',
                              ],
                          ],
                          name:
                              type === 'alarm'
                                  ? '事件告警数据详情'
                                  : '事件相关流量数据详情',
                      }

            const { name, data = [] } = exportList
            const data1 = data[0] || []
            const data2 = data1[0] || []
            const data3 = data2[0] || {}
            const fields = Object.keys(data3).map(d => {
                return { label: d, value: d }
            })

            const header = fields
                .filter(d => fields.includes(d.value))
                .map(d => d.label)

            const workbook = XLSX.utils.book_new()

            data.forEach(d => {
                const sheet = XLSX.utils.json_to_sheet(d[0] || [], {
                    header,
                })
                XLSX.utils.book_append_sheet(workbook, sheet, d[1])
            })
            if (isZip) {
                const workbook2blob = wb => {
                    // 生成excel的配置项
                    const wopts = {
                        // 要生成的文件类型
                        bookType: 'xlsx',
                        // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
                        bookSST: false,
                        type: 'binary',
                    }

                    const wbout = XLSX.write(wb, wopts)
                    // 将字符串转ArrayBuffer
                    function s2ab(s) {
                        const buf = new ArrayBuffer(s.length)
                        const view = new Uint8Array(buf)
                        // eslint-disable-next-line no-bitwise
                        for (let i = 0; i < s.length; i += 1)
                            view[i] = s.charCodeAt(i) & 0xff
                        return buf
                    }

                    const blob = new Blob([s2ab(wbout)], {
                        type: 'application/octet-stream',
                    })

                    return blob
                }
                return workbook2blob(workbook)
            }

            return XLSX.writeFile(workbook, `${name}.xlsx`)
        },
        [alarmOriginData, featureData, eventFeatureOriginData]
    )

    const saveAs = useCallback(() => {
        setLoading(true)
        const zip = new JSZip()
        const promiseArr = []
        if (alarmOriginData.length > 0) {
            promiseArr.push(
                new Promise(resolve => {
                    zip.file('事件告警.xlsx', exportOriginData('alarm', true))
                    resolve()
                })
            )
        }
        if (featureData.length > 0) {
            promiseArr.push(
                new Promise(resolve => {
                    zip.file('TCP主动握手.xlsx', exportOriginData('tcp', true))
                    resolve()
                })
            )
        }

        if (eventFeatureOriginData.length > 0) {
            promiseArr.push(
                new Promise(resolve => {
                    zip.file(
                        '事件相关流量.xlsx',
                        exportOriginData('eventFeature', true)
                    )
                    resolve()
                })
            )
        }
        promiseArr.push(
            new Promise(resolve => {
                setTimeout(() => {
                    getHtml(container.current).then(content => {
                        const blobContext = html2Doc.asBlob(content)
                        zip.file('事件报告.docx', blobContext)
                        resolve()
                    })
                }, 100)
            })
        )

        return Promise.all(promiseArr).then(() => {
            return zip.generateAsync({ type: 'blob' }).then(content => {
                // 传入blob数据和文件名 并下载为本地文件
                let url = content
                if (typeof content === 'object' && content instanceof Blob) {
                    url = URL.createObjectURL(content) // 创建blob地址
                }
                const a = document.createElement('a')
                a.href = url
                a.download = `事件报告${moment().format(
                    'YYYY-MM-DD HH:mm:ss'
                )}.zip`
                a.click()
                setLoading(false)
            })
        })
    }, [
        alarmOriginData.length,
        eventFeatureOriginData.length,
        exportOriginData,
        featureData.length,
    ])

    const featureTitie = useMemo(() => {
        return isDnsTypeEvent({ eventData })
            ? 'DNS请求行为分析'
            : 'TCP主动握手行为分析'
    }, [eventData])

    return (
        <>
            <Button
                icon={<SaveOutlined />}
                type='primary'
                ghost
                onClick={() => {
                    setVisible(!visible)
                }}
            >
                生成报告
            </Button>
            <Modal
                visible={visible}
                onCancel={() => {
                    setVisible(false)
                }}
                footer={false}
                width='90%'
                bodyStyle={{ padding: 0, position: 'relative' }}
                destroyOnClose
            >
                <div
                    className={`${style['event-report']} ${
                        loading ? 'app-loading' : ''
                    }`}
                >
                    <div className='report-container'>
                        <div ref={container} style={{ padding: '20px 10%' }}>
                            <h1
                                style={{
                                    textAlign: 'center',
                                    margin: '10px 0',
                                }}
                            >
                                事件处置报告
                            </h1>
                            <h2>一、事件概览</h2>
                            <div className='report-content-child'>
                                <h3>1、事件基本信息</h3>
                                <div className='report-content-child'>
                                    <table className='table' border='1'>
                                        <tbody>
                                            {basicEventData.map(trItem => {
                                                if (trItem.length > 1) {
                                                    const [td1, td2] = trItem
                                                    return (
                                                        <tr
                                                            key={`${td1.label}_${td1.value}`}
                                                        >
                                                            <td>{td1.label}</td>
                                                            <td>{td1.value}</td>
                                                            <td>{td2.label}</td>
                                                            <td>{td2.value}</td>
                                                        </tr>
                                                    )
                                                }
                                                return (
                                                    <tr
                                                        key={`${trItem[0].label}_${trItem[0].value}`}
                                                    >
                                                        <td>
                                                            {trItem[0].label}
                                                        </td>
                                                        <td colSpan={3}>
                                                            {trItem[0].value}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <h3>2、处置建议</h3>
                                <h4>2.1、系统建议</h4>
                                <div className='report-content-child'>暂无</div>
                                <h4>2.2、人工建议</h4>
                                <div className='textarea-content report-content-child'>
                                    <textarea
                                        id='comment-id'
                                        placeholder='请输入处置意见'
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <h2>二、事件相关数据</h2>
                            <div className='report-content-child'>
                                <h3>1、设备信息</h3>
                                <h4> 1.1、威胁设备</h4>
                                <div className='report-content-child'>
                                    <ReportDeviceTable
                                        data={attackDeviceInfo}
                                        icon={<HackerIcon />}
                                    />
                                </div>
                                <h4> 1.2、受害设备</h4>
                                <div className='report-content-child'>
                                    <ReportDeviceTable
                                        data={victimDeviceInfo}
                                        icon={<VictimIcon />}
                                    />
                                </div>
                                <h3>2、事件告警行为时序分析</h3>
                                <h4>2.1、可视化</h4>
                                <div className='report-content-child chart-item'>
                                    {/* <TimeingChangeChart /> */}
                                    <img id='alarm-img' />
                                </div>
                                <h4>2.2、原始数据</h4>
                                <div className='report-content-child'>
                                    详见附件1
                                </div>
                                <h3>3、{featureTitie}</h3>
                                <h4>3.1、可视化</h4>
                                <div className='report-content-child chart-item'>
                                    {/* <TcpTimingChart /> */}
                                    <img id='tcp-img' />
                                </div>
                                <h4>3.2、原始数据</h4>
                                <div className='report-content-child'>
                                    详见附件2
                                </div>
                                <h3>4、事件相关流量数据分析</h3>
                                {/* <h4>4.1、可视化</h4>
                            <div className='report-content-child chart-item'>
                                <FlowChart />
                            </div> */}
                                <h4>4.1、原始数据</h4>
                                <div className='report-content-child'>
                                    详见附件3
                                </div>
                            </div>
                            <h2>三、附件</h2>
                            <div className='report-content-child appendix-container'>
                                {alarmOriginData.length > 0 && (
                                    <div
                                        onClick={() => {
                                            exportOriginData('alarm')
                                        }}
                                        className='file-name'
                                    >
                                        附件1：事件告警数据详情.xlsx
                                    </div>
                                )}
                                {featureData.length > 0 && (
                                    <div
                                        onClick={() => {
                                            exportOriginData('tcp')
                                        }}
                                        className='file-name'
                                    >
                                        附件2： 行为特征数据详情.xlsx
                                    </div>
                                )}
                                {eventFeatureOriginData.length > 0 && (
                                    <div
                                        onClick={() => {
                                            exportOriginData('eventFeature')
                                        }}
                                        className='file-name'
                                    >
                                        附件3：事件相关流量数据详情.xlsx
                                    </div>
                                )}
                            </div>
                        </div>
                        <div
                            className='download-btn'
                            onClick={() => {
                                saveAs()
                            }}
                        >
                            <CloudDownloadOutlined />
                            <div>报告下载</div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default inject(stores => ({
    attackDeviceInfo: stores.eventDetailStore.attackDeviceInfo,
    victimDeviceInfo: stores.eventDetailStore.victimDeviceInfo,
    alarmOriginData: stores.eventDetailStore.alarmOriginData,
    featureData: stores.eventDetailStore.featureData,
    eventFeatureOriginData: stores.eventDetailStore.eventFeatureOriginData,
    setCreateLoading: stores.eventDetailStore.setCreateLoading,
}))(observer(ViewReport))

function ReportDeviceTable({ data, icon }) {
    const {
        leftInfo: { addressInfo, latLng, timePosition, operator, tag },
        rightInfo: {
            lastestTag,
            created,
            updated,
            rankDesc,
            lastestSource,
            assetDesc,
            assetRange,
            info,
        },
        device,
        useType,
    } = data

    const rightTitle = {
        ti: '情报信息',
        port: '端口信息',
        asset: '资产信息',
    }
    const firstTd = {
        ti: {
            title: '最新情报',
            value: lastestTag,
        },
        port: {
            title: '端口信息',
            value: info,
        },
        asset: {
            title: '资产描述',
            value: assetDesc,
        },
    }
    const secondTd = {
        ti: {
            title: '收录时间',
            value: created,
        },
        asset: {
            title: '资产标签',
            value: assetRange,
        },
        port: {
            title: '--',
            value: '--',
        },
    }
    return (
        <table className='table' border='1'>
            <tbody>
                <tr>
                    <td rowSpan={6} style={{ width: '150px' }}>
                        <div className='td-icon'>{icon}</div>
                        <div style={{ textAlign: 'center' }}>{device}</div>
                    </td>
                    <td colSpan={2}>基本信息</td>
                    <td colSpan={2}>{rightTitle[useType]}</td>
                </tr>
                <tr>
                    <td>地理信息</td>
                    <td>{addressInfo}</td>
                    <td>{firstTd[useType].title}</td>
                    <td>{firstTd[useType].value}</td>
                </tr>
                <tr>
                    <td>经纬度</td>
                    <td>{latLng}</td>
                    <td>{secondTd[useType].title}</td>
                    <td>{secondTd[useType].value}</td>
                </tr>
                <tr>
                    <td>时区</td>
                    <td>{timePosition}</td>
                    <td>{useType === 'ti' ? '更新时间' : '--'}</td>
                    <td>{useType === 'ti' ? updated : '--'}</td>
                </tr>
                <tr>
                    <td>运营商</td>
                    <td>{operator}</td>
                    <td>{useType === 'ti' ? '威胁等级' : '--'}</td>
                    <td>{useType === 'ti' ? rankDesc : '--'}</td>
                </tr>
                <tr>
                    <td>系统标签</td>
                    <td>{tag}</td>
                    <td>{useType === 'ti' ? '情报来源' : '--'}</td>
                    <td>{useType === 'ti' ? lastestSource : '--'}</td>
                </tr>
            </tbody>
        </table>
    )
}

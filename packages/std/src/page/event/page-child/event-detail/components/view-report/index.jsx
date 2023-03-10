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
    appendixContainer.innerHTML = '??????????????????????????????????????????'

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
                    label: '????????????',
                    value: attackDevice,
                },
                {
                    label: '????????????',
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
                    label: '????????????',
                    value: victimDevice,
                },
                {
                    label: '????????????',
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
                    label: '????????????',
                    value: `${show_starttime} ??? ${show_endtime} (?????? ${show_duration})`,
                },
            ],
            [
                {
                    label: '????????????',
                    value: show_type,
                },
                {
                    label: '????????????',
                    value: show_level,
                },
            ],
            [
                {
                    label: '????????????',
                    value: detailType ? detailType.join() : '',
                },
                {
                    label: '????????????',
                    value: extraInfo,
                },
            ],
            [
                {
                    label: '????????????',
                    value: stage,
                },
                {
                    label: '????????????',
                    value: desc,
                },
            ],
            [
                {
                    label: '????????????',
                    value: show_model,
                },
                {
                    label: '????????????',
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
                              [dataObj[type].attack, '????????????'],
                              [dataObj[type].victim, '????????????'],
                          ],
                          name: 'TCP????????????????????????',
                      }
                    : {
                          data: [
                              [
                                  dataObj[type],
                                  type === 'alarm'
                                      ? '????????????????????????'
                                      : '??????????????????????????????',
                              ],
                          ],
                          name:
                              type === 'alarm'
                                  ? '????????????????????????'
                                  : '??????????????????????????????',
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
                    // ??????excel????????????
                    const wopts = {
                        // ????????????????????????
                        bookType: 'xlsx',
                        // ????????????Shared String Table????????????????????????????????????????????????????????????????????????IOS??????????????????????????????
                        bookSST: false,
                        type: 'binary',
                    }

                    const wbout = XLSX.write(wb, wopts)
                    // ???????????????ArrayBuffer
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
                    zip.file('????????????.xlsx', exportOriginData('alarm', true))
                    resolve()
                })
            )
        }
        if (featureData.length > 0) {
            promiseArr.push(
                new Promise(resolve => {
                    zip.file('TCP????????????.xlsx', exportOriginData('tcp', true))
                    resolve()
                })
            )
        }

        if (eventFeatureOriginData.length > 0) {
            promiseArr.push(
                new Promise(resolve => {
                    zip.file(
                        '??????????????????.xlsx',
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
                        zip.file('????????????.docx', blobContext)
                        resolve()
                    })
                }, 100)
            })
        )

        return Promise.all(promiseArr).then(() => {
            return zip.generateAsync({ type: 'blob' }).then(content => {
                // ??????blob?????????????????? ????????????????????????
                let url = content
                if (typeof content === 'object' && content instanceof Blob) {
                    url = URL.createObjectURL(content) // ??????blob??????
                }
                const a = document.createElement('a')
                a.href = url
                a.download = `????????????${moment().format(
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
            ? 'DNS??????????????????'
            : 'TCP????????????????????????'
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
                ????????????
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
                                ??????????????????
                            </h1>
                            <h2>??????????????????</h2>
                            <div className='report-content-child'>
                                <h3>1?????????????????????</h3>
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
                                <h3>2???????????????</h3>
                                <h4>2.1???????????????</h4>
                                <div className='report-content-child'>??????</div>
                                <h4>2.2???????????????</h4>
                                <div className='textarea-content report-content-child'>
                                    <textarea
                                        id='comment-id'
                                        placeholder='?????????????????????'
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <h2>????????????????????????</h2>
                            <div className='report-content-child'>
                                <h3>1???????????????</h3>
                                <h4> 1.1???????????????</h4>
                                <div className='report-content-child'>
                                    <ReportDeviceTable
                                        data={attackDeviceInfo}
                                        icon={<HackerIcon />}
                                    />
                                </div>
                                <h4> 1.2???????????????</h4>
                                <div className='report-content-child'>
                                    <ReportDeviceTable
                                        data={victimDeviceInfo}
                                        icon={<VictimIcon />}
                                    />
                                </div>
                                <h3>2?????????????????????????????????</h3>
                                <h4>2.1????????????</h4>
                                <div className='report-content-child chart-item'>
                                    {/* <TimeingChangeChart /> */}
                                    <img id='alarm-img' />
                                </div>
                                <h4>2.2???????????????</h4>
                                <div className='report-content-child'>
                                    ????????????1
                                </div>
                                <h3>3???{featureTitie}</h3>
                                <h4>3.1????????????</h4>
                                <div className='report-content-child chart-item'>
                                    {/* <TcpTimingChart /> */}
                                    <img id='tcp-img' />
                                </div>
                                <h4>3.2???????????????</h4>
                                <div className='report-content-child'>
                                    ????????????2
                                </div>
                                <h3>4?????????????????????????????????</h3>
                                {/* <h4>4.1????????????</h4>
                            <div className='report-content-child chart-item'>
                                <FlowChart />
                            </div> */}
                                <h4>4.1???????????????</h4>
                                <div className='report-content-child'>
                                    ????????????3
                                </div>
                            </div>
                            <h2>????????????</h2>
                            <div className='report-content-child appendix-container'>
                                {alarmOriginData.length > 0 && (
                                    <div
                                        onClick={() => {
                                            exportOriginData('alarm')
                                        }}
                                        className='file-name'
                                    >
                                        ??????1???????????????????????????.xlsx
                                    </div>
                                )}
                                {featureData.length > 0 && (
                                    <div
                                        onClick={() => {
                                            exportOriginData('tcp')
                                        }}
                                        className='file-name'
                                    >
                                        ??????2??? ????????????????????????.xlsx
                                    </div>
                                )}
                                {eventFeatureOriginData.length > 0 && (
                                    <div
                                        onClick={() => {
                                            exportOriginData('eventFeature')
                                        }}
                                        className='file-name'
                                    >
                                        ??????3?????????????????????????????????.xlsx
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
                            <div>????????????</div>
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
        ti: '????????????',
        port: '????????????',
        asset: '????????????',
    }
    const firstTd = {
        ti: {
            title: '????????????',
            value: lastestTag,
        },
        port: {
            title: '????????????',
            value: info,
        },
        asset: {
            title: '????????????',
            value: assetDesc,
        },
    }
    const secondTd = {
        ti: {
            title: '????????????',
            value: created,
        },
        asset: {
            title: '????????????',
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
                    <td colSpan={2}>????????????</td>
                    <td colSpan={2}>{rightTitle[useType]}</td>
                </tr>
                <tr>
                    <td>????????????</td>
                    <td>{addressInfo}</td>
                    <td>{firstTd[useType].title}</td>
                    <td>{firstTd[useType].value}</td>
                </tr>
                <tr>
                    <td>?????????</td>
                    <td>{latLng}</td>
                    <td>{secondTd[useType].title}</td>
                    <td>{secondTd[useType].value}</td>
                </tr>
                <tr>
                    <td>??????</td>
                    <td>{timePosition}</td>
                    <td>{useType === 'ti' ? '????????????' : '--'}</td>
                    <td>{useType === 'ti' ? updated : '--'}</td>
                </tr>
                <tr>
                    <td>?????????</td>
                    <td>{operator}</td>
                    <td>{useType === 'ti' ? '????????????' : '--'}</td>
                    <td>{useType === 'ti' ? rankDesc : '--'}</td>
                </tr>
                <tr>
                    <td>????????????</td>
                    <td>{tag}</td>
                    <td>{useType === 'ti' ? '????????????' : '--'}</td>
                    <td>{useType === 'ti' ? lastestSource : '--'}</td>
                </tr>
            </tbody>
        </table>
    )
}

import { DownloadOutlined } from '@ant-design/icons'
import { Modal, Tabs, message } from 'antd'
import React, { useState, useCallback, useEffect } from 'react'
import { chain } from 'lodash'
import { eventEvidence } from '@/service'
import style from './index.module.less'
import EvidenceContent, {
    formatEvidenceData,
} from '../../../../../../ui/container/EvidenceContent'

const { TabPane } = Tabs

function EvidenceModal({ rowData = [], pageType, resetData }) {
    const [tabsList, setTabList] = useState([])
    const [title, setTitle] = useState('')
    const clalculateTabs = useCallback(
        (nowData, nowType) => {
            return new Promise((resolve, reject) => {
                const evidenceInfo = {
                    服务: 'srv_',
                    操作系统: 'os_',
                    中间件: 'midware_',
                    设备: 'dev_',
                    '设备/应用系统': 'dev_',
                }

                const infoArr =
                    nowType === 'srv'
                        ? ['服务', '操作系统', '中间件', '设备/应用系统']
                        : ['设备', '操作系统']
                const result = chain(nowData)
                    .map(rowItem => {
                        const {
                            ip,
                            port,
                            show_srv_name,
                            show_os_name,
                            show_midware_name,
                            show_dev_name,
                            devid,
                        } = rowItem
                        setTitle(`${ip}${port !== undefined ? `:${port}` : ''}`)
                        const commonInfo = {
                            服务: show_srv_name,
                            操作系统: show_os_name,
                            中间件: show_midware_name,
                            '设备/应用系统': show_dev_name,
                            设备: show_dev_name,
                        }
                        const getInfo = keyArr => {
                            const useObj = keyArr.reduce((obj, keyItem) => {
                                obj[keyItem] = commonInfo[keyItem]
                                return obj
                            }, {})
                            return Object.entries(useObj).filter(d => d[1])
                        }
                        return getInfo(infoArr).map(d => {
                            const time =
                                rowItem[`${evidenceInfo[`${d[0]}`]}time`]
                            return {
                                tabKey: d[0],
                                evidenceParams: {
                                    time,
                                    childTab: d[1],
                                    devid,
                                    childKey: `${d[1]}_${time}`,
                                },
                            }
                        })
                    })
                    .flatten()
                    .groupBy('tabKey')
                    .entries()
                    .map(d => {
                        const [tabKey, childs] = d
                        return {
                            tabKey,
                            childs: chain(childs).map('evidenceParams').value(),
                        }
                    })
                    .value()
                if (result.length) {
                    resolve(result)
                } else {
                    reject()
                }
            })
                .then(res => {
                    setTabList(res)
                })
                .catch(() => {
                    message.warning('暂无可查看内容！')
                    resetData([])
                })
        },
        [resetData]
    )

    useEffect(() => {
        if (rowData.length > 0) {
            clalculateTabs(rowData, pageType)
        }
    }, [rowData, pageType, clalculateTabs])

    const [activeKey, setActiveKey] = useState('')
    const [childActiveKey, setChildActiveKey] = useState('')
    useEffect(() => {
        if (tabsList.length) {
            setActiveKey(tabsList[0].tabKey)
            setChildActiveKey(tabsList[0].childs[0].childKey)
        }
    }, [tabsList])

    const [downloadUrl, setDownloadUrl] = useState('')

    const changeTab = useCallback(
        k => {
            setActiveKey(k)
            const { childs } = chain(tabsList).find({ tabKey: k }).value()
            setChildActiveKey(childs[0].childKey)
        },
        [tabsList]
    )

    const [evidenceData, setEvidenceData] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (childActiveKey) {
            const { childs } = chain(tabsList)
                .find({ tabKey: activeKey })
                .value()
            const { time, devid } = chain(childs)
                .find({ childKey: childActiveKey })
                .value()

            setDownloadUrl(
                `${window.appConfig.baseUrl}/evidence?download=true&time=${time}&devid=${devid}`
            )
            setLoading(true)
            eventEvidence({ time, devid })
                .then(res => {
                    let result = {}
                    if (res.length) {
                        const [resData] = res
                        result = formatEvidenceData(resData, time)
                    }
                    setEvidenceData(result)
                })
                .catch(() => {
                    setEvidenceData(false)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [activeKey, childActiveKey, tabsList])

    const changeChildTab = useCallback(nowKey => {
        setChildActiveKey(nowKey)
    }, [])

    const onClose = useCallback(() => {
        setActiveKey('')
        setChildActiveKey('')
        setTabList([])
        resetData([])
        setEvidenceData(false)
    }, [resetData])

    return (
        <Modal
            visible={tabsList.length > 0}
            onCancel={() => {
                onClose()
            }}
            destroyOnClose
            width='80%'
            title={`${title} 包内容查看`}
            className={style['evidence-modal']}
            bodyStyle={{ padding: '0 20px 0 0', overflowY: 'scroll' }}
            maskClosable={false}
            okButtonProps={{
                href: downloadUrl,
                icon: <DownloadOutlined />,
            }}
            okText='下载'
        >
            <Tabs
                tabPosition='left'
                activeKey={activeKey}
                onChange={nowKey => {
                    changeTab(nowKey)
                }}
            >
                {tabsList.map(tabItem => {
                    const { tabKey, childs } = tabItem
                    return (
                        <TabPane tab={tabKey} key={tabKey}>
                            <Tabs
                                activeKey={childActiveKey}
                                onChange={activeChildKey => {
                                    changeChildTab(activeChildKey)
                                }}
                                size='small'
                                className={loading ? 'app-loading' : ''}
                            >
                                {childs.map(childItem => {
                                    const { childTab, childKey } = childItem
                                    return (
                                        <TabPane tab={childTab} key={childKey}>
                                            <EvidenceContent
                                                data={evidenceData}
                                            />
                                        </TabPane>
                                    )
                                })}
                            </Tabs>
                        </TabPane>
                    )
                })}
            </Tabs>
        </Modal>
    )
}

export default EvidenceModal

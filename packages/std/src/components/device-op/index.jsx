import {
    BarsOutlined,
    EditOutlined,
    ExportOutlined,
    GlobalOutlined,
    PlusOutlined,
    SearchOutlined,
    SettingOutlined,
    UpCircleOutlined,
    PartitionOutlined,
} from '@ant-design/icons'
import { Descriptions, message, Tabs, Timeline } from 'antd'
import React, { useCallback, useMemo, useState } from 'react'
import { inject, observer } from 'mobx-react'
import DeviceOpMenuTemplate from '@shadowflow/components/ui/table/device-op-menu-template'
import { find, chain } from 'lodash'
import { blacklistApi, internalApi, moApi, whitelistApi } from '@/service'
import { skipPage } from '@/utils/methods-ui'
import deviceOpMenuStore from '@shadowflow/components/ui/table/device-op-menu-template/store'
import { getDeviceInfo, TiResultSort } from '@/utils/methods-data'

import FlagIcon from '@shadowflow/components/ui/icon/icon-flag'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import {
    translateTiSource,
    translateType,
} from '@shadowflow/components/utils/business/methods-ti'
import { formateUTC } from '@shadowflow/components/utils/universal/methods-time'
import {
    Address,
    getDeviceType,
} from '@shadowflow/components/utils/universal/methods-net'
import { openAddInternalIpModal } from '@shadowflow/components/ui/modal'
import { AntdEmptySuper } from '@shadowflow/components/ui/antd-components-super'
import UnitContainer from '@shadowflow/components/ui/container/unit-container'
import withAuth from '@shadowflow/components/ui/container/with-auth'
import { openAddBlackModal, openAddWhiteModal } from '../modals'
import Score from '../chart/chart-score'
import style from './index.module.less'
import { openMoModal } from '../modals/modal-config-mo'

const { TabPane } = Tabs

// 设备操作菜单
export const DeviceOpMenu = withAuth(
    inject('configStore')(
        observer(function DeviceOpMenu({ configStore, userAuth = false }) {
            const { device, resultParams } = deviceOpMenuStore
            const {
                ip = '',
                port = '',
                domain = '',
                isOnlyIp = false,
                isOnlyPort = false,
            } = useMemo(() => getDeviceType(device), [device])
            const resultDevice = useMemo(
                () => device.toString().split(':')[0],
                [device]
            )
            const { black, white, changeData, internal, mo } = configStore

            /**
             * 判断黑白名单，分两种情况
             * 1、配置中的黑、白名单，ip和port都配置了
             * 2、只配了ip的情况
             */
            const findWhiteOrBlack = useCallback(
                list => {
                    const currentDevice =
                        typeof device !== 'string' ? device.toString() : device
                    return find(list, listItem => {
                        const [nowIp = '', nowPort = ''] = currentDevice.split(
                            ':'
                        )
                        const { ip: itemIp, port: itemPort } = listItem
                        if (!!itemPort && !!itemIp) {
                            return nowIp === itemIp && nowPort === itemPort
                        }
                        if (!!itemIp && !itemPort) {
                            return nowIp === itemIp
                        }
                        return false
                    })
                },
                [device]
            )

            const blackData = useMemo(() => findWhiteOrBlack(black), [
                black,
                findWhiteOrBlack,
            ])
            const whiteData = useMemo(() => findWhiteOrBlack(white), [
                white,
                findWhiteOrBlack,
            ])
            const internalData = useMemo(() => {
                const addr = Address(ip)
                const ipString = `${addr.correctForm()}${addr.subnet}`
                return internal.find(d => d.ip === ipString) || { ip }
            }, [internal, ip])

            const moData = useMemo(() => {
                return find(mo, d => [d.moip, d.pip].includes(ip))
            }, [ip, mo])

            const configList = useMemo(() => {
                return [
                    {
                        title: '黑名单',
                        openModalFun: openAddBlackModal,
                        data: blackData,
                        api: blacklistApi,
                        dataKey: 'black',
                        disabled: !blackData,
                    },
                    {
                        title: '白名单',
                        openModalFun: openAddWhiteModal,
                        data: whiteData,
                        api: whitelistApi,
                        dataKey: 'white',
                        disabled: !whiteData,
                    },
                    {
                        title: '资产标签',
                        openModalFun: openAddInternalIpModal,
                        data: internalData,
                        api: internalApi,
                        dataKey: 'internal',
                        disabled: !internalData.id,
                    },
                    {
                        title: '追踪',
                        openModalFun: openMoModal,
                        data: moData,
                        api: moApi,
                        dataKey: 'mo',
                        disabled: !moData,
                    },
                ]
            }, [blackData, internalData, moData, whiteData])

            const outerQueryList = useMemo(() => {
                return [
                    {
                        title: '直接打开',
                        href: `http://${device}`,
                    },
                    {
                        title: 'Virtural Total',
                        href: `https://www.virustotal.com/gui/search/${
                            ip || domain
                        }`,
                    },
                    {
                        title: 'Google',
                        href: `https://www.google.com/search?q=${device}`,
                    },
                ]
            }, [device, domain, ip])

            const menuList = useMemo(() => {
                const [
                    blackConfig,
                    whiteConfig,
                    internalConfig,
                    moConfig,
                ] = configList
                const calculateConfig = params => {
                    const {
                        api,
                        data,
                        openModalFun,
                        dataKey,
                        disabled,
                    } = params
                    return [
                        {
                            type: 'menu',
                            icon: <PlusOutlined />,
                            click: () => {
                                openModalFun({
                                    op: 'add',
                                    data: {
                                        [dataKey === 'mo' ? 'moip' : 'ip']: ip,
                                        [dataKey === 'mo'
                                            ? 'moport'
                                            : 'port']: port,
                                    },
                                })
                            },
                            menuText: '新增',
                        },
                        {
                            type: 'menu',
                            icon: <EditOutlined />,
                            click: () => {
                                openModalFun({
                                    op: 'mod',
                                    data,
                                    [dataKey === 'mo' ? 'moid' : 'id']: data.id,
                                })
                            },
                            menuText: '编辑',
                            disabled,
                        },
                        {
                            type: 'menu',
                            icon: <PlusOutlined />,
                            click: () => {
                                api({
                                    op: 'del',
                                    [dataKey === 'mo' ? 'moid' : 'id']: data.id,
                                }).then(() => {
                                    api().then(res => {
                                        message.success('操作成功！')
                                        changeData({
                                            [dataKey]: res,
                                        })
                                    })
                                })
                            },
                            menuText: '移除',
                            disabled,
                        },
                    ]
                }

                const resultArr = [
                    {
                        type: 'menu',
                        icon: <SearchOutlined />,
                        click: () => {
                            const nowParams = { device }
                            if (resultParams) {
                                Object.entries(
                                    Object.prototype.toString.call(
                                        resultParams
                                    ) === '[object Function]'
                                        ? resultParams()
                                        : resultParams
                                ).forEach(d => {
                                    const [newkey, newvalue] = d
                                    nowParams[newkey] = newvalue
                                })
                            }
                            skipPage('/result', { queryParams: nowParams })
                        },
                        menuText: '全局搜索',
                    },
                ]
                if (!isOnlyPort) {
                    resultArr.push(
                        {
                            type: 'divider',
                            menuText: '第一个',
                        },
                        {
                            type: 'menu',
                            icon: <BarsOutlined />,
                            click: () => {
                                const nowParams = {
                                    filterCondition: {
                                        device: {
                                            allDevice: device,
                                        },
                                    },
                                }
                                if (resultParams) {
                                    nowParams.queryParams =
                                        Object.prototype.toString.call(
                                            resultParams
                                        ) === '[object Function]'
                                            ? resultParams()
                                            : resultParams
                                }
                                skipPage('/event/list', nowParams)
                            },
                            menuText: '事件列表',
                        }
                        // {
                        //     type: 'menu',
                        //     icon: <SecurityScanOutlined />,
                        //     click: () => {
                        //         skipPage('/event/analysis', {
                        //             pageParams: {
                        //                 device: resultDevice,
                        //             },
                        //         })
                        //     },
                        //     menuText: '事件分析',
                        // },
                    )
                    if (isOnlyIp) {
                        const { handle_auth = false } = userAuth
                        if (handle_auth) {
                            resultArr.push({
                                type: 'subMenu',
                                title: '系统配置',
                                icon: <SettingOutlined />,
                                child: [
                                    {
                                        type: 'subMenu',
                                        icon: <SettingOutlined />,
                                        title: '白名单',
                                        child: calculateConfig(whiteConfig),
                                    },
                                    {
                                        type: 'subMenu',
                                        icon: <SettingOutlined />,
                                        title: '黑名单',
                                        child: calculateConfig(blackConfig),
                                    },
                                    {
                                        type: 'subMenu',
                                        icon: <SettingOutlined />,
                                        title: '资产标签',
                                        child: calculateConfig(internalConfig),
                                    },
                                    {
                                        type: 'subMenu',
                                        icon: <SettingOutlined />,
                                        title: '追踪',
                                        child: calculateConfig(moConfig),
                                    },
                                ],
                            })
                        }
                    }
                    resultArr.push(
                        {
                            type: 'divider',
                            menuText: '第二个',
                        },
                        {
                            type: 'subMenu',
                            title: '外部查询',
                            icon: <ExportOutlined />,
                            child: outerQueryList.map(item => {
                                const { title, href } = item
                                return {
                                    type: 'menu',
                                    icon: <GlobalOutlined />,
                                    menuText: title,
                                    click: () => {
                                        window.open(href)
                                    },
                                }
                            }),
                        }
                    )
                }

                return resultArr
            }, [
                changeData,
                configList,
                device,
                ip,
                isOnlyIp,
                isOnlyPort,
                outerQueryList,
                port,
                resultParams,
                userAuth,
            ])

            const [tiInfo, setTiInfo] = useState(null)

            const basinInfoHandle = useCallback(() => {
                return new Promise(resolve => {
                    getDeviceInfo(resultDevice).then(res => {
                        const {
                            asset,
                            geo,
                            system,
                            threat,
                            type,
                            info = [],
                        } = res
                        const { assetDesc = [], isAsset } = asset || {}

                        const { isBlack, isWhite } = system || {}

                        const {
                            created = '',
                            detail = [],
                            lastestSource = '',
                            lastestTag = '',
                            rank,
                            updated = '',
                        } = threat || {}

                        const {
                            nation = '',
                            province = '',
                            city = '',
                            lat = '',
                            lng = '',
                            operator = '',
                            timearea = '',
                            position: address = '',
                            nationCode = '',
                        } = geo || {}
                        const topInfo = {
                            地理信息: (
                                <>
                                    {nation ? (
                                        <>
                                            {nationCode && (
                                                <FlagIcon
                                                    code={nationCode.toLocaleLowerCase()}
                                                />
                                            )}
                                            {[nation, province, city].join('/')}
                                        </>
                                    ) : (
                                        '--'
                                    )}
                                </>
                            ),
                            运营商: operator || '--',
                            时区: address ? `${address}/${timearea}` : '--',
                            系统标签: (
                                <>
                                    {isBlack || isWhite || assetDesc.length ? (
                                        <>
                                            {isBlack && (
                                                <TagAttribute type='black'>
                                                    黑名单
                                                </TagAttribute>
                                            )}
                                            {isWhite && (
                                                <TagAttribute>
                                                    白名单
                                                </TagAttribute>
                                            )}
                                            {assetDesc.map(d => (
                                                <TagAttribute
                                                    type='asset'
                                                    key={d}
                                                >
                                                    {d}
                                                </TagAttribute>
                                            ))}
                                        </>
                                    ) : (
                                        '--'
                                    )}
                                </>
                            ),
                            经纬度: lat ? `${lat},${lng}` : '--',
                        }

                        const portDesc = chain(info).map('desc').value()
                        const resultTiInfo = {
                            describe: {
                                情报类型: translateType(type),
                                情报数据: (
                                    <>
                                        {detail.length}
                                        <UnitContainer unit='条' />
                                    </>
                                ),
                                收录时间: formateUTC(created) || '--',
                                最新情报: (
                                    <>
                                        {lastestTag ? (
                                            <TagAttribute type='event'>
                                                {lastestTag}
                                            </TagAttribute>
                                        ) : (
                                            '--'
                                        )}
                                    </>
                                ),
                                来源单位: (
                                    <>
                                        {lastestSource ? (
                                            <TagAttribute type='asset'>
                                                {translateTiSource(
                                                    lastestSource
                                                )}
                                            </TagAttribute>
                                        ) : (
                                            '--'
                                        )}
                                    </>
                                ),
                                更新时间: formateUTC(updated) || '--',
                            },
                            rank,
                            tiTag: lastestTag,
                            detail: TiResultSort(detail),
                        }

                        let badgeType = ''
                        let badgeText = ''
                        switch (true) {
                            case !!threat:
                                badgeType = 'ti'
                                badgeText = resultTiInfo.tiTag
                                break
                            case isAsset:
                                badgeType = 'asset'
                                break
                            case isBlack:
                                badgeType = 'black'
                                break
                            case isWhite:
                                badgeType = 'white'
                                break
                            default:
                                break
                        }
                        setTiInfo(resultTiInfo)
                        resolve({
                            topInfo,
                            portDesc,
                            badgeInfo: { badgeType, badgeText },
                        })
                    })
                })
            }, [resultDevice])

            const tabComponent = useMemo(() => {
                return (
                    <div className={style['tab-container']}>
                        <Tabs
                            tabBarGutter='2'
                            tabBarStyle={{ padding: '0px 10px', margin: 0 }}
                            defaultActiveKey='ti'
                        >
                            <TabPane tab='情报信息' key='ti'>
                                <div className='basic-center'>
                                    <div className='basic-center-ti-top'>
                                        <div className='basic-center-ti-top-center'>
                                            <Descriptions
                                                column={{
                                                    xxl: 3,
                                                    xl: 3,
                                                    lg: 3,
                                                    md: 1,
                                                    sm: 1,
                                                    xs: 1,
                                                }}
                                            >
                                                {tiInfo &&
                                                    Object.entries(
                                                        tiInfo.describe
                                                    ).map(item => {
                                                        const [
                                                            label,
                                                            value,
                                                        ] = item
                                                        return (
                                                            <Descriptions.Item
                                                                label={label}
                                                                key={label}
                                                            >
                                                                {value}
                                                            </Descriptions.Item>
                                                        )
                                                    })}
                                            </Descriptions>
                                        </div>
                                        <div className='basic-center-ti-top-right'>
                                            {tiInfo && (
                                                <Score score={tiInfo.rank} />
                                            )}
                                        </div>
                                    </div>
                                    <div className='basic-center-ti-center'>
                                        <div className='basic-chart-title'>
                                            图一：情报时间线
                                        </div>
                                        <div className='timeline-container'>
                                            {tiInfo && tiInfo.detail.length ? (
                                                <Timeline mode='alternate'>
                                                    {tiInfo.detail.map(
                                                        tiItem => {
                                                            const {
                                                                time,
                                                                tag,
                                                                src,
                                                            } = tiItem
                                                            return (
                                                                <Timeline.Item
                                                                    dot={
                                                                        <UpCircleOutlined />
                                                                    }
                                                                    key={`${src}_${tag}_${time}`}
                                                                >
                                                                    {translateTiSource(
                                                                        src
                                                                    )}
                                                                    ：
                                                                    <TagAttribute type='event'>
                                                                        {tag}
                                                                    </TagAttribute>
                                                                    <div className='line-time'>
                                                                        {formateUTC(
                                                                            time
                                                                        )}
                                                                    </div>
                                                                </Timeline.Item>
                                                            )
                                                        }
                                                    )}
                                                </Timeline>
                                            ) : (
                                                <AntdEmptySuper
                                                    comStyle={{ height: 200 }}
                                                    description='未查询到情报数据'
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                )
            }, [tiInfo])

            return (
                <DeviceOpMenuTemplate
                    menuList={menuList}
                    basinInfoHandle={basinInfoHandle}
                    tabComponent={tabComponent}
                />
            )
        })
    )
)

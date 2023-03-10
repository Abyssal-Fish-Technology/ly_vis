import SkipContainer from '@/components/skip-container'
import { getDeviceInfo } from '@/utils/methods-data'
import { AntdEmptySuper } from '@shadowflow/components/ui/antd-components-super'
import FlagIcon from '@shadowflow/components/ui/icon/icon-flag'
import {
    HackerIcon,
    VictimIcon,
} from '@shadowflow/components/ui/icon/icon-util'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import { formateUTC } from '@shadowflow/components/utils/universal/methods-time'
import { Descriptions } from 'antd'
import { chain, compact, isEmpty } from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useMemo, useState } from 'react'
import style from './index.module.less'

const InfoModule = inject(stores => ({
    changeReportData: stores.eventDetailStore.changeReportData,
}))(
    observer(({ type = 'attackDevice', device, params, changeReportData }) => {
        const [leftData, setLeftData] = useState([])
        const [rightData, setRightData] = useState([])
        const [loading, setLoading] = useState(false)
        const [moreType, setMoreType] = useState({
            type: 'asset',
            deviceType: 'ip',
            isHidden: true,
        })
        useEffect(() => {
            setLoading(true)
            getDeviceInfo(device)
                .then(res => {
                    const {
                        asset,
                        geo,
                        system,
                        threat,
                        type: deviceType,
                        info = [],
                    } = res

                    const {
                        assetDesc = [],
                        isAsset = false,
                        assetDetail = [],
                    } = asset || {}
                    const { isBlack, isWhite } = system || {}
                    const {
                        city = '',
                        lat = '',
                        lng = '',
                        nation = '',
                        nationCode = '',
                        operator = '',
                        position = '',
                        province = '',
                        timearea = '',
                    } = geo || {}

                    const {
                        rankDesc,
                        created,
                        updated,
                        lastestTag,
                        lastestSource,
                    } = threat || {}

                    const systemList = compact([
                        isBlack ? { type: 'black', text: '?????????' } : '',
                        isWhite ? { type: 'default', text: '?????????' } : '',
                        isAsset ? { type: 'asset', text: '??????' } : '',
                    ])

                    const systemTags = systemList.map(d => d.text)

                    const leftInfo = {
                        addressInfo: compact([nation, province, city]).join(
                            '/'
                        ),
                        latLng: compact([lat, lng]).join(','),
                        timePosition: compact([position, timearea]).join('/'),
                        operator,
                        tag: compact([...systemTags, lastestTag]).join(','),
                    }

                    let useLeftInfo = {}
                    if (deviceType === 'ip') {
                        useLeftInfo = {
                            ????????????: (
                                <>
                                    {nationCode && (
                                        <FlagIcon
                                            code={nationCode.toLocaleLowerCase()}
                                        />
                                    )}
                                    {leftInfo.addressInfo}
                                </>
                            ),
                            ?????????: leftInfo.latLng,
                            ??????: leftInfo.timePosition,
                            ?????????: operator,
                            ????????????: systemList.length ? (
                                <>
                                    {systemList.map(item => (
                                        <TagAttribute
                                            type={item.type}
                                            key={item.type}
                                        >
                                            {item.text}
                                        </TagAttribute>
                                    ))}
                                </>
                            ) : (
                                ''
                            ),
                        }
                    }
                    let useRightInfo = {}
                    let rightInfo = {}
                    const currentMoreType = {
                        type: 'asset',
                        deviceType,
                        isHidden: isEmpty(res),
                    }
                    let useType = 'ti'
                    if (threat) {
                        currentMoreType.type = 'ti'
                        useRightInfo = {
                            ????????????: (
                                <TagAttribute type='event'>
                                    {lastestTag}
                                </TagAttribute>
                            ),
                            ????????????: formateUTC(created),
                            ????????????: formateUTC(updated),
                            ????????????: rankDesc,
                            ????????????: (
                                <TagAttribute type='asset'>
                                    {lastestSource}
                                </TagAttribute>
                            ),
                        }
                        rightInfo = {
                            lastestTag,
                            created: formateUTC(created),
                            updated: formateUTC(updated),
                            rankDesc,
                            lastestSource,
                        }
                    }
                    if (!threat && isAsset) {
                        useType = 'asset'
                        useRightInfo = {
                            ????????????: (
                                <>
                                    {assetDesc.map(item => (
                                        <TagAttribute type='asset' key={item}>
                                            {item}
                                        </TagAttribute>
                                    ))}
                                </>
                            ),
                            ????????????: assetDetail[0] ? assetDetail[0].ip : '',
                        }
                        rightInfo = {
                            assetDesc: assetDesc.join(','),
                            assetRange: assetDetail[0] ? assetDetail[0].ip : '',
                        }
                    }
                    if (deviceType === 'port') {
                        useType = 'port'
                        useRightInfo = {
                            ????????????: chain(info).map('desc').join(',').value(),
                        }
                        rightInfo = {
                            info: chain(info).map('desc').join(',').value(),
                        }
                    }

                    setLeftData(Object.entries(useLeftInfo))
                    setRightData(Object.entries(useRightInfo))
                    setMoreType(currentMoreType)
                    changeReportData(
                        type === 'attackDevice'
                            ? 'attackDeviceInfo'
                            : 'victimDeviceInfo',
                        {
                            leftInfo,
                            rightInfo,
                            device,
                            useType,
                        }
                    )
                })
                .finally(() => {
                    setLoading(false)
                })
        }, [changeReportData, device, type])

        const infoFooter = useMemo(() => {
            const footerText = '??????????????????'
            const tooltipTitle = '????????????????????????'
            const search = {
                queryParams: {
                    ...params,
                    device,
                    pagekey: '??????',
                },
            }
            return (
                <>
                    {!moreType.isHidden ? (
                        <SkipContainer
                            className='operate-content-active'
                            message={tooltipTitle}
                            to={{
                                pathname: '/result',
                                search: {
                                    ...search,
                                },
                            }}
                        >
                            {footerText}
                        </SkipContainer>
                    ) : null}
                </>
            )
        }, [device, moreType, params])

        return (
            <div
                className={`${style['info-module']} ${
                    loading ? 'app-loading' : ''
                }`}
            >
                <div className='info-module-title'>
                    <span className='info-module-title-icon'>
                        {type === 'attackDevice' ? (
                            <HackerIcon />
                        ) : (
                            <VictimIcon />
                        )}
                    </span>

                    <div className='info-module-title-text'>
                        <DeviceOperate device={device} resultParams={params}>
                            {`${
                                type === 'attackDevice'
                                    ? '????????????'
                                    : '????????????'
                            }: ${device}`}
                        </DeviceOperate>
                    </div>
                </div>
                <div className='info-module-content'>
                    {leftData.length > 0 && (
                        <Descriptions
                            className='info-module-content-item'
                            column={1}
                            size='small'
                        >
                            {leftData.map(leftItem => (
                                <Descriptions.Item
                                    key={leftItem[0]}
                                    label={leftItem[0]}
                                    labelStyle={{ whiteSpace: 'nowrap' }}
                                >
                                    {leftItem[1] || '--'}
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    )}
                    {rightData.length > 0 && (
                        <Descriptions
                            className='info-module-content-item'
                            column={1}
                            size='small'
                        >
                            {rightData.map(rightItem => (
                                <Descriptions.Item
                                    key={rightItem[0]}
                                    label={rightItem[0]}
                                    labelStyle={{ whiteSpace: 'nowrap' }}
                                >
                                    {rightItem[1] || '--'}
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    )}
                </div>
                {rightData.length + leftData.length === 0 && (
                    <AntdEmptySuper
                        comStyle={{ height: 'calc(100% - 40px)' }}
                    />
                )}
                <div className='info-module-footer'>{infoFooter}</div>
            </div>
        )
    })
)
function DeviceInfo({ originRecordData }) {
    const {
        starttime,
        endtime,
        attackDevice,
        victimDevice,
        devid,
    } = originRecordData
    const params = useMemo(() => ({ devid, starttime, endtime }), [
        devid,
        endtime,
        starttime,
    ])
    return (
        <div className={style['device-info']}>
            <InfoModule
                type='attackDevice'
                device={attackDevice}
                params={params}
            />
            <InfoModule
                type='victimDevice'
                device={victimDevice}
                params={params}
            />
        </div>
    )
}

export default inject(stores => ({
    originRecordData: stores.eventDetailStore.originRecordData,
}))(observer(DeviceInfo))

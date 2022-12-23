import React, { useEffect, useMemo } from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { Col, Statistic } from 'antd'
import Section from '@shadowflow/components/ui/layout/section'
import {
    AlertOutlined,
    DatabaseOutlined,
    SecurityScanOutlined,
} from '@ant-design/icons'
import {
    DNSIcon,
    TCPIcon,
    BlackListIcon,
} from '@shadowflow/components/ui/icon/icon-util'
import { map } from 'lodash'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import DeviceBadge from '@shadowflow/components/ui/icon/device-badge'
import style from './index.module.less'
import BasicInfoStore from './store'
import EventInfo from './components/event-info'

const featureIconMap = {
    sus: <AlertOutlined />,
    black: <BlackListIcon />,
    service: <DatabaseOutlined />,
    scan: <SecurityScanOutlined />,
    tcpinit: <TCPIcon />,
    dns: <DNSIcon />,
}

function ResultBasic(props) {
    const { resultStore } = props
    const { basicLoading, eventLoading } = resultStore

    const basicInfoStore = useMemo(() => new BasicInfoStore(), [])

    useEffect(() => {
        basicInfoStore.start(resultStore)
    }, [
        basicInfoStore,
        resultStore,
        resultStore.featureInfo,
        resultStore.searchValue,
        resultStore.deviceInfo,
        resultStore.portInfo,
        resultStore.eventInfo,
        resultStore.conditionValue,
        resultStore.loading,
    ])

    const {
        value,
        portInfo,
        featureInfo,
        address,
        operator,
        coordinate,
        lastestTag,
        risk,
        badgeType,
        badgeText = '',
        tagList = [],
    } = useMemo(() => basicInfoStore.basicInfo, [basicInfoStore.basicInfo])
    function onFeatureCard(type) {
        resultStore.changeCurrentTabKey('特征')
        resultStore.setFeatureType(type)
    }

    return (
        <Provider basicInfoStore={basicInfoStore}>
            <div className={style.page}>
                <Section
                    title='基础信息'
                    className={`${basicLoading ? 'app-loading' : ''}`}
                >
                    <div className='page-header'>
                        <div className='page-header-value'>{value}</div>
                        <div>
                            {tagList.map(tagItem => {
                                const { tagType, tagText } = tagItem
                                return (
                                    <TagAttribute
                                        type={tagType}
                                        key={tagText}
                                        style={{ margin: '5px 8px 5px 0' }}
                                    >
                                        {tagText}
                                    </TagAttribute>
                                )
                            })}
                        </div>
                    </div>
                    <div className='page-basic'>
                        <div className='page-basic-info'>
                            {/* ip */}
                            {address && (
                                <div className='page-basic-item'>
                                    <div className='page-basic-item-label'>
                                        地理位置:
                                    </div>
                                    <div className='page-basic-item-value'>
                                        {address}
                                    </div>
                                </div>
                            )}
                            {operator && (
                                <div className='page-basic-item'>
                                    <div className='page-basic-item-label'>
                                        运营商:
                                    </div>
                                    <div className='page-basic-item-value'>
                                        {operator}
                                    </div>
                                </div>
                            )}
                            {coordinate && (
                                <div className='page-basic-item'>
                                    <div className='page-basic-item-label'>
                                        经纬度:
                                    </div>
                                    <div className='page-basic-item-value'>
                                        {coordinate}
                                    </div>
                                </div>
                            )}
                            {/* port */}
                            {portInfo && (
                                <div className='page-basic-item'>
                                    <div className='page-basic-item-label'>
                                        端口信息:
                                    </div>
                                    <div
                                        className='page-basic-item-value'
                                        title={portInfo}
                                    >
                                        {portInfo}
                                    </div>
                                </div>
                            )}

                            {/* Threat */}
                            {risk && (
                                <div className='page-basic-item'>
                                    <div className='page-basic-item-label'>
                                        风险值:
                                    </div>
                                    <div className='page-basic-item-value'>
                                        {risk}
                                    </div>
                                </div>
                            )}
                            {lastestTag && (
                                <div className='page-basic-item'>
                                    <div className='page-basic-item-label'>
                                        最新分类:
                                    </div>
                                    <div className='page-basic-item-value'>
                                        {lastestTag}
                                    </div>
                                </div>
                            )}
                        </div>
                        {badgeType && (
                            <DeviceBadge
                                cssStyle={{
                                    bottom: '0px',
                                    right: '20px',
                                    width: '110px',
                                    height: '110px',
                                    fontSize: '18px',
                                }}
                                deviceType={badgeType}
                                badgeText={badgeText}
                            />
                        )}
                    </div>
                </Section>
                <Section
                    title='事件信息'
                    className={`${eventLoading ? 'app-loading' : ''}`}
                >
                    <EventInfo />
                </Section>
                <Section title='流量特征'>
                    <div className='page-feature ant-row'>
                        {featureInfo.map(d => {
                            return (
                                <Col span={8} gutter={[0, 16]} key={d.name}>
                                    <div
                                        className={`page-feature-card ${
                                            !d.value && 'disabled'
                                        } ${
                                            resultStore[`${d.key}Loading`]
                                                ? 'app-loading'
                                                : ''
                                        }`}
                                    >
                                        <div
                                            className='page-feature-card-header operate-content-active'
                                            onClick={() => onFeatureCard(d.key)}
                                        >
                                            <span className='card-header-icon'>
                                                {featureIconMap[d.key]}
                                            </span>
                                            <span className='card-header-name'>
                                                {d.name}
                                            </span>
                                        </div>
                                        <div className='page-feature-card-content'>
                                            {map(d.data, (d1, k) => (
                                                <span
                                                    className='card-content-item'
                                                    key={k}
                                                >
                                                    <span className='card-content-item-label'>
                                                        {k}
                                                    </span>
                                                    :
                                                    <span className='card-content-item-value'>
                                                        <Statistic
                                                            value={
                                                                d1 > 999
                                                                    ? '999+'
                                                                    : d1
                                                            }
                                                        />
                                                    </span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Col>
                            )
                        })}
                    </div>
                </Section>
            </div>
        </Provider>
    )
}
export default inject('resultStore')(observer(ResultBasic))

import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    SwapOutlined,
} from '@ant-design/icons'
import { Spin } from 'antd'
import { chain, compact } from 'lodash'
import React, { useEffect, useMemo, useState } from 'react'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import FlagIcon from '@shadowflow/components/ui/icon/icon-flag'
import { getDeviceInfo } from '@/utils/methods-data'
import { AntdEmptySuper } from '@shadowflow/components/ui/antd-components-super'
import style from './index.module.less'

function BasicInfoItem({ name, value, type }) {
    const [content, setcontent] = useState({})
    const [loading, setloading] = useState(!!value)
    useEffect(() => {
        if (value) {
            getDeviceInfo(value)
                .then(res => {
                    const { type: devicetype, geo, info, system, threat } = res
                    if (devicetype === 'ip') {
                        const { lastestTag } = threat
                        const { isBlack, isWhite } = system
                        const tagList = [
                            isBlack ? { text: '黑名单', type: 'black' } : '',
                            isWhite ? { text: '白名单', type: 'default' } : '',
                            lastestTag
                                ? { text: lastestTag, type: 'event' }
                                : '',
                        ]
                        const {
                            nation,
                            province,
                            city,
                            operator,
                            lat,
                            lng,
                            nationCode,
                        } = geo
                        setcontent({
                            地理信息: (
                                <>
                                    {nationCode && (
                                        <FlagIcon
                                            code={nationCode.toLocaleLowerCase()}
                                        />
                                    )}
                                    {compact([nation, province, city]).join(
                                        '/'
                                    )}
                                </>
                            ),
                            运营商: operator,
                            经纬度: compact([lat, lng]).join('/'),
                            标签: (
                                <>
                                    {compact(tagList).map(d => (
                                        <TagAttribute
                                            type={d.type}
                                            className='basic-info-tag'
                                        >
                                            {d.text}
                                        </TagAttribute>
                                    ))}
                                </>
                            ),
                        })
                    }
                    if (devicetype === 'port') {
                        setcontent({
                            端口信息: chain(info).map('desc').join(',').value(),
                        })
                    }
                })
                .finally(() => {
                    setloading(false)
                })
        }
    }, [type, value])
    return (
        <div className='basicinfo-item'>
            <div className='basicinfo-item-header'>
                <span className='title-label'>{name}:</span>
                <span className='title-value'>{value}</span>
            </div>
            {value ? (
                <Spin spinning={loading}>
                    <div className='basicinfo-item-content'>
                        {Object.entries(content).map(item => {
                            const [nowname, nowvalue] = item
                            return (
                                <div
                                    className='basicinfo-content-item'
                                    key={nowname}
                                >
                                    <div className='basicinfo-content-label'>
                                        {nowname}:
                                    </div>
                                    <div className='basicinfo-content-value'>
                                        {nowvalue}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Spin>
            ) : (
                <AntdEmptySuper
                    comStyle={{ height: 'calc(100% - 40px)', fontSize: '10px' }}
                />
            )}
        </div>
    )
}

export default function BasicInfo({ moinfo }) {
    const deviceInfoArr = useMemo(() => {
        const nameDict = {
            moip: '追踪目标IP',
            moport: '追踪目标端口',
            pip: '对端IP',
            pport: '对端端口',
        }
        const directionIcon = {
            IN: <ArrowLeftOutlined />,
            OUT: <ArrowRightOutlined />,
            ALL: <SwapOutlined />,
        }
        const moInsertSignDict = {
            moip: ':',
            moport: directionIcon[moinfo.direction],
            pport: ':',
            pip: '',
        }
        return ['moip', 'moport', 'pport', 'pip'].map((key, i) => {
            return {
                name: nameDict[key],
                value: moinfo[key],
                key,
                sign: moInsertSignDict[key],
                type: [0, 3].includes(i) ? 'ip' : 'port',
            }
        })
    }, [moinfo])

    return (
        <div className={style.basicinfo}>
            {deviceInfoArr.map(d => {
                return [
                    <BasicInfoItem {...d} />,
                    d.sign ? (
                        <div className='split-sign' key={`${d.key}-sign`}>
                            {d.sign}
                        </div>
                    ) : (
                        ''
                    ),
                ]
            })}
        </div>
    )
}

import React, { useEffect, useState } from 'react'
import { assetHost, assetSrv, assetUrl } from '@/service'
import { chain } from 'lodash'
import Section from '@shadowflow/components/ui/layout/section'
import { Spin, Statistic } from 'antd'
import style from './index.module.less'

export default function AssetInfo({ params, moinfo, callback }) {
    const [ipStatic, setIpStatic] = useState({
        name: 'IP',
        value: 0,
        loading: true,
        key: 'ip',
        path: 'srv',
    })

    const [portStatic, setPortStatic] = useState({
        name: '端口',
        value: 0,
        loading: true,
        key: 'srv',
    })

    const [hostStatic, setHostStatic] = useState({
        name: '网站',
        value: 0,
        loading: true,
        key: 'host',
    })

    const [urlStatic, setUrlStatic] = useState({
        name: 'URL',
        value: 0,
        loading: true,
        key: 'url',
    })

    useEffect(() => {
        const { moip, moport } = moinfo
        const assetParams = {
            ...params,
        }
        if (moip) assetParams.ip = moip
        if (moport) assetParams.port = moport

        assetSrv(assetParams).then(srvRes => {
            callback(srvRes)
            setPortStatic({
                ...portStatic,
                value: chain(srvRes).map('port').uniq().value().length,
                loading: false,
            })
            setIpStatic({
                ...ipStatic,
                value: chain(srvRes).map('ip').uniq().value().length,
                loading: false,
            })
        })

        assetHost(assetParams).then(srvRes => {
            setHostStatic({
                ...hostStatic,
                value: chain(srvRes).map('host').uniq().value().length,
                loading: false,
            })
        })

        assetUrl(assetParams).then(srvRes => {
            setUrlStatic({
                ...urlStatic,
                value: chain(srvRes).map('url').uniq().value().length,
                loading: false,
            })
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moinfo, params])

    return (
        <Section title='资产信息(追踪目标端)'>
            <div className={style['asset-statistic']}>
                {[ipStatic, portStatic, hostStatic, urlStatic].map(
                    staticItem => {
                        const { key, name, loading, value } = staticItem
                        return (
                            <div className='asset-statistic-item' key={key}>
                                <div className='asset-statistic-name operate-content-default'>
                                    {name}
                                </div>
                                <div className='asset-statistic-value'>
                                    <Spin spinning={loading}>
                                        <Statistic value={value} />
                                    </Spin>
                                </div>
                            </div>
                        )
                    }
                )}
            </div>
        </Section>
    )
}

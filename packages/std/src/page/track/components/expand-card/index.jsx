import React, { useCallback, useState } from 'react'
import BasicInfo from './components/info-basic'
import AssetInfo from './components/info-assetstatistic'
import EventInfo from './components/info-event'
import AssetSrvInfo from './components/info-assetsrv'
import style from './index.module.less'

export default function ExpandCard({ moinfo, params }) {
    const [assetSrvData, setassetSrvData] = useState([])
    const [assetSrvInfoLoading, setassetSrvInfoLoading] = useState(true)
    const feedAssetSrvBack = useCallback(srvData => {
        setassetSrvData(srvData)
        setassetSrvInfoLoading(false)
    }, [])
    return (
        <div className={style['mo-info']}>
            <BasicInfo moinfo={moinfo} />
            <div className='otherInfo'>
                <EventInfo params={params} moinfo={moinfo} />
                <AssetInfo
                    params={params}
                    moinfo={moinfo}
                    callback={feedAssetSrvBack}
                />
                <AssetSrvInfo
                    srvData={assetSrvData}
                    loading={assetSrvInfoLoading}
                />
            </div>
        </div>
    )
}

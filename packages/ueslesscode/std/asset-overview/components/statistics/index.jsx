import React, { useMemo } from 'react'
import { inject, observer } from 'mobx-react'
import style from './index.module.less'
import AssetStatic from '../asset-static'

function Statistics({ assetStore }) {
    const {
        ipAggreData,
        hostAggreData,
        srvAggreData,
        urlAggreData,
        statisticData,
    } = assetStore

    const assetCountObj = useMemo(
        () => ({
            ip: ipAggreData.length,
            srv: srvAggreData.length,
            host: hostAggreData.length,
            url: urlAggreData.length,
        }),
        [hostAggreData, ipAggreData, srvAggreData, urlAggreData]
    )

    const useData = useMemo(() => {
        return statisticData.map(item => {
            return {
                ...item,
                count: assetCountObj[item.type],
            }
        })
    }, [assetCountObj, statisticData])

    return <AssetStatic assetStatic={useData} className={style.statistics} />
}

export default inject('assetStore')(observer(Statistics))

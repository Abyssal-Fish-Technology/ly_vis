import React, { useMemo } from 'react'
import style from './index.module.less'

export default function DeviceBadge({
    cssStyle,
    deviceType = '',
    badgeText = '',
}) {
    const { nowclass, text } = useMemo(() => {
        const resultObj = {}
        switch (deviceType) {
            case 'ti':
                resultObj.nowclass = 'ti-red'
                resultObj.text = badgeText
                break
            case 'asset':
                resultObj.nowclass = 'ti-blue'
                resultObj.text = '资产组'
                break
            case 'black':
                resultObj.nowclass = 'ti-black'
                resultObj.text = '黑名单'
                break
            case 'white':
                resultObj.nowclass = 'ti-green'
                resultObj.text = '白名单'
                break
            default:
                resultObj.nowclass = 'unknow'
                resultObj.text = '未记录'
                break
        }
        return resultObj
    }, [badgeText, deviceType])
    return (
        <div style={cssStyle} className={style['device-badge']}>
            <div className={`${nowclass} device-badge-content`}>
                <div className='device-badge-ring' />
                <div className='device-badge-text '>{text}</div>
            </div>
        </div>
    )
}

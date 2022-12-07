import { Drawer } from 'antd'
import React from 'react'
import style from './index.module.less'

export default function AssetMoreInfo({ data, closeCallback, keyMap }) {
    return (
        <Drawer
            title='资产弹窗'
            placement='right'
            onClose={closeCallback}
            visible={data}
            className={style['moreinfo-drawer']}
            width='500'
        >
            {keyMap.map(d => {
                return (
                    <div className='moreinfo-item' key={d.key}>
                        <span className='moreinfo-label'>{d.label}:</span>
                        <span className='moreinfo-value'>
                            {data[d.key] || ''}
                        </span>
                    </div>
                )
            })}
        </Drawer>
    )
}

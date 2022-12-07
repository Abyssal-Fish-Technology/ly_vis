import { Button, InputNumber } from 'antd'
import React, { useEffect, useState } from 'react'
import style from './index.module.less'

export const LimitCom = function LimitCom({ limit = 1000, callback }) {
    useEffect(() => {
        callback(limit)
    }, [callback, limit])
    const [inputValue, setInputValue] = useState(limit)
    return (
        <div className={style['limit-com']}>
            <span className='detault-color'>采样数量：</span>
            <InputNumber
                style={{ width: '100px' }}
                value={inputValue}
                min={0}
                onChange={v => {
                    setInputValue(v === null ? '' : Math.floor(v))
                }}
            />
            <Button
                className='detault-color'
                onClick={() => {
                    callback(inputValue || 0)
                }}
            >
                刷新
            </Button>
        </div>
    )
}

import React, { useState, useEffect } from 'react'
import { message, Skeleton } from 'antd'
import { isObject } from 'lodash'
import configStore from '../config/store'
import 'mobx-react/batchingForReactDom'
import style from './index.module.less'

// 更新系统通用数据成
export default function LayerUpdate(props) {
    const [showchild, setshowChild] = useState(false)
    useEffect(() => {
        configStore
            .updateAll()
            .then(() => {
                setshowChild(true)
            })
            .catch(err => {
                if (err.message === 'error') {
                    message.warn('配置数据加载失败, 请再次刷新')
                } else {
                    console.log(isObject(err) ? err.message : err)
                }
            })
    }, [])
    return (
        <>
            {showchild ? (
                props.children
            ) : (
                <div className={style.emptyPage}>
                    <div className='emptyPage-child'>
                        <Skeleton
                            round
                            title
                            paragraph={{ rows: 10 }}
                            loading
                        />
                        <Skeleton
                            round
                            title
                            paragraph={{ rows: 10 }}
                            loading
                        />
                        <Skeleton
                            round
                            title
                            paragraph={{ rows: 10 }}
                            loading
                        />
                    </div>
                </div>
            )}
        </>
    )
}

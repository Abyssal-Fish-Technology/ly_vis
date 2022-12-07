import {
    CheckOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    SettingOutlined,
} from '@ant-design/icons'
import { Statistic, Tooltip } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'

import style from './index.module.less'

function isBreakOut(count) {
    const typeItem = document.querySelector(
        '.event-type-container .event-type-item'
    )
    if (typeItem === null) return ''
    const typeContainer = document.querySelector('.event-type-container')
    const widthItem = typeItem.getBoundingClientRect().width
    const widthContainer = typeContainer.getBoundingClientRect().width
    return widthItem * count > widthContainer
}

function EventType({ store }) {
    const { eventTypeArr, changeDisabledObj, openEditModal } = store
    const [expand, setexpand] = useState(false)
    const [showExpand, setShowExpand] = useState(false)
    useEffect(() => {
        const callback = () => {
            setShowExpand(isBreakOut(eventTypeArr.length))
        }
        window.addEventListener('resize', callback)
        if (eventTypeArr.length > 0) {
            setShowExpand(isBreakOut(eventTypeArr.length))
        }
        return () => {
            window.removeEventListener('resize', callback)
        }
    }, [eventTypeArr])
    return (
        <div className={style['event-type']}>
            <div className={`event-type-container ${expand ? 'expand' : ''}`}>
                {eventTypeArr.map(d => {
                    const { name, type, disabled, value, icon: Icon } = d
                    return (
                        <div
                            className={`event-type-item ${
                                disabled ? 'disabled' : ''
                            } ${value > 0 ? '' : 'zero'}`}
                            key={name}
                        >
                            <div
                                className='event-item-icon'
                                onClick={() => {
                                    if (!value) return
                                    changeDisabledObj(type, !disabled)
                                }}
                            >
                                <Icon />
                                <span className='event-item-checked'>
                                    <CheckOutlined />
                                </span>
                            </div>
                            <div className='event-item-name'>{name}</div>
                            <div className='event-item-value'>
                                <Statistic
                                    value={value}
                                    valueStyle={{
                                        fontSize: '30px',
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className='event-showall'>
                <Tooltip title='编辑展示类型'>
                    <SettingOutlined onClick={openEditModal} />
                </Tooltip>
                {showExpand && (
                    <div
                        onClick={() => {
                            setexpand(!expand)
                        }}
                    >
                        {expand ? (
                            <DoubleRightOutlined />
                        ) : (
                            <DoubleLeftOutlined />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default inject(stores => ({
    store: stores.overviewOmStore,
}))(observer(EventType))

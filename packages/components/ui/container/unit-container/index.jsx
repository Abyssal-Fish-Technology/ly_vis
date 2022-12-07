import React from 'react'
import style from './index.module.less'

export default function UnitContainer({ unit = '', cssStyle = {} }) {
    return (
        <span className={style['unit-container']} style={{ ...cssStyle }}>
            {unit && `(${unit})`}
        </span>
    )
}

import React from 'react'
import { inject, observer } from 'mobx-react'
import { ArrowIcon } from '@/components/icon-util'
import style from './index.module.less'

function Card({ cardData }) {
    return (
        <div className={style.card}>
            {cardData.map((d, i) => {
                const arr = [
                    <div className='card-item' key={d.name}>
                        <div>
                            <div className='card-value'>{d.value}</div>
                            <div className='card-name'>{d.name}</div>
                        </div>
                    </div>,
                ]
                if (i < cardData.length - 1) {
                    arr.push(
                        <ArrowIcon
                            className='card-arrow'
                            key={`${d.name}_arrow`}
                        />
                    )
                }
                return arr
            })}
        </div>
    )
}
export default inject(props => ({
    cardData: props.eventOverviewStore.cardData,
}))(observer(Card))

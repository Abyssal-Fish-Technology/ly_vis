import { Statistic as Value } from 'antd'
import { inject, observer } from 'mobx-react'
import React from 'react'
import style from './index.module.less'

function CardSmall({ name, value, icon: Icon }) {
    return (
        <div className='card-small-item'>
            <div className='card-small-icon'>
                <Icon />
            </div>
            <div className='card-small-name'>{name}</div>
            <Value value={value} />
        </div>
    )
}

function Statistic({ statisticData }) {
    const groupByStatisticData = Object.values(
        statisticData.reduce((obj, d) => {
            if (!obj[d.group]) obj[d.group] = []
            obj[d.group].push(d)
            return obj
        }, {})
    )
    return (
        <div className={style.statistic}>
            {groupByStatisticData.map((statisticArr, i) => {
                return statisticArr.map((statisticItem, j) => {
                    return [
                        <CardSmall
                            key={statisticItem.name}
                            {...statisticItem}
                        />,
                        i < groupByStatisticData.length - 1 &&
                        j === statisticArr.length - 1 ? (
                            <span
                                className='statistic-split'
                                key={`${statisticItem.name}-split`}
                            />
                        ) : (
                            ''
                        ),
                    ]
                })
            })}
        </div>
    )
}

export default inject(stores => ({
    statisticData: stores.trackStore.statisticalData,
}))(observer(Statistic))

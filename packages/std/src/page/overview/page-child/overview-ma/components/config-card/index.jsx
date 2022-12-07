import UnitContainer from '@shadowflow/components/ui/container/unit-container'
import { inject, observer } from 'mobx-react'
import React from 'react'
import style from './index.module.less'

function ConfigCard({ configCard }) {
    return (
        <div className={style['config-card']}>
            {configCard.map(d => {
                const { icon: Icon, name, values } = d
                return (
                    <div className='config-card-item' key={name}>
                        <div className='config-card-item-left'>
                            <Icon />
                            <div className='config-card-item-name'>{name}</div>
                        </div>
                        <div className='config-card-value'>
                            {values.map(valueItem => {
                                const { desc, value, unit } = valueItem
                                return (
                                    <div
                                        className='config-card-value-item'
                                        key={desc}
                                    >
                                        {desc}
                                        <span className='config-card-value-item-value'>
                                            {value}
                                        </span>
                                        <UnitContainer unit={unit} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
export default inject(props => ({
    configCard: props.overviewMaStore.configCard,
}))(observer(ConfigCard))

import React, { useMemo } from 'react'
import { observer, Provider } from 'mobx-react'
import Toptoolbox from '@shadowflow/components/ui/form/toptoolbox'
import { Switch } from 'antd'
import { useEventUpdate } from '@/utils/methods-event'
import style from './index.module.less'
import EventType from './components/event-type'
import EventHost from './components/event-host'
import EventTime from './components/event-time'
import RankAttackDevice from './components/rank-attackdevice'
import Desk from './components/desk'
import EventTypeModifiedModal from './components/event-type-modal'
import OverviewOmStore from './store'
import RefreshCheckbox from '../../components/refresh-checkbox'

const OverviewOMPage = () => {
    const pageStore = useMemo(() => new OverviewOmStore(), [])
    const { assetEvent, changeAssetEvent, start, changeProcessed } = pageStore

    useEventUpdate(changeProcessed)

    return (
        <div className={style['page-om']}>
            <Toptoolbox
                callback={start}
                extra={[
                    <RefreshCheckbox key='autoRefresh' callback={start} />,
                    // 1、switch在form中使用时需要加上valuePropName属性，否则报语法错误，由于toptoolbox中的是遍历加载额外属性的，所以需要添加这个属性的手动加上。
                    // 这里的属性传入用全小写的valuepropname，因为在react中自定义的属性传入props中时要用全小写
                    <Switch
                        key='event-filter'
                        checkedChildren='资产事件'
                        unCheckedChildren='全部事件'
                        onChange={changeAssetEvent}
                        name='switch'
                        valuepropname='checked'
                    />,
                ]}
                formData={{ switch: assetEvent }}
            />
            <Provider overviewOmStore={pageStore}>
                <div className='page-top'>
                    <EventType />
                </div>
                <div className='page-center'>
                    <div className='page-center-left'>
                        <div className='page-center-left-top'>
                            <EventHost />
                        </div>
                        <div className='page-center-left-bottom'>
                            <EventTime />
                        </div>
                    </div>
                    <div className='page-center-right'>
                        <Desk />
                    </div>
                </div>
                <div className='page-bottom'>
                    <RankAttackDevice />
                </div>
                <EventTypeModifiedModal />
            </Provider>
        </div>
    )
}

export default observer(OverviewOMPage)

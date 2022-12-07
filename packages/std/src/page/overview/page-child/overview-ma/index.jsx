import Toptoolbox from '@shadowflow/components/ui/form/toptoolbox'
import { inject, observer, Provider } from 'mobx-react'
import React, { useMemo } from 'react'
import ConfigCard from './components/config-card'
import ConfigDevice from './components/config-device'
import ConfigRule from './components/config-rule'
import style from './index.module.less'
import OverviewMaStore from './store'

const OverviewMAPage = ({ device, userList, internal, event, proxy }) => {
    const pageStore = useMemo(() => new OverviewMaStore(), [])

    return (
        <div className={`${style['page-ma']}`}>
            <Toptoolbox
                callback={condition => {
                    return pageStore.start({
                        params: condition,
                        configData: {
                            device,
                            userList,
                            internal,
                            event,
                            proxy,
                        },
                    })
                }}
            />
            <Provider overviewMaStore={pageStore}>
                <div className='page-top'>
                    <ConfigCard />
                </div>
                <div className='page-center'>
                    <ConfigDevice />
                </div>
                <div className='page-bottom'>
                    <ConfigRule />
                </div>
            </Provider>
        </div>
    )
}

export default inject(stores => ({
    device: stores.configStore.device,
    userList: stores.configStore.userList,
    internal: stores.configStore.internal,
    event: stores.configStore.event,
    proxy: stores.configStore.proxy,
}))(observer(OverviewMAPage))

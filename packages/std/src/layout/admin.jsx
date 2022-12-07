import React, { useMemo } from 'react'
import { Layout } from 'antd'
import appConfig from '@/config'
import { Provider } from 'mobx-react'
import style from './admin.module.less'
import configStore from './components/config/store'
import Nav from './components/nav'
import PageTab from './components/page-tab'
import LayerUpdate from './components/layer-update'
import LayerModal from './components/layer-modal'

const AdminLayout = props => {
    const navData = useMemo(() => {
        return appConfig.routers[1].routes
            .filter(d => d.isTopMenu)
            .map(d => {
                const children = d.routes
                    ? d.routes.filter(d1 => !d1.redirect)
                    : []
                return {
                    name: d.name,
                    path: d.path,
                    children: children
                        .filter(d2 => !d2.isHidden)
                        .map(d1 => ({
                            name: d1.name,
                            path: d1.path,
                        })),
                }
            })
    }, [])
    return (
        <Provider configStore={configStore}>
            <Layout className={style['app-layout']}>
                <Nav data={navData} />
                <div className='app-nav-child'>
                    <div className='app-nav-child-container'>
                        <div className='app-nav-child-left'>
                            <PageTab />
                        </div>
                    </div>
                </div>
                <div className='app-content'>
                    <div className='app-content-container'>
                        <LayerUpdate>{props.children}</LayerUpdate>
                    </div>
                </div>
                <LayerModal />
            </Layout>
        </Provider>
    )
}

export default AdminLayout

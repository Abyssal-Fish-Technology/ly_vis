import React, { useEffect, useState } from 'react'
import {
    Router,
    Switch,
    Route,
    Redirect,
    useHistory,
    useLocation,
} from 'react-router-dom'
import appConfig from '@/config'
import { ConfigProvider } from 'antd'
import enUS from 'antd/es/locale/en_US'
import zhCN from 'antd/es/locale/zh_CN'
// import { TransitionGroup, CSSTransition } from 'react-transition-group'
import KeepAlive, { AliveScope } from 'react-activation'
import history from '@shadowflow/components/history'
import { getUrlParams } from '@shadowflow/components/utils/universal/methods-router'
import { getKey } from './layout/components/page-tab/store'
import 'moment/locale/zh-cn'

const I18layout = props => {
    const obj = {
        zh: zhCN,
        en: enUS,
    }
    const historys = useHistory()
    const [lang, setlang] = useState(getUrlParams('language') || 'zh')
    useEffect(() => {
        return historys.listen(() => {
            setlang(getUrlParams('language') || 'zh')
        })
    }, [historys])
    return <ConfigProvider locale={obj[lang]}>{props.children}</ConfigProvider>
}

const CusRedirect = props => {
    const location = useLocation()
    const { search } = location
    return (
        <Redirect
            {...props}
            to={{
                pathname: props.to,
                search,
            }}
        />
    )
}

const createRouter = arr => {
    return (
        <Switch>
            {arr.map(d => {
                const {
                    component: C,
                    path,
                    redirect,
                    routes,
                    name,
                    notKeepAlive,
                    ...routerProps
                } = d
                const Cop = props => {
                    const location = useLocation()
                    const key = getKey(location)
                    if (C && notKeepAlive) {
                        return <C>{props.children}</C>
                    }
                    if (C) {
                        return (
                            <KeepAlive
                                id={key}
                                name={key}
                                saveScrollPosition='screen'
                            >
                                <C>{props.children}</C>
                            </KeepAlive>
                        )
                    }
                    return props.children
                }
                if (routes) {
                    return (
                        <Route key={path || name} {...routerProps} path={path}>
                            <Cop>{createRouter(routes)}</Cop>
                        </Route>
                    )
                }
                if (redirect) {
                    return (
                        <CusRedirect
                            key={`${path}_${redirect}`}
                            {...routerProps}
                            from={path}
                            to={redirect}
                        />
                    )
                }
                return (
                    <Route key={path || name} {...routerProps} path={path}>
                        <Cop />
                    </Route>
                )
            })}
        </Switch>
    )
}

const a = createRouter(appConfig.routers)

/**
 * bug编号322；事件跳转详情页面不从顶部开始，会自动滚动
 * 原理不清楚
 */
function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}

const AppRouter = () => {
    return (
        <Router history={history}>
            <ScrollToTop />
            <AliveScope>
                <I18layout>{a}</I18layout>
            </AliveScope>
        </Router>
    )
}

export default AppRouter

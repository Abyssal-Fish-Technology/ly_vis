import React from 'react'
import {
    PieChartOutlined,
    TableOutlined,
    LineChartOutlined,
    AlertOutlined,
    SafetyOutlined,
    SettingOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import AdminLayout from '@/layout/admin'
import OverviewOMPage from '@/page/overview/page-child/overview-om'
import OverviewMAPage from '@/page/overview/page-child/overview-ma'
import OverviewANPage from '@/page/overview/page-child/overview-an'
import EventListPage from '@/page/event/page-child/event-list'
import EventDetailPage from '@/page/event/page-child/event-detail'
import Page404 from '@/page/404'
import LoginPage from '@/page/login'
import {
    EventConfig,
    BWListConfig,
    AssetConfig,
    SystemConfig,
    MoConfig,
    CatalogueConfig,
} from '@/page/config'
import SearchPage from '@/page/search'
import ResultPage from '@/page/result'
import TrackPage from '@/page/track'

const appConfig = {
    routers: [
        {
            path: '/login',
            component: LoginPage,
            notKeepAlive: true,
        },
        {
            path: '/',
            component: AdminLayout,
            notKeepAlive: true,
            routes: [
                {
                    path: '/',
                    redirect: '/overview',
                    exact: true,
                },
                {
                    name: '总览',
                    path: '/overview',
                    isTopMenu: true,
                    routes: [
                        {
                            path: '/overview',
                            redirect: '/overview/om',
                            exact: true,
                        },
                        {
                            path: '/overview/om',
                            name: '运维',
                            icon: <PieChartOutlined />,
                            component: OverviewOMPage,
                        },
                        {
                            path: '/overview/an',
                            name: '分析',
                            icon: <SearchOutlined />,
                            component: OverviewANPage,
                        },
                        {
                            path: '/overview/ma',
                            name: '管理',
                            icon: <SettingOutlined />,
                            component: OverviewMAPage,
                        },
                    ],
                },
                {
                    name: '事件',
                    path: '/event/list',
                    component: EventListPage,
                    isTopMenu: true,
                },
                {
                    name: '事件拓展',
                    path: '/event',
                    routes: [
                        {
                            path: '/event',
                            redirect: '/event/list',
                            exact: true,
                        },
                        {
                            path: '/event/detail',
                            name: '详情',
                            icon: <LineChartOutlined />,
                            isHidden: true, // 不需要在导航中展示
                            component: EventDetailPage,
                        },
                    ],
                },
                {
                    name: '追踪',
                    path: '/track',
                    component: TrackPage,
                    isTopMenu: true,
                },
                {
                    name: '配置',
                    path: '/config',
                    isTopMenu: true,
                    routes: [
                        {
                            path: '/config',
                            redirect: '/config/catalogue',
                            exact: true,
                        },
                        {
                            path: '/config/catalogue',
                            name: '目录',
                            icon: <AlertOutlined />,
                            component: CatalogueConfig,
                        },
                        {
                            path: '/config/event',
                            name: '规则',
                            icon: <AlertOutlined />,
                            component: EventConfig,
                        },
                        {
                            path: '/config/bwlist',
                            name: '黑白名单',
                            icon: <TableOutlined />,
                            component: BWListConfig,
                        },
                        {
                            path: '/config/asset',
                            name: '资产',
                            icon: <SafetyOutlined />,
                            component: AssetConfig,
                        },
                        {
                            path: '/config/mo',
                            name: '追踪',
                            icon: <SafetyOutlined />,
                            component: MoConfig,
                        },
                        {
                            path: '/config/system',
                            name: '系统',
                            icon: <SettingOutlined />,
                            component: SystemConfig,
                        },
                    ],
                },
                {
                    name: '全局搜索',
                    path: '/search',
                    component: SearchPage,
                },
                {
                    name: '搜索结果',
                    path: '/result',
                    component: ResultPage,
                },
                {
                    name: '404',
                    component: Page404,
                },
            ],
        },
    ],
}

const getAllRoute = (d, arr) => {
    let i = 0
    while (i < d.length) {
        arr.push(d[i])
        if (d[i].routes) {
            getAllRoute(d[i].routes, arr)
        }
        i += 1
    }
    return arr
}

export const routeArr = getAllRoute(appConfig.routers, [])

const pathAndNameDict = routeArr
    .filter(d => d.path && d.name)
    .reduce((obj, d) => {
        obj[d.path] = d.name
        return obj
    }, {})

export function calcualtePathName(pathName = '') {
    return pathAndNameDict[pathName] || 'Unknow'
}

export default appConfig

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { observer, Provider } from 'mobx-react'
import { Tabs } from 'antd'
import { useLocation } from 'react-router-dom'
import SearchForm from '@/components/form-search'
import {
    AlertOutlined,
    BulbOutlined,
    FolderViewOutlined,
    PieChartOutlined,
} from '@ant-design/icons'
import ResultBasic from '@/page/result/page-child/info-basic'
import ResultTi from '@/page/result/page-child/info-ti'
import ResultFeature from '@/page/result/page-child/info-feature'
import { useEventUpdate } from '@/utils/methods-event'
import EventInfo from '@/page/result/page-child/info-event'
import style from './index.module.less'
import ResultStore from './store'

const { TabPane } = Tabs
function ResultPage() {
    const resultStore = useMemo(() => new ResultStore(), [])

    const {
        searchValue,
        conditionValue,
        initCondition,
        currentTabKey,
        changeCurrentTabKey,
        changeProcessed,
    } = resultStore

    const { search } = useLocation()

    useEffect(() => {
        initCondition()
    }, [search, initCondition])

    const startSearch = useCallback(
        values => {
            initCondition({ ...values })
        },
        [initCondition]
    )

    useEventUpdate(changeProcessed)

    const tabList = useMemo(() => {
        return [
            {
                name: '总览',
                icon: <PieChartOutlined />,
                component: <ResultBasic />,
            },
            {
                name: '情报',
                icon: <AlertOutlined />,
                component: <ResultTi />,
            },
            {
                name: '事件',
                icon: <BulbOutlined />,
                component: <EventInfo />,
            },
            {
                name: '特征',
                icon: <FolderViewOutlined />,
                component: <ResultFeature />,
            },
        ]
    }, [])

    const [fixedLeft, setFixedLeft] = useState(20)

    useEffect(() => {
        const calcFixed = () => {
            const bodyWidth = document.body.clientWidth

            if (bodyWidth >= 1440) {
                setFixedLeft((bodyWidth - 1440) / 2)
            } else {
                setFixedLeft(20)
            }
        }
        calcFixed()
        window.addEventListener('resize', calcFixed, false)
        return () => {
            window.removeEventListener('resize', calcFixed)
        }
    }, [])

    return (
        <div className={style.result}>
            <Provider resultStore={resultStore}>
                <div className='result-content-box'>
                    <div className='result-header'>
                        <SearchForm
                            onFinish={startSearch}
                            searchValue={searchValue}
                            conditionValue={conditionValue}
                            defaultCollapse={false}
                        />
                    </div>
                    <div className='result-body'>
                        <Tabs
                            tabPosition='left'
                            type='card'
                            tabBarGutter={16}
                            activeKey={currentTabKey}
                            onChange={key => {
                                changeCurrentTabKey(key)
                            }}
                            tabBarStyle={{
                                position: 'fixed',
                                left: `${fixedLeft}px`,
                                top: '228px',
                            }}
                        >
                            {tabList.map(tabItem => {
                                const { name, icon, component } = tabItem
                                return (
                                    <TabPane
                                        tab={
                                            <>
                                                {icon}
                                                <div>{name}</div>
                                            </>
                                        }
                                        key={name}
                                    >
                                        {component}
                                    </TabPane>
                                )
                            })}
                        </Tabs>
                    </div>
                </div>
            </Provider>
        </div>
    )
}
export default observer(ResultPage)

import { getUrlParams } from '@shadowflow/components/utils/universal/methods-router'
import { Col, Row } from 'antd'
import { chain } from 'lodash'
import { observer } from 'mobx-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import ConfigLeftNav from '../config-left-nav'
import ConfigRightContent from '../config-right-content'
import TemplateContext from './context'

function ConfigTemplate({ data }) {
    const [currentTabKey, setCurrentTabKey] = useState(
        data.length
            ? chain(data)
                  .map('children')
                  .flatten()
                  .filter(navItem => navItem.isActive)
                  .value()[0].key
            : ''
    )

    const { search } = useLocation()
    useEffect(() => {
        const { active } = getUrlParams('pageParams') || {}
        if (active) {
            setCurrentTabKey(active)
        }
    }, [search])

    function clickHandle(key) {
        setCurrentTabKey(key)
    }

    const leftTabsList = useMemo(() => {
        return chain(data)
            .map(navItem => {
                return {
                    ...navItem,
                    children: chain(navItem.children)
                        .map(nodeItem => {
                            return {
                                title: `${nodeItem.title}`,
                                key: nodeItem.key,
                            }
                        })
                        .value(),
                }
            })
            .value()
    }, [data])

    const rightContentData = useMemo(() => {
        return chain(data).map('children').flatten().value()
    }, [data])

    const { Provider } = TemplateContext

    return (
        <Provider value={{ clickHandle, currentTabKey }}>
            {data.length ? (
                <Row gutter={[16, 16]}>
                    <Col span={4}>
                        <ConfigLeftNav navData={leftTabsList} />
                    </Col>
                    <Col span={20}>
                        <ConfigRightContent
                            rightContentData={rightContentData}
                            currentKey={currentTabKey}
                        />
                    </Col>
                </Row>
            ) : null}
        </Provider>
    )
}

export default observer(ConfigTemplate)

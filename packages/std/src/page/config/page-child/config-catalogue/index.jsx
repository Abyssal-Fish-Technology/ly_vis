import Section from '@shadowflow/components/ui/layout/section'
import { SearchOutlined } from '@ant-design/icons'
import { Col, Input, Row } from 'antd'
import { chain, trim } from 'lodash'
import React, { useMemo, useState } from 'react'
import { observer } from 'mobx-react'
import { getUserAuth } from '@shadowflow/components/utils/universal/methods-storage'
import { assetConfigData } from '../config-asset'
import { bwlistConfigData } from '../config-bwlist'
import { configMoStore } from '../config-mo'
import { eventConfigData } from '../config-event'
import { systemConfigData } from '../config-system'
import CatalogueNav from './components/catalogue-nav'
import style from './index.module.less'

const userLevel = getUserAuth()
export default observer(function ConfigCatalogue() {
    const [seachKey, setSeachKey] = useState('')

    const catalogueArr = useMemo(() => {
        const result = chain([
            eventConfigData,
            assetConfigData,
            bwlistConfigData,
            configMoStore.moConfigData,
            systemConfigData,
        ])
            .cloneDeep()
            .forEach(d => {
                d.children.forEach(d2 => {
                    d2.children = d2.children.filter(d3 => {
                        return d3.title.indexOf(seachKey) > -1
                    })
                })
                d.children = d.children.filter(d4 => d4.children.length)
            })
            .filter(d => d.children.length)
            .value()

        return result
    }, [seachKey])

    return (
        <div className={style.configCatalogue}>
            <Section>
                <div className='input-box'>
                    <Input
                        placeholder='搜索配置'
                        bordered={false}
                        suffix={<SearchOutlined />}
                        size='large'
                        onChange={e => {
                            setSeachKey(trim(e.target.value))
                        }}
                    />
                </div>
                <div>
                    {catalogueArr.map(pageItem => {
                        const { path } = pageItem
                        return (
                            <div className='page-item' key={pageItem.title}>
                                <div className='page-item-title'>
                                    {pageItem.title}
                                </div>
                                {pageItem.children.map(navTypeItem => {
                                    return (
                                        <div
                                            className='page-nav-type-item'
                                            key={navTypeItem.title}
                                        >
                                            <div className='page-nav-type-item-title'>
                                                {navTypeItem.title}
                                            </div>
                                            <Row gutter={[16, 16]}>
                                                {navTypeItem.children.map(
                                                    navNodeItem => {
                                                        const {
                                                            title,
                                                            key: configStoreKey,
                                                            openModalFun,
                                                            modalType = '',
                                                            addAuth,
                                                        } = navNodeItem
                                                        return (
                                                            <Col
                                                                span={4}
                                                                key={title}
                                                            >
                                                                <CatalogueNav
                                                                    title={
                                                                        title
                                                                    }
                                                                    configStoreKey={
                                                                        configStoreKey
                                                                    }
                                                                    path={path}
                                                                    openModalFun={
                                                                        openModalFun
                                                                    }
                                                                    modalType={
                                                                        modalType
                                                                    }
                                                                    addAuth={
                                                                        addAuth
                                                                    }
                                                                    userLevel={
                                                                        userLevel
                                                                    }
                                                                />
                                                            </Col>
                                                        )
                                                    }
                                                )}
                                            </Row>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </Section>
        </div>
    )
})

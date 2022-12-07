import Section from '@shadowflow/components/ui/layout/section'
import { SearchOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import { chain } from 'lodash'
import { observer } from 'mobx-react'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { formatStringSpace } from '@shadowflow/components/utils/universal/methods-arithmetic'
import NavTreeNode from './components/nav-tree-node'
import style from './index.module.less'

function ConfigLeftNav({ navData }) {
    const [tabsList, setTabsList] = useState([])

    useEffect(() => {
        setTabsList(navData)
    }, [navData])

    const filterTabsListFun = useCallback(
        value => {
            const nowTabsList = chain(navData)
                .cloneDeep()
                .forEach(navItem => {
                    const newChildren = chain(navItem.children)
                        .filter(nodeItem => {
                            return nodeItem.title.indexOf(value) >= 0
                        })
                        .value()
                    navItem.children = newChildren
                })
                .filter(navItem => navItem.children.length)
                .value()

            setTabsList(nowTabsList)
        },
        [navData]
    )

    return (
        <div className={style.configNav}>
            <Section>
                <Input
                    onChange={e => {
                        filterTabsListFun(formatStringSpace(e.target.value))
                    }}
                    suffix={<SearchOutlined />}
                />
                <div className='nav-tree-box'>
                    {tabsList.map(typeItem => {
                        return (
                            <div
                                className='nav-type-container'
                                key={typeItem.title}
                            >
                                <p className='nav-type-title'>
                                    {typeItem.title}
                                </p>
                                <ul className='nav-type-ul'>
                                    {typeItem.children.map(listItem => {
                                        const { title, key } = listItem
                                        return (
                                            <NavTreeNode
                                                title={title}
                                                key={title}
                                                navNodeKey={key}
                                            />
                                        )
                                    })}
                                </ul>
                            </div>
                        )
                    })}
                </div>
            </Section>
        </div>
    )
}

export default memo(observer(ConfigLeftNav))

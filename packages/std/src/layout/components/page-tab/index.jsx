import {
    CaretDownOutlined,
    CloseOutlined,
    RightOutlined,
} from '@ant-design/icons'
import { List, Dropdown } from 'antd'
import { observer } from 'mobx-react'
import React, { useEffect, useMemo } from 'react'
import { useAliveController } from 'react-activation'
import { useHistory } from 'react-router'
import { skipPage } from '@/utils/methods-ui'
import { parse } from 'qs'
import { reaction } from 'mobx'
import { chain, find } from 'lodash'
import pageTabStore from './store'
import style from './index.module.less'

export function parseSearch(search) {
    return parse(search.replace(/^[?]+/, ''))
}

function calculateNav(pathname, tagName) {
    let result = tagName
    if (pathname.includes('/overview')) {
        result = `总览 / ${tagName}`
    }
    if (pathname.includes('/asset')) {
        result = `资产 / ${tagName}`
    }
    if (pathname.includes('/config')) {
        result = `配置 / ${tagName}`
    }
    if (pathname.includes('/result')) {
        result = '搜索结果'
    }
    if (pathname === '/') {
        result = '总览 / 运维'
    }
    return result
}

function PageTagList({ data, isListItem = false }) {
    return (
        <div className={`${style['pagetag-list']}`}>
            {data.map((tagItem, i) => {
                return [
                    <div
                        className={`pagetag-item ${
                            tagItem.active ? 'active' : ''
                        }`}
                        key={tagItem.key}
                        onClick={() => {
                            if (!tagItem.active && !isListItem) {
                                skipPage(
                                    tagItem.pathname,
                                    parseSearch(tagItem.search),
                                    false,
                                    {
                                        isFastTab: true,
                                        nowKey: tagItem.key,
                                    }
                                )
                            }
                        }}
                    >
                        <div className='pagetag-item-dot' />
                        <div className='pagetag-item-name'>
                            {calculateNav(tagItem.pathname, tagItem.name)}
                        </div>
                        {!isListItem && (
                            // <Popconfirm
                            //     title='确定关闭该页面吗?'
                            //     onConfirm={() => {
                            //         pageTabStore.delPageListItem(tagItem.key)
                            //     }}
                            //     getPopupContainer={() =>
                            //         document.querySelector('.app-nav-child')
                            //     }
                            //     // onCancel={cancel}
                            //     okText='关闭'
                            //     cancelText='取消'
                            // >
                            <CloseOutlined
                                className='pagetag-item-close'
                                onClick={e => {
                                    e.stopPropagation()
                                    pageTabStore.delPageListItem(tagItem.key)
                                }}
                            />
                            // </Popconfirm>
                        )}
                    </div>,
                    i < data.length - 1 && (
                        <RightOutlined
                            className='pagetag-slice'
                            key={`next_${tagItem.key}`}
                        />
                    ),
                ]
            })}
        </div>
    )
}

function PageTab() {
    const menu = (
        <div className='select-list'>
            <List
                bordered
                dataSource={pageTabStore.pageTagList}
                renderItem={listItem => (
                    <List.Item
                        className={`select-list-item ${
                            listItem.active ? 'active' : ''
                        }`}
                        onClick={() => {
                            if (listItem.active) return
                            const thisListActive = listItem.list.find(
                                tagItem => tagItem.active
                            )
                            pageTabStore.selectPageList(listItem.key)
                            skipPage(
                                thisListActive.pathname,
                                parseSearch(thisListActive.search),
                                false,
                                {
                                    isFastTab: true,
                                    nowKey: thisListActive.key,
                                }
                            )
                        }}
                    >
                        <div
                            className={`item-check ${
                                listItem.active ? 'active' : ''
                            }`}
                        >
                            <div className='circle' />
                        </div>
                        <div className='item-content'>
                            <PageTagList
                                data={listItem.list}
                                key={listItem.key}
                                isListItem
                            />
                        </div>
                    </List.Item>
                )}
            />
        </div>
    )

    // 随着PageTagList的变化，要接着删除
    const { drop, getCachingNodes } = useAliveController()
    useEffect(() => {
        return reaction(
            () => pageTabStore.pageTagList,
            pageTagList => {
                const nowPageAliveArr = chain(pageTagList)
                    .map('list')
                    .flatten()
                    .map('key')
                    .uniq()
                    .value()

                const cachingNodes = getCachingNodes()
                cachingNodes.forEach(nodeItem => {
                    if (
                        !nowPageAliveArr.includes(
                            nodeItem.name.replace('wrap_', '')
                        )
                    ) {
                        drop(nodeItem.name)
                    }
                })
                // console.log(cachingNodes)
            }
        )
    }, [drop, getCachingNodes])

    const history = useHistory()

    useEffect(() => {
        pageTabStore.addPageTagList(history.location)
        return history.listen(his => {
            const { action } = history
            pageTabStore.changePageTagList(his, action)
        })
    }, [history])

    const { pageTagList, reset } = pageTabStore

    const activeList = useMemo(() => {
        const activeListItem = pageTagList.find(d => d.active)
        return activeListItem ? activeListItem.list : []
    }, [pageTagList])

    useEffect(() => {
        if (pageTagList.length > 5) {
            const [firstItem, ...otherItems] = [...pageTagList]
            const otherItemsList = chain(otherItems)
                .map('list')
                .flatten()
                .value()
            firstItem.list.forEach(tabItem => {
                const { key } = tabItem
                if (!find(otherItemsList, d => d.key === key)) {
                    drop(`wrap_${key}`)
                    drop(key)
                }
            })
            reset(otherItems)
        }
    }, [drop, pageTagList, reset])

    return (
        <div className={`${style.pagetab} nav-pageTab`}>
            <Dropdown
                overlayStyle={{
                    width: '100%',
                }}
                overlay={menu}
                placement='bottomLeft'
                trigger='click'
                getPopupContainer={() => document.querySelector('.nav-pageTab')}
            >
                <div className='select'>
                    <CaretDownOutlined />
                </div>
            </Dropdown>

            <div className='content'>
                <PageTagList data={activeList} />
            </div>
        </div>
    )
}

export default observer(PageTab)

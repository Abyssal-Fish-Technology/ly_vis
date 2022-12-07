import { calcualtePathName } from '@/config'
import { skipPage } from '@/utils/methods-ui'
import { chain } from 'lodash'
import { action, observable } from 'mobx'
import { parse } from 'qs'

const tabItemTemplate = {
    order: 0,
    type: 'tabItem',
    active: true,
    pathname: '',
    search: '',
    key: '',
    name: '',
}

export function getKey(location) {
    // hash值都是带有 # 的，加入key值是把 # 去掉
    const { pathname, search, hash = '' } = location
    // 首次进入系统时，存入的路由信息时 '/'，跳转之后再切换时会触发重定向导致页面刷新，所以直接存入重定向的路由
    return `${pathname === '/' ? '/overview/om' : pathname}_${search.replace(
        /\?/g,
        ''
    )}|${hash.replace('#', '')}`
}

class PageTabStore {
    maxLength = 5

    @observable pageTagList = []

    /**
     * @param {*} location
     */
    @action.bound changePageTagList(location, nowAction) {
        /**
         * 导航跳转共有几种情况
         * 1、浏览器前进、后退 (keepAlive会记录状态，无需处理)
         * 2、页内跳转 skipPage方法控制
         * 3、导航跳转 skipPage方法控制
         * 4、快速导航跳转 skipPage方法控制
         */
        const { isPage, isFastTab, isNav } = location
        if (nowAction === 'POP') {
            /**
             * 正常路由跳转的action为PUSH或者REPLACE，浏览器前进、后退以及手动修改url时为POP，POP时由于没有经过skipPage方法，所以没有上面的三个标识，需要手动操作
             * 1、判断当前location中的路径，在pageTagList中是否存在，如果存在，那么就找到当前的url以及它的父级，并把父级的active改为true，然后操作activeList
             * 2、如果不存在，就直接新增一个active
             */
            const { hash = '', pathname = '', search = '' } = location
            const manualKey = `${pathname}_${search.replace(
                /\?/g,
                ''
            )}|${hash.replace('#', '')}`
            const manualPage = chain(this.pageTagList)
                .map('list')
                .flatten()
                .find(d => d.key === manualKey)
                .value()
            if (manualPage) {
                const oriPageTagList = chain(
                    JSON.parse(JSON.stringify(this.pageTagList))
                )
                    .forEach(d => {
                        d.active = d.key === manualPage.parentKey
                    })
                    .value()
                this.pageTagList = oriPageTagList
                this.selectListItem(location)
            } else {
                this.addPageTagList(location)
            }
        }

        if (isPage) {
            // 2、在当前active的list里面新增一个或者选择。
            this.addPageTagListItem(location)
        }
        if (isFastTab) {
            // 4、操作activeList
            this.selectListItem(location)
        }
        if (isNav) {
            // 3、操作activeList
            this.addPageTagList(location)
        }
    }

    // =============================== 关于TagList的方法 ===============================
    // ============== 增加一个新的list ==============
    /**
     * 操作当前的List。
     * 首先先寻找ListArr中list中只有一个的，并且第一个listItem key相同的。
     * 找不到的话就 新增一个List。
     * @param {history.location} location
     */
    @action.bound addPageTagList(location) {
        const { pathname, search } = location
        const newkey = getKey(location)
        this.pageTagList.forEach(d => {
            d.active = false
        })
        const findList = this.pageTagList.find(d => {
            return d.list.length === 1 && d.list[0].key === newkey
        })
        // 原理和getKey里一致
        const usePathname = pathname === '/' ? '/overview/om' : pathname
        if (findList) {
            findList.active = true
        } else {
            const newListItem = {
                type: 'listItem',
                active: true,
                key: newkey,
                list: [
                    {
                        ...tabItemTemplate,
                        pathname: usePathname,
                        search,
                        key: newkey,
                        name: calcualtePathName(usePathname),
                        parentKey: newkey,
                    },
                ],
            }
            this.pageTagList.push(newListItem)
        }
        this.pageTagList = [...this.pageTagList]
    }

    // ============== 选择一个新的list ==============
    @action.bound selectPageList(selectListKey) {
        const newpageTagList = this.pageTagList.map(d => ({
            ...d,
            active: d.key === selectListKey,
        }))
        this.pageTagList = newpageTagList
    }

    // =============================== 关于某个TagList'中的 TagItem的相关方法 ===============================
    // ============== 新增当前Active'的List中的TagList ==============
    /**
     * 操作当前Active的list。
     * 关键点在于重复跳转，重复跳转的依据是key或者是pathname
     * 如果是重复跳转，那么就单纯的把重复的给变成Active即可。
     * 如果是新增跳转，那么就得找到现在的active，然后把后面的都删了，再把active赋予新增的Item
     * @param {history.location}} location
     */
    @action.bound addPageTagListItem(location) {
        const { pathname, search } = location

        const thisPageListArray = this.pageTagList.find(d => d.active)
        const { list, key } = thisPageListArray
        const newkey = getKey(location)

        const thisActiveItem = list.find(d => d.key === newkey)
        const index = list.findIndex(d => d.active)
        list.forEach(d => {
            d.active = false
        })
        if (thisActiveItem) {
            thisActiveItem.active = true
        } else {
            list.splice(index + 1, list.length)
            const tabObj = {
                ...tabItemTemplate,
                order: index + 1,
                pathname,
                search,
                key: newkey,
                name: calcualtePathName(pathname),
                parentKey: key,
            }
            list.push(tabObj)
        }
        this.pageTagList = this.pageTagList.map(d => {
            return d.key === key ? thisPageListArray : d
        })
    }

    // ============== 选择当前List的ListItem ==============
    @action.bound selectListItem(location) {
        const newkey = getKey(location)
        const thisPageListArray = this.pageTagList.find(d => d.active)
        const { list } = thisPageListArray
        list.forEach(d => {
            d.active = false
        })

        /**
         * 针对POP类型的第三种情况
         */
        if (
            this.pageTagList.length === 1 &&
            this.pageTagList[0] &&
            !this.pageTagList[0].active
        ) {
            list[0].active = true
        } else if (
            this.pageTagList.length === 1 &&
            this.pageTagList[0] &&
            this.pageTagList[0].list.length === 1
        ) {
            // 地址栏加了额外的hash，然后刷新本页面，pageTagList中只有当前页面，删除地址栏中的hash后进行跳转，应该选中当前的这个tab
            list[0].active = true
        } else if (list.length) {
            list.find(d => {
                const dkey = d.key.includes('|') ? d.key : `${d.key}|`
                return dkey === newkey
            }).active = true
        }

        this.pageTagList = [...this.pageTagList]
    }

    // ============== 删除当前List的ListItem ==============
    @action.bound delPageListItem(key) {
        const thisPageListArray = this.pageTagList.find(d => d.active)
        const { list } = thisPageListArray
        const index = list.findIndex(d => d.key === key)
        list.splice(index, list.length)

        // 如果本条删完了
        if (
            list.length === 0 ||
            (list.length === 1 && list[0].pathname === '/overview/om')
        ) {
            // 如果全部都删完了
            if (this.pageTagList.length === 1) {
                this.addPageTagListItem({
                    pathname: '/overview/om',
                    search: '',
                })
            } else {
                // 如果其他的list还有
                const activeIndex = this.pageTagList.findIndex(d => d.active)
                this.pageTagList.splice(activeIndex, 1)
                this.pageTagList[0].active = true
                if (!this.pageTagList[0].list.length) {
                    this.addPageTagListItem({
                        pathname: '/overview/om',
                        search: '',
                    })
                }
            }
        } else if (!list.find(d => d.active)) {
            list[list.length - 1].active = true
        }

        this.pageTagList = [...this.pageTagList]
        const nowActiveTag = this.pageTagList
            .find(d => d.active)
            .list.find(d => d.active)
        const { pathname = '/overview/om', search = '', key: nowKey = '|' } =
            nowActiveTag || {}

        skipPage(pathname, parse(search.replace('?', '')), false, {
            isPage: false,
            isFastTab: true,
            nowKey,
        })
    }

    // =============== 重置pageTagList ==============
    @action.bound reset(listArr) {
        this.pageTagList = listArr || []
    }
}

const pageTabStore = new PageTabStore()
export default pageTabStore

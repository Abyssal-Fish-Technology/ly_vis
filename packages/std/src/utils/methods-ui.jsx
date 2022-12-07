import { chain, isEqual, pick } from 'lodash'
import { parse, stringify } from 'qs'
import history from '@shadowflow/components/history'
import pageTabStore from '@/layout/components/page-tab/store'

function hiddenAntTooltip() {
    document.querySelectorAll('.ant-tooltip').forEach(item => {
        item.classList.add('ant-tooltip-hidden')
    })
}

/**
 * @param {string | object} page 可以是对象，可以是字符串，当是对象的时候，history.push直接以对象为主。
 * @param {object} params 传进来的参数
 * @param {boolean} keepSearch 是否保留原来的参数
 * @param {boolean} extraAttr 是否是页面内点击跳转
 */
export function skipPage(
    page = '',
    params = {},
    keepSearch = false,
    extraAttr = {
        isPage: true,
        isNav: false,
        isFastTab: false,
    }
) {
    // 当要跳转的地址和当前页面完全相同时，阻止跳转行为,还需要考虑到相同url但是hash不同的情况

    const { isNav, isPage, isFastTab, nowKey = '|' } = extraAttr
    const [, nowHash] = nowKey.split('|')
    if (
        isEqual(
            parse(stringify(params)),
            parse(history.location.search.replace('?', ''))
        ) &&
        page === history.location.pathname &&
        `#${nowHash}` === history.location.hash
    ) {
        return
    }
    let currentParams = {}
    if (page === '/') {
        if (params.language) {
            currentParams.theme = params.language
        }
    } else {
        currentParams = { ...params }
    }
    const search = parse(history.location.search.replace(/^\?/, ''))
    // 默认需要保持不变的参数
    const shouldKeepObj = pick(search, ['language', 'theme'])
    const useParams = keepSearch ? search : {}
    const urlParams = stringify({
        ...useParams,
        ...shouldKeepObj,
        ...currentParams,
    })

    // 以下是做相同的url去重的逻辑，目前有以下情况会出现相同的url导致key值重复，出现多个页面公用一个store的情况：
    // 1、点击导航栏，新建一个tab后，在本页面跳转其它页面，进入其它页面后，再次点击导航菜单，又新建一个tab,
    // 由于从nav新建的tab都是没有参数的，所以它们的key：pathname_search是相同的，所以当isNav=true时，从现有的pageTagList中
    // 寻找是否有key值相等，且item中的list数组大于1（表示在此页面进行过二次跳转，没有二次跳转就直接跳转现有的tab就行了）。存在的话，
    // 就用找出来的所有符合条件的，用数组最后一项的标识加1，就是当前路由的标识,随着符合条件的项越多，依次增加标识的值
    // 2、当isFastTab=true时，代表跳转都是在pageTagList已存在的项中进行跳转，在pagetab中，把现有的key值通过extraAttr传入，拿到key中的标识后再通过hash传入就可以找到已存在的项
    // 3、当isPage=true时，表示在当前tab新增或选择一个tab，遍历pageTagList中所有的list数组，找到符合pathname_search相等的项，同样用最后一项的标识加1作为新标识,
    // 此时需要判断是否在当前选中的pageList中进行跳转，如果是就不用另外加标识，属于page的重复跳转，所以需要在遍历pageList时要加上筛选条件 !active(未选中)

    const { pageTagList } = pageTabStore
    let routersign = ''
    const nowPage = `/${page}`.replace(/^[/]+/, '/')
    const calculateSign = arr => {
        if (arr.length) {
            // 加上排序，保证每次拿到的sign都是最大的
            const sortArr = arr.sort((a, b) => {
                const aSign = a.key.split('|')[1] || 0
                const bSign = b.key.split('|')[1] || 0
                return Number(aSign) - Number(bSign)
            })
            const lastListItemSign =
                sortArr[sortArr.length - 1].key.split('|')[1] || 1
            return Number(lastListItemSign) + 1
        }
        return ''
    }
    if (isNav) {
        const nowList = pageTagList.filter(d => {
            const [{ pathname, search: dsearch }] = d.list
            return (
                pathname === nowPage &&
                dsearch.replace(/\?/g, '') === urlParams &&
                d.list.length > 1
            )
        })
        routersign = calculateSign(nowList)
    }
    if (isFastTab) {
        ;[, routersign] = nowKey.split('|')
    }
    if (isPage) {
        const list = chain(pageTagList)
            .filter(d => !d.active)
            .map('list')
            .flatten()
            .filter(d => {
                const { search: dsearch, pathname } = d
                return (
                    dsearch.replace(/\?/g, '') === urlParams &&
                    pathname === nowPage
                )
            })
            .value()
        routersign = calculateSign(list)
    }

    let location = {
        pathname: nowPage,
        search: `?${urlParams}`,
        ...extraAttr,
        hash: `#${routersign}`,
    }

    if (typeof page === 'object') {
        location = {
            ...location,
            ...page,
        }
    }
    history.push(location)
    hiddenAntTooltip()
}

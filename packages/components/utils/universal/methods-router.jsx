import { parse, stringify } from 'qs'
import history from '../../history'

/**
 * 获取地址栏search参数值
 * @param {*} key 字段名
 * @return 对应的参数值
 */
export function getUrlParams(key) {
    const searchParams = history.location.search.replace(/^\?/, '')
    if (key === undefined) {
        return parse(searchParams)
    }
    return parse(searchParams)[key]
}

/**
 * 通过新增的方式创建新的search str
 * @param {Object} addObj 要添加的参数对象
 * @return 原有参数和添加参数合并的字符串
 */
export function createUrlParams(addObj) {
    const oldObj = parse(history.location.hash.split('?')[1])
    return stringify({
        ...oldObj,
        ...addObj,
    })
}

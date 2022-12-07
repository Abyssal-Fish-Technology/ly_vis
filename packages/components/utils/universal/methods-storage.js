/** ********************************************************************** StorageHandler start ***********************************************************************
 ** storage操作方法
 ** 关键字： storage
 * */

;(function () {
    // 定义一个变量让setItem函数的值指向它
    const originalSetItem = localStorage.setItem
    // 重写setItem函数
    localStorage.setItem = function (key, newValue, ...arg) {
        // 创建setItemEvent事件
        const event = new Event('setItemEvent')
        event.key = key
        event.newValue = newValue
        // 提交setItemEvent事件
        window.dispatchEvent(event)
        // 执行原setItem函数
        originalSetItem.apply(this, [key, newValue, ...arg])
    }
})()

/**
 * 存入storage
 * @param {*} name 字段名
 * @param {*} value 值
 */
export function setStorage(name, value) {
    localStorage.setItem(name, JSON.stringify(value))
}

/**
 * 读取storage
 * @param {String} name 字段名
 */
export function getStorage(name) {
    const result = localStorage.getItem(name) || ''
    if (!result) {
        localStorage.removeItem(name)
    }
    try {
        return JSON.parse(result)
    } catch (e) {
        return result
    }
}

/** ***********************************************************************  end ************************************************************************* */
/**
 * 账号注销时存入当前页面地址
 * @param {Object} urlObj 当前页面地址和参数
 */
export function setTopToolBoxParams(params) {
    return setStorage('toptoolboxparmas', params)
}

/**
 * 登录成功时读取上一次地址
 */
export function getTopToolBoxParams() {
    return getStorage('toptoolboxparmas')
}

/**
 * 账号名存入stroage
 * @param {String} name 账号名
 */
export function setUserName(name) {
    setStorage('ly-user', name)
}

/**
 * 读取账号名
 */
export function getUserName() {
    return getStorage('ly-user')
}

/**
 * 账号权限存入storage
 * @param {String} auth 权限
 */
export function setUserAuth(auth) {
    setStorage('ly-auth', auth)
}

/**
 * 读取账号权限
 */
export function getUserAuth() {
    return getStorage('ly-auth')
}

/**
 * 保存主题参数到缓存
 * @param {light|dark} theme
 */
export function setThemeParams(theme) {
    setStorage('theme', theme)
}

/**
 * 读取缓存中的主题参数
 * @returns light | dark
 */
export function getThemeParams() {
    return getStorage('theme')
}

/**
 * 账号注销时存入当前页面地址
 * @param {Object} urlObj 当前页面地址和参数
 */
export function setPrevLocationParams(urlObj) {
    setStorage('prevLocationParams', urlObj)
}

/**
 * 登录成功时读取上一次地址
 */
export function getPrevLocationParams() {
    return getStorage('prevLocationParams')
}

/** ********************************************************************** UiHandle start ***********************************************************************
 ** dom操作方法集合
 ** 关键字： dom
 * */

const CODE_STATUS = {
    200: 'OK',
    300: '未登录',
    301: '用户名或密码错误',
    302: '用户名或密码错误',
    303: '用户名已登陆',
    304: '账号被锁定',
    305: '连接超时/被顶掉了',
    306: '暂无权限',
}

/**
 * tooltip弹窗隐藏
 */
export function hiddenAntTooltip() {
    document.querySelectorAll('.ant-tooltip').forEach(item => {
        item.classList.add('ant-tooltip-hidden')
    })
}

/**
 * 获取code码
 */
export function getCodeMessage(code, defaultMessage = '') {
    return CODE_STATUS[code] || defaultMessage
}

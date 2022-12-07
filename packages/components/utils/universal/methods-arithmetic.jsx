/** ********************************************************************** NumberFormatter start ***********************************************************************
 ** 数值格式化方法集合
 ** 关键字： formatter
 * */

/**
 *保留1或者2位小数或者10进制数
 * @param {Number} value 传入的数值
 * @return 小数或10进制数，如：1.0，3000
 */
export function keepDecimals(value) {
    if (Number.isNaN(value)) {
        return 0.0
    }
    const a = parseInt(value, 10).toString().length
    if (a >= 3) {
        return parseInt(value, 10)
    }
    if (a === 2) {
        return value.toFixed(1)
    }

    if (Number(value.toFixed(2)) !== 0) return value.toFixed(2)
    if (Number(value.toFixed(3)) !== 0) return value.toFixed(3)
    if (Number(value.toFixed(4)) !== 0) return value.toFixed(4)
    if (Number(value.toFixed(5)) !== 0) return value.toFixed(5)
    return value.toFixed(2)
}

/**
 * 格式化字符串前后的空格
 * @param {*} str 传入的字符串
 * @returns 去掉空格后的字符串
 */
export function formatStringSpace(str = '') {
    return str.replace(/(^\s*)|(\s*$)/g, '')
}

/** ***********************************************************************  end ************************************************************************* */

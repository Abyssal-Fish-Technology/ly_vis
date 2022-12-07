import { keepDecimals } from './methods-arithmetic'

/** ********************************************************************** TrafficFormatter start ***********************************************************************
 ** 流量格式化方法集合
 ** 关键字： formatter
 * */

/**
 *流量数值单位格式化
 * @param {Number|String} value 传入的数值
 * @return 格式化后的流量数值，如：1K,1.4M、120.0
 */
export function arrangeAlerm(value) {
    if (!value || Number.isNaN(value)) {
        return 0
    }
    const a = parseInt(value, 10).toString().length
    if (a <= 3 && a >= 0) {
        return keepDecimals(value)
    }
    if (a > 3 && a <= 6) {
        return `${keepDecimals(Number(value) / 1024)}K`
    }
    if (a > 6 && a <= 9) {
        return `${keepDecimals(Number(value) / (1024 * 1024))}M`
    }
    if (a > 9 && a <= 12) {
        return `${keepDecimals(Number(value) / (1024 * 1024 * 1024))}G`
    }
    if (a > 12 && a <= 15) {
        return `${keepDecimals(Number(value) / (1024 * 1024 * 1024 * 1024))}T`
    }
    if (a > 15 && a <= 18) {
        return `${keepDecimals(
            Number(value) / (1024 * 1024 * 1024 * 1024 * 1024)
        )}P`
    }
    return value
}

/** ***********************************************************************  end ************************************************************************* */

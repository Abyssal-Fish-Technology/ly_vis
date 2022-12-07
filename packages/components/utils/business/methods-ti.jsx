import Bwclass from '../../locale/bwclass'
import Source from '../../locale/source'

/** ********************************************************************** TiFormatter start ***********************************************************************
 ** 情报格式化方法集合
 ** 关键字： formatter
 * */

/**
 * 威胁来源翻译
 * @param {String} 来源的Code名，一般是英文缩写
 * Soucre 是本地来源库
 * @return 翻译结果，如：'SEC-UN'返回 天际友盟，如果没有找到的话，就返回自己本身
 */
export function translateTiSource(sourceText = '') {
    const key = sourceText.toUpperCase()
    return Source[key] ? Source[key].desc : sourceText
}

/**
 *情报来源翻译
 * @param {String} bwclassText
 * @return 翻译结果：如 'POP'返回 主流网站
 */
export function translateTiTag(tag = '') {
    const key = tag.toUpperCase()
    const language = 'zh'
    return Bwclass[key] ? Bwclass[key][`${language}desc`] : tag
}

/**
 *情报数据的ID获取，100x是 安全的，11xx是不安全的，2xxx是攻击性质的
 * @param {String} bwclassText
 * @return 翻译结果：如 'POP'返回 1001
 */
export function getTiId(bwclassText = '') {
    const key = bwclassText.toUpperCase()
    return Bwclass[key] ? Bwclass[key].id : 0
}

/** ***********************************************************************  end ************************************************************************* */

/** ********************************************************************** 根据情报的Score来计算的一些衍生物 ***********************************************************************
 ** 情报score计算方法集合
 ** 关键字： score
 * */
/**
 * 威胁来源等级对应颜色计算
 * @param {Number} score
 * @return 各级别对应的颜色
 */

export function calculateRiskColor(score) {
    let color = 'gray'
    switch (score) {
        case score >= 0 && score < 0.8: // 主流
            color = '#18b57a' // 绿
            break
        case score >= 0.8 && score < 1: // 政企
            color = '#5bc0de' // 蓝
            break
        case score >= 1 && score < 1.01: // 过时
            color = 'gray' // 灰
            break
        case score >= 1.01 && score < 2: // 活跃90天以内的 识别出来威胁
            color = '#fd9940' // 橙
            break
        case score >= 2 && score <= 5: // 7天 识别出来的威胁
            color = '#ec4f74' // 红
            break

        default:
            break
    }
    return color
}

/**
 * 威胁来源风险评估
 * @param {Nmuber} score
 * @return 风险评估值
 */
export function calculateRiskScore(score = -2) {
    let rate = ''
    switch (true) {
        case score < 1:
            rate = '无威胁'
            break
        case score >= 1 && score <= 2:
            rate = '过期'
            break
        case score > 2 && score <= 3:
            rate = '低威胁'
            break
        case score > 3 && score <= 4:
            rate = '中威胁'
            break
        default:
            rate = '高威胁'
            break
    }
    return rate
}

/**
 * 翻译情报类型
 * @param {*} key
 * @returns
 */
export function translateType(key) {
    const obj = {
        ip: 'IP',
        domain: '域名',
        url: 'URL',
        hash: '文件哈希',
        email: '邮件地址',
    }
    return obj[key.toLocaleLowerCase()] || key
}

/** ***********************************************************************  end ************************************************************************* */

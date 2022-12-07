import { isArray, isObject, reduce } from 'lodash'

export const commonFormProps = {
    labelAlign: 'right',
}

// 获取表单元素的label和name的映射关系
export function getFormDict(formarr) {
    return formarr.reduce((obj, d) => {
        obj[d.props.name] = d.props.label
        return obj
    }, {})
}

// 事件配置弹窗的用来确定的最后一步
export function getConfirmInfo(values, dict = {}) {
    return reduce(
        values,
        (obj, d, k) => {
            const title = dict[k] || k
            obj[title] =
                !isArray(d) && isObject(d) ? getConfirmInfo(d, dict) : d
            return obj
        },
        {}
    )
}

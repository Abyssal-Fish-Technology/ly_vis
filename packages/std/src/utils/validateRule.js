import { message } from 'antd'

/**
 * 表单校验规则
 */
const filterReg = {
    filterRule: new RegExp(/[^a-zA-Z0-9.!<>/()=\s]/, 'g'),

    numberRule: new RegExp(/[^0-9]/, 'g'),

    ipRule: new RegExp(/[^0-9.!/(),]/, 'g'),

    portRule: new RegExp(/[^0-9<>!(),]/, 'g'),

    whiteIpRule: new RegExp(/[^-0-9.!/(),]/, 'g'),

    whitePortRule: new RegExp(/[^-0-9<>!(),]/, 'g'),

    protocolRule: new RegExp(/[^,0-9a-zA-Z]/, 'g'),

    hourRule: new RegExp(/[^0-9:]/, 'g'),

    notSpaceRule: new RegExp(/[\s]/, 'g'),
}

export default function validateInput(type) {
    return e => {
        let { value } = e.target
        if (filterReg[type] && filterReg[type].test(value)) {
            value = value.replace(filterReg[type], '')
            message.error('非法字符,禁止输入')
        }
        return value
    }
}

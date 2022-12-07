import { Col, Input, Row } from 'antd'
import React from 'react'
/**
 * 自定义设备查询
 * @param {Object} value
 * 表单值，有两种
 * 模糊模式:
 *  {
 *      deviceIp: '',
        devicePort: '',
    }
 * 精准模式:
    {
        attackIp: '',
        attackPort: '',
        victimIp: '',
        victimPort: '',
    }
* @returns
 */
export function AssetDeviceFilter({
    value = { ip: '', port: '', host: '', show_url: '' },
    onChange,
    keyArr,
}) {
    const translateDict = {
        ip: 'IP',
        port: '端口',
        host: '网站',
        show_url: 'URL',
    }

    function triggerChange(key, newValue) {
        const valueObj = {
            ...value,
            [key]: newValue,
        }
        const result = keyArr.reduce((obj, keyItem) => {
            obj[keyItem] = valueObj[keyItem]
            return obj
        }, {})
        onChange(result)
    }

    return (
        <Row align='middle' gutter={10}>
            {keyArr.map((keyItem, i) => {
                const nowSpan = i % 2 === 0 ? 12 : 11
                return [
                    <Col span={keyArr.length > 1 ? nowSpan : 18} key={keyItem}>
                        <Input
                            placeholder={translateDict[keyItem]}
                            value={value[keyItem]}
                            onChange={e => {
                                triggerChange(keyItem, e.target.value)
                            }}
                            allowClear
                        />
                    </Col>,
                    i % 2 === 0 && keyArr.length > 1 && ':',
                ]
            })}
        </Row>
    )
}

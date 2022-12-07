import React, { forwardRef } from 'react'
import { Select, Input, Tooltip } from 'antd'
import { RetweetOutlined } from '@ant-design/icons'
import { useSelectOptions } from '@shadowflow/components/utils/universal/methods-hooks'
import { getDeviceType } from '@shadowflow/components/utils/universal/methods-net'
import withConfig from '@shadowflow/components/ui/form/form-components/hoc/with-config'
import withFormItem from '@shadowflow/components/ui/form/form-components/hoc/with-form-item'
import useConfigCache from '@shadowflow/components/ui/form/form-components/hooks/use-config-cache'
import RangePicker from './components/picker-daterange'

const { Option } = Select

// 校验规则
export const rulesObj = {
    validIP: (rule, value) => {
        const { isOnlyIp, mask } = getDeviceType(value)
        if (value && !isOnlyIp && !mask) {
            return Promise.reject(new Error('请输入正确的IP!'))
        }
        return Promise.resolve()
    },
    validPort: (rule, value) => {
        const reg = /^\d+$/
        if (
            value &&
            (!reg.test(value) || Number(value) < 0 || Number(value) > 65535)
        ) {
            return Promise.reject(new Error('请输入正确的PORT!'))
        }
        return Promise.resolve()
    },
    validDns: (rule, value) => {
        const { hasDomain } = getDeviceType(value)
        if (value && !hasDomain) {
            return Promise.reject(new Error('请输入正确的域名!'))
        }
        return Promise.resolve()
    },
    validNum: (rule, value) => {
        if (value && !/^\d+$/.test(value)) {
            return Promise.reject(new Error('请输入正确的整数!'))
        }
        return Promise.resolve()
    },
    validUrl: (rule, value) => {
        const { hasUrl } = getDeviceType(value)
        if (value && !hasUrl) {
            return Promise.reject(new Error('请输入正确的URL!'))
        }
        return Promise.resolve()
    },
}

export const IpInput = ({ rules = [], ...props }) => {
    const Cmp = withFormItem(
        forwardRef((_props, ref) => {
            return <Input ref={ref} {..._props} />
        })
    )
    props.rules = [...rules, { validator: rulesObj.validIP }]
    return <Cmp {...props} />
}

export const PortInput = ({ rules = [], ...props }) => {
    const Cmp = withFormItem(
        forwardRef((_props, ref) => {
            return <Input ref={ref} {..._props} />
        })
    )
    props.rules = [...rules, { validator: rulesObj.validPort }]
    return <Cmp {...props} />
}

export const DeviceType = withFormItem(props => {
    return (
        <Select {...props}>
            <Option value='router'>router</Option>
            <Option value='switcher'>switcher</Option>
            <Option value='mirror'>mirror</Option>
        </Select>
    )
})

export const DeviceFlowType = withFormItem(props => {
    return (
        <Select {...props}>
            <Option value='sflow'>sflow</Option>
            <Option value='netflow'>netflow</Option>
        </Select>
    )
})

export const ProxySelect = withConfig(
    props => {
        const { cache } = useConfigCache('proxy')
        const options = useSelectOptions(cache, 'id', 'name')
        return <Select {...props}>{options}</Select>
    },
    'proxy',
    'id'
)

export const DisabledSelect = withFormItem(props => {
    return (
        <Select {...props}>
            <Option value='Y'>Yes</Option>
            <Option value='N'>No</Option>
        </Select>
    )
})

export const ProxyStatus = withFormItem(props => {
    return (
        <Select {...props}>
            <Option value='disconnected'>disconnected</Option>
            <Option value='connected'>connected</Option>
        </Select>
    )
})

export const DefaultFormItem = withFormItem(props => {
    return <Input {...props} />
})

// 反转按钮
export function ReverseFields({ style, onClick }) {
    return (
        <Tooltip title='反转数据'>
            <RetweetOutlined
                className='font-4'
                style={{
                    position: 'absolute',
                    top: '35px',
                    right: '-1em',
                    ...style,
                }}
                onClick={onClick}
            />
        </Tooltip>
    )
}

ReverseFields.defaultProps = {
    style: null,
    onClick: () => {},
}

export const DateTimeRangePicker = withFormItem(props => {
    return <RangePicker {...props} />
})

export { default as DeviceSelect } from './components/select-device'

export { default as HourPicker } from './components/picker-hour'

export { default as WeekSelect } from './components/select-week'

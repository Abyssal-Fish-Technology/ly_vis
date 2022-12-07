import React from 'react'
import { Form } from 'antd'

export default function withFormItem(Component) {
    return ({ cache, inputProps = {}, ...formItemProps }) => {
        const cacheProps = cache ? { cache } : {}
        return (
            <Form.Item {...formItemProps}>
                <Component {...cacheProps} {...inputProps} />
            </Form.Item>
        )
    }
}

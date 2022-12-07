import React from 'react'
import { Form } from 'antd'
import { has } from 'lodash'
import useConfigCache from '../hooks/use-config-cache'

export default function withConfig(Wrapped, cacheKey, initialField) {
    return ({ inputProps, ...props }) => {
        const { cache = [] } = useConfigCache(cacheKey)
        if (
            cache &&
            cache.length &&
            cache[0][initialField] !== undefined &&
            initialField !== undefined &&
            !has(props, 'initialValue')
        ) {
            props.initialValue = cache[0][initialField]
        }

        return (
            <Form.Item {...props}>
                <Wrapped {...inputProps} />
            </Form.Item>
        )
    }
}

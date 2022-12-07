import withFormItem from '@shadowflow/components/ui/form/form-components/hoc/with-form-item'
import { Switch } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'

const EventStatus = withFormItem(function EventStatus({
    value,
    onChange,
    ...props
}) {
    const [itemValue, setItemValue] = useState()

    const itemChange = useCallback(
        v => {
            const useValue = v ? 'ON' : 'OFF'
            setItemValue(v)
            onChange(useValue)
        },
        [onChange]
    )

    useEffect(() => {
        const useValue = value === true || value === 'ON'
        itemChange(useValue)
    }, [itemChange, value])
    return (
        <Switch
            checked={itemValue}
            onChange={itemChange}
            checkedChildren='开启'
            unCheckedChildren='关闭'
            {...props}
        />
    )
})

export default EventStatus

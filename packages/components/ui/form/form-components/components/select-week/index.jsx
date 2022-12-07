import withFormItem from '@shadowflow/components/ui/form/form-components/hoc/with-form-item'
import { Select } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

const WEEK_MAP = {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    0: '周日',
}

const WeekSelect = withFormItem(function WeekSelect({
    value,
    onChange,
    ...props
}) {
    const options = useMemo(() => new Array(7).fill().map((d, i) => i), [])

    const [selectValue, setSelectValue] = useState()

    const selectChange = useCallback(
        changedValue => {
            setSelectValue(changedValue)
            if (onChange) onChange(changedValue.join(','))
        },
        [onChange]
    )

    useEffect(() => {
        const format = d => parseInt(d, 10)

        const useValue = Array.isArray(value)
            ? value.map(format)
            : (value || '').split(',').map(format)

        selectChange(value === '' || value === 'NaN' ? [] : useValue)
    }, [selectChange, value])

    return (
        <Select
            value={selectValue}
            onChange={selectChange}
            mode='multiple'
            maxTagCount={0}
            {...props}
        >
            {options.map(v => (
                <Select.Option key={v} value={v}>
                    {WEEK_MAP[v]}
                </Select.Option>
            ))}
        </Select>
    )
})

export default WeekSelect

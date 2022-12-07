import React, { useCallback, useEffect, useState } from 'react'
import { TimePicker as Picker } from 'antd'
import moment, { isMoment } from 'moment'
import withFormItem from '@shadowflow/components/ui/form/form-components/hoc/with-form-item'

const HourPicker = withFormItem(function HourPicker({
    value,
    onChange,
    format = 'HH:mm:ss',
    ...props
}) {
    const [timeValue, setTimeValue] = useState()
    const pickerChange = useCallback(
        t => {
            setTimeValue(t)
            if (onChange) onChange(t.format(format))
        },
        [format, onChange]
    )

    useEffect(() => {
        const useValue = isMoment(value) ? value : moment(value, format)
        pickerChange(useValue)
    }, [format, pickerChange, value])

    return (
        <Picker
            value={timeValue}
            format={format}
            onChange={pickerChange}
            {...props}
        />
    )
})

export default HourPicker

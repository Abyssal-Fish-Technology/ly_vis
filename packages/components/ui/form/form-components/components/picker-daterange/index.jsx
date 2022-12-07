import { DatePicker } from 'antd'
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { not10Length } from '@shadowflow/components/utils/universal/methods-time'

const { RangePicker } = DatePicker

export default function DateTimeRangePicker({
    value = [],
    onChange,
    result = false,
    openChange = false,
    initFormat = 'YYYY/MM/DD HH:mm',
    ranges = {
        今天: [moment().startOf('d'), moment()],
        最近三天: [moment().subtract(2, 'day'), moment()],
        最近七天: [moment().subtract(6, 'day'), moment()],
    },
    showTime = {
        hideDisabledOptions: true,
        minuteStep: 5,
        format: 'hh:mm',
    },
    ...props
}) {
    const [value0, value1] = value
    const [timeValue, setTimeValue] = useState([])

    useEffect(() => {
        const useTime = [value0, value1].map(t =>
            typeof t === 'number' && !not10Length(t) ? moment.unix(t) : t
        )
        setTimeValue(useTime)
    }, [value0, value1])

    let currentValue = [value0, value1]
    function pickerChange(values) {
        const useValues = Array.isArray(values)
            ? values.map(t => (t ? t.unix() : t))
            : values
        currentValue = useValues
        if (onChange) onChange(useValues)
    }
    return (
        <RangePicker
            value={timeValue}
            allowClear={false}
            showTime={showTime}
            format={initFormat}
            disabledDate={current => current && current > moment()}
            onChange={pickerChange}
            onOpenChange={open => {
                if (
                    (result.starttime !== currentValue[0] ||
                        result.endtime !== currentValue[1]) &&
                    !open &&
                    result
                ) {
                    openChange(currentValue)
                }
            }}
            {...props}
            ranges={ranges}
        />
    )
}

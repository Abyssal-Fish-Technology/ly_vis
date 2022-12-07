import React, { useMemo } from 'react'
import { Select } from 'antd'

const { Option } = Select

export function useSelectOptions(data, valueKey, showkey) {
    return useMemo(
        () =>
            data.map(d => (
                <Option key={d[valueKey]} value={d[valueKey]}>
                    {d[showkey]}
                </Option>
            )),
        [data, showkey, valueKey]
    )
}

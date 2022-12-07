import { Select } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { useSelectOptions } from '@shadowflow/components/utils/universal/methods-hooks'
import useConfigCache from '../../hooks/use-config-cache'
import withConfig from '../../hoc/with-config'

const DeviceSelect = observer(
    withConfig(
        function DeviceSelect({ value, onChange, needAll = false, ...props }) {
            const [selectValue, setSelectValue] = useState()

            const { cache } = useConfigCache('device')

            const options = useSelectOptions(cache, 'id', 'name')

            const selectChange = useCallback(
                e => {
                    setSelectValue(e)
                    if (onChange) {
                        onChange(
                            props.mode === 'multiple' && Array.isArray(e)
                                ? e.join()
                                : e
                        )
                    }
                },
                [onChange, props.mode]
            )

            useEffect(() => {
                let useValue = !value ? '' : +value
                if (props.mode === 'multiple') {
                    useValue = Array.isArray(value)
                        ? value.map(d => +d)
                        : (value || '')
                              .toString()
                              .split(',')
                              .filter(s => s !== '')
                              .map(d => +d)
                }
                setSelectValue(useValue)
            }, [props.mode, selectChange, value])
            return (
                <Select value={selectValue} onChange={selectChange} {...props}>
                    {needAll && <Select.Option value=''>全部</Select.Option>}
                    {options}
                </Select>
            )
        },
        'device',
        'id'
    )
)

export default DeviceSelect

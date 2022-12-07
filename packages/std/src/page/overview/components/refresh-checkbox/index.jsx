import { Checkbox } from 'antd'
import React, { useCallback, useEffect, useRef } from 'react'

export default function RefreshCheckbox(props) {
    const { callback } = props
    const timer = useRef(null)

    const changeValue = useCallback(
        start => {
            if (start) {
                timer.current = setInterval(() => {
                    callback()
                }, 5 * 3600 * 1000)
            } else {
                clearInterval(timer.current)
            }
        },
        [callback, timer]
    )

    useEffect(() => {
        timer.current = setInterval(() => {
            callback()
        }, 5 * 3600 * 1000)
        return () => {
            clearInterval(timer.current)
        }
    }, [callback])
    return (
        <div>
            <Checkbox
                defaultChecked
                onChange={e => {
                    changeValue(e.target.checked)
                }}
            >
                自动刷新(5分钟)
            </Checkbox>
        </div>
    )
}

import React, { useContext, useEffect, useMemo } from 'react'
import { Descriptions, Typography } from 'antd'
import { isArray, map } from 'lodash'
import StepFormContext from '../context'

const disabledFields = ['passwd', 'repasswd']

export default function Confirm() {
    const {
        formValue,
        confirmInfo,
        setConfirmInfo,
        getConfirmInfo,
    } = useContext(StepFormContext)

    const firstValue = useMemo(() => Object.values(confirmInfo)[0], [
        confirmInfo,
    ])

    const infoData = useMemo(
        () =>
            firstValue && firstValue.constructor === Object
                ? confirmInfo
                : [confirmInfo],
        [confirmInfo, firstValue]
    )

    useEffect(() => {
        const useConfirmInfo = getConfirmInfo
            ? getConfirmInfo(formValue)
            : formValue
        setConfirmInfo(useConfirmInfo)
    }, [formValue, getConfirmInfo, setConfirmInfo])

    return (
        <div className='step-form-confirm'>
            {map(infoData, (item, title) => {
                return (
                    item && (
                        <Descriptions
                            title={
                                !isArray(infoData) ? (
                                    <Typography.Title level={4}>
                                        {title}
                                    </Typography.Title>
                                ) : null
                            }
                            key={title}
                            column={2}
                        >
                            {map(item, (val = '', field) => {
                                return disabledFields.includes(field) ? null : (
                                    <Descriptions.Item
                                        key={field}
                                        label={<strong>{field}</strong>}
                                    >
                                        {String(val)}
                                    </Descriptions.Item>
                                )
                            })}
                        </Descriptions>
                    )
                )
            })}
        </div>
    )
}

import React, { useMemo } from 'react'
import { inject, observer } from 'mobx-react'
import { TagAttribute } from '@shadowflow/components/ui/tag'

function withConfig(Wrapped) {
    return inject('configStore')(observer(Wrapped))
}

function getDataObj(data, field, id) {
    return data.find(d => String(d[field]) === String(id)) || {}
}

export const DeviceCell = withConfig(function DeviceCell({
    configStore,
    id = '',
}) {
    const { device } = configStore
    const resultArr = useMemo(() => {
        const arr = []
        if (id === '-') {
            arr.push('全部')
        } else {
            String(id)
                .split(',')
                .forEach(itemId => {
                    arr.push(getDataObj(device, 'id', itemId).name || itemId)
                })
        }
        return arr
    }, [device, id])

    return (
        <span>
            {resultArr.map(item => (
                <TagAttribute key={item} type='asset'>
                    {item}
                </TagAttribute>
            ))}
        </span>
    )
})

export function ActCell({ id }) {
    const actionArr = useMemo(
        () => [
            {
                id: 1,
                act: 'send email',
            },
            {
                id: 2,
                act: 'send message',
            },
            {
                id: 3,
                act: 'send email,send message',
            },
        ],
        []
    )
    const data = useMemo(() => getDataObj(actionArr, 'id', id), [actionArr, id])
    return <span>{data.act || id}</span>
}

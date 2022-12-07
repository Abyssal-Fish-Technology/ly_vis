import React, { useMemo } from 'react'
import { Select, Input, Tooltip, TreeSelect } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { translateEventLevel } from '@shadowflow/components/system/event-system'
import { useSelectOptions } from '@shadowflow/components/utils/universal/methods-hooks'
import withConfig from '@shadowflow/components/ui/form/form-components/hoc/with-config'
import withFormItem from '@shadowflow/components/ui/form/form-components/hoc/with-form-item'
import useConfigCache from '@shadowflow/components/ui/form/form-components/hooks/use-config-cache'
import { openMoGroupModal } from '../modals/modal-mo-group'

const { Option } = Select
const { TreeNode } = TreeSelect

export const MoIpInput = withFormItem(_props => {
    return <Input {..._props} />
})

export const MoGroupSelectAdd = ({ callback }) => {
    return (
        <Tooltip title='添加追踪分组'>
            <PlusOutlined
                style={{
                    position: 'absolute',
                    top: '95px',
                    right: '-1em',
                    cursor: 'pointer',
                }}
                onClick={() => {
                    openMoGroupModal({
                        op: 'gadd',
                        callback,
                    })
                }}
            />
        </Tooltip>
    )
}

export const MoGroupSelect = observer(
    withConfig(
        props => {
            const { cache } = useConfigCache('moGroup')
            const options = useSelectOptions(cache, 'id', 'name')
            return <Select {...props}>{options}</Select>
        },
        'moGroup',
        'id'
    )
)

export const EventActionSelect = withConfig(
    props => {
        const { cache } = useConfigCache('eventAction')
        const options = useSelectOptions(cache, 'id', 'desc')
        return <Select {...props}>{options}</Select>
    },
    'eventAction',
    'id'
)

export const EventLevelSelect = withConfig(
    props => {
        const { cache } = useConfigCache('eventLevel')
        const data = useMemo(
            () =>
                cache.map(d => ({ ...d, label: translateEventLevel(d.desc) })),
            [cache]
        )
        const options = useSelectOptions(data, 'desc', 'label')
        return <Select {...props}>{options}</Select>
    },
    'eventLevel',
    'desc'
)

export const EventTypeSelect = withConfig(
    props => {
        const { cache } = useConfigCache('eventType')
        const options = useSelectOptions(cache, 'desc', 'desc')
        return <Select {...props}>{options}</Select>
    },
    'eventType',
    'desc'
)

export const MoSelect = observer(
    withConfig(
        props => {
            const { cache, configStore } = useConfigCache('mo')
            return (
                <>
                    <TreeSelect
                        dropdownClassName='eventModal-mo-select'
                        {...props}
                    >
                        {configStore.moGroup.map(d1 => (
                            <TreeNode
                                key={`moGroup-${d1.id}`}
                                title={d1.name}
                                selectable={false}
                                value={`moGroup-${d1.id}`}
                            >
                                {cache
                                    .filter(d2 => d2.groupid === d1.id)
                                    .map(d3 => (
                                        <TreeNode
                                            key={d3.id}
                                            value={d3.id}
                                            title={`id: ${d3.id}, ${d3.desc}`}
                                        />
                                    ))}
                            </TreeNode>
                        ))}
                    </TreeSelect>
                </>
            )
        },
        'mo',
        'id'
    )
)

export const EventActSelect = withFormItem(props => {
    return (
        <Select {...props}>
            <Option value={1}>send email</Option>
            <Option value={2}>send message</Option>
            <Option value={3}>send email,send message</Option>
        </Select>
    )
})

export { default as EventStatus } from './components/switch-event-status'

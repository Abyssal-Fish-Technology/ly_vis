export const EVENT_PARAMS = {
    type: 'event',
    op: 'get',
}

export const EVENT_CONFIG_PARAMS = {
    type: 'event_config',
    op: 'get',
}

export const EVENT_COLUMNS = [
    {
        title: 'id',
        dataIndex: 'id',
    },
    {
        title: '描述',
        dataIndex: 'desc',
    },
    {
        title: '行动',
        dataIndex: 'action_id',
    },
    {
        title: '数据源',
        dataIndex: 'devid',
    },
    {
        title: '配置ID',
        dataIndex: 'config_id',
    },
    {
        title: '事件类型',
        dataIndex: 'event_type',
    },
    {
        title: '事件级别',
        dataIndex: 'event_level',
    },
    {
        title: '监控星期',
        dataIndex: 'weekday',
    },
    {
        title: '开始时间',
        dataIndex: 'stime',
    },
    {
        title: '结束时间',
        dataIndex: 'etime',
    },
    {
        title: '事件状态',
        dataIndex: 'status',
    },
]

export const EVENT_FORM = [
    {
        label: '事件类型',
        valueKey: 'event_type',
        required: true,
    },
    {
        label: '配置ID',
        valueKey: 'config_id',
    },
    {
        label: '数据源',
        valueKey: 'devid',
    },
    {
        label: '事件级别',
        valueKey: 'event_level',
    },
    {
        label: '事件状态',
        valueKey: 'status',
        required: true,
        options: ['ON', 'OFF'],
    },
    {
        label: '行动',
        valueKey: 'action_id',
        required: true,
    },
    {
        label: '描述',
        valueKey: 'desc',
        required: true,
    },
    {
        label: '监控星期',
        valueKey: 'weekday',
        required: true,
    },
    {
        label: '开始时间',
        valueKey: 'stime',
        required: true,
    },
    {
        label: '结束时间',
        valueKey: 'etime',
        required: true,
    },
]

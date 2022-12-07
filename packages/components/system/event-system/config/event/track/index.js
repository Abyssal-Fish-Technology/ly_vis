// 具体的详细配置表格
const detailConfigColumns = [
    {
        title: 'id',
        dataIndex: 'id',
    },
    {
        title: 'mo',
        dataIndex: 'moid',
    },
    {
        title: '阈值模式',
        dataIndex: 'thres_mode',
    },
    {
        title: '数据类型',
        dataIndex: 'data_type',
    },
    {
        title: '最小值',
        dataIndex: 'min',
    },
    {
        title: '最大值',
        dataIndex: 'max',
    },
]

// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '监控追踪条目',
        valueKey: 'moid',
    },
    {
        label: '阈值模式',
        valueKey: 'thres_mode',
        options: ['abs', 'rel_v', 'rel_p'],
        required: true,
    },
    {
        label: '数据类型',
        valueKey: 'data_type',
        options: ['bps', 'pps', 'sps'],
        required: true,
    },
    {
        label: '最小值',
        valueKey: 'min',
        required: true,
    },
    {
        label: '最大值',
        valueKey: 'max',
    },
]

const EventTrack = {
    type: 'mo',
    name: '追踪事件',
    objOrder: [0, 1, 2, 3],
    detailConfigColumns,
    detailConfigForms,
}

export default EventTrack

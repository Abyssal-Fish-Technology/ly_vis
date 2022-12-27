// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '监控追踪条目',
        valueKey: 'moid',
    },
    {
        label: '数据类型',
        valueKey: 'data_type',
        options: ['bps', 'pps', 'fps'],
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
    detailConfigForms,
    params: {
        thres_mode: 'abs',
    },
}

export default EventTrack

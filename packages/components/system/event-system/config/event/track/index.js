// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '监控追踪条目',
        valueKey: 'moid',
    },
    {
        label: '阈值',
        valueKey: 'min',
        required: true,
    },
    {
        label: '阈值单位',
        valueKey: 'data_type',
        options: ['Bps', 'pps', 'fps'],
        required: true,
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

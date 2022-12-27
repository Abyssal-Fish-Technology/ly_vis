// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '阈值',
        valueKey: 'min',
        required: true,
    },
    {
        label: '数据单位',
        valueKey: 'data_type',
        options: ['Bps', 'pps', 'fps'], // 待选值，可省略
        required: true,
    },
]

const EventTi = {
    type: 'ti',
    name: '情报命中',
    objOrder: [2, 3, 0, 1],
    detailConfigForms,
}

export default EventTi

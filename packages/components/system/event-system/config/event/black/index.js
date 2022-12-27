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
        options: ['Bps', 'pps', 'fps'],
        required: true,
    },
]

const EventBlack = {
    type: 'black',
    name: '黑名单事件',
    objOrder: [2, 3, 0, 1],
    detailConfigForms,
}

export default EventBlack

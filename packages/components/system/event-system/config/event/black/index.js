// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '最小值',
        valueKey: 'min',
        required: true,
    },
    {
        label: '最大值',
        valueKey: 'max',
    },
    {
        label: '数据单位',
        valueKey: 'data_type',
        options: ['bps', 'pps', 'fps'],
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

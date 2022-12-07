// 具体的详细配置表格
const detailConfigColumns = [
    {
        title: 'id',
        dataIndex: 'id',
    },
    {
        title: '最小值',
        dataIndex: 'min',
    },
    {
        title: '最大值',
        dataIndex: 'max',
    },
    {
        title: '数据单位',
        dataIndex: 'data_type',
    },
]

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
    detailConfigColumns,
    detailConfigForms,
}

export default EventBlack

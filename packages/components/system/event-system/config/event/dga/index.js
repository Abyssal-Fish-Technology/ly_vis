// 具体的详细配置表格
const detailConfigColumns = [
    {
        title: 'id',
        dataIndex: 'id',
    },
    {
        title: '源IP',
        dataIndex: 'sip',
    },
    {
        title: '目的IP',
        dataIndex: 'dip',
    },
    {
        title: '最小百分比',
        dataIndex: 'min',
    },
    {
        title: '域名数量',
        dataIndex: 'qcount',
    },
]

// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '源IP',
        valueKey: 'sip',
    },
    {
        label: '目的IP',
        valueKey: 'dip',
    },
    {
        label: '最小百分比',
        valueKey: 'min',
        placeholder: '疑似DGA域名的最小百分比值',
        required: true,
    },
    {
        label: '域名数量',
        valueKey: 'qcount',
        placeholder: 'DGA域名数量',
        required: true,
    },
]

const DgaEvent = {
    type: 'dga',
    name: 'DGA事件',
    objOrder: [0, 1, 2, 3],
    detailConfigColumns,
    detailConfigForms,
}

export default DgaEvent

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
    detailConfigForms,
}

export default DgaEvent

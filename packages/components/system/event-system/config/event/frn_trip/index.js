// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '源IP',
        valueKey: 'sip',
        placeholder: '',
        required: true,
    },
    {
        label: '目的IP',
        valueKey: 'dip',
        placeholder: '',
    },
    {
        label: '阈值',
        valueKey: 'min',
        required: true, // 是否必填,可省略
        placeholder: '',
    },
    {
        label: '描述信息',
        valueKey: 'desc',
        placeholder: '',
    },
]

const FrnTripEvent = {
    type: 'frn_trip',
    name: '服务器外连',
    objOrder: [0, 1, 2, 3],
    detailConfigForms,
}

export default FrnTripEvent

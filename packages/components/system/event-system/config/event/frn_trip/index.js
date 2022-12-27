// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '服务器IP',
        valueKey: 'sip',
        placeholder: '',
        required: true,
    },
    {
        label: '外连通讯IP',
        valueKey: 'dip',
        placeholder: '',
    },
    {
        label: '阈值',
        valueKey: 'min',
        required: true, // 是否必填,可省略
        placeholder: '阈值单位：会话量/5min',
    },
]

const FrnTripEvent = {
    type: 'frn_trip',
    name: '服务器外连',
    objOrder: [0, 1, 2, 3],
    detailConfigForms,
}

export default FrnTripEvent

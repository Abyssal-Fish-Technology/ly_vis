// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '查询DNS的IP',
        valueKey: 'sip',
        placeholder: '发起请求主机范围，ip或者net，多个以逗号分割',
        required: true,
    },
    {
        label: 'DNS服务器IP',
        valueKey: 'dip',
        placeholder: '',
        required: true,
    },
    {
        label: '可疑程度',
        valueKey: 'min',
        placeholder: '查询域名疑似dns隧道的程度,默认值99',
        required: true,
        initValue: 99,
    },
]

const EventDnsTunAi = {
    type: 'dnstun_ai',
    name: 'DNS隧道AI事件',
    objOrder: [0, 1, 2, 3],
    detailConfigForms,
}
export default EventDnsTunAi

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
        label: '相似度',
        valueKey: 'min',
        placeholder: '检出相似度（范围0～99）',
        required: true,
    },
]

const EventDnsTunAi = {
    type: 'dnstun_ai',
    name: 'DNS隧道AI事件',
    objOrder: [0, 1, 2, 3],
    detailConfigForms,
}
export default EventDnsTunAi

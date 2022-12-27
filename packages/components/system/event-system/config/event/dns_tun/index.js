// 具体的详细配置Form
const detailConfigForms = [
    {
        label: 'IP',
        valueKey: 'ip',
        placeholder: '发起请求主机范围，ip或者net，多个以逗号分割',
    },
    {
        label: '临界域名长度',
        valueKey: 'namelen',
        placeholder: '建议值为25',
    },
    {
        label: '父域名临界请求频度',
        valueKey: 'fqcount',
        placeholder: '建议值为150',
    },
    {
        label: '检出评估值',
        valueKey: 'detvalue',
        placeholder: '超出评估值检出为威胁事件',
    },
    {
        label: '描述信息',
        valueKey: 'desc',
        placeholder: '',
        required: true,
    },
]

const EventDnsTun = {
    type: 'dns_tun',
    name: 'DNS隧道事件',
    objOrder: [0, 1, 2, 3],
    detailConfigForms,
}

export default EventDnsTun

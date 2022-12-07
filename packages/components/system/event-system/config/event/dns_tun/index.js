// 具体的详细配置表格
const detailConfigColumns = [
    {
        title: 'id',
        dataIndex: 'id',
    },
    {
        title: 'IP',
        dataIndex: 'ip',
    },
    {
        title: '临界域名长度',
        dataIndex: 'namelen',
    },
    {
        title: '父域名临界请求频度',
        dataIndex: 'fqcount',
    },
    {
        title: '检出评估值',
        dataIndex: 'detvalue',
    },
    {
        title: '描述信息',
        dataIndex: 'desc',
    },
]

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
    detailConfigColumns,
    detailConfigForms,
}

export default EventDnsTun

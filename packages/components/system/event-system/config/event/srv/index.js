// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '最小端口会话数',
        valueKey: 'min_portsessions',
        required: true,
    },
    {
        label: '最大端口会话数',
        valueKey: 'max_portsessions',
    },
    {
        label: '端口',
        valueKey: 'port',
    },
    {
        label: 'IP',
        valueKey: 'ip',
    },
    {
        label: '协议',
        valueKey: 'protocol',
        options: ['', 'TCP', 'UDP', 'ICMP', 'GRE', 'ESP'], // 待选值，可省略
    },
]

const EventSrv = {
    type: 'srv',
    name: '异常服务',
    objOrder: [2, 3, 0, 1],
    detailConfigForms,
}

export default EventSrv

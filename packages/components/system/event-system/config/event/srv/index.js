// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '服务会话数阈值',
        valueKey: 'min_portsessions',
        required: true,
    },
    {
        label: '服务端口',
        valueKey: 'port',
    },
    {
        label: '服务IP',
        valueKey: 'ip',
    },
    {
        label: '协议',
        valueKey: 'protocol',
        options: ['', 'TCP', 'UDP', 'ICMP'], // 待选值，可省略
    },
]

const EventSrv = {
    type: 'srv',
    name: '异常服务',
    objOrder: [2, 3, 0, 1],
    detailConfigForms,
}

export default EventSrv

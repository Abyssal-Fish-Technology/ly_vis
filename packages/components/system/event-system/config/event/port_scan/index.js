// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '探测IP数量阈值',
        valueKey: 'min_peerips',
        placeholder: '',
        required: true,
    },
    {
        label: '被扫描端口',
        valueKey: 'port',
        placeholder: '',
    },
    {
        label: '扫描源IP',
        valueKey: 'ip',
        placeholder: '',
    },
    {
        label: '协议',
        valueKey: 'protocol',
        options: ['', 'TCP', 'UDP', 'ICMP'], // 待选值，可省略
        placeholder: '',
    },
]

const EventPortScan = {
    type: 'port_scan',
    name: '端口扫描',
    objOrder: [2, 3, 0, 1],
    detailConfigForms,
}

export default EventPortScan

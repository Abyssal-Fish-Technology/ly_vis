// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '探测端口数量阈值',
        valueKey: 'min_peerports',
        placeholder: '',
        required: true,
    },
    {
        label: '扫描源IP',
        valueKey: 'sip',
        placeholder: '',
    },
    {
        label: '受害IP',
        valueKey: 'dip',
        placeholder: '',
    },
    {
        label: '协议',
        valueKey: 'protocol',
        options: ['', 'TCP', 'UDP', 'ICMP'], // 待选值，可省略
        placeholder: '',
    },
]

const EventIpScan = {
    type: 'ip_scan',
    name: 'IP扫描',
    objOrder: [2, 3, 0, 1],
    detailConfigForms,
}
export default EventIpScan

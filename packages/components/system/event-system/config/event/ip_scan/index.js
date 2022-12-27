// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '最小对端端口数',
        valueKey: 'min_peerports',
        placeholder: '',
        required: true,
    },
    {
        label: '最大对端口数',
        valueKey: 'max_peerports',
        placeholder: '',
    },
    {
        label: '源IP',
        valueKey: 'sip',
        placeholder: '',
    },
    {
        label: '目的IP',
        valueKey: 'dip',
        placeholder: '',
    },
    {
        label: '协议',
        valueKey: 'protocol',
        options: ['', 'TCP', 'UDP', 'ICMP', 'GRE', 'ESP'], // 待选值，可省略
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

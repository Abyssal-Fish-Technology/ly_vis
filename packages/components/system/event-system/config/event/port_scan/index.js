// 具体的详细配置表格
const detailConfigColumns = [
    {
        title: 'id',
        dataIndex: 'id',
    },
    {
        title: '最小对端IP数',
        dataIndex: 'min_peerips',
    },
    {
        title: '最大对端IP数',
        dataIndex: 'max_peerips',
    },
    {
        title: '端口',
        dataIndex: 'port',
    },
    {
        title: 'IP',
        dataIndex: 'ip',
    },
    {
        title: '协议',
        dataIndex: 'protocol',
    },
]

// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '最小对端IP数',
        valueKey: 'min_peerips',
        placeholder: '',
        required: true,
    },
    {
        label: '最大对端IP数',
        valueKey: 'max_peerips',
        placeholder: '',
    },
    {
        label: '端口',
        valueKey: 'port',
        placeholder: '',
    },
    {
        label: 'IP',
        valueKey: 'ip',
        placeholder: '',
    },
    {
        label: '协议',
        valueKey: 'protocol',
        options: ['', 'TCP', 'UDP', 'ICMP', 'GRE', 'ESP'], // 待选值，可省略
        placeholder: '',
    },
]

const EventPortScan = {
    type: 'port_scan',
    name: '端口扫描',
    objOrder: [2, 3, 0, 1],
    detailConfigColumns,
    detailConfigForms,
}

export default EventPortScan

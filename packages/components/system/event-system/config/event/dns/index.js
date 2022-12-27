// 具体的详细配置Form
const detailConfigForms = [
    {
        label: 'IP',
        valueKey: 'ip',
        placeholder: '发起请求主机范围，ip或者net，多个以逗号分割',
    },
    {
        label: '请求域名',
        valueKey: 'qname',
        placeholder: '域名范围，多个以逗号分割',
    },
    {
        label: '请求次数',
        valueKey: 'qcount',
        placeholder: '请求域名次数',
        required: true,
    },
    {
        label: '描述信息',
        valueKey: 'desc',
        placeholder: '',
    },
]

// 事件obj以该顺序解析: [受害ip, 受害端口, 对端ip, 对端端口]

const DnsEvent = {
    type: 'dns',
    name: 'DNS事件',
    objOrder: [0, 1, 2, 3],
    detailConfigForms,
}

export default DnsEvent

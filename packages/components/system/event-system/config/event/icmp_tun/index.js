// 具体的详细配置Form
const detailConfigForms = [
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
        label: '影响因子1',
        valueKey: 'IF1',
        placeholder: '异常类型payload内容种类，默认值5',
        initValue: 5,
    },
    {
        label: '影响因子2',
        valueKey: 'IF2',
        placeholder: 'payload内容种类，默认值2',
        initValue: 2,
    },
    {
        label: '影响因子3',
        valueKey: 'IF3',
        placeholder: 'payload长度的种类，默认值5',
        initValue: 5,
    },
]

const EventIcmpTun = {
    type: 'icmp_tun',
    name: 'ICMP隧道',
    objOrder: [0, 1, 2, 3],
    detailConfigForms,
}

export default EventIcmpTun

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
        label: '异常载荷内容种类数',
        valueKey: 'IF1',
        placeholder: '默认值5',
        initValue: 5,
    },
    {
        label: '所有载荷种内容类数',
        valueKey: 'IF2',
        placeholder: '默认值2',
        initValue: 2,
    },
    {
        label: '所有载荷长度种类数',
        valueKey: 'IF3',
        placeholder: '默认值5',
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

// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '阈值',
        valueKey: 'min',
        placeholder: '类型为拖库时，bytes的最小值，其它为flow的最小值',
        required: true,
    },
    {
        label: '类型',
        valueKey: 'url_type',
        placeholder: '',
        required: true,
    },
    {
        label: '正则',
        valueKey: 'pat',
        placeholder: 'c++形式的正则表达式',
        required: true,
    },
]

const EventUrlContent = {
    type: 'url_content',
    name: 'URL内容识别',
    objOrder: [2, 3, 0, 1],
    detailConfigForms,
}

export default EventUrlContent

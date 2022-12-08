import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    Input,
    Form,
    DatePicker,
    Select,
    Button,
    Radio,
    Checkbox,
    List,
    Tooltip,
    Collapse,
    message,
} from 'antd'
import moment from 'moment'
import { observer } from 'mobx-react'
import { chain, pickBy } from 'lodash'
import {
    IpInput,
    PortInput,
    rulesObj,
} from '@shadowflow/components/ui/form/form-components'
import {
    DoubleRightOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
} from '@ant-design/icons'
import configStore from '@/layout/components/config/store'
import { formatStringSpace } from '@shadowflow/components/utils/universal/methods-arithmetic'
import { rountTime5Min } from '@shadowflow/components/utils/universal/methods-time'
import style from './index.module.less'

const { Item: FormItem } = Form
const { Option } = Select
const { RangePicker } = DatePicker

const featureArr = [
    {
        name: '威胁连接',
        key: 'sus',
    },
    {
        name: '黑名单连接',
        key: 'black',
    },
    {
        name: '服务记录',
        key: 'service',
    },
    {
        name: '扫描记录',
        key: 'scan',
    },
    {
        name: 'TCP连接记录',
        key: 'tcpinit',
    },
    {
        name: 'DNS连接记录',
        key: 'dns',
    },
    {
        name: 'DNS隧道连接记录',
        key: 'dns_tun',
    },
]

// 查询方式不支持类型
const searchTypeArr = [
    {
        name: 'IP',
        key: 'ip',
        exclude: [],
    },
    {
        name: '端口',
        key: 'port',
        exclude: ['sus', 'black', 'dns', 'dns_tun'],
    },
    {
        name: '域名',
        key: 'dns',
        exclude: ['sus', 'black', 'service', 'scan', 'tcpinit'],
    },
    {
        name: 'IP 端口',
        key: 'ip port',
        exclude: [],
    },
    {
        name: 'IP>端口',
        key: 'ip>port',
        exclude: ['service'],
    },
    {
        name: 'IP:端口',
        key: 'ip:port',
        exclude: ['scan'],
    },
]

const SearchTip = () => {
    const arr = [
        {
            id: 1,
            title: 'IP>PORT',
            eg: '1.1.1.1>8080',
            desc: '1.1.1.1的对端端口为8080的情况下的流量特征',
        },
        {
            id: 2,
            title: 'IP:PORT',
            eg: '1.1.1.1:8080',
            desc: '1.1.1.1的8080端口下的流量特征',
        },
        {
            id: 3,
            title: 'IP PORT',
            eg: '1.1.1.1 8080',
            desc: '1.1.1.1和8080端口下的流量特征，包含上述1和2两种情况',
        },
        {
            id: 4,
            title: 'DNS',
            eg: 'www.shuziguanxing.com',
            desc: '访问www.shuziguangxing.com的主机IP',
        },
    ]
    return (
        <List
            itemLayout='vertical'
            split={false}
            dataSource={arr}
            renderItem={item => (
                <List.Item
                    key={item.title}
                    style={{ padding: 0, marginBottom: '10px' }}
                >
                    <div style={{ fontWeight: 'bold' }}>
                        <span style={{ display: 'inline-block', width: '2em' }}>
                            {item.id}、
                        </span>
                        {item.title}
                    </div>
                    <div style={{ marginLeft: '2em' }}>
                        <div>搜索：{item.eg}</div>
                        <div>查看：{item.desc}</div>
                    </div>
                </List.Item>
            )}
        />
    )
}

const calcualteNowFeature = type => {
    const excludeArr = searchTypeArr.find(d => d.key === type).exclude
    return featureArr.filter(d => !excludeArr.includes(d.key))
}

function SearchForm({
    onFinish,
    searchValue,
    conditionValue,
    defaultCollapse = true,
    simple = false,
}) {
    const [searchType, setsearchType] = useState('ip')

    const [collapseKey, setCollapseKey] = useState(
        defaultCollapse ? 'condition-pane' : ''
    )

    const [formValue] = Form.useForm()
    const [formConditon] = Form.useForm()

    const ipRef = useRef()
    const portRef = useRef()
    const dnsRef = useRef()

    const useFeature = useMemo(() => calcualteNowFeature(searchType), [
        searchType,
    ])

    useEffect(() => {
        if (searchValue) {
            formValue.setFieldsValue(searchValue)
            setsearchType(searchValue.searchType)
        }
    }, [formValue, searchValue])

    useEffect(() => {
        setTimeout(() => {
            if (
                portRef.current &&
                (formValue.getFieldValue('ip') || !ipRef.current)
            ) {
                portRef.current.focus()
            } else if (ipRef.current) {
                ipRef.current.focus()
            } else if (dnsRef.current) {
                dnsRef.current.focus()
            }
        }, 100)
    }, [formValue, searchType])
    useEffect(() => {
        if (conditionValue) {
            const { feature = [], proto } = conditionValue
            formConditon.setFieldsValue({
                ...conditionValue,
                feature,
                proto: proto || '',
            })
        }
    }, [conditionValue, formConditon])

    const ipInput = (
        <IpInput
            name='ip'
            key='ip'
            rules={[
                {
                    required: true,
                    message: '请输入IP!',
                },
            ]}
            inputProps={{
                placeholder: '请输入IP',
                ref: ipRef,
            }}
        />
    )

    const portInput = (
        <PortInput
            name='port'
            inputProps={{
                ref: portRef,
                placeholder: '请输入端口',
            }}
            rules={[
                {
                    required: true,
                    message: '请输入端口!',
                },
            ]}
        />
    )

    const dnsInput = (
        <FormItem
            name='dns'
            rules={[
                {
                    required: true,
                    message: '请输入域名!',
                },
                { validator: rulesObj.validDns },
            ]}
        >
            <Input ref={dnsRef} placeholder='请输入域名' />
        </FormItem>
    )

    const formObj = {
        ip: <div className='search-value-single'>{ipInput}</div>,
        port: <div className='search-value-single'>{portInput}</div>,
        dns: <div className='search-value-single'>{dnsInput}</div>,
        'ip port': (
            <div className='search-value-complex'>
                {ipInput}
                <div className='ant-form-item'> </div>
                {portInput}
            </div>
        ),
        'ip>port': (
            <div className='search-value-complex'>
                {ipInput}
                <div className='ant-form-item'>&gt;</div>
                {portInput}
            </div>
        ),
        'ip:port': (
            <div className='search-value-complex'>
                {ipInput}
                <div className='ant-form-item'>:</div>
                {portInput}
            </div>
        ),
    }

    const [conditionVis, setconditionVis] = useState(false)
    function onSearchFinish(value) {
        formConditon
            .validateFields()
            .then(values => {
                const [starttime, endtime] = values.starttime.map(d => d.unix())
                const params = {
                    ...pickBy(values, d => d !== null),
                    ...value,
                    feature: values.feature.join(','),
                    starttime,
                    endtime,
                }
                if (onFinish) {
                    const {
                        ip = '',
                        port = '',
                        dns = '',
                        searchType: nowType = 'ip',
                        ...otherParams
                    } = params
                    let device = ''
                    switch (nowType) {
                        case 'ip':
                            device = ip
                            break
                        case 'port':
                            device = port
                            break
                        case 'dns':
                            device = dns
                            break
                        case 'ip:port':
                            device = `${ip}:${port}`
                            break
                        case 'ip>port':
                            device = `${ip}>${port}`
                            break
                        case 'ip port':
                            device = `${ip} ${port}`
                            break
                        default:
                            break
                    }
                    onFinish({ ...otherParams, device })
                }
            })
            .finally(() => {
                setconditionVis(false)
            })
    }

    function onValuesChange(changed) {
        if (Object.prototype.hasOwnProperty.call(changed, 'ip')) {
            const { ip } = changed
            const type = ip[ip.length - 1]
            if ([' ', ':', '>'].includes(type)) {
                const realType = `ip${type}port`
                setsearchType(realType)
                formValue.setFieldsValue({
                    ip: ip.slice(0, -1),
                    searchType: realType,
                })

                setTimeout(() => {
                    if (portRef.current) portRef.current.focus()
                }, 100)
            }
        }
    }

    function onCollapse() {
        const key = collapseKey ? '' : 'condition-pane'
        setCollapseKey(key)
    }

    const initialValues = useMemo(() => {
        return {
            starttime: [
                moment(rountTime5Min(moment().subtract(1, 'd').unix()) * 1000),
                moment(rountTime5Min(moment().unix()) * 1000),
            ],
            devid: configStore.device.length ? configStore.device[0].id : null,
            proto: '',
            feature: useFeature.map(d => d.key),
            limit: 0,
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useFeature, configStore.device])

    useEffect(() => {
        formConditon.setFieldsValue(initialValues)
    }, [conditionVis, formConditon, initialValues])
    return (
        <>
            {!simple ? (
                <div className={style['search-form']}>
                    <Form
                        className='search-value'
                        size='large'
                        form={formValue}
                        onFinish={onSearchFinish}
                        onValuesChange={onValuesChange}
                    >
                        <Input.Group compact>
                            <FormItem
                                name='searchType'
                                initialValue={searchType}
                            >
                                <Select
                                    className='search-value-type'
                                    onChange={type => {
                                        setsearchType(type)
                                    }}
                                >
                                    {searchTypeArr.map(d => {
                                        return (
                                            <Option value={d.key} key={d.key}>
                                                {d.name}
                                            </Option>
                                        )
                                    })}
                                </Select>
                            </FormItem>
                            {formObj[searchType]}
                            <Button
                                size='large'
                                htmlType='submit'
                                type='primary'
                            >
                                搜索
                            </Button>
                            <div className='search-extra'>
                                <Tooltip
                                    className='search-tip'
                                    title={<SearchTip />}
                                >
                                    <QuestionCircleOutlined />
                                </Tooltip>
                                <div
                                    className='collapse-control'
                                    onClick={onCollapse}
                                >
                                    <DoubleRightOutlined
                                        rotate={collapseKey ? -90 : 90}
                                    />
                                    <span>
                                        {collapseKey ? '收起' : '展开'}搜索条件
                                    </span>
                                </div>
                            </div>
                        </Input.Group>
                    </Form>
                    <Collapse
                        ghost
                        className='collapse-condition'
                        activeKey={collapseKey}
                    >
                        <Collapse.Panel
                            forceRender
                            key='condition-pane'
                            header={null}
                            showArrow={false}
                        >
                            <Form
                                className='search-condition'
                                initialValues={initialValues}
                                layout='horizontal'
                                form={formConditon}
                                labelCol={{ span: 2 }}
                                wrapperCol={{ offset: 1 }}
                            >
                                <FormItem label='时间范围' name='starttime'>
                                    <RangePicker
                                        allowClear={false}
                                        showTime={{
                                            minuteStep: 5,
                                            format: 'hh:mm',
                                        }}
                                        format='YYYY/MM/DD HH:mm'
                                        disabledDate={current =>
                                            current > moment()
                                        }
                                        ranges={{
                                            今天: [
                                                moment().startOf('d'),
                                                moment(),
                                            ],
                                            最近三天: [
                                                moment()
                                                    .subtract(2, 'day')
                                                    .startOf('d'),
                                                moment(),
                                            ],
                                            最近七天: [
                                                moment()
                                                    .subtract(6, 'day')
                                                    .startOf('d'),
                                                moment(),
                                            ],
                                        }}
                                    />
                                </FormItem>
                                <FormItem name='feature' label='特征类型'>
                                    <Checkbox.Group>
                                        {useFeature.map(d => (
                                            <Checkbox key={d.key} value={d.key}>
                                                {d.name}
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </FormItem>
                                <FormItem label='采样值'>
                                    <FormItem noStyle name='limit'>
                                        <Input className='input-limit' />
                                    </FormItem>
                                    <Tooltip title='0为所有'>
                                        <QuestionCircleOutlined
                                            style={{ marginLeft: '10px' }}
                                        />
                                    </Tooltip>
                                </FormItem>
                                <FormItem name='proto' label='协议'>
                                    <Radio.Group>
                                        <Radio value=''>全部</Radio>
                                        <Radio value='6'>TCP</Radio>
                                        <Radio value='17'>UDP</Radio>
                                        <Radio value='1'>ICMP</Radio>
                                    </Radio.Group>
                                </FormItem>
                                <FormItem name='devid' label='节点'>
                                    <Radio.Group>
                                        {configStore.device.map(item => (
                                            <Radio
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {item.name}
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                </FormItem>
                            </Form>
                        </Collapse.Panel>
                    </Collapse>
                </div>
            ) : (
                <div className={style['search-form-simple']}>
                    <Form
                        className='search-value'
                        form={formValue}
                        onFinish={values => {
                            const nowValues = formValue.getFieldsValue()

                            const result = chain(nowValues)
                                .entries()
                                .reduce((obj, item) => {
                                    const [key, value] = item
                                    obj[key] = formatStringSpace(value)
                                    return obj
                                }, {})
                                .value()

                            formValue.setFieldsValue(result)
                            onSearchFinish(values)
                        }}
                        onValuesChange={onValuesChange}
                        layout='inline'
                    >
                        <div className='search-extra'>
                            <Tooltip
                                className='search-tip'
                                title={<SearchTip />}
                            >
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </div>
                        <div className='search-container'>
                            <FormItem
                                className='search-type-container'
                                name='searchType'
                                initialValue={searchType}
                            >
                                <Select
                                    className='search-value-type'
                                    onChange={type => {
                                        setsearchType(type)
                                        formValue.setFieldsValue({
                                            feature: calcualteNowFeature(
                                                type
                                            ).map(d => d.key),
                                        })
                                    }}
                                >
                                    {searchTypeArr.map(d => {
                                        return (
                                            <Option value={d.key} key={d.key}>
                                                {d.name}
                                            </Option>
                                        )
                                    })}
                                </Select>
                            </FormItem>
                            <div
                                className='search-input-container'
                                onClick={() => setconditionVis(true)}
                            >
                                {formObj[searchType]}
                            </div>
                            <Button
                                icon={<SearchOutlined />}
                                htmlType='submit'
                                type='text'
                                style={{
                                    background: 'rgba(0,0,0,0)',
                                    border: 'none',
                                }}
                                onClick={() => {
                                    formValue.validateFields().catch(error => {
                                        error.errorFields.forEach(d => {
                                            message.error(d.errors.toString())
                                        })
                                    })
                                }}
                            />
                        </div>
                    </Form>
                    <div
                        className={`search-condition-container ${
                            conditionVis ? '' : 'hidden'
                        }`}
                    >
                        <div
                            className='close'
                            onClick={() => {
                                setconditionVis(false)
                            }}
                        >
                            X
                        </div>
                        <Form
                            className='search-condition'
                            initialValues={initialValues}
                            layout='horizontal'
                            form={formConditon}
                            labelCol={{ span: 3 }}
                            wrapperCol={{ offset: 1 }}
                        >
                            <FormItem label='时间范围' name='starttime'>
                                <RangePicker
                                    allowClear={false}
                                    showTime={{
                                        minuteStep: 5,
                                        format: 'hh:mm',
                                    }}
                                    format='YYYY/MM/DD HH:mm'
                                    disabledDate={current => current > moment()}
                                    ranges={{
                                        今天: [moment().startOf('d'), moment()],
                                        最近三天: [
                                            moment()
                                                .subtract(2, 'day')
                                                .startOf('d'),
                                            moment(),
                                        ],
                                        最近七天: [
                                            moment()
                                                .subtract(6, 'day')
                                                .startOf('d'),
                                            moment(),
                                        ],
                                    }}
                                />
                            </FormItem>
                            <FormItem name='feature' label='特征类型'>
                                <Select
                                    mode='multiple'
                                    maxTagCount='responsive'
                                    className='feature-select'
                                >
                                    {useFeature.map(d => (
                                        <Option key={d.key} value={d.key}>
                                            {d.name}
                                        </Option>
                                    ))}
                                </Select>
                            </FormItem>
                            <FormItem label='采样值'>
                                <FormItem noStyle name='limit'>
                                    <Input className='input-limit' />
                                </FormItem>
                                <Tooltip title='0为所有'>
                                    <QuestionCircleOutlined
                                        style={{ marginLeft: '10px' }}
                                    />
                                </Tooltip>
                            </FormItem>
                            <FormItem name='proto' label='协议'>
                                <Radio.Group>
                                    <Radio value=''>全部</Radio>
                                    <Radio value='6'>TCP</Radio>
                                    <Radio value='17'>UDP</Radio>
                                    <Radio value='1'>ICMP</Radio>
                                </Radio.Group>
                            </FormItem>
                            <FormItem name='devid' label='节点'>
                                <Radio.Group>
                                    {configStore.device.map(item => (
                                        <Radio key={item.id} value={item.id}>
                                            {item.name}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            )}
        </>
    )
}

export default observer(SearchForm)

import {
    openAddEventActionModal,
    openAddEventIgnoreModal,
    openAddEventModal,
} from '@/components/modals'
import {
    eventConfigApi,
    eventConfigApiAction,
    eventConfigApiConfig,
    eventConfigApiIgnore,
} from '@/service'
import {
    EventConfig,
    translateEventConfigLable,
    translateEventDetailConfigLable,
    translateEventLevel,
} from '@shadowflow/components/system/event-system'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import { formatterMoField } from '@shadowflow/components/utils/universal/methods-form'
import { valueSort } from '@shadowflow/components/utils/universal/methods-table'
import {
    formatTimestamp,
    calculateWeekday,
} from '@shadowflow/components/utils/universal/methods-time'
import { Col, Descriptions, message, Row } from 'antd'
import { chain, find, isEmpty } from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useCallback, useMemo } from 'react'
import { JumpSpan } from '../../components/config-right-content/components/config-button'
import ConfigCollapse from '../../components/config-right-content/components/config-collapse'
import ConfigTemplate from '../../components/config-template'
import { ActCell, DeviceCell } from '../../components/table-cell'

function configApi(eventType) {
    return params => {
        return EventConfig[eventType]
            ? eventConfigApi({
                  ...EventConfig[eventType].config.params,
                  ...params,
              })
            : Promise.reject()
    }
}

const eventColumns = [
    {
        title: '状态',
        dataIndex: 'status',
        sorter: valueSort('status'),
    },
    {
        title: '描述',
        dataIndex: 'desc',
        sorter: valueSort('desc'),
    },
    {
        title: '数据源',
        dataIndex: 'devid',
        sorter: valueSort('devid'),
        render: t => <DeviceCell id={t} />,
    },
    {
        title: '事件级别',
        dataIndex: 'event_level',
        sorter: valueSort('sort_level'),
        render: t => translateEventLevel(t),
    },
    {
        title: '监控时间',
        dataIndex: 'stime',
        sorter: valueSort('stime'),
    },
    {
        title: '监控时间',
        dataIndex: 'etime',
        sorter: valueSort('etime'),
    },
]

const actiovColumns = [
    {
        title: '描述',
        dataIndex: 'desc',
        sorter: valueSort('desc'),
    },
    {
        title: '邮件',
        dataIndex: 'mail',
        sorter: valueSort('mail'),
    },
    {
        title: '行动',
        dataIndex: 'act',
        sorter: valueSort('act'),
        render: t => <ActCell id={t} />,
    },
    {
        title: '电话',
        dataIndex: 'phone',
        sorter: valueSort('phone'),
    },
    {
        title: 'uid',
        dataIndex: 'uid',
        sorter: valueSort('uid'),
    },
]

const ignoreColumns = [
    {
        title: '描述',
        dataIndex: 'desc',
        sorter: valueSort('desc'),
    },
    {
        title: '发起IP',
        dataIndex: 'lip',
        sorter: valueSort('lip'),
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '目标IP',
        dataIndex: 'tip',
        sorter: valueSort('tip'),
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '目标端口',
        dataIndex: 'tport',
        sorter: valueSort('tport'),
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '域名',
        dataIndex: 'domain',
        sorter: valueSort('domain'),
        render: t => (
            <DeviceOperate device={t}>
                <span>{t}</span>
            </DeviceOperate>
        ),
    },
    {
        title: '开始时刻',
        dataIndex: 'stime',
        sorter: valueSort('stime'),
    },
    {
        title: '结束时刻',
        dataIndex: 'etime',
        sorter: valueSort('etime'),
    },
    {
        title: '已忽略条数',
        dataIndex: 'count',
        sorter: valueSort('count'),
    },
    {
        title: '变更时间',
        dataIndex: 'time',
        render: (t, d) => formatTimestamp(d.time),
        sorter: valueSort('time'),
    },
]

const publicProperty = {
    addAuth: ['sysadmin', 'analyser'],
    editAuth: ['sysadmin', 'analyser'],
    deleteAuth: ['sysadmin', 'analyser'],
}

function onDeleteFn(rows, eventType, changeData) {
    const promiseArr = []
    rows.forEach(d => {
        promiseArr.push(
            eventConfigApiConfig({
                op: 'del',
                event_id: d.id,
            })
        )
        promiseArr.push(
            configApi(eventType)({
                op: 'del',
                config_id: d.config_id,
            })
        )
    })
    return Promise.all(promiseArr).then(() => {
        return Promise.all([
            eventConfigApiConfig(),
            configApi(eventType)(),
        ]).then(([eventData, configData]) => {
            const result = eventData.filter(
                eventItem => eventItem.event_type === eventType
            )
            message.success('操作成功！')
            changeData({
                event: eventData,
                [`eventConfig${eventType}`]: configData,
                [`event${eventType}`]: result,
            })
            return {
                eventData,
                configData,
            }
        })
    })
}

function deleteAction(rows, eventType, changeData) {
    const promiseArr = []
    rows.forEach(d => {
        promiseArr.push(
            eventConfigApiAction({
                op: 'del',
                action_id: d.id,
            })
        )
    })
    return Promise.all(promiseArr).then(() => {
        eventConfigApiAction().then(res => {
            changeData({ eventAction: res })
        })
    })
}

function eventFormatter(field, value, device, eventAction) {
    let result = ''
    switch (field) {
        case 'status':
            result = value === 'ON' ? '开启' : '关闭'
            break
        case 'weekday':
            result = chain(value.split(','))
                .reduce((arr, item) => {
                    arr.push(calculateWeekday(item))
                    return arr
                }, [])
                .join()
                .value()
            break
        case 'devid':
            result = device.find(d => d.id === value)
                ? device.find(d => d.id === value).name
                : ''
            break
        case 'event_level':
            result = translateEventLevel(value)
            break
        case 'action_id':
            result = eventAction.find(d => d.id === Number(value))
                ? eventAction.find(d => d.id === Number(value)).desc
                : ''
            break
        default:
            result = value
            break
    }
    return result
}

const ExpandableCard = inject('configStore')(
    observer(function ExpandableCard({ record, configStore }) {
        const { device, eventAction, mo, event } = configStore
        const { event_type, config_id } = record
        const colSpan = useMemo(() => {
            return event_type === 'mo' ? 8 : 12
        }, [event_type])
        const alarmData = useMemo(() => {
            const {
                stime,
                etime,
                weekday,
                devid,
                event_level,
                action_id,
                status,
                desc,
            } = record
            return {
                stime,
                etime,
                weekday,
                devid,
                event_level,
                action_id,
                status,
                desc,
            }
        }, [record])
        const monitorData = useMemo(() => {
            if (configStore[`eventConfig${event_type}`].length < 1) return {}
            const currentEventConfig = chain(
                configStore[`eventConfig${event_type}`]
            )
                .find(eventconfigItem => {
                    return eventconfigItem.id === config_id
                })
                .value()
            return currentEventConfig || {}
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [configStore, event_type, config_id, event])

        const moData = useMemo(() => {
            const result = chain(mo)
                .find(moItem => moItem.id === monitorData.moid)
                .value()
            return result || {}
        }, [monitorData, mo])

        const formatterMo = useCallback(
            (field, value) => {
                let result = ''
                switch (field) {
                    case 'addtime':
                        result = value ? formatTimestamp(value) : ''
                        break

                    case 'devid':
                        result = value
                            ? find(device, d => d.id === Number(value)).name
                            : ''
                        break
                    default:
                        result = value
                        break
                }
                return result
            },
            [device]
        )

        return (
            <Row gutter={[16, 16]}>
                <Col span={colSpan}>
                    <Descriptions title='告警配置'>
                        {Object.entries(alarmData).map(recordItem => {
                            const [key, value] = recordItem
                            return (
                                <Descriptions.Item
                                    label={translateEventConfigLable(key)}
                                    span={3}
                                    key={key}
                                >
                                    {eventFormatter(
                                        key,
                                        value,
                                        device,
                                        eventAction
                                    )}
                                </Descriptions.Item>
                            )
                        })}
                    </Descriptions>
                </Col>
                {!isEmpty(monitorData) && (
                    <Col span={colSpan}>
                        <Descriptions title='监控配置'>
                            {Object.entries(monitorData).map(recordItem => {
                                const [field, value] = recordItem
                                return (
                                    field !== 'id' &&
                                    field !== 'grep_rule' && (
                                        <Descriptions.Item
                                            label={translateEventDetailConfigLable(
                                                field,
                                                event_type
                                            )}
                                            span={3}
                                            key={field}
                                        >
                                            {value}
                                        </Descriptions.Item>
                                    )
                                )
                            })}
                        </Descriptions>
                    </Col>
                )}
                {event_type === 'mo' && (
                    <Col span={colSpan}>
                        <Descriptions title='追踪配置'>
                            {Object.entries(moData).map(recordItem => {
                                const [field, value] = recordItem
                                return field !== 'id' && field !== 'groupid' ? (
                                    <Descriptions.Item
                                        label={formatterMoField(field)}
                                        span={3}
                                        key={field}
                                    >
                                        {formatterMo(field, value)}
                                    </Descriptions.Item>
                                ) : null
                            })}
                        </Descriptions>
                    </Col>
                )}
            </Row>
        )
    })
)

export const eventConfigData = {
    title: '告警',
    path: '/config/event',
    children: [
        {
            title: '告警配置',
            children: [
                {
                    title: '黑名单事件',
                    key: 'event|black',
                    modalType: 'black',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置黑名单事件告警规则，统计与
                                    <JumpSpan
                                        text='黑名单IP'
                                        path='/config/bwlist'
                                        search={{
                                            pageParams: { active: 'black' },
                                        }}
                                    />
                                    之间的通讯，当单位时间内流量或会话量或包数量大小超过设定的阈值后即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                                <ConfigCollapse
                                    title='黑白名单'
                                    context='IP黑白名单包括IP白名单和IP黑名单配置，其中IP白名单即指定IP为可信IP，源IP为可信IP的流量不进行攻击检测。IP黑名单即指定IP为恶意IP，源IP为恶意IP的流量需要根据检测策略执行相应的动作。Web应用防火墙可以根据设置的IP黑白名单规则，放行或拦截指定的IP，增强网络攻击防御准确性。'
                                />
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: true,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: '包特征识别',
                    key: 'event|cap',
                    modalType: 'cap',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是查看包特征识别配置。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    addAuth: [],
                    editAuth: ['sysadmin', 'analyser'],
                    deleteAuth: [],
                },
                {
                    title: 'DGA事件',
                    key: 'event|dga',
                    modalType: 'dga',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置DAG事件的告警规则，通过AI模型对域名进行DGA域名相似度评估，当相似度评估值、单位时间内疑似DGA域名的数量超过设定的阈值后即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                                <ConfigCollapse
                                    title='DAG域名原理'
                                    context='客户端通过DGA算法生成大量备选域名，并且进行查询，攻击者与恶意软件运行同一套DGA算法，生成相同的备选域名列表，当需要发动攻击的时候，选择其中少量进行注册，便可以建立通信，并且可以对注册的域名应用速变IP技术，快速变换IP，从而域名和IP都可以进行快速变化。'
                                />
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: 'dns事件',
                    key: 'event|dns',
                    modalType: 'dns',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置dns事件的告警规则，通过与威胁域名情报进行碰撞，统计对威胁域名或指定域名的请求次数，当在规定时间内超过设定的阈值后即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                                <ConfigCollapse
                                    title='DNS'
                                    context={`DNS是互联网的一项服务，它作为将域名和IP地址相互映射的一个分布式数据库，能够使人更方便地访问互联网。
                                    简单的讲DNS就是翻译官，就像把http://www.baidu.com翻译成220.181.111.188让机器理解。
                                    DNS解析作为域名与网站间的链条，面对网络攻击时往往首当其冲。劫持、隧道、网络钓鱼、缓存中毒、DDoS攻击……DNS一直承受着各种攻击。`}
                                />
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: 'dns隧道事件',
                    key: 'event|dns_tun',
                    modalType: 'dns_tun',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置dns隧道事件的告警规则，对相同源IP、目的IP上的域名在域名长度、相同父域名的域名数量等维度进行综合判定评分，当评分超过规定的阈值后即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                                <ConfigCollapse
                                    title='DNS隧道攻击'
                                    context='正常网络之间的通信，是发生在两台机器建立TCP连接之后的，在进行通信时：如果目标是IP，则会直接发送报文，如果是域名，则将域名解析为IP再通信。
                                    C&C服务器在建立连接后将指令传递给客户端上的后门程序。DNS隧道的原理就是：在后门程序进行DNS查询时，
                                    如果查询的域名不在DNS服务器本机的缓存中，就会访问互联网进行查询，然后返回结果，如果互联网上有一台攻击者设置的服务器，
                                    那么服务器就可以依靠域名解析的响应进行数据包的交换，从DNS协议的角度来看，这样的操作只是反复查询某个或者某些特定的域名并且得到解析结果，
                                    但其本质是，DNS预期的返回结果应该是一个IP地址，而事实上不是——返回的可以是任意字符串，包括加密的C&C指令，从而将其他协议封装在DNS协议中进行传输。'
                                />
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: 'dns隧道ai事件',
                    key: 'event|dnstun_ai',
                    modalType: 'dnstun_ai',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置dns隧道ai事件的告警规则，通过AI模型智能识别DNS隧道，通过模型对域名进行相似度评估，评估值超过阈值后及产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: '服务器外联事件',
                    key: 'event|frn_trip',
                    modalType: 'frn_trip',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置服务器外联事件的告警规则，对指定服务器主动外联的流量进行检测，根据流量分析结果，在规定时间内超过规定的阈值后即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                                <ConfigCollapse
                                    title='服务器外联防护'
                                    context='服务器外联防护是一种针对内网服务器的保护机制，可以有效识别服务器的主动外联行为，为管理员检查服务器提供依据，
                                    进而防止服务器成为僵尸网络的一部分，对外发动攻击或对内进行渗透。'
                                />
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: 'ICMP隧道',
                    key: 'event|icmp_tun',
                    modalType: 'icmp_tun',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置服ICMP隧道的告警规则，通过监控源IP和目的IP之间的ICMP通讯，在异常请求类型、请求回应包数量、请求回应payload等维度进行判定，当在规定时间内超过规定的阈值即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                                <ConfigCollapse
                                    title='ICMP隧道'
                                    context={`ICMP隧道是一个比较特殊的协议。在一般的通信协议里，如果两台设备要进行通信，肯定要开放端口，而在ICMP协议下就不需要。
                                    最常见的ICMP消息为Ping命令的回复，攻击者可以利用命令得到比回复更多的ICMP请求。在通常情况下，每个Ping命令都有相对应的回复与请求。
                                    在一些条件下，如果攻击者使用各类隧道技术（HTTP，DNS，常规正反端口转发等）操作都失败了，常常会通过ping命令访问远程计算机，
                                    尝试进行ICMP隧道，将TCP/UDP数据封装到ICMP的ping数据包中，从而穿过防火墙（通常防火墙不会屏蔽ping数据包），实现不受限制的网络访问`}
                                />
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: 'IP扫描',
                    key: 'event|ip_scan',
                    modalType: 'ip_scan',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置IP扫描的告警规则，通过对相同源IP、相同目的IP上不同目的端口数量进行统计，当在规定时间内对端端口数量超过阈值后即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                                <ConfigCollapse
                                    title='扫描'
                                    context='scan，是一切入侵的基础，扫描探测一台主机包括是为了确定主机是否活动、主机系统、正在使用哪些端口、提供了哪些服务、相关服务的软件版本等等，对这些内容的探测就是为了“对症下药”。'
                                />
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: '追踪事件',
                    key: 'event|mo',
                    modalType: 'mo',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置追踪事件的告警规则，
                                    可自定义任意通讯目标在网络层的通讯动作，
                                    <JumpSpan
                                        text='通讯目标'
                                        path='/config/mo'
                                    />
                                    可定义内容包括：源目的IP、源目的端口、传输协议、应用协议、通讯方向等多个维度，
                                    当在单位时间内通讯目标上流量大小或会话量或包数量超出阈值后即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: '端口扫描',
                    key: 'event|port_scan',
                    modalType: 'port_scan',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置端口扫描的告警规则，通过相同源IP、相同目的端口上不同目的IP数量进行统计，当指定的扫描端口上IP数量超过规定的阈值后即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                                <ConfigCollapse
                                    title='端口扫描'
                                    context='端口扫描是网络安全中非常常用的技术手段。通过对于特定的IP范围和端口范围进行穷举扫描，发现网络中开放的端口，从而为进一步的探查提供基本信息。'
                                />
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: '异常服务',
                    key: 'event|srv',
                    modalType: 'srv',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置异常服务的告警规则，对资产标签内同一目的IP、目的端口上的会话量进行统计，当在监控周期内超出设定的端口会话数阈值即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: '情报命中',
                    key: 'event|ti',
                    modalType: 'ti',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置情报命中的告警规则，通过与威胁IP进行碰撞，当与威胁IP通讯的流量大小或会话数量或包的数量在单位时间内超出了设定阈值即产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: 'URL内容识别',
                    key: 'event|url_content',
                    modalType: 'url_content',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置URL内容识别的告警规则，通过xss、sql注入、资源探测、命令执行等攻击行为的正则表达式与URL进行匹配来产生告警事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    ...publicProperty,
                },
                {
                    title: '挖矿',
                    key: 'event|mining',
                    modalType: 'mining',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是查看挖矿行为配置。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddEventModal,
                    deleteDataFn: onDeleteFn,
                    ExpandableCard,
                    isActive: false,
                    columns: eventColumns,
                    addAuth: [],
                    editAuth: ['sysadmin', 'analyser'],
                    deleteAuth: [],
                },
            ],
        },
        {
            title: '其他配置',
            children: [
                {
                    title: '事件动作',
                    key: 'eventAction',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置事件动作。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    openModalFun: openAddEventActionModal,
                    deleteDataFn: deleteAction,
                    isActive: false,
                    columns: actiovColumns,
                    ...publicProperty,
                },
                {
                    title: '事件忽略',
                    key: 'eventIgnore',
                    CreateDescribe: () => {
                        return (
                            <>
                                <div>功能简介：</div>
                                <div className='paragraph-content'>
                                    本页面是配置事件忽略，忽略与配置相匹配的事件，并删除历史事件。
                                </div>
                                <div className='paragraph-content '>
                                    支持
                                    <span className='strong-text'>新增</span>、
                                    <span className='strong-text'>修改</span>、
                                    <span className='strong-text'>删除</span>
                                    操作。
                                </div>
                            </>
                        )
                    },
                    api: eventConfigApiIgnore,
                    openModalFun: openAddEventIgnoreModal,
                    isActive: false,
                    columns: ignoreColumns,
                    ...publicProperty,
                },
            ],
        },
    ],
}

export default function ConfigEvent() {
    return <ConfigTemplate data={eventConfigData.children} />
}

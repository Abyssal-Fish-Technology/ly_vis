import React from 'react'
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    RetweetOutlined,
    SwapLeftOutlined,
    ArrowDownOutlined,
    ArrowUpOutlined,
} from '@ant-design/icons'
import SrvTableTips from '@/components/tab-srv-tips'
import {
    valueSort,
    GetColumnSearchProps,
} from '@shadowflow/components/utils/universal/methods-table'
import { DeviceOperate } from '@shadowflow/components/ui/table/device-op-menu-template'
import { TdFlag } from '@shadowflow/components/ui/antd-components-super'
import { inject, observer } from 'mobx-react'
import moment from 'moment'

// ===================================变量============================
export const calculateTopnDir = dir =>
    dir === 'left' ? (
        <ArrowLeftOutlined
            className={dir === 'left' ? 'color-red' : 'color-blue'}
        />
    ) : (
        <ArrowRightOutlined
            className={dir === 'left' ? 'color-red' : 'color-blue'}
        />
    )

const DeviceRender = inject(stores => ({
    params: stores.resultStore.conditionValue,
}))(
    observer(({ device = '', isIp = true, params }) => {
        const {
            devid,
            starttime: [time1, time2],
        } = params
        return (
            <DeviceOperate
                device={device}
                resultParams={{
                    devid,
                    starttime: moment(time1).unix(),
                    endtime: moment(time2).unix(),
                }}
            >
                {isIp && <TdFlag ip={device} />}
                {device}
            </DeviceOperate>
        )
    })
)

const commomCol = [
    {
        title: 'Bytes',
        dataIndex: 'showBytes',
        sorter: valueSort('bytes'),
        fixed: 'right',
        width: 100,
    },
    {
        title: 'Pkts',
        dataIndex: 'showPkts',
        sorter: valueSort('pkts'),
        fixed: 'right',
        width: 100,
    },
    {
        title: '请求次数',
        dataIndex: 'flows',
        sorter: valueSort('flows'),
        fixed: 'right',
        width: 100,
    },
]
// sus
const susCol = [
    {
        title: '威胁IP',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        fixed: 'left',
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '受害IP',
        dataIndex: 'dip',
        sorter: valueSort('dip'),
        fixed: 'left',
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '协议',
        dataIndex: 'protocol',
        align: 'center',
        render: t => t.join(),
    },
    {
        title: '总连接/次',
        dataIndex: 'count',
        align: 'center',
        sorter: valueSort('count'),
    },
    {
        title: '连接详情/次',
        dataIndex: 'showTopnDir',
        align: 'center',
        render: (t, d) => (
            <SrvTableTips
                type='威胁IP'
                resData={d.resData}
                reqData={d.reqData}
            />
        ),
    },
    {
        title: '分类',
        dataIndex: 'showBwclass',
    },
    {
        title: '最后发起时间',
        dataIndex: 'showLastTime',
        sorter: valueSort('lastTime'),
    },
    ...commomCol,
]
const susDet = [
    {
        title: '威胁IP',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '方向',
        dataIndex: 'showTopnDir',
    },
    {
        title: '受害IP',
        dataIndex: 'dip',
        sorter: valueSort('dip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '协议',
        dataIndex: 'protocol',
    },
    {
        title: 'Time',
        dataIndex: 'showTime',
        sorter: valueSort('time'),
    },
    {
        title: '持续时间',
        dataIndex: 'showDuration',
        sorter: valueSort('duration'),
    },
    ...commomCol,
]
// 黑名单
const blackCol = [
    {
        title: '黑名单',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        fixed: 'left',
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '受害IP',
        dataIndex: 'dip',
        sorter: valueSort('dip'),
        fixed: 'left',
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '协议',
        dataIndex: 'showProtocol',
        align: 'center',
        render: (t, d) => d.protocol.join(),
    },
    {
        title: '总连接/次',
        dataIndex: 'count',
        align: 'center',
        sorter: valueSort('count'),
    },
    {
        title: '连接详情/次',
        dataIndex: 'showTopnDir',
        align: 'center',
        render: (t, d) => (
            <SrvTableTips
                type='黑名单'
                reqData={d.reqData}
                resData={d.resData}
            />
        ),
    },
    {
        title: 'Last Time',
        dataIndex: 'showLastTime',
        sorter: valueSort('lastTime'),
    },
    ...commomCol,
]
const blackeDet = [
    {
        title: '黑名单',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '方向',
        dataIndex: 'showTopnDir',
    },
    {
        title: '受害ip',
        dataIndex: 'dip',
        sorter: valueSort('dip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '协议',
        dataIndex: 'protocol',
    },
    {
        title: 'Time',
        dataIndex: 'showTime',
        sorter: valueSort('time'),
    },
    {
        title: '持续时间',
        dataIndex: 'showDuration',
        sorter: valueSort('duration'),
    },
    ...commomCol,
]
// 服务
const serviceCol = [
    {
        title: '服务IP',
        dataIndex: 'ip',
        sorter: valueSort('ip'),
        fixed: 'left',
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '服务端口',
        dataIndex: 'port',
        sorter: valueSort('port'),
        fixed: 'left',
        width: 80,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: '协议',
        dataIndex: 'showProtocol',
        align: 'center',
        render: (t, d) => d.protocol.join(),
    },
    {
        title: '总连接/次',
        dataIndex: 'count',
        align: 'center',
        sorter: valueSort('count'),
    },
    {
        title: '连接详情/次',
        dataIndex: 'showTopnDir',
        align: 'center',
        render: (t, d) => (
            <SrvTableTips
                type='服务IP+Port'
                reqData={d.reqData}
                resData={d.resData}
            />
        ),
    },
    {
        title: 'Last Time',
        dataIndex: 'showLastTime',
        sorter: valueSort('lastTime'),
    },
    ...commomCol,
]
const serviceDet = [
    {
        title: '服务IP',
        dataIndex: 'ip',
        sorter: valueSort('ip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '服务端口',
        dataIndex: 'port',
        sorter: valueSort('port'),
        width: 80,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: '方向',
        dataIndex: 'showTopnDir',
    },
    {
        title: '协议',
        dataIndex: 'protocol',
    },
    {
        title: 'Time',
        dataIndex: 'showTime',
        sorter: valueSort('time'),
    },
    {
        title: '持续时间',
        dataIndex: 'showDuration',
        sorter: valueSort('duration'),
    },
    ...commomCol,
]
// 扫描
const scanCol = [
    {
        title: '扫描源',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        fixed: 'left',
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '目标端口',
        dataIndex: 'dport',
        sorter: valueSort('dport'),
        fixed: 'left',
        width: 80,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: '协议',
        dataIndex: 'protocol',
        align: 'center',
        render: t => t.join(),
    },
    {
        title: '扫描次数',
        dataIndex: 'count',
        align: 'center',
        sorter: valueSort('count'),
    },
    {
        title: 'Last Time',
        dataIndex: 'showLastTime',
        sorter: valueSort('lastTime'),
    },
    ...commomCol,
]
const scanDet = [
    {
        title: '扫描源',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '目标端口',
        dataIndex: 'dport',
        sorter: valueSort('dport'),
        width: 80,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: 'peers',
        dataIndex: 'peers',
        sorter: valueSort('peers'),
    },
    {
        title: '协议',
        dataIndex: 'protocol',
    },
    {
        title: 'Time',
        dataIndex: 'showTime',
        sorter: valueSort('time'),
    },
    {
        title: '',
        dataIndex: 'showDuration',
        sorter: valueSort('duration'),
    },
    ...commomCol,
]
// tcpinit
const tcpinitCol = [
    {
        title: '发起IP',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        fixed: 'left',
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '目标端口',
        dataIndex: 'dport',
        sorter: valueSort('dport'),
        fixed: 'left',
        width: 80,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: '目标IP',
        dataIndex: 'dip',
        sorter: valueSort('dip'),
        fixed: 'left',
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '活跃动作',
        dataIndex: 'count',
        align: 'center',
        width: 80,
        sorter: valueSort('count'),
    },
    {
        title: 'Last Time',
        dataIndex: 'showLastTime',
        sorter: valueSort('lastTime'),
    },
    ...commomCol,
]
const tcpinitDet = [
    {
        title: '发起IP',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '目标端口',
        dataIndex: 'dport',
        sorter: valueSort('dport'),
        width: 80,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: '目标IP',
        dataIndex: 'dip',
        sorter: valueSort('dip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: 'Time',
        dataIndex: 'showTime',
        sorter: valueSort('time'),
    },
    ...commomCol,
]
// dns
const dnsCol = [
    {
        title: '发起IP',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '域名',
        dataIndex: 'qname',
        sorter: valueSort('qname'),
        width: 200,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: '服务器/台',
        dataIndex: 'dnsSrvCount',
        render: t => t,
        sorter: valueSort('dnsSrvCount'),
    },
    {
        title: '查询类型',
        dataIndex: 'showQtype',
    },
    {
        title: '威胁类型',
        dataIndex: 'showBwclass',
    },
    {
        title: '活跃动作',
        dataIndex: 'count',
        align: 'center',
        sorter: valueSort('count'),
    },
    {
        title: 'Last Time',
        dataIndex: 'showLastTime',
        sorter: valueSort('lastTime'),
    },
    ...commomCol,
]
const dnsDet = [
    {
        title: '发起IP',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: 'DNS',
        dataIndex: 'qname',
        sorter: valueSort('qname'),
        width: 200,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: 'DNS服务器',
        dataIndex: 'dip',
        sorter: valueSort('dip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '端口',
        dataIndex: 'dport',
        sorter: valueSort('dport'),
        width: 80,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: '查询类型',
        dataIndex: 'showQtype',
    },
    {
        title: '威胁类型',
        dataIndex: 'showBwclass',
    },
    {
        title: 'Time',
        dataIndex: 'showTime',
        sorter: valueSort('time'),
    },
    ...commomCol,
]

// dns_tun
const dns_tunCol = [
    {
        title: '发起IP',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '父（子）域名',
        dataIndex: 'qname',
        sorter: valueSort('qname'),
        width: 200,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: '活跃动作',
        dataIndex: 'count',
        align: 'center',
        sorter: valueSort('count'),
    },
    {
        title: 'Last Time',
        dataIndex: 'showLastTime',
        sorter: valueSort('lastTime'),
    },
    ...commomCol,
]
const dns_tunDet = [
    {
        title: '发起IP',
        dataIndex: 'sip',
        sorter: valueSort('sip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: 'DNS',
        dataIndex: 'fqname',
        sorter: valueSort('fqname'),
        width: 200,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: 'DNS服务器',
        dataIndex: 'dip',
        sorter: valueSort('dip'),
        width: 160,
        render: t => <DeviceRender device={t} />,
    },
    {
        title: '端口',
        dataIndex: 'dport',
        sorter: valueSort('dport'),
        width: 80,
        render: t => <DeviceRender device={t} isIp={false} />,
    },
    {
        title: '隧道评分',
        dataIndex: 'score',
        sorter: valueSort('score'),
    },
    {
        title: '请求频率',
        dataIndex: 'fratio',
        sorter: valueSort('fratio'),
    },
    {
        title: 'Time',
        dataIndex: 'showTime',
        sorter: valueSort('time'),
    },
    ...commomCol,
]

// 添加表格筛选
;[
    susCol,
    susDet,
    blackCol,
    blackeDet,
    serviceCol,
    serviceDet,
    scanCol,
    scanDet,
    tcpinitCol,
    tcpinitDet,
    dnsCol,
    dnsDet,
    dns_tunCol,
    dns_tunDet,
].forEach(d => {
    //  表头筛选
    GetColumnSearchProps(d, [
        'ip',
        'sip',
        'dip',
        'port',
        'dport',
        'sport',
        'showProtocol',
        'showTime',
        'showLastTime',
        'showDuration',
    ])
})

// 总变量
export const featureObj = {
    sus: {
        name: '威胁连接',
        key: 'sus',
        columns: [susCol, susDet],
    },
    black: {
        name: '黑名单连接',
        key: 'black',
        columns: [blackCol, blackeDet],
    },
    scan: {
        name: '扫描连接',
        key: 'scan',
        columns: [scanCol, scanDet],
    },
    tcpinit: {
        name: 'TCP连接',
        key: 'tcpinit',
        columns: [tcpinitCol, tcpinitDet],
    },
    service: {
        name: '服务',
        key: 'service',
        columns: [serviceCol, serviceDet],
    },
    dns: {
        name: 'DNS连接',
        key: 'dns',
        columns: [dnsCol, dnsDet],
    },
    dns_tun: {
        name: 'DNS隧道连接',
        key: 'dns_tun',
        columns: [dns_tunCol, dns_tunDet],
    },
}

// ================================ 函数 ============================

export const calcualteColumns = (type, isDetail = false) => {
    return featureObj[type] ? featureObj[type].columns[isDetail ? 1 : 0] : []
}

export const translateFeture = type => {
    return featureObj[type].name || type
}

/** ***************************************** 流量特征基本信息 ********************************************* */
export const topnFeature = {
    sus: {
        type: 'sus',
        name: '威胁连接',
        id: 0,
        anchor: 'search-topn-sus', // 锚点
        tooltip: '威胁流量',
        // 切换不同表格类型的tab
        tabs: [
            {
                tab: '全部连接',
                key: 'all',
            },
            {
                tab: (
                    <span>
                        威胁IP
                        <RetweetOutlined className='tab-icon color-purple' />
                        受害IP
                    </span>
                ),
                key: 'loop',
            },
            {
                tab: (
                    <span>
                        威胁IP
                        <ArrowLeftOutlined className='tab-icon color-red' />
                        受害IP
                    </span>
                ),
                key: 'sip',
            },
            {
                tab: (
                    <span>
                        威胁IP
                        <ArrowRightOutlined className='tab-icon color-blue' />
                        受害IP
                    </span>
                ),
                key: 'dip',
            },
        ],
        column: susCol,
        detailColumn: susDet,
        footerContent: (
            <>
                注：
                <SwapLeftOutlined rotate={270} className='color-red' />
                <span>:</span>
                <span>
                    威胁IP
                    <ArrowLeftOutlined className='color-red' />
                    连接IP;&nbsp;
                </span>
                <SwapLeftOutlined rotate={90} className='color-blue' />
                <span>:</span>
                <span>
                    威胁IP
                    <ArrowRightOutlined className='color-blue' />
                    连接IP&nbsp;
                </span>
            </>
        ),
    },
    black: {
        type: 'black',
        name: '黑名单连接',
        id: 1,
        anchor: 'search-topn-black',
        tooltip: '黑名单流量',
        tabs: [
            {
                tab: '全部连接',
                key: 'all',
            },
            {
                tab: (
                    <span>
                        黑名单
                        <RetweetOutlined className='tab-icon color-purple' />
                        受害IP
                    </span>
                ),
                key: 'loop',
            },
            {
                tab: (
                    <span>
                        黑名单
                        <ArrowLeftOutlined className='tab-icon color-red' />
                        受害IP
                    </span>
                ),
                key: 'sip',
            },
            {
                tab: (
                    <span>
                        黑名单
                        <ArrowRightOutlined className='tab-icon color-blue' />
                        受害IP
                    </span>
                ),
                key: 'dip',
            },
        ],
        column: blackCol,
        detailColumn: blackeDet,
        footerContent: (
            <>
                注：
                <ArrowDownOutlined className='color-red' />
                <span>:</span>
                <span>
                    黑名单IP
                    <ArrowLeftOutlined className='color-red' />
                    连接IP;&nbsp;
                </span>
                <ArrowUpOutlined className='color-blue' />
                <span>:</span>
                <span>
                    黑名单IP
                    <ArrowRightOutlined className='color-blue' />
                    连接IP&nbsp;
                </span>
            </>
        ),
    },
    service: {
        type: 'service',
        name: '服务记录',
        id: 2,
        anchor: 'search-topn-service',
        tooltip: '异常服务流量',
        tabs: [
            {
                tab: '全部服务',
                key: 'all',
            },
            {
                tab: (
                    <span>
                        服务
                        <RetweetOutlined className='tab-icon color-purple' />
                        连接IP
                    </span>
                ),
                key: 'loop',
            },
            {
                tab: (
                    <span>
                        服务
                        <ArrowLeftOutlined className='tab-icon color-red' />
                        连接IP
                    </span>
                ),
                key: 'sip',
            },
            {
                tab: (
                    <span>
                        服务
                        <ArrowRightOutlined className='tab-icon color-blue' />
                        连接IP
                    </span>
                ),
                key: 'dip',
            },
        ],
        column: serviceCol,
        detailColumn: serviceDet,
        footerContent: (
            <>
                注：
                <ArrowDownOutlined className='color-red' />
                <span>:</span>
                <span>
                    服务
                    <ArrowLeftOutlined className='color-red' />
                    连接IP;&nbsp;
                </span>
                <ArrowUpOutlined className='color-blue' />
                <span>:</span>
                <span>
                    服务
                    <ArrowRightOutlined className='color-blue' />
                    连接IP&nbsp;
                </span>
            </>
        ),
    },
    scan: {
        type: 'scan',
        name: '扫描记录',
        id: 3,
        anchor: 'search-topn-scan',
        tooltip: '扫描流量',
        tabs: [
            {
                tab: '全部扫描',
                key: 'all',
            },
        ],
        column: scanCol,
        detailColumn: scanDet,
        footerContent: '',
    },
    tcpinit: {
        type: 'tcpinit',
        name: 'TCP连接记录',
        id: 4,
        anchor: 'search-topn-tcpinit',
        tooltip: '发起动作',
        tabs: [
            {
                tab: '全部连接',
                key: 'all',
            },
            {
                tab: <span>作为发起方</span>,
                key: 'sip',
            },
            {
                tab: <span>作为接收方</span>,
                key: 'dip',
            },
        ],
        column: tcpinitCol,
        detailColumn: tcpinitDet,
        footerContent: '',
    },
    dns: {
        type: 'dns',
        name: 'DNS连接记录',
        id: 5,
        anchor: 'search-topn-dns',
        tooltip: '',
        tabs: [
            {
                tab: '全部连接',
                key: 'all',
            },
        ],
        column: dnsCol,
        detailColumn: dnsDet,
        footerContent: '',
    },
    dns_tun: {
        type: 'dns_tun',
        name: 'DNS隧道连接记录',
        id: 6,
        anchor: 'search-topn-dnstun',
        tooltip: '',
        tabs: [
            {
                tab: '全部连接',
                key: 'all',
            },
        ],
        column: dns_tunCol,
        detailColumn: dns_tunDet,
        footerContent: '',
    },
}

export default { topnFeature }

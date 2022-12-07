import { chain, compact, maxBy, minBy, pick, sumBy, uniqBy } from 'lodash'
import { geoinfo, assetIp, assetUrl, assetSrv, assetHost } from '@/service'
import { getDeviceType } from '@shadowflow/components/utils/universal/methods-net'
import {
    formatDuration,
    formatTimestamp,
} from '@shadowflow/components/utils/universal/methods-time'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'

export const srvFields = [
    {
        label: 'IP地址',
        value: 'ip',
        wch: 20,
    },
    {
        label: '端口',
        value: 'port',
        wch: 10,
    },
    {
        label: '协议',
        value: 'protocol',
        wch: 20,
    },
    // {
    //     label: 'MAC地址',
    //     value: 'mac',
    //     wch: 20,
    // },
    {
        label: '资产类别',
        value: 'srv_type',
        wch: 15,
    },
    {
        label: '资产服务类型',
        value: 'srv_name',
        wch: 20,
    },

    {
        label: '服务版本号',
        value: 'srv_version',
        wch: 15,
    },
    {
        label: '设备/应用系统类型',
        value: 'dev_type',
        wch: 15,
    },
    {
        label: '设备/应用系统厂商',
        value: 'dev_vendor',
        wch: 10,
    },
    {
        label: '设备/应用系统版本号',
        value: 'dev_model',
        wch: 20,
    },
    {
        label: '操作系统名称',
        value: 'os_name',
        wch: 10,
    },
    {
        label: '设备/应用系统名称',
        value: 'dev_name',
        wch: 10,
    },
    {
        label: '中间件名称',
        value: 'midware_name',
        wch: 10,
    },
    {
        label: '中间件类型',
        value: 'midware_type',
        wch: 10,
    },
    {
        label: '中间件版本',
        value: 'midware_version',
        wch: 10,
    },
    {
        label: '操作系统类型',
        value: 'os_type',
        wch: 10,
    },
    {
        label: '操作系统版本',
        value: 'os_version',
        wch: 10,
    },
    // {
    //     label: '威胁名称',
    //     value: 'threat_name',
    //     wch: 10,
    // },
    // {
    //     label: '威胁类型',
    //     value: 'threat_type',
    //     wch: 10,
    // },
    // {
    //     label: '威胁版本',
    //     value: 'threat_version',
    //     wch: 10,
    // },
    {
        label: '活跃状态',
        value: 'status',
        wch: 10,
    },
    {
        label: '活跃结束时间',
        value: 'endtime',
        wch: 20,
    },
    {
        label: '国家/地区',
        value: 'region',
        wch: 20,
    },
    {
        label: '经纬度',
        value: 'latALng',
        wch: 25,
    },
    {
        label: '主机名数量',
        value: 'hostCount',
        wch: 15,
    },
    {
        label: 'url数量',
        value: 'urlCount',
        wch: 10,
    },
    {
        label: '主机名',
        value: 'host',
        wch: 30,
    },
    {
        label: 'url',
        value: 'url',
        wch: 80,
    },
]

const ipFields = [
    { value: 'ip', label: 'ip', wch: 20 },
    // {
    //     label: '设备名称',
    //     value: 'dev_name',
    //     wch: 10,
    // },
    // {
    //     label: '设备类型',
    //     value: 'dev_type',
    //     wch: 15,
    // },
    // {
    //     label: '设备厂商',
    //     value: 'dev_vendor',
    //     wch: 10,
    // },
    // {
    //     label: '设备版本号',
    //     value: 'dev_model',
    //     wch: 20,
    // },
    // {
    //     label: '操作系统名称',
    //     value: 'os_name',
    //     wch: 10,
    // },
    // {
    //     label: '操作系统类型',
    //     value: 'os_type',
    //     wch: 10,
    // },
    // {
    //     label: '操作系统版本',
    //     value: 'os_version',
    //     wch: 10,
    // },

    { value: 'starttime', label: '开始时间', wch: 25 },
    { value: 'endtime', label: '结束时间', wch: 25 },
    { value: 'duration', label: '持续时间', wch: 20 },
    { value: 'status', label: '活跃状态', wch: 10 },
    { value: 'flows', label: 'flows', wch: 10 },
    { value: 'bytes', label: 'bytes', wch: 10 },
    { value: 'pkts', label: 'pkts', wch: 10 },
]

const hostFields = [
    { value: 'host', label: '主机名', wch: 30 },
    { value: 'ip', label: 'ip', wch: 20 },
    { value: 'port', label: '端口', wch: 10 },
    { value: 'starttime', label: '开始时间', wch: 25 },
    { value: 'endtime', label: '结束时间', wch: 25 },
    { value: 'duration', label: '持续时间', wch: 20 },
    { value: 'status', label: '活跃状态', wch: 10 },
    { value: 'flows', label: 'flows', wch: 10 },
    { value: 'bytes', label: 'bytes', wch: 10 },
    { value: 'pkts', label: 'pkts', wch: 10 },
]

const urlFields = [
    { value: 'url', label: 'url', wch: 50 },
    { value: 'ip', label: 'ip', wch: 20 },
    { value: 'port', label: '端口', wch: 10 },
    { value: 'retcode', label: '返回码', wch: 10 },
    { value: 'starttime', label: '开始时间', wch: 25 },
    { value: 'endtime', label: '结束时间', wch: 25 },
    { value: 'duration', label: '持续时间', wch: 20 },
    { value: 'status', label: '活跃状态', wch: 10 },
    { value: 'flows', label: 'flows', wch: 10 },
    { value: 'bytes', label: 'bytes', wch: 10 },
    { value: 'pkts', label: 'pkts', wch: 10 },
]

export const allFields = {
    ip: ipFields,
    srv: srvFields,
    host: hostFields,
    url: urlFields,
}

export const otherInfoFields = [
    'dev_name',
    'midware_name',
    'midware_type',
    'midware_version',
    'os_type',
    'os_version',
    'threat_name',
    'threat_type',
    'threat_version',
    'status',
    'starttime',
    'endtime',
    'region',
    'latALng',
    'hostCount',
    'urlCount',
    'host',
    'url',
]

const initFields = srvFields.reduce((obj, d) => {
    obj[d.value] = ''
    return obj
}, {})

export function getAssetTypeName(type) {
    const obj = {
        ip: '资产ip',
        srv: '端口',
        host: '资产host',
        url: '资产url',
    }
    return obj[type] || new Error('未知类型')
}

/**
 * 二进制字符串转ArrayBuffer
 * @param {String}} s
 */
export function s2ab(s) {
    const buf = new ArrayBuffer(s.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i !== s.length; i += 1) view[i] = s.charCodeAt(i) & 0xff
    return buf
}

/**
 * Blob对象以文件下载
 * @param {Blob} obj
 * @param {String} filename
 */
export function saveAs(obj, filename) {
    const link = document.createElement('a')
    link.download = filename
    link.href = URL.createObjectURL(obj)
    link.click()
    URL.revokeObjectURL(obj)
}

function getAssetSrvTypeData() {
    return fetch('./asset-config/assetSrvType.json')
        .then(res => res.json())
        .then(res => {
            const assetSrvMap = Object.keys(res).map(k => {
                return [res[k].map(d1 => d1.desc.toLowerCase()), k]
            })
            const portMap = chain(res)
                .values()
                .flatten()
                .reduce((obj, d) => {
                    obj[d.port] = d.desc.toLowerCase()
                    return obj
                })
                .value()
            return [assetSrvMap, portMap]
        })
}

function getGeoData(data) {
    const iplist = data.map(d => d.ip)
    return geoinfo(iplist.join(',')).then(res => {
        const geoRes = res.reduce((obj, d) => {
            const { ip, result } = d
            obj[ip] = {
                latALng: `${result[5]}, ${result[6]}`,
                region: `${result[0]}, ${result[1]}, ${result[2]}`,
            }
            return obj
        }, {})
        return geoRes
    })
}

function initAssetData(data) {
    return chain(data)
        .reduce((obj, d) => {
            const key = compact([d.ip, d.port, d.protocol, d.app_proto]).join(
                '-'
            )
            if (!obj[key]) {
                obj[key] = {
                    ...d,
                    srv_id: `${d.ip}-${d.port}`,
                    name: d.ip,
                    ip: d.ip,
                    port: d.port,
                    data: [],
                }
            }
            obj[key].data.push(d)
            return obj
        }, {})
        .forEach(d => {
            const lastItem = maxBy(d.data, d1 => d1.endtime)
            Object.assign(d, lastItem)
        })
        .value()
}

/**
 * 用于XLSX转换的数据，并计算单元格合并
 * @param {Array} tableData
 */
function getExportData(tableData, selectedFields) {
    const useFields = srvFields.filter(d => selectedFields.includes(d.value))
    const exportData = tableData
        .map(d =>
            pick(
                {
                    ...d,
                    host: d.host.join(','),
                    url: d.url.map(d1 => d1.url).join(','),
                },
                [...selectedFields]
            )
        )
        .map(d => {
            return useFields.reduce((obj, d1) => {
                obj[d1.label] = d[d1.value]
                return obj
            }, {})
        })
    return { data: exportData }
}

/**
 * 导出表格的数据，包括所有字段
 */
function getTableData(srv, host, url, geoData, assetSrvMap, portMap) {
    const srvObj = initAssetData(srv)
    const srvData = Object.values(srvObj)

    const hostObj = initAssetData(host)

    const urlObj = initAssetData(url)

    const tableData = chain(srvData)
        .map(d => {
            const useHost = hostObj[d.srv_id]
                ? chain(hostObj[d.srv_id].data)
                      .map(d1 => d1.host)
                      .uniq()
                      .value()
                : []

            const useUrl = urlObj[d.srv_id]
                ? uniqBy(urlObj[d.srv_id].data, 'url')
                : []

            const protocol = d.app_proto || portMap[d.port] || ''

            return {
                ...initFields,
                ...d,
                ...geoData[d.ip],
                protocol,
                status: d.is_alive ? '活跃' : '非活跃',
                endtime: formatTimestamp(d.endtime),
                starttime: formatTimestamp(d.starttime),
                hostCount: useHost.length || '',
                urlCount: useUrl.length || '',
                host: useHost,
                url: useUrl,
            }
        })
        .value()
    return tableData
}

/**
 * 请求所有数据
 * @param {Object} params
 */
export function fetchSrvData(params, srvAskHost = { url: false, host: false }) {
    const promiseArr = [
        assetSrv(params),
        new Promise(resolve => resolve()),
        new Promise(resolve => resolve()),
    ]
    if (srvAskHost.host) promiseArr[1] = assetHost(params)
    if (srvAskHost.url) promiseArr[2] = assetUrl(params)
    return Promise.all(promiseArr)
        .then(res => {
            const assetRes = [res[0], [], []]
            // eslint-disable-next-line prefer-destructuring
            if (srvAskHost.host) assetRes[1] = res[1]
            // eslint-disable-next-line prefer-destructuring
            if (srvAskHost.url) assetRes[2] = res[2]
            return getGeoData(assetRes[0]).then(geoData => {
                return [...assetRes, geoData]
            })
        })
        .then(res => {
            return getAssetSrvTypeData().then(([assetSrvMap, portMap]) => {
                return [...res, assetSrvMap, portMap]
            })
        })
}

export function getAssetData(type, params, srvAskHost) {
    switch (type) {
        case 'ip':
            return assetIp(params).then(res => [
                res.map(d => ({
                    ...d,
                    isV4: getDeviceType(d.ip).ipType === 'v4',
                })),
            ])

        case 'srv':
            return fetchSrvData(params, srvAskHost)
        case 'host':
            return assetHost(params).then(res => [res])
        case 'url':
            return assetUrl(params).then(res => [res])
        default:
            throw new Error('无指定类型')
    }
}

/**
 * 导出XLSX所需的数据
 * @param {Array} srv
 * @param {Array} host
 * @param {Array} url
 * @param {Object} geoData
 * @param {Object} assetSrvMap
 * @param {Object} selectedFields
 */
export function getSrvSheetData(
    srv,
    host,
    url,
    geoData,
    assetSrvMap,
    portMap,
    selectedFields
) {
    const tableData = getTableData(
        srv,
        host,
        url,
        geoData,
        assetSrvMap,
        portMap
    )
    const sheetData = getExportData(tableData, selectedFields)
    return sheetData
}

function calculateIpListData(data, useFields) {
    return chain(data)
        .reduce((obj, d) => {
            const key = d.ip
            const tempData = obj[key] ? obj[key].data : []
            tempData.push(d)
            const is_alive = obj[key] ? obj[key].is_alive : 0
            obj[key] = {
                ...d,
                data: tempData,
                name: key,
                is_alive: d.is_alive || is_alive,
            }
            return obj
        }, {})
        .values()
        .map(d => {
            const arr = d.data
            const { starttime } = minBy(arr, 'starttime')
            const { endtime } = maxBy(arr, 'endtime')
            const duration = sumBy(arr, 'duration')
            const flows = sumBy(arr, 'flows')
            const bytes = sumBy(arr, 'bytes')
            const pkts = sumBy(arr, 'pkts')
            let useObj = {
                ...d,
                starttime: formatTimestamp(starttime),
                endtime: formatTimestamp(endtime),
                duration: formatDuration(duration),
                status: d.is_alive === 1 ? '活跃' : '非活跃',
                flows: arrangeAlerm(flows),
                bytes: arrangeAlerm(bytes),
                pkts: arrangeAlerm(pkts),
            }
            useObj = useFields.reduce((obj, d1) => {
                obj[d1.label] = useObj[d1.value]
                return obj
            }, {})
            return useObj
        })
        .value()
}

function calculateHostListData(data, useFields) {
    return chain(data)
        .reduce((obj, d) => {
            const key = `${d.host}-${d.ip}`
            const tempData = obj[key] ? obj[key].data : []
            tempData.push(d)
            const is_alive = obj[key] ? obj[key].is_alive : 0
            obj[key] = {
                ...d,
                data: tempData,
                name: key,
                is_alive: d.is_alive || is_alive,
            }
            return obj
        }, {})
        .values()
        .map(d => {
            const arr = d.data
            const { starttime } = minBy(arr, 'starttime')
            const { endtime } = maxBy(arr, 'endtime')
            const duration = sumBy(arr, 'duration')
            const flows = sumBy(arr, 'flows')
            const bytes = sumBy(arr, 'bytes')
            const pkts = sumBy(arr, 'pkts')
            const port = chain(arr).map('port').uniq().value().join()
            let useObj = {
                ...d,
                port,
                starttime: formatTimestamp(starttime),
                endtime: formatTimestamp(endtime),
                duration: formatDuration(duration),
                status: d.is_alive === 1 ? '活跃' : '非活跃',
                flows: arrangeAlerm(flows),
                bytes: arrangeAlerm(bytes),
                pkts: arrangeAlerm(pkts),
            }
            useObj = useFields.reduce((obj, d1) => {
                obj[d1.label] = useObj[d1.value]
                return obj
            }, {})
            return useObj
        })
        .value()
}

function calculateUrlListData(data, useFields) {
    return chain(data)
        .reduce((obj, d) => {
            const key = `${d.url}-${d.ip}`
            const tempData = obj[key] ? obj[key].data : []
            tempData.push(d)
            const is_alive = obj[key] ? obj[key].is_alive : 0
            obj[key] = {
                ...d,
                data: tempData,
                name: key,
                is_alive: d.is_alive || is_alive,
            }
            return obj
        }, {})
        .values()
        .map(d => {
            const arr = d.data
            const { starttime } = minBy(arr, 'starttime')
            const { endtime } = maxBy(arr, 'endtime')
            const duration = sumBy(arr, 'duration')
            const flows = sumBy(arr, 'flows')
            const bytes = sumBy(arr, 'bytes')
            const pkts = sumBy(arr, 'pkts')
            const port = chain(arr).map('port').uniq().value().join()
            const retcode = chain(arr)
                .map(d1 => d1.retcode.split())
                .flatten()
                .uniq()
                .value()
                .join()
            let useObj = {
                ...d,
                port,
                retcode,
                starttime: formatTimestamp(starttime),
                endtime: formatTimestamp(endtime),
                duration: formatDuration(duration),
                status: d.is_alive === 1 ? '活跃' : '非活跃',
                flows: arrangeAlerm(flows),
                bytes: arrangeAlerm(bytes),
                pkts: arrangeAlerm(pkts),
            }
            useObj = useFields.reduce((obj, d1) => {
                obj[d1.label] = useObj[d1.value]
                return obj
            }, {})
            return useObj
        })
        .value()
}

function getOtherSheetData(type, data, selectedFields) {
    const useFields = allFields[type].filter(d =>
        selectedFields.includes(d.value)
    )

    const method = {
        ip: calculateIpListData,
        host: calculateHostListData,
        url: calculateUrlListData,
    }
    const exportData = method[type](data, useFields)

    return { data: exportData }
}

export function getSheetData(type, ...args) {
    if (type === 'srv') {
        return getSrvSheetData(...args)
    }
    return getOtherSheetData(type, ...args)
}

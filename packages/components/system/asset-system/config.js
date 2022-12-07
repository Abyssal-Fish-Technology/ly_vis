import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import {
    formatDuration,
    formatTimestamp,
} from '@shadowflow/components/utils/universal/methods-time'
import assetColumns from './columns'

function calculateField(columns) {
    return columns
        .slice(0, columns.length)
        .map(d => ({ label: d.title, value: d.dataIndex }))
}

const {
    ip: ipColumns,
    srv: srvColumns,
    host: hostColumns,
    url: urlColumns,
} = assetColumns

const ipAggreFields = calculateField(ipColumns)
const srvAggreFields = calculateField(srvColumns)
const hostAggreFields = calculateField(hostColumns)
const urlAggreFields = calculateField(urlColumns)

const formatMap = {
    bytes: value => arrangeAlerm(value),
    pkts: value => arrangeAlerm(value),
    flows: value => arrangeAlerm(value),
    time: value => formatTimestamp(value),
    duration: value => formatDuration(value),
}

export function formatValue(key, value) {
    const formatFun = formatMap[key]
    return formatFun ? formatFun(value) : value
}

export function getFields(type) {
    switch (type) {
        case 'ip':
            return ipAggreFields
        case 'srv':
            return srvAggreFields
        case 'host':
            return hostAggreFields
        case 'url':
            return urlAggreFields
        default:
            return new Error('unkonw type')
    }
}

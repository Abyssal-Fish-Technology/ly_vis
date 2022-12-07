import { getDeviceType } from './methods-net'

export const calculateSearchParams = (device = '', type = 'std') => {
    const resultObj = {}
    const {
        ip = '',
        port = '',
        isOnlyUrl = false,
        isOnlyDomain = false,
        isOnlyPort = false,
        hasIp = false,
        hasDomain = false,
        hasUrl = false,
    } = getDeviceType(device)
    const [nowip = '', nowport = ''] = device.split(' ')
    let resultType = 'ip'
    resultObj.ip = ip
    switch (true) {
        case device.includes('>') && hasIp && type === 'std':
            resultType = 'ip>port'
            ;[, resultObj.port] = device.split('>')
            break
        case device.includes(':') && hasIp && type === 'std':
            resultType = 'ip:port'
            ;[, resultObj.port] = device.split(':')
            break
        case getDeviceType(nowip).isOnlyIp &&
            getDeviceType(nowport).isOnlyPort &&
            type === 'std' &&
            hasIp:
            resultType = 'ip port'
            resultObj.port = nowport
            break
        case isOnlyPort:
            resultType = type === 'std' ? 'port' : 'srv'
            resultObj[type === 'std' ? 'port' : 'srv'] = port
            break
        case isOnlyDomain || hasDomain:
            resultType = type === 'std' ? 'dns' : 'host'
            resultObj[type === 'std' ? 'dns' : 'host'] = device
            break
        case isOnlyUrl || hasUrl:
            resultType = 'url'
            resultObj.url = device
            break
        default:
            break
    }
    resultObj.searchType = resultType
    return resultObj
}

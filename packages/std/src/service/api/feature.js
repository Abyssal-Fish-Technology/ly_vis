import fetch from '@/service/fetch'

export function featureGet(params) {
    return fetch.post('feature', params)
}

export function featureTcpinit(params) {
    return fetch.post('feature', {
        limit: 0,
        ...params,
        type: 'tcpinit',
    })
}
export function featureDns(params) {
    return fetch.post('feature', {
        ...params,
        type: 'dns',
    })
}
export function featureScan(params) {
    return fetch.post('feature', {
        ...params,
        type: 'scan',
    })
}
export function featureSus(params) {
    return fetch.post('feature', {
        ...params,
        type: 'sus',
    })
}
export function featureBlack(params) {
    return fetch.post('feature', {
        ...params,
        type: 'black',
    })
}
export function featureService(params) {
    return fetch.post('feature', {
        ...params,
        type: 'service',
    })
}
export function featureMo(params) {
    return fetch.post('feature', {
        ...params,
        type: 'mo',
        limit: 0,
    })
}

import fetch from '@/service/fetch'

export function assetGet(params) {
    return fetch.post('asset', params)
}

export function assetIp(params) {
    return fetch.post('asset', {
        type: 'asset_ip',
        // limit: 0,
        ...params,
    })
}
export function assetSrv(params) {
    return fetch.post('asset', {
        type: 'asset_srv',
        // limit: 0,
        ...params,
    })
}
export function assetHost(params) {
    return fetch.post('asset', {
        type: 'asset_host',
        // limit: 0,
        ...params,
    })
}
export function assetUrl(params) {
    return fetch.post('asset', {
        type: 'asset_url',
        // limit: 0,
        ...params,
    })
}

export function statinfoGet(params) {
    return fetch.post('statinfo', {
        type: 'asset',
        ...params,
    })
}

import fetch from '@/service/fetch'

export function blacklistApi(params = {}) {
    return fetch.post('config', {
        op: 'get',
        type: 'bwlist',
        target: 'blacklist',
        ...params,
    })
}

export function whitelistApi(params = {}) {
    return fetch.post('config', {
        op: 'get',
        type: 'bwlist',
        target: 'whitelist',
        ...params,
    })
}

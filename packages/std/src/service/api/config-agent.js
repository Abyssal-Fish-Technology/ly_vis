import fetch from '@/service/fetch'

// 设备
export function deviceApi(params = {}) {
    return fetch.post('config', {
        op: 'get',
        type: 'agent',
        target: 'device',
        ...params,
    })
}

// 代理
export function proxyApi(params = {}) {
    return fetch.post('config', {
        op: 'get',
        type: 'agent',
        ...params,
    })
}

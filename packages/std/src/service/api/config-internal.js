import fetch from '@/service/fetch'

export function internalApi(params = {}) {
    return fetch.post('config', {
        op: 'get',
        type: 'internalip',
        ...params,
    })
}

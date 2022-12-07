import fetch from '@/service/fetch'

export function userApi(params = {}) {
    return fetch.post('config', {
        op: 'get',
        type: 'user',
        ...params,
    })
}

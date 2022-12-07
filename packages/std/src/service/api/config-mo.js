import fetch from '@/service/fetch'

export function moApi(params = {}) {
    return fetch.post('config', {
        op: 'get',
        type: 'mo',
        ...params,
    })
}

export function mogroupApi(params = {}) {
    return fetch.post('config', {
        op: 'gget',
        type: 'mo_group',
        ...params,
    })
}

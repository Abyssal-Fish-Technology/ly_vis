import fetch from '@/service/fetch'

export function sctlStat(params) {
    return fetch.post('sctl', {
        ...params,
    })
}

export function sctlStop(params) {
    return fetch.post('sctl', {
        op: 'stop',
        ...params,
    })
}

export function sctlStart(params) {
    return fetch.post('sctl', {
        op: 'start',
        ...params,
    })
}

export function sctlRestart(params) {
    return fetch.post('sctl', {
        op: 'restart',
        ...params,
    })
}

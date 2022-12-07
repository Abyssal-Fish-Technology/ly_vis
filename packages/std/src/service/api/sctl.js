import fetch from '@/service/fetch'

export function sctlStat(params) {
    return fetch.post('sctl', {
        op: 'stat',
        tid: '0',
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

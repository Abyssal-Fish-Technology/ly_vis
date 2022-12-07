import fetch from '@/service/fetch'

// event
export function eventConfigApiConfig(params) {
    return fetch.post('config', {
        op: 'get',
        type: 'event',
        ...params,
    })
}

// eventType
export function eventConfigApiType(params) {
    return fetch.post('config', {
        op: 'get',
        type: 'event_type',
        ...params,
    })
}

// eventLevel
export function eventConfigApiLevel(params) {
    return fetch.post('config', {
        op: 'get',
        type: 'event_level',
        ...params,
    })
}

// =============================== 事件详细配置 ===============================

// ============== 统一事件详细配置 ==============
export function eventConfigApi(params) {
    return fetch.post('config', {
        op: 'get',
        type: 'event_config',
        ...params,
    })
}
// ============== Mo事件详细配置 ==============
export function eventConfigApiMo(params) {
    return fetch.post('config', {
        op: 'get',
        event_type: 'threshold',
        type: 'event_config',
        ...params,
    })
}

export function eventConfigApiScan(params) {
    return fetch.post('config', {
        op: 'get',
        event_type: 'scan',
        type: 'event_config',
        ...params,
    })
}

export function eventConfigApiDos(params) {
    return fetch.post('config', {
        op: 'get',
        event_type: 'srv',
        type: 'event_config',
        ...params,
    })
}

export function eventConfigApiSus(params) {
    return fetch.post('config', {
        op: 'get',
        event_type: 'sus',
        type: 'event_config',
        ...params,
    })
}

export function eventConfigApiBlack(params) {
    return fetch.post('config', {
        op: 'get',
        event_type: 'black',
        type: 'event_config',
        ...params,
    })
}

export function eventConfigApiDns(params) {
    return fetch.post('config', {
        op: 'get',
        event_type: 'dns',
        type: 'event_config',
        ...params,
    })
}

export function eventConfigApiDnstun(params) {
    return fetch.post('config', {
        op: 'get',
        event_type: 'dns_tun',
        type: 'event_config',
        ...params,
    })
}

// eventAction
export function eventConfigApiAction(params) {
    return fetch.post('config', {
        op: 'get',
        type: 'event_action',
        ...params,
    })
}

// !eventIgnore
export function eventConfigApiIgnore(params) {
    return fetch.post('config', {
        op: 'get',
        type: 'event_ignore',
        ...params,
    })
}

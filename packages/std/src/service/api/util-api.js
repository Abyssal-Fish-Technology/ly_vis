import fetch from '@/service/fetch'

export function geoinfo(iplist) {
    return fetch.post('geoinfo', {
        ipList: iplist,
    })
}

export function portinfo(portlist) {
    return fetch.post('portinfo', {
        portlist,
    })
}

export function ipInfo(ipList) {
    return fetch.post('ipinfo', {
        iplist: ipList.toString(),
    })
}

export function threatinfo(key, op = 'get') {
    return fetch.post('threatinfo', {
        key,
        op,
    })
}

export function threatinfoPro(list, type) {
    return fetch.post('threatinfopro', {
        list,
        type,
    })
}

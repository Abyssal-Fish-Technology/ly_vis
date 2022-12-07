import fetch from '@/service/fetch'

export function topnGet(parmas) {
    return fetch.post('topn', parmas)
}

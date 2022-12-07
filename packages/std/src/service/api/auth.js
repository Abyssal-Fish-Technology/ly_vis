import fetch from '@/service/fetch'

export function login(params) {
    return fetch.post('login', params)
}

export function logout() {
    return fetch.post('logout')
}

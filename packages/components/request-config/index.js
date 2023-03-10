import { message } from 'antd'
import axios from 'axios'
import { chain, isEqual } from 'lodash'
import { parse, stringify } from 'qs'

class RequestCache {
    constructor() {
        this.data = {}
    }

    isHave(nowKey) {
        return chain(this.data)
            .keys()
            .find(key => {
                return isEqual(parse(key), parse(nowKey))
            })
            .value()
    }

    createTimer(nowKey) {
        const timer = setTimeout(() => {
            this.delete(nowKey)
            clearTimeout(timer)
        }, 60 * 60 * 4 * 1000)
        return timer
    }

    static checkUrlAndParams(params, cacheApiArr) {
        const [url, currentParams] = params.split('^')
        const { op } = parse(currentParams)
        return cacheApiArr.includes(url) && (!op || op === 'get')
    }

    add(nowKey, nowData, cacheApiArr) {
        if (
            !this.isHave(nowKey) &&
            RequestCache.checkUrlAndParams(nowKey, cacheApiArr)
        ) {
            const timer = this.createTimer(nowKey)
            this.data[nowKey] = {
                data: nowData,
                timer,
            }
        }
    }

    delete(nowKey) {
        const newData = { ...this.data }
        clearTimeout(newData[nowKey].timer)
        delete newData[nowKey]
        this.data = newData
    }

    get(nowKey) {
        const key = this.isHave(nowKey)
        return key ? this.data[key].data : null
    }

    update(nowKey, nowData) {
        const key = this.isHave(nowKey)
        clearTimeout(this.data[key].timer)
        this.data[key] = {
            data: nowData,
            timer: this.createTimer(nowKey),
        }
    }
}

export const cacheRequest = new RequestCache({})

export default function requestConfig({
    baseUrl,
    isCacheRequset,
    requestCallBack = null,
    requestErrCallBack = null,
    responseCallBack = null,
    responseErrCallBack = null,
}) {
    const axiosInstance = axios.create({
        baseURL: baseUrl,
        timeout: 1000000,
        transformRequest: [
            data => {
                return stringify(data)
            },
        ],
        adapter: config => {
            const currentKey = `${config.url}^${config.data}`
            if (cacheRequest.get(currentKey) !== null && isCacheRequset) {
                return new Promise(reslove => {
                    const resInfo = {
                        data: cacheRequest.get(currentKey),
                        status: 200,
                        statusText: 'OK',
                        config,
                    }
                    setTimeout(() => {
                        reslove(resInfo)
                    }, 0)
                })
            }
            return axios({
                ...config,
                adapter: undefined,
                data: parse(config.data),
            })
        },
    })

    // ????????????
    axiosInstance.interceptors.request.use(
        config => {
            if (requestCallBack) {
                requestCallBack(config)
            }
            return config
        },
        error => {
            if (requestErrCallBack) {
                requestErrCallBack(error)
            } else {
                Promise.reject(error)
            }
        }
    )

    // ????????????
    axiosInstance.interceptors.response.use(
        data => {
            return responseCallBack(data)
        },
        error => {
            // ????????????????????????threatinfo???????????????????????????????????????????????????????????????????????????????????????
            // ??????error.toJSON()?????????toJSON???????????????error?????????????????????(axios?????????????????????)????????????error?????????toJSON?????????????????????(Object.keys()????????????)
            const { config = {}, message: timeoutMessage = '' } = error || {}
            const { url = '' } = config
            if (timeoutMessage.includes('timeout') && url === 'threatinfo') {
                return Promise.resolve([])
            }
            if (responseErrCallBack) {
                responseErrCallBack(error)
            }
            if (!axios.isCancel(error)) {
                if (error.response) {
                    if (error.response.status >= 500) {
                        message.error('??????????????????????????????????????????')
                    } else if (error.response.status >= 400) {
                        message.error('??????????????????????????????????????????')
                    }
                }
            }
            error.message = 'error'
            return Promise.reject(error)
        }
    )
    return axiosInstance
}

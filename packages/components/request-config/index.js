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

    // 请求拦截
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

    // 响应拦截
    axiosInstance.interceptors.response.use(
        data => {
            return responseCallBack(data)
        },
        error => {
            // 外放访问受限时，threatinfo接口不能使用，这里做特殊处理，防止接口报错以及页面渲染出错
            // 去掉error.toJSON()，使用toJSON是为了查看error包含的错误信息(axios文档中给的方法)，但是当error中没有toJSON方法时就会报错(Object.keys()可以查看)
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
                        message.error('服务器错误，请联系管理员处理')
                    } else if (error.response.status >= 400) {
                        message.error('客户端错误，请检查地址和参数')
                    }
                }
            }
            error.message = 'error'
            return Promise.reject(error)
        }
    )
    return axiosInstance
}

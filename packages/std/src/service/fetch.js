import axios from 'axios'
import { message } from 'antd'
import { parse } from 'qs'
import history from '@shadowflow/components/history'
import { handleMcokPost } from '@shadowflow/components/utils/universal/methods-post'
import { getUrlParams } from '@shadowflow/components/utils/universal/methods-router'
import { setPrevLocationParams } from '@shadowflow/components/utils/universal/methods-storage'
import { cloneDeep } from 'lodash'
import requestConfig, {
    cacheRequest,
} from '@shadowflow/components/request-config'
import { getCodeMessage } from '@shadowflow/components/utils/business/methods-auth'
import RequestStore from './store'

function requestCallBack(config) {
    if (process.env.REACT_APP_ENV === 'mock') {
        config.url = handleMcokPost(config.url, config.data)
    }
    // 当外网访问受限时，threatinfo接口不能使用，统一threatinfo的超时设为30秒
    if (config.url === 'threatinfo') {
        config.timeout = 30000
    }
    config.cancelToken = new axios.CancelToken(cancel => {
        RequestStore.add(cancel)
        if (
            ['portinfo', 'geoinfo', 'threatinfo', 'feature'].includes(
                config.url
            )
        ) {
            RequestStore.tooltipAdd(cancel)
        }
    })
}

function responseCallBack(data) {
    const res = data.data
    const { pathname } = history.location
    if (
        res[0] &&
        res[0].code &&
        res[0].code >= 300 &&
        res[0].code < 400 &&
        res[0].code !== 306
    ) {
        if (!pathname.includes('login')) {
            setPrevLocationParams({ pathname, urlParams: getUrlParams() })
            message.warning(getCodeMessage(res[0].code))
        }
        RequestStore.cancel()

        res.message = 'unlogin'
        // 因为有的页面针对于Reject还有后续的catch回调函数，如果说不加settimeOut的话，就会在登录页面去执行其他页面的函数逻辑，导致产生BUG。
        setTimeout(() => {
            history.replace('/login')
        }, 1000)
        return Promise.reject(res)
    }
    if (res[0] && res[0].code && res[0].code === 306) {
        message.error('本角色暂无此项操作权限!')
        RequestStore.cancel()
        res.message = 'unpower'
        return Promise.reject(res)
    }
    if (JSON.stringify(res).includes('[{failed}]')) {
        message.error('操作失败!')
        res.message = 'op-failed'
        return Promise.reject(res)
    }

    const { op = '', req_type = '' } = parse(data.config.data)
    if (
        data.config.url === 'event' &&
        op === 'mod' &&
        req_type === 'set_proc_status'
    ) {
        const deleteKeys = Object.keys(cacheRequest.data).filter(keyItem => {
            const [nowUrl, nowParams] = keyItem.split('^')
            return nowUrl === 'event' && parse(nowParams).req_type === 'aggre'
        })
        deleteKeys.forEach(keyItem => {
            cacheRequest.delete(keyItem)
        })
    }

    cacheRequest.add(
        `${data.config.url}^${data.config.data}`,
        cloneDeep(data.data),
        ['asset', 'evidence']
    )
    return data.data
}

const fetch = requestConfig({
    baseUrl: window.appConfig.baseUrl,
    isCacheRequset: window.appConfig.isCacheRequset,
    requestCallBack,
    responseCallBack,
})

export default fetch

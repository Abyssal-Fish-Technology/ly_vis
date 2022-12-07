/** ********************************************************************** MockFun start ***********************************************************************
 ** mock方法集合
 ** 关键字： mock
 * */

/**
 * mock请求拦截处理
 * @param {*} url:请求地址
 * @param {*} params：请求参数
 * @returns 拼接后的请求地址
 */
export function handleMcokPost(url, params) {
    const { type, op, event_type, req_type } = params
    let result_url = url
    if (url === 'event') {
        result_url = `${url}?req_type=${req_type}`
    }

    const urlArr = ['asset', 'threatinfo', 'threatinfopro', 'feature']
    if (urlArr.includes(url)) {
        result_url = `${url}?type=${type}`
    }

    if (url === 'config') {
        if (type === 'user') {
            if (op === 'get') {
                result_url = `config?type=user`
            } else {
                result_url = `config?type=user&op=${op}`
            }
        }

        if (type === 'event_config' && op === 'get') {
            result_url = `config?type=event_config&event_type=${event_type}`
        }

        if (type === 'bwlist') {
            result_url = `config?type=bwlist`
        }
        const typeArr = [
            'user',
            'mo',
            'mo_group',
            'event_ignore',
            'internalip',
            'agent',
            'event',
            'event_type',
            'event_action',
            'event_level',
        ]
        if (typeArr.includes(type)) {
            const nowType = type === 'internalip' ? 'internal' : type
            result_url = `config?type=${nowType}&op=${op}`
            if (op === 'get') {
                result_url = `config?type=${nowType}`
            }
        }
    }
    return result_url
}

/** ***********************************************************************  end ************************************************************************* */

/** ********************************************************************** PostHandler start ***********************************************************************
 ** Post方法集合
 ** 关键字： promise、post
 * */
/**
 * 使用promise实现并发请求
 * @param {*} limit 同时执行的promise个数
 * @param {*} arr 操作的数组
 * @param {*} callback 请求方法
 */
export async function concurrentRequest(limit, paramsArr, keyArr, callback) {
    const ret = [] // 用于存放所有的promise实例
    const executing = [] // 用于存放目前正在执行的promise
    let i = 0
    while (i < paramsArr.length) {
        const p = Promise.resolve(callback(paramsArr[i], keyArr[i])) // 防止回调函数返回的不是promise，使用Promise.resolve进行包裹
        ret.push(p)
        if (limit <= paramsArr.length) {
            // then回调中，当这个promise状态变为fulfilled后，将其从正在执行的promise列表executing中删除
            const e = p.then(() => executing.splice(executing.indexOf(e), 1))
            executing.push(e)
            if (executing.length >= limit) {
                // 一旦正在执行的promise列表数量等于限制数，就使用Promise.race等待某一个promise状态发生变更，
                // 状态变更后，就会执行上面then的回调，将该promise从executing中删除，
                // 然后再进入到下一次for循环，生成新的promise进行补充
                // eslint-disable-next-line no-await-in-loop
                await Promise.race(executing)
            }
        }
        i += 1
    }

    return Promise.all(ret)
}

/** ***********************************************************************  end ************************************************************************* */

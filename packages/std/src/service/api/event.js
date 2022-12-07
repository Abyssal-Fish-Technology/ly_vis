import fetch from '@/service/fetch'
import { splitEventObj } from '@shadowflow/components/system/event-system'
import { intersection } from 'lodash'

const { ignoreEventSwitch, ignoreEventIpArr } = window.appConfig

export function eventGet(params) {
    return new Promise((resolve, reject) => {
        fetch
            .post('event', {
                req_type: 'aggre',
                ...params,
            })
            .then(
                res => {
                    const newRes = ignoreEventSwitch
                        ? res.filter(d => {
                              const final = intersection(
                                  splitEventObj(d),
                                  ignoreEventIpArr
                              )
                              return final.length === 0
                          })
                        : res
                    resolve(newRes)
                },
                err => {
                    reject(err)
                }
            )
    })
}

export function eventStatusMod(params) {
    return fetch.post('event', {
        req_type: 'set_proc_status',
        ...params,
    })
}

export function eventInfoGet(params) {
    return fetch.post('event', {
        req_type: 'scatter',
        ...params,
    })
}

/**
 *
 * @param {obj} params = {
 *  starttime: timestamp(s),
 *  endtime: timestamp(s),
 *  obj,
 * }
 */
export function eventFeature(params) {
    return fetch.post('event_feature', {
        ...params,
    })
}

/**
 * 获取数据包
 * @param {obj} params = {
 *  time: 微秒级别数据包,
 *  endtime: timestamp(s),
 *  obj,
 * }
 */
export function eventEvidence(params) {
    return fetch.post('evidence', {
        ...params,
    })
}

import { observable, action, computed, reaction } from 'mobx'
import { reduce } from 'lodash'
import { setUserAuth } from '../utils/universal/methods-storage'

// 配置接口的数据
export default class ConfigStore {
    @observable device = []

    @observable proxy = []

    @observable internal = []

    @observable black = []

    @observable white = []

    @observable userList = []

    /**
     *  处理后的数据
     */
    // 当前用户权限
    @computed get userLevel() {
        const level =
            this.userList.length === 1 ? this.userList[0].level : 'sysadmin'
        setUserAuth(level)
        return level
    }

    @computed get internalIpArr() {
        return this.internal.map(d => d.ip)
    }

    @action.bound changeData(data) {
        // 对源数据排序
        const useData = reduce(
            data,
            (obj, d, k) => {
                obj[k] = d.slice().sort((a, b) => a.id - b.id)
                return obj
            },
            {}
        )
        Object.assign(this, useData)
    }

    @action.bound updateAll = () => {
        return Promise.resolve()
    }

    constructor(beforeChange) {
        this.beforeChange = beforeChange
        reaction(
            () => this.internal,
            internal => {
                window.internalIp = internal
            }
        )

        reaction(
            () => this.device,
            device => {
                window.device = device
            }
        )
    }
}

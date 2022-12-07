import { moApi } from '@/service'
import { concurrentRequest } from '@shadowflow/components/utils/universal/methods-post'
import { message } from 'antd'
import { keys, values } from 'lodash'
import { action, observable } from 'mobx'

class ImportStore {
    @observable visible = false

    @observable devid = ''

    @observable successFun = ''

    @action.bound updateVisible(state, devid = '', successFun = '') {
        this.visible = state
        if (devid) {
            this.devid = devid
            this.successFun = successFun
        }
    }

    @observable importData = []

    @action.bound setImportData(data) {
        this.importData = data
    }

    @action.bound sendPostFun() {
        const paramsArr = values(this.importData)
        const keyArr = keys(this.importData)
        return concurrentRequest(1, paramsArr, keyArr, this.addMoFun).then(
            () => {
                message.success('操作成功！')
                this.successFun()
            }
        )
    }

    @action.bound addMoFun(params, key) {
        return moApi({
            type: 'mo',
            op: 'add',
            devid: this.devid,
            ...params,
        }).then(() => {
            const newData = JSON.parse(JSON.stringify(this.importData))
            delete newData[key]
            this.importData = newData
        })
    }
}

export default new ImportStore()

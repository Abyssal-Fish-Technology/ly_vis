import { action, observable } from 'mobx'

export default class AddConfigModalStore {
    init = (API, updateCache) => {
        this.API = API
        this.updateCache = updateCache
    }

    @observable visible = false

    op = 'add'

    data = {}

    callback = () => {}

    type = 'ip'

    @action onOpen = ({
        op = 'add',
        data = {},
        callback = () => {},
        type = 'ip',
    } = {}) => {
        this.visible = true
        this.op = op
        this.data = data
        this.type = type
        this.callback = callback
    }

    @action onClose = () => {
        this.visible = false
    }

    confirm = values => {
        if (this.op === 'mod') {
            values.id = this.data.id
        }

        return this.API({
            ...values,
            op: this.op,
        }).then(() => {
            this.API().then(res => {
                return this.updateCache(res)
            })
        })
    }
}

import { action, observable } from 'mobx'

export default class ModalStore {
    @observable visible = false

    @action onOpen = data => {
        this.visible = true
        this.data = data
    }

    @action onClose = () => {
        this.visible = false
        this.data = {}
    }

    @observable loading = false

    @action openLoading = () => {
        this.loading = true
    }

    @action closeLoading = () => {
        this.loading = false
    }
}

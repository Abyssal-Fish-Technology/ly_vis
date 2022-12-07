import { action, observable } from 'mobx'

class OverallSituationStore {
    @observable updateList = []

    @action.bound changeUpdateList(list) {
        this.updateList = list
    }
}

export default new OverallSituationStore()

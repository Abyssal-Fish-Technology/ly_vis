import { eventGet } from '@/service'
import { formatEventData } from '@/utils/methods-event'
import { message } from 'antd'
import { isArray } from 'lodash'
import { action, observable } from 'mobx'

export default class EventDetailStore {
    @observable alarmParams = {}

    @action.bound setAlarmParams(value) {
        this.alarmParams = value
    }

    @observable attackDeviceInfo = {}

    @observable victimDeviceInfo = {}

    @observable alarmTimingData = {}

    @observable eventFeatureData = {}

    @observable alarmOriginData = []

    @observable featureData = []

    @observable eventFeatureOriginData = []

    @action.bound changeReportData(field, data) {
        this[field] = data
    }

    @observable originRecordData = {}

    @action.bound changeRecordData(ids) {
        const eventId = isArray(ids) ? ids[0].id : ids
        eventGet({ id: eventId }).then(event => {
            if (event.length > 0) {
                ;[this.originRecordData] = formatEventData(event)
            } else {
                message.warning('未查询到事件信息!')
                this.originRecordData = {}
            }
        })
    }
}

import { observable, action } from 'mobx'
import { eventConfigApiConfig, eventConfigApi } from '@/service'
import { EventConfig } from '@shadowflow/components/system/event-system'

class EventConfigStore {
    @observable visible = false

    @observable eventType = 'black'

    op = 'add'

    data = {}

    id = null

    callback = () => {}

    @action onOpen = ({
        type = 'black',
        op = 'add',
        data,
        id,
        callback = () => {},
    }) => {
        this.visible = true
        this.eventType = type
        this.op = op
        this.data = data
        this.id = id
        this.callback = callback
    }

    @action onClose = () => {
        this.visible = false
    }

    onConfirm = (formValue, updateCache) => {
        const { event, eventConfig = {} } = formValue
        const { event_type } = event

        if (this.op === 'mod') {
            event.event_id = this.id
            eventConfig.config_id = event.config_id
            Object.entries(eventConfig).forEach(d => {
                const [nowKey, nowValue] = d
                eventConfig[nowKey] = nowValue || 'null'
            })
        }
        event.action_id = 1
        const currentApi = () => {
            return EventConfig[event_type].detailConfigForms.length
                ? eventConfigApi({
                      ...EventConfig[event_type].config.params,
                      ...eventConfig,
                      op: this.op,
                  }).then(res => {
                      const config_id =
                          this.op === 'add' ? res[0].id : event.config_id
                      return eventConfigApiConfig({
                          ...event,
                          op: this.op,
                          config_id,
                      })
                  })
                : eventConfigApiConfig({
                      ...event,
                      op: this.op,
                      config_id: event.config_id,
                  })
        }

        return currentApi().then(() => {
            eventConfigApi({
                ...EventConfig[event_type].config.params,
                op: 'get',
            }).then(res => {
                updateCache({
                    [`eventConfig${event_type}`]: res,
                })
            })
            eventConfigApiConfig().then(res => {
                updateCache({ event: res })
                const result = res.filter(
                    eventItem => eventItem.event_type === this.eventType
                )
                updateCache({ [`event${this.eventType}`]: result })
            })
            this.callback()
        })
    }
}

export default new EventConfigStore()

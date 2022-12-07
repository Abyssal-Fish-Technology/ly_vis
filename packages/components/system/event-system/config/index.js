import {
    EVENT_COLUMNS,
    EVENT_CONFIG_PARAMS,
    EVENT_FORM,
    EVENT_PARAMS,
} from './public/event-config'
import EventBlack from './event/black'
import EventCap from './event/cap'
import EventDga from './event/dga'
import EventDns from './event/dns'
import EventDnsTun from './event/dns_tun'
import EventDnsTunAi from './event/dnstun_ai'
import EventFrnTrip from './event/frn_trip'
import EventIcmpTun from './event/icmp_tun'
import EventIpScan from './event/ip_scan'
import EventPortScan from './event/port_scan'
import EventSrv from './event/srv'
import EventTi from './event/ti'
import EventTrack from './event/track'
import EventUrlContent from './event/url_content'
import EventMining from './event/mining'

const EventArr = [
    EventBlack,
    EventCap,
    EventDga,
    EventDns,
    EventDnsTun,
    EventDnsTunAi,
    EventFrnTrip,
    EventIcmpTun,
    EventIpScan,
    EventPortScan,
    EventSrv,
    EventTi,
    EventTrack,
    EventUrlContent,
    EventMining,
]

const publicConfig = {
    params: EVENT_PARAMS,
    columns: EVENT_COLUMNS,
    forms: EVENT_FORM,
}

const EventConfig = EventArr.reduce((obj, d) => {
    obj[d.type] = {
        ...publicConfig,
        ...d,
        config: {
            params: {
                ...EVENT_CONFIG_PARAMS,
                event_type: d.type,
            },
            columns: d.detailConfigColumns,
            forms: d.detailConfigForms,
            dict: d.detailConfigForms.reduce((dict, formItem) => {
                dict[formItem.valueKey] = formItem.label
                return dict
            }, {}),
        },
    }
    return obj
}, {})

export const eventConfigFormDict = EVENT_FORM.reduce((dict, formItem) => {
    dict[formItem.valueKey] = formItem.label
    return dict
}, {})

export default EventConfig

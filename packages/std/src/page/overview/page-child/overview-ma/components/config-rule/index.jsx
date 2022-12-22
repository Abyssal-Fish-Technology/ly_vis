import { Input, List, Radio, Tooltip } from 'antd'
import Section from '@shadowflow/components/ui/layout/section'
import { inject, observer } from 'mobx-react'
import React, { useCallback, useMemo, useState } from 'react'
import { graphic } from 'echarts/lib/export'
import { LineChart } from '@shadowflow/components/charts'
import { EditOutlined } from '@ant-design/icons'
import { TriggerEventModal } from '@/components/modals'
import {
    EventConfig,
    translateEventLevel,
    translateEventType,
} from '@shadowflow/components/system/event-system'
import moment from 'moment'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import FormFilter from '@shadowflow/components/ui/form/form-filter'
import UnitContainer from '@shadowflow/components/ui/container/unit-container'
import withAuth from '@shadowflow/components/ui/container/with-auth'
import style from './index.module.less'

function EventChart({ data }) {
    const option = {
        tooltip: {
            formatter: params => {
                const [
                    { marker, data: value, seriesName, axisValueLabel },
                ] = params
                return `<div class='echart-tooltips'>
                <div class='title'>${axisValueLabel.replace('\n', ' ')}</div>
                        <div class="dot-item">
                            ${marker}
                            <span class="dot-item-name">${seriesName}</span>: <span class="dot-item-value" >${value}</span>
                        </div>
                    </div>`
            },
        },
        xAxis: {
            data: data.map(d => d.name),
            axisLabel: {
                show: false,
            },
            axisTick: {
                show: false,
            },
            interval: 300,
        },
        yAxis: {
            show: false,
        },
        series: [
            {
                name: '事件数量',
                smooth: true,
                symbolSize: 0,
                areaStyle: {
                    color: new graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgba(34, 81, 247, 1)',
                        },
                        {
                            offset: 1,
                            color: 'rgba(34, 81, 247, .2)',
                        },
                    ]),
                },
            },
        ],
    }
    return <LineChart data={data} option={option} />
}

const RuleItem = withAuth(({ data, userAuth = {} }) => {
    return (
        <div className='rule-item' key={data.id}>
            <div className='rule-header'>
                <div className='rule-header-left'>
                    <div className='rule-title'>
                        <Tooltip title={data.desc}>{data.desc}</Tooltip>
                    </div>
                    <TagAttribute type='event' className='rule-type'>
                        {translateEventType(data.event_type)}
                    </TagAttribute>
                </div>
                <div className='rule-set operate-content-default'>
                    {userAuth.handle_auth && (
                        <TriggerEventModal
                            type={data.event_type}
                            id={data.id}
                            op='mod'
                        >
                            <EditOutlined />
                        </TriggerEventModal>
                    )}
                </div>
            </div>
            <div className='rule-info'>
                <div className='rule-info-item'>
                    <div className='rule-info-label'>检出事件级别</div>
                    <div className='rule-info-value'>
                        {translateEventLevel(data.event_level)}
                    </div>
                </div>
                <div className='rule-info-item'>
                    <div className='rule-info-label'>检出事件</div>
                    <div className='rule-info-value'>{data.value}</div>
                    <UnitContainer unit='件' />
                </div>
            </div>
            <div className='rule-chart'>
                <div className='rule-chart-title'>检出事件趋势</div>
                <div className='rule-chart-body'>
                    <EventChart data={data.data} />
                </div>
            </div>
        </div>
    )
})

const ConfigRuleFilter = inject('overviewMaStore')(
    observer(({ overviewMaStore }) => {
        const { changeFilterCondition } = overviewMaStore
        const [form, setForm] = useState(null)
        const getForm = useCallback(nowForm => {
            setForm(nowForm)
        }, [])
        const filterCondition = useMemo(() => {
            const eventTypeArr = Object.entries(EventConfig).map(d => ({
                name: d[1].name,
                value: d[0],
            }))

            return [
                {
                    name: 'name',
                    label: '规则查询',
                    content: <Input allowClear />,
                    type: 'custom',
                    basic: true,
                },
                {
                    name: 'status',
                    label: '启用状态',
                    content: (
                        <Radio.Group
                            onChange={() => {
                                form.submit()
                            }}
                        >
                            <Radio value=''>全部</Radio>
                            <Radio value='ON'>启用</Radio>
                            <Radio value='OFF'>关闭</Radio>
                        </Radio.Group>
                    ),
                    type: 'custom',
                    basic: true,
                },
                {
                    name: 'type',
                    label: '事件类型',
                    type: 'tag',
                    tagArr: eventTypeArr,
                    basic: true,
                },
            ]
        }, [form])

        return (
            <Section title='事件规则有效性' className='filter-form'>
                <FormFilter
                    getForm={getForm}
                    formContent={filterCondition}
                    callback={changeFilterCondition}
                    filterBarWrapperSelector='.rule-filter-condition'
                    formAttr={{
                        initialValues: { status: '' },
                    }}
                />
            </Section>
        )
    })
)

function ConfigRule({ useRuleData, params }) {
    return (
        <div className={style.rule}>
            <ConfigRuleFilter />
            <div className='rule-filter-condition' />
            <Section className='rule-body'>
                <div className='rule-body-time-title'>
                    检出事件时间范围：
                    <span className='rule-body-time-text'>
                        {moment(params.starttime * 1000).format(
                            'YYYY-MM-DD hh:mm:ss'
                        )}
                        ~
                        {moment(params.endtime * 1000).format(
                            'YYYY-MM-DD hh:mm:ss'
                        )}
                    </span>
                </div>
                <List
                    grid={{ gutter: 16, column: 5 }}
                    dataSource={useRuleData}
                    renderItem={d => (
                        <List.Item>
                            <RuleItem data={d} />
                        </List.Item>
                    )}
                    pagination={{
                        pageSize: 10,
                    }}
                />
            </Section>
        </div>
    )
}
export default inject(props => ({
    useRuleData: props.overviewMaStore.useRuleData,
    params: props.overviewMaStore.params,
}))(observer(ConfigRule))

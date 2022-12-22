import { TriggerEventModal } from '@/components/modals'
import { singleHandleEvent } from '@/utils/methods-event'
import { SettingOutlined } from '@ant-design/icons'
import { translateEventProcess } from '@shadowflow/components/system/event-system'
import withAuth from '@shadowflow/components/ui/container/with-auth'
import { HackerIcon } from '@shadowflow/components/ui/icon/icon-util'
import Section from '@shadowflow/components/ui/layout/section'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import { Button, Descriptions, Tabs, Tooltip, Input, Space } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useMemo, useState } from 'react'
import ViewReport from '../view-report'
import style from './index.module.less'

const { TabPane } = Tabs
const { TextArea } = Input
function EventInfo({ originRecordData, userAuth = {} }) {
    const { handle_auth = false } = useMemo(() => userAuth, [userAuth])
    const descriptionsList = useMemo(() => {
        const {
            show_type,
            detailType = [],
            show_model,
            desc,
            show_level,
            show_starttime,
            show_endtime,
            show_duration,
            show_is_alive,
            event_id,
            type,
            id,
            extraInfo = '',
            stage,
        } = originRecordData
        return {
            事件编号: <div className='event-id'>{`#${id}`}</div>,
            攻击阶段: (
                <div className='attack-color'>
                    {stage} <HackerIcon />
                </div>
            ),
            事件类型: <TagAttribute type='event'>{show_type}</TagAttribute>,
            详细类型: (
                <>
                    {detailType.map(detailItem => (
                        <TagAttribute type='eventDetail' key={detailItem}>
                            {detailItem}
                        </TagAttribute>
                    ))}
                </>
            ),
            检出手段: <TagAttribute type='asset'>{show_model}</TagAttribute>,
            描述信息: desc,
            告警级别: <TagAttribute>{show_level}</TagAttribute>,
            发生时间: show_starttime,
            结束时间: show_endtime,
            持续时长: show_duration,
            活跃状态: show_is_alive,
            扩展信息: extraInfo,
            检出配置: handle_auth ? (
                <>
                    <span>{`${show_type}配置`}</span>
                    <TriggerEventModal type={type} id={event_id} op='mod'>
                        <Tooltip title='编辑检出配置'>
                            <Button
                                icon={<SettingOutlined />}
                                type='link'
                                size='small'
                            />
                        </Tooltip>
                    </TriggerEventModal>
                </>
            ) : (
                '无'
            ),
        }
    }, [handle_auth, originRecordData])

    const tabList = useMemo(() => {
        return [
            {
                tab: '激活',
                key: 'unprocessed',
            },
            {
                tab: '确认',
                key: 'assigned',
            },
            {
                tab: '处理',
                key: 'processed',
            },
        ]
    }, [])

    const [statusLoading, setStatusLoading] = useState(false)
    const [currentStatus, setCurrentStatus] = useState('')

    useEffect(() => {
        setCurrentStatus(originRecordData.proc_status)
    }, [originRecordData.proc_status])

    return (
        <Section
            title='事件信息'
            className={`${style['event-info']} ${
                statusLoading ? 'app-loading' : ''
            }`}
        >
            <div className='event-info-top'>
                <div className='pro-status-box'>
                    <div className='pro-status-content'>
                        <span className='pro-status-text'>
                            {translateEventProcess(
                                originRecordData.proc_status
                            )}
                        </span>
                    </div>
                </div>
                <Descriptions
                    column={1}
                    size='small'
                    labelStyle={{ lineHeight: '24px' }}
                    contentStyle={{ lineHeight: '24px' }}
                >
                    {Object.entries(descriptionsList).map(item => {
                        const [title, content] = item
                        return (
                            <Descriptions.Item label={title} key={title}>
                                {content}
                            </Descriptions.Item>
                        )
                    })}
                </Descriptions>
            </div>
            {handle_auth && (
                <div className='event-info-center'>
                    <Tabs
                        activeKey={currentStatus}
                        centered
                        tabBarStyle={{ marginBottom: '5px' }}
                        onTabClick={setCurrentStatus}
                    >
                        {tabList.map(tabItem => {
                            return (
                                <TabPane tab={tabItem.tab} key={tabItem.key}>
                                    <TextArea
                                        defaultValue={
                                            originRecordData.proc_status ===
                                            tabItem.key
                                                ? originRecordData.proc_comment
                                                : ''
                                        }
                                        id={`${tabItem.key}_id`}
                                        className='proc-comment'
                                    />
                                    <div
                                        style={{
                                            textAlign: 'right',
                                            marginTop: '10px',
                                        }}
                                    >
                                        <Button
                                            type='primary'
                                            onClick={() => {
                                                singleHandleEvent({
                                                    proc_status: tabItem.key,
                                                    id: originRecordData.id,
                                                    changeLoading: setStatusLoading,
                                                    proc_comment: document.querySelector(
                                                        `#${tabItem.key}_id`
                                                    ).value,
                                                }).then(() => {
                                                    setStatusLoading(false)
                                                })
                                            }}
                                        >
                                            事件处置
                                        </Button>
                                    </div>
                                </TabPane>
                            )
                        })}
                    </Tabs>
                </div>
            )}
            <div className='event-info-bottom'>
                <Space size='middle'>
                    <ViewReport eventData={originRecordData} />
                </Space>
            </div>
        </Section>
    )
}

export default withAuth(
    inject(stores => ({
        originRecordData: stores.eventDetailStore.originRecordData,
    }))(observer(EventInfo))
)

import React, { useEffect, useMemo } from 'react'
import { inject, observer } from 'mobx-react'
import Score from '@/components/chart/chart-score'
import { Anchor, Tabs, Timeline } from 'antd'
import Section from '@shadowflow/components/ui/layout/section'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import { UpCircleOutlined } from '@ant-design/icons'
import { formateUTC } from '@shadowflow/components/utils/universal/methods-time'
import { AntdEmptySuper } from '@shadowflow/components/ui/antd-components-super'
import UnitContainer from '@shadowflow/components/ui/container/unit-container'
import style from './index.module.less'
import TiInfoStore from './store'
import TableList from './TableList'

const { TabPane } = Tabs

function ResultTi({ deviceInfo, tiLoading }) {
    const tiInfoStore = useMemo(() => new TiInfoStore(), [])

    useEffect(() => {
        tiInfoStore.start(deviceInfo)
    }, [deviceInfo, tiInfoStore])
    const { basicInfo, rank, SrcXTag, TagXSrc, detail } = tiInfoStore.tiInfo
    const handleClick = id => {
        const top = document.getElementById(id).getBoundingClientRect()
        window.scrollTo(top)
    }

    return (
        <div className={`${style.page} ${tiLoading ? 'app-loading' : ''}`}>
            <Section title='情报信息'>
                <div className='ti-top'>
                    <div className='ti-basic'>
                        {Object.entries(basicInfo).map(infoItem => {
                            const [label, value] = infoItem
                            return (
                                <div className='ti-basic-item' key={label}>
                                    <span>{label}：</span>

                                    {label === '情报类型' && value !== '--' ? (
                                        <TagAttribute type='sfaeTi'>
                                            {value}
                                        </TagAttribute>
                                    ) : (
                                        <span className='ti-basic-text'>
                                            {label === '情报数据' &&
                                            value !== '--' ? (
                                                <>
                                                    {value}
                                                    <UnitContainer unit='条' />
                                                </>
                                            ) : (
                                                value
                                            )}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div className='ti-score'>
                        <Score score={rank} />
                    </div>
                </div>
            </Section>
            <Section>
                <div className='ti-center'>
                    <Tabs defaultActiveKey='source' type='card'>
                        <TabPane tab='来源聚合' key='source'>
                            <div className='ti-center-item'>
                                {!SrcXTag.length ? (
                                    <AntdEmptySuper description='未查询到情报数据' />
                                ) : (
                                    <div>
                                        <div className='list-tag'>
                                            {SrcXTag.map(sd => {
                                                return (
                                                    <Anchor
                                                        affix={false}
                                                        offsetTop={60}
                                                        className='list-tag-item'
                                                        key={sd.name}
                                                    >
                                                        <TagAttribute
                                                            className='list-tag-name'
                                                            src={sd.name}
                                                            type='asset'
                                                        >
                                                            <div
                                                                onClick={() => {
                                                                    handleClick(
                                                                        sd.name
                                                                    )
                                                                }}
                                                            >
                                                                {`${sd.name}(${sd.data.length})`}
                                                            </div>
                                                        </TagAttribute>
                                                        :
                                                        <>
                                                            {sd.child.map(
                                                                td => (
                                                                    <TagAttribute
                                                                        key={td}
                                                                        type='event'
                                                                        className='list-tag-name'
                                                                    >
                                                                        <div
                                                                            onClick={() => {
                                                                                handleClick(
                                                                                    sd.name
                                                                                )
                                                                            }}
                                                                        >
                                                                            {`${td}`}
                                                                        </div>
                                                                    </TagAttribute>
                                                                )
                                                            )}
                                                        </>
                                                    </Anchor>
                                                )
                                            })}
                                        </div>
                                        <TableList tableData={SrcXTag} />
                                    </div>
                                )}
                            </div>
                        </TabPane>
                        <TabPane tab='标签聚合' key='tag'>
                            <div className='ti-center-item'>
                                {!TagXSrc.length ? (
                                    <AntdEmptySuper description='未查询到情报数据' />
                                ) : (
                                    <div>
                                        <div className='list-tag'>
                                            {TagXSrc.map(td => {
                                                return (
                                                    <Anchor
                                                        affix={false}
                                                        offsetTop={60}
                                                        className='list-tag-item'
                                                        key={td.name}
                                                    >
                                                        <TagAttribute
                                                            type='event'
                                                            className='list-tag-name'
                                                        >
                                                            <div
                                                                onClick={() => {
                                                                    handleClick(
                                                                        td.name
                                                                    )
                                                                }}
                                                            >
                                                                {`${td.name}(${td.data.length})`}
                                                            </div>
                                                        </TagAttribute>
                                                        :
                                                        {td.child.map(sd => (
                                                            <TagAttribute
                                                                type='asset'
                                                                className='list-tag-name'
                                                                key={sd}
                                                            >
                                                                <div
                                                                    onClick={() => {
                                                                        handleClick(
                                                                            td.name
                                                                        )
                                                                    }}
                                                                >
                                                                    {`${sd}`}
                                                                </div>
                                                            </TagAttribute>
                                                        ))}
                                                    </Anchor>
                                                )
                                            })}
                                        </div>
                                        <TableList tableData={TagXSrc} />
                                    </div>
                                )}
                            </div>
                        </TabPane>
                        <TabPane tab='时间线' key='timeline'>
                            <div className='ti-center-item'>
                                {!detail.length ? (
                                    <AntdEmptySuper description='未查询到情报数据' />
                                ) : (
                                    <Timeline
                                        mode='alternate'
                                        style={{
                                            paddingTop: '16px',
                                            minHeight: '184px',
                                        }}
                                    >
                                        {detail.map(tiItem => {
                                            const { time, tag, src } = tiItem
                                            return (
                                                <Timeline.Item
                                                    dot={<UpCircleOutlined />}
                                                    key={`${src}_${tag}_${time}`}
                                                >
                                                    {src}：
                                                    <TagAttribute type='event'>
                                                        {tag}
                                                    </TagAttribute>
                                                    <div className='line-time'>
                                                        {formateUTC(time)}
                                                    </div>
                                                </Timeline.Item>
                                            )
                                        })}
                                    </Timeline>
                                )}
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </Section>
        </div>
    )
}

export default inject(stores => ({
    deviceInfo: stores.resultStore.deviceInfo,
    tiLoading: stores.resultStore.basicLoading,
}))(observer(ResultTi))

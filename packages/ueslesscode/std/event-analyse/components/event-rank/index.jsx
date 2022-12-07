import Section from '@shadowflow/components/ui/layout/section'
import { Badge, List, Tabs } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { Fragment } from 'react'

const { TabPane } = Tabs

function EventRank({ history }) {
    const { path, range, device } = history.find(d => d.active).eventRank
    return (
        <Section title='设备排行Top10'>
            <Tabs defaultActiveKey='1' centered>
                <TabPane tab='攻击路径' key='1'>
                    <List
                        className='attack-path'
                        itemLayout='horizontal'
                        dataSource={path.slice(0, 10)}
                        size='small'
                        renderItem={(d, i) => (
                            <List.Item>
                                <Badge
                                    count={i + 1}
                                    className={`${i > 2 ? 'back' : 'prev'}`}
                                />
                                <span className='path'>
                                    {d.path.map((d1, j) => {
                                        const key = `${d.path
                                            .map(d2 => d2.device)
                                            .join('-')}-${d1.device}`
                                        return (
                                            <Fragment key={key}>
                                                {d1.device}
                                                {j < d.path.length - 1 && (
                                                    <span
                                                        className='path-type'
                                                        size='small'
                                                        color='red'
                                                    >
                                                        {d.path[j + 1].type}
                                                    </span>
                                                )}
                                            </Fragment>
                                        )
                                    })}
                                </span>
                            </List.Item>
                        )}
                    />
                </TabPane>
                <TabPane tab='攻击范围' key='2'>
                    <List
                        className='attack-range'
                        itemLayout='horizontal'
                        dataSource={range.slice(0, 10)}
                        size='small'
                        renderItem={(d, i) => (
                            <List.Item>
                                <Badge
                                    count={i + 1}
                                    className={`${i > 2 ? 'back' : 'prev'}`}
                                />
                                <span className='name'>{d.name}</span>
                                <span className='value'>{d.value}</span>
                            </List.Item>
                        )}
                    />
                </TabPane>
                <TabPane tab='设备事件量' key='3'>
                    <List
                        itemLayout='horizontal'
                        dataSource={device.slice(0, 10)}
                        size='small'
                        renderItem={(d, i) => (
                            <List.Item>
                                <Badge
                                    count={i + 1}
                                    className={`${i > 2 ? 'back' : 'prev'}`}
                                />
                                <span className='name'>{d.name}</span>
                                <span className='value'>{d.value}</span>
                            </List.Item>
                        )}
                    />
                </TabPane>
                {/* <TabPane tab='疑似APT' key='4'>
                    <List
                        itemLayout='horizontal'
                        dataSource={APT.splice(0, 10)}
                        renderItem={item => <List.Item>{item}</List.Item>}
                    />
                </TabPane> */}
            </Tabs>
        </Section>
    )
}
export default inject(stores => ({
    history: stores.eventAnalyseStore.history,
}))(observer(EventRank))

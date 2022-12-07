import React from 'react'
import { inject, observer } from 'mobx-react'
import { Drawer, Form, Switch, Select, Slider, Checkbox } from 'antd'
import style from './index.module.less'

function GraphSetting({
    visible,
    graphSetting,
    changeGraphSetting,
    closeSetting,
    sizeDict,
}) {
    const [form] = Form.useForm()
    function setGraph() {
        const value = form.getFieldsValue()
        changeGraphSetting(value)
    }
    return (
        <Drawer
            getContainer={false}
            title='图设置'
            placement='right'
            visible={visible}
            onClose={closeSetting}
            width='25%'
            className={style['an-setting']}
        >
            <Form
                onValuesChange={setGraph}
                form={form}
                initialValues={graphSetting}
            >
                <div className='setting-item'>
                    <div className='setting-item-name'>界面显示</div>
                    <div className='setting-item-content'>
                        <Form.Item
                            label='节点名称'
                            name='showLabel'
                            valuePropName='checked'
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            label='攻击类型'
                            name='showType'
                            valuePropName='checked'
                        >
                            <Switch />
                        </Form.Item>
                    </div>
                </div>
                <div className='setting-item'>
                    <div className='setting-item-name'>视觉通道</div>
                    <div className='setting-item-content'>
                        <Form.Item label='颜色' name='color'>
                            <Select>
                                <Select.Option value='nodeType'>
                                    资产/威胁/未知
                                </Select.Option>
                                <Select.Option value='eventType'>
                                    事件类型
                                </Select.Option>
                                <Select.Option value='attackType'>
                                    攻击方/受害方
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label='大小' name='size'>
                            <Select>
                                {Object.entries(sizeDict).map(d => (
                                    <Select.Option value={d[0]} key={d[0]}>
                                        {d[1]}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                </div>
                <div className='setting-item'>
                    <div className='setting-item-name'>图属性</div>
                    <div className='setting-item-content'>
                        <Form.Item
                            label='向心力'
                            name='center'
                            valuePropName='checked'
                        >
                            <Checkbox />
                        </Form.Item>
                        <Form.Item
                            label='拖拽锁定'
                            name='drag'
                            valuePropName='checked'
                        >
                            <Checkbox />
                        </Form.Item>
                        <Form.Item label='连线长度' name='distance'>
                            <Slider min={0} max={150} />
                        </Form.Item>
                        <Form.Item label='电荷力' name='strength'>
                            <Slider
                                min={-200}
                                max={200}
                                tipFormatter={value => {
                                    return `${
                                        value > 0 ? '引力' : '斥力'
                                    }: ${Math.abs(value)}`
                                }}
                            />
                        </Form.Item>
                        <Form.Item label='节点间距' name='collide'>
                            <Slider min={0} max={30} />
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </Drawer>
    )
}

export default inject(stores => ({
    visible: stores.eventLinkStore.settingVis,
    closeSetting: stores.eventLinkStore.closeSetting,
    graphSetting: stores.eventLinkStore.graphSetting,
    changeGraphSetting: stores.eventLinkStore.changeGraphSetting,
    sizeDict: stores.eventLinkStore.sizeDict,
}))(observer(GraphSetting))

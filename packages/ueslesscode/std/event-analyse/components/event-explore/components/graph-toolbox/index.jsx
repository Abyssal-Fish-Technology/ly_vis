import React, { useEffect, useState } from 'react'
import { SettingOutlined } from '@ant-design/icons'
import { Form, Button, Input, Select } from 'antd'
import { inject, observer } from 'mobx-react'
import style from './index.module.less'

function Toolbox({
    observableIp,
    changeObservableIp,
    openSetting,
    graphSetting,
    changeGraphSetting,
    sizeDict,
}) {
    const [searchDevice, setsearchDevice] = useState()
    useEffect(() => {
        setsearchDevice(observableIp)
    }, [observableIp])
    const [form] = Form.useForm()
    function setGraph() {
        const value = form.getFieldsValue()
        changeGraphSetting({
            ...graphSetting,
            ...value,
        })
    }
    return (
        <div className={`${style['chart-tools']}`}>
            <div className='chart-tools-item'>
                <Input.Search
                    placeholder='请输入查询IP'
                    value={searchDevice}
                    onChange={e => {
                        setsearchDevice(e.target.value)
                    }}
                    onSearch={e => {
                        changeObservableIp(e)
                    }}
                />
            </div>
            <Form
                onValuesChange={setGraph}
                form={form}
                layout='inline'
                initialValues={graphSetting}
            >
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
            </Form>
            <div className='chart-tools-item' onClick={openSetting}>
                <SettingOutlined />
                更多设置
            </div>
            {/* <div className='chart-tools-item aggre-select'>
                <HeatMapOutlined />
                聚类
                <Select
                    size='small'
                    defaultValue=''
                    width='100'
                    // onChange={type => {
                    //     if (type) {
                    //         setkillChain(type)
                    //     } else {
                    //         setkillChain(false)
                    //     }
                    // }}
                >
                    <Select.Option value=''>无</Select.Option>
                    <Select.Option value='stage'>攻击链</Select.Option>
                    <Select.Option value='eventType'>事件类型</Select.Option>
                </Select>
            </div> */}
            <Button
                type='primary'
                size='small'
                onClick={() => changeObservableIp('')}
            >
                刷新
            </Button>
        </div>
    )
}

export default inject(stores => ({
    observableIp: stores.eventAnalyseStore.observableIp,
    changeObservableIp: stores.eventAnalyseStore.changeObservableIp,
    openSetting: stores.eventLinkStore.openSetting,
    graphSetting: stores.eventLinkStore.graphSetting,
    changeGraphSetting: stores.eventLinkStore.changeGraphSetting,
    sizeDict: stores.eventLinkStore.sizeDict,
}))(observer(Toolbox))

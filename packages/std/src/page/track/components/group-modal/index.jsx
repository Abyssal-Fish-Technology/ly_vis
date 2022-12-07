import { moApi } from '@/service'
import { DoubleRightOutlined } from '@ant-design/icons'
import { Button, Form, message, Modal, Select } from 'antd'
import { chain } from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useState } from 'react'

const { Option } = Select

export const UpdateGroup = inject('configStore')(
    observer(({ selection, configStore }) => {
        const { changeData, moGroup, mo } = configStore
        const [form] = Form.useForm()
        const [visible, setVisible] = useState(false)

        function onOpen() {
            setVisible(true)
        }
        function onClose() {
            setVisible(false)
        }

        function onUpdate() {
            const groupid = form.getFieldValue('groupid')
            const updateData = chain(mo)
                .filter(d => selection.includes(d.id))
                .map(item => {
                    return { ...item, groupid }
                })
                .value()
            const promiseArr = []
            updateData.forEach(item => {
                promiseArr.push(
                    moApi({
                        op: 'mod',
                        moid: item.id,
                        ...item,
                    })
                )
            })
            return Promise.all(promiseArr).then(() => {
                message.success('操作成功！')
                moApi().then(res => {
                    changeData({ mo: res })
                })
            })
        }

        return (
            <>
                <Button
                    type='link'
                    size='small'
                    icon={<DoubleRightOutlined />}
                    onClick={onOpen}
                >
                    移动分组
                </Button>
                <Modal
                    title='移动分组'
                    okText='确定'
                    visible={visible}
                    onCancel={onClose}
                    onOk={onUpdate}
                    width={400}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 16 }}
                    >
                        <Form.Item name='groupid' label='追踪分组'>
                            <Select placeholder='选择分组'>
                                {moGroup.map(item => {
                                    return (
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        )
    })
)

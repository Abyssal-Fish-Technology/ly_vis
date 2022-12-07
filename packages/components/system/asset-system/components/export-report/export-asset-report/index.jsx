import React, { useEffect, useState } from 'react'
import { inject, observer, Provider } from 'mobx-react'
import { Checkbox, Form, message, Modal } from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import moment from 'moment'
import { rountTime5Min } from '@shadowflow/components/utils/universal/methods-time'
import assetReportStore from './store'
import Report from './report'
import ReportForm from './form'
import { getTopToolBoxParams } from '../../../../../utils/universal/methods-storage'

function ExportAssetReport({ configStore }) {
    const { internal, device } = configStore
    const [form] = Form.useForm()

    const [visible, setVisible] = useState(false)

    const [reportVisible, setReportVisible] = useState(false)

    const [loading, setLoading] = useState(false)

    function onOpen() {
        setVisible(true)
    }

    function onOk() {
        setLoading(true)
        const { time, devid, detail } = form.getFieldsValue()
        const { name, ip, port } =
            device.find(d => String(d.id) === String(devid)) || {}
        assetReportStore.changeData({
            condition: {
                time: time.map(t => rountTime5Min(t.unix())),
                devid,
            },
            timeRange: time.map(t => t.format('YYYY-MM-DD HH:mm:ss')),
            deviceInfo: `${name}(${ip}:${port})`,
            internal,
            detail,
        })

        assetReportStore
            .initData()
            .then(() => {
                setReportVisible(true)
                message.success('导出成功!')
                setVisible(false)
            })
            .catch(err => {
                console.log(err)
                setLoading(false)
                message.success('导出失败!')
            })
            .finally(() => {
                setReportVisible(false)
            })
    }

    function reportCallback() {
        setReportVisible(false)
        setLoading(false)
    }

    useEffect(() => {
        if (!visible) return
        const { starttime, endtime, devid } = getTopToolBoxParams() || {}
        const time = [starttime, endtime].map(t => moment.unix(t))
        form.setFieldsValue({
            time,
            devid,
        })
    }, [form, visible])

    return (
        <Provider assetReportStore={assetReportStore}>
            <div onClick={onOpen}>导出报告</div>
            <Modal
                title='资产报告'
                okText='导出'
                forceRender
                visible={visible}
                onCancel={() => setVisible(false)}
                onOk={onOk}
                maskClosable={false}
                okButtonProps={{
                    loading,
                    icon: <ExportOutlined />,
                }}
            >
                <ReportForm
                    form={form}
                    extraItem={
                        <>
                            <Form.Item
                                label='细节列表'
                                name='detail'
                                valuePropName='checked'
                            >
                                <Checkbox />
                            </Form.Item>
                        </>
                    }
                />
            </Modal>
            {reportVisible && <Report callback={reportCallback} />}
        </Provider>
    )
}

export default inject('configStore')(observer(ExportAssetReport))

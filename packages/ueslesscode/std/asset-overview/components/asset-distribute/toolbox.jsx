import React, { useState } from 'react'
import { Form, Button, Checkbox, Switch } from 'antd'
import html2canvas from 'html2canvas'
import { DownloadOutlined } from '@ant-design/icons'

export default function ToolBox({ form, chartEle }) {
    const [downloadLoading, setDownloadLoading] = useState(false)
    function onDownLoad() {
        if (chartEle && chartEle.current) setDownloadLoading(true)
        html2canvas(chartEle.current).then(canvas => {
            const a = document.createElement('a')
            a.download = `资产分布图.png`
            a.href = canvas.toDataURL()
            a.click()
            setDownloadLoading(false)
        })
    }
    return (
        <Form form={form}>
            <Form.Item label='关联事件' name='event' valuePropName='checked'>
                <Checkbox />
            </Form.Item>
            <Form.Item label='分布方式' name='type' valuePropName='checked'>
                <Switch checkedChildren='ip段' unCheckedChildren='资产组' />
            </Form.Item>
            <Form.Item label='导出图片'>
                <Button
                    type='primary'
                    icon={<DownloadOutlined />}
                    loading={downloadLoading}
                    onClick={onDownLoad}
                >
                    下载
                </Button>
            </Form.Item>
            <Form.Item label='展示细节' name='detail' valuePropName='checked'>
                <Switch checkedChildren='开' unCheckedChildren='关' />
            </Form.Item>
        </Form>
    )
}

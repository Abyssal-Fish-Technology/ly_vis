import React, { useState } from 'react'
import { rountTime5Min } from '@shadowflow/components/utils/universal/methods-time'
import { Modal, Form, message } from 'antd'
import XLSX from 'xlsx'
import ModalContent from './modal'
import { getSheetData, getAssetData, getAssetTypeName } from './config'
import './index.less'

export default function ExportAssetList() {
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    function onOk() {
        setLoading(true)
        const {
            time,
            fields,
            assetType,
            is_alive,
            devid,
            filetype,
        } = form.getFieldsValue()
        const timeRange = time.map(t => rountTime5Min(t.unix()))
        const timeRangeStr = time.map(t => t.format('MM-DD_HH-mm')).join('----')
        const params = {
            devid,
            is_alive,
            starttime: timeRange[0],
            endtime: timeRange[1],
        }
        const srvAskHostOrUrl = {
            host: false,
            url: false,
        }
        if (assetType === 'srv') {
            if (fields.find(d => ['hostCount', 'host'].includes(d))) {
                srvAskHostOrUrl.host = true
            }
            if (fields.find(d => ['urlCount', 'url'].includes(d))) {
                srvAskHostOrUrl.url = true
            }
        }

        const typeName = getAssetTypeName(assetType)
        getAssetData(assetType, params, srvAskHostOrUrl)
            .then(res => {
                const { data = [] } = getSheetData(assetType, ...res, fields)

                const SheetNames = [typeName]
                const Sheets = {}
                Sheets[typeName] = XLSX.utils.json_to_sheet(data)
                message.success('导出成功')
                setVisible(false)
                XLSX.writeFile(
                    {
                        SheetNames,
                        Sheets,
                    },
                    `${typeName}_${timeRangeStr}.${filetype}`
                )
            })
            .catch(e => {
                console.log(e)
                message.error('请求数据失败，请重新导出！')
            })
            .finally(() => {
                setLoading(false)
            })
    }

    function onCancel() {
        setVisible(false)
    }

    function onClick() {
        setVisible(true)
    }

    return (
        <span>
            <span onClick={onClick}>资产列表</span>
            <Modal
                width={850}
                title='导出资产列表'
                okText='导出'
                visible={visible}
                onOk={onOk}
                onCancel={onCancel}
                okButtonProps={{
                    loading,
                }}
                maskClosable={false}
            >
                <ModalContent form={form} />
            </Modal>
        </span>
    )
}

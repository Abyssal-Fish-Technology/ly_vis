import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import { Button, Col, Input, message, Modal, Row, Upload } from 'antd'
import { chain } from 'lodash'
import { observer } from 'mobx-react'
import React, { useState } from 'react'
import XLSX from 'xlsx'
import importStore from './store'
import style from './index.module.less'

const { Dragger } = Upload

function ImportModal() {
    const { visible, updateVisible, setImportData, sendPostFun } = importStore
    const [fileList, setFileList] = useState([])
    const [errorList, setErrorList] = useState([])
    const [disabled, setDisabled] = useState(true)
    const [showUploadList, setShowUploadList] = useState(false)
    const [confirmLoading, setConfirmLoading] = useState(false)

    const ReaderFile = async file => {
        return new Promise(resolve => {
            const reader = new FileReader()
            reader.readAsBinaryString(file) // readAsBinaryString(file)：将文件读取为二进制字符串
            reader.onload = e => {
                const data = e.target.result
                // XLSX.read获得 workbook对象，指的是整份Excel文档,并将其解析为二进制字符串
                const wb = XLSX.read(data, {
                    type: 'binary',
                })
                // wb.SheetNames[0]是获取第一个表名
                // wb.Sheets[表名]获取第一个表的数据
                // XLSX.utils.sheet_to_json生成一个对象数组，JSON.stringify解析为json对象
                const json = XLSX.utils.sheet_to_json(
                    wb.Sheets[wb.SheetNames[0]]
                )
                resolve(json)
            }
        })
    }

    return (
        <Modal
            title='批量新增'
            visible={visible}
            okText='导入'
            okButtonProps={{
                disabled,
            }}
            confirmLoading={confirmLoading}
            cancelText='取消'
            onCancel={() => {
                setFileList([])
                setImportData([])
                updateVisible(false)
                setShowUploadList(false)
            }}
            onOk={() => {
                setConfirmLoading(true)
                sendPostFun().then(() => {
                    setConfirmLoading(false)
                })
            }}
            className={style.fileModal}
            bodyStyle={{ paddingTop: '10px' }}
        >
            <Row
                gutter={[16, 16]}
                style={{ marginBottom: '15px' }}
                align='middle'
            >
                <Col span={4}>模板下载：</Col>
                <Col span={16}>
                    <Button
                        icon={<DownloadOutlined />}
                        style={{ marginRight: '15px' }}
                        size='small'
                        href='./template/Mo数据模板.xlsx'
                    >
                        .xlsx模板
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        size='small'
                        href='./template/Mo数据模板.csv'
                    >
                        .csv模板
                    </Button>
                </Col>
            </Row>
            <Dragger
                accept='.xlsx,.csv'
                beforeUpload={file => {
                    ReaderFile(file).then(res => {
                        const errorArr = []
                        res.forEach((item, index) => {
                            const {
                                moip,
                                moport,
                                pip,
                                pport,
                                groupid,
                                direction,
                            } = item
                            const fieldArr = []
                            if (!moip && !moport && !pip && !pport) {
                                fieldArr.push(
                                    `"moip、moport、pip、pport"字段中至少填一个`
                                )
                            }
                            if (!groupid) {
                                fieldArr.push(`必填字段"groupid"`)
                            }
                            if (!direction) {
                                fieldArr.push(`必填字段"direction"`)
                            }
                            if (fieldArr.length) {
                                errorArr.push(
                                    `第${index + 1}条数据${fieldArr.join(',')}`
                                )
                            }
                        })
                        setErrorList(errorArr)
                        setDisabled(errorArr.length)
                        setShowUploadList(!errorArr.length)
                        if (errorArr.length > 0) {
                            message.warning('请确保上传数据的正确性！')
                            Promise.reject()
                            return Upload.LIST_IGNORE
                        }
                        const resultData = chain(res)
                            .map((currentValue, index) => {
                                return { [index]: currentValue }
                            })
                            .reduce((obj, arr) => {
                                Object.entries(arr).forEach(item => {
                                    const [key, value] = item
                                    obj[key] = value
                                })
                                return obj
                            }, {})
                            .value()
                        setImportData(resultData)

                        return setFileList([file])
                    })
                }}
                showUploadList={showUploadList}
                fileList={fileList}
                onRemove={() => {
                    setFileList([])
                    setImportData([])
                }}
            >
                <p className='ant-upload-drag-icon'>
                    <InboxOutlined />
                </p>
                <p className='ant-upload-text'>
                    点击或拖动文件到此区域内以上传
                </p>
                <p className='ant-upload-hint'>
                    仅支持单个文件上传（仅支持.xlsx和.csv格式的文件）！
                </p>
            </Dragger>
            {errorList.length > 0 && (
                <div className='fileuploader-error'>
                    <div className='fileuploader-header'>
                        {' '}
                        存在错误数据 {errorList.length} 条，具体如下:
                    </div>
                    <Input.TextArea
                        disabled
                        value={errorList.join('\n')}
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        className='error-info'
                    />
                </div>
            )}
        </Modal>
    )
}

export default observer(ImportModal)

export function showImportModal(devid, successFun) {
    return importStore.updateVisible(true, devid, successFun)
}

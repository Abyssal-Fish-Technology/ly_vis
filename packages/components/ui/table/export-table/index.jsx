import { Button, Checkbox, Form, Modal, Radio, Switch } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { chain } from 'lodash'
import XLSX from 'xlsx'
import { DownloadOutlined } from '@ant-design/icons'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import {
    formatTimestamp,
    formatDuration,
} from '@shadowflow/components/utils/universal/methods-time'
import moment from 'moment'
import style from './index.module.less'

const formatMap = {
    bytes: value => arrangeAlerm(value),
    pkts: value => arrangeAlerm(value),
    flows: value => arrangeAlerm(value),
    time: value => formatTimestamp(value),
    duration: value => formatDuration(value),
}

function formatValue(key, value) {
    const formatFun = formatMap[key]
    return formatFun ? formatFun(value) : value
}

function ExportTableComponent({
    fields = [],
    exportData = [],
    selectData = [],
    originalData = [],
    selectOriginalData = [],
    fileName = '导出数据',
}) {
    const [visible, setVisible] = useState(false)
    const [form] = Form.useForm()

    const [dataType, setDataType] = useState('table')

    const oriFields = useMemo(() => {
        if (originalData.length) {
            return Object.keys(originalData[0]).map(d => {
                return { label: d, value: d }
            })
        }
        return []
    }, [originalData])

    const useFields = useMemo(() => {
        return dataType === 'table' ? fields : oriFields
    }, [dataType, fields, oriFields])

    const fieldsMap = useMemo(
        () =>
            useFields.reduce((obj, d) => {
                obj[d.value] = d.label
                return obj
            }, {}),
        [useFields]
    )

    function handleFn(key) {
        setDataType(key)
    }

    const [noSelected, setNoSelected] = useState(true)
    useEffect(() => {
        setNoSelected(!selectData.length)
    }, [selectData.length])

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                exportFields: useFields.map(d => d.value),
                allChecked: true,
            })
        }
    }, [useFields, form, visible])

    function onOpen() {
        setVisible(true)
    }
    function onClose() {
        setVisible(false)
    }

    function onExport() {
        const { fileSuffix, exportFields, exportType } = form.getFieldsValue()
        const header = useFields
            .filter(d => exportFields.includes(d.value))
            .map(d => d.label)
        const calculateResultData = data => {
            return data.map(d =>
                chain(d)
                    .pick(exportFields)
                    .reduce((obj, d1, k) => {
                        obj[fieldsMap[k]] = formatValue(k, d1).toString()
                        return obj
                    }, {})
                    .value()
            )
        }
        const currentTableData = exportType === 'all' ? exportData : selectData

        const currentOriginalData =
            exportType === 'all' ? originalData : selectOriginalData

        const useData =
            dataType === 'table'
                ? calculateResultData(currentTableData)
                : calculateResultData(currentOriginalData)
        const sheet = XLSX.utils.json_to_sheet(useData, {
            header,
        })
        const nowFileName =
            dataType === 'table' ? `${fileName}` : `原始${fileName}`
        const resultFileName = `${nowFileName}_${moment().format(
            'YYYY-MM-DD_HH:mm:ss'
        )}`
        const workbook = XLSX.utils.book_new()

        XLSX.utils.book_append_sheet(workbook, sheet, resultFileName)

        XLSX.writeFile(workbook, `${resultFileName}.${fileSuffix}`)
    }

    return (
        <>
            <Button type='primary' icon={<DownloadOutlined />} onClick={onOpen}>
                导出数据
            </Button>
            <Modal
                title='数据导出'
                okText='导出'
                visible={visible}
                onCancel={onClose}
                onOk={onExport}
            >
                <ModalForm
                    form={form}
                    useFields={useFields}
                    noSelected={noSelected}
                    handleFn={handleFn}
                    dataType={dataType}
                    isChangeType={originalData.length > 0}
                />
            </Modal>
        </>
    )
}

function ModalForm({
    form,
    useFields,
    noSelected,
    handleFn,
    dataType,
    isChangeType,
}) {
    const [isCheckall, setIsCheckall] = useState(true)
    const [checkedvalues, setCheckvalues] = useState(
        useFields.map(item => item.value)
    )

    useEffect(() => {
        setCheckvalues(useFields.map(d => d.value))
    }, [dataType, form, useFields])

    useEffect(() => {
        if (isCheckall) {
            form.setFieldsValue({
                exportFields: useFields.map(d => d.value),
            })
        } else {
            form.setFieldsValue({
                exportFields: checkedvalues,
            })
        }
    }, [checkedvalues, useFields, form, isCheckall])

    useEffect(() => {
        form.setFieldsValue({
            allChecked: checkedvalues.length === useFields.length,
        })
        setIsCheckall(checkedvalues.length === useFields.length)
    }, [checkedvalues, useFields.length, form])

    const [radioDisabled, setRadioDisabled] = useState(true)
    useEffect(() => {
        form.setFieldsValue({ exportType: noSelected ? 'all' : 'select' })
        setRadioDisabled(noSelected)
    }, [noSelected, form])

    return (
        <Form
            form={form}
            name='export-table-modal-form'
            className={style['export-table-modal-form']}
        >
            <Form.Item name='exportType' label='导出方式' initialValue='all'>
                <Radio.Group>
                    <Radio value='all'>全量导出</Radio>
                    <Radio value='select' disabled={radioDisabled}>
                        {noSelected ? '选择导出（未选择数据）' : '选择导出'}
                    </Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item name='fileSuffix' label='文件类型' initialValue='xlsx'>
                <Radio.Group>
                    <Radio value='xlsx'>xlsx</Radio>
                    <Radio value='csv'>csv</Radio>
                </Radio.Group>
            </Form.Item>
            {isChangeType && (
                <Form.Item
                    name='dataType'
                    label='数据格式'
                    initialValue={dataType}
                >
                    <Radio.Group
                        onChange={e => {
                            handleFn(e.target.value)
                        }}
                    >
                        <Radio value='table'>表格数据</Radio>
                        <Radio value='original'>原始数据</Radio>
                    </Radio.Group>
                </Form.Item>
            )}
            <Form.Item name='allChecked' label='全选' valuePropName='checked'>
                <Switch
                    defaultChecked
                    onChange={checked => {
                        setIsCheckall(checked)
                        if (!checked) {
                            setCheckvalues([])
                        }
                    }}
                />
            </Form.Item>
            <Form.Item
                name='exportFields'
                label='导出字段'
                className='modal-form-item-fields'
            >
                <Checkbox.Group
                    options={useFields}
                    onChange={checkedvalue => {
                        setCheckvalues(checkedvalue)
                    }}
                />
            </Form.Item>
        </Form>
    )
}

export default ExportTableComponent

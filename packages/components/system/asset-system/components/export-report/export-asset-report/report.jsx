import { Descriptions, message } from 'antd'
import { map } from 'lodash'
import { MobXProviderContext, observer } from 'mobx-react'
import React, { useContext, useEffect, useRef } from 'react'
import html2Doc from 'html-docx-js/dist/html-docx'
import moment from 'moment'
import { AntdTableSuper } from '../../../../../ui/antd-components-super'

const keyMap = {
    'no-private': '内网',
    private: '互联网',
    ipv6: 'IPv6',
}

const publicColumns = [
    {
        title: '数量',
        dataIndex: 'value',
        align: 'center',
    },
]

const srvNameColumns = [
    {
        title: '服务名称',
        dataIndex: 'name',
        align: 'center',
    },
    ...publicColumns,
]
const srvTypeColumns = [
    {
        title: '服务类型',
        dataIndex: 'name',
        align: 'center',
    },
    ...publicColumns,
]
const midNameColumns = [
    {
        title: '中间件名称',
        dataIndex: 'name',
        align: 'center',
    },
    ...publicColumns,
]
const midTypeColumns = [
    {
        title: '中间件类型',
        dataIndex: 'name',
        align: 'center',
    },
    ...publicColumns,
]
const osNameColumns = [
    {
        title: '操作系统名称',
        dataIndex: 'name',
        align: 'center',
    },
    ...publicColumns,
]
const osTypeColumns = [
    {
        title: '操作系统类型',
        dataIndex: 'name',
        align: 'center',
    },
    ...publicColumns,
]
const devNameColumns = [
    {
        title: '设备/应用系统名称',
        dataIndex: 'name',
        align: 'center',
    },
    ...publicColumns,
]
const devTypeColumns = [
    {
        title: '设备/应用系统类型',
        dataIndex: 'name',
        align: 'center',
    },
    ...publicColumns,
]

function saveAs(obj, filename) {
    const link = document.createElement('a')
    link.download = filename
    link.href = URL.createObjectURL(obj)
    link.click()
    URL.revokeObjectURL(obj)
}

function Report({ callback }) {
    const { assetReportStore } = useContext(MobXProviderContext)
    const {
        overviewData,
        asset_data,
        srv_name_data,
        srv_type_data,
        host_data,
        url_data,
        os_name_data,
        os_type_data,
        dev_name_data,
        dev_type_data,
        midware_name_data,
        midware_type_data,
    } = assetReportStore
    const ref = useRef()

    useEffect(() => {
        function setTableStyle() {
            const bg = '#eee'

            const border = '1px solid #eee'

            const tables = ref.current.querySelectorAll('.export-table table')

            const overviewTable = ref.current.querySelector(
                '.export-overview-table'
            )

            const oTds = overviewTable.querySelectorAll('td')
            const oThs = overviewTable.querySelectorAll('th')
            const oth = overviewTable.querySelector('tr')

            oth.style.backgroundColor = bg
            ;[...oTds, ...oThs].forEach(ele => {
                ele.style['border-bottom'] = border
                ele.style['border-top'] = border
            })

            const oRangeTable = overviewTable.querySelector(
                '.export-overview-table-range'
            )

            const orTds = oRangeTable.querySelectorAll('td')
            const orThs = oRangeTable.querySelectorAll('th')
            ;[...orTds, ...orThs].forEach(ele => {
                ele.style.border = 'none'
                ele.style['text-align'] = 'left'
            })

            tables.forEach(table => {
                const trs = table.querySelectorAll('thead tr')
                trs.forEach(tr => {
                    tr.style.backgroundColor = bg
                })
                const tds = table.querySelectorAll('td')
                ;[...tds].forEach(element => {
                    element.style['border-bottom'] = border
                    element.style['border-top'] = border
                })
                const urlTds = table.querySelectorAll('td.td-url')
                if (urlTds) {
                    urlTds.forEach(td => {
                        Object.assign(td.style, {
                            width: '50%',
                            textAlign: 'left',
                            wordBreak: 'break-all',
                            whiteSpace: 'normal',
                        })
                    })
                }
            })
        }
        setTableStyle()
        try {
            const html = `<!DOCTYPE html>
                            <html>
                            <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1" />
                            <meta charset="UTF-8" />
                            <style>
                                .table-first-page {
                                    margin-top: 5cm;
                                    margin-bottom: 15cm
                                }
                                .table-first-page h1 {
                                    text-align: center;
                                }
                                .table-first-page p {
                                    text-align: right;
                                    margin-top: 5cm;
                                }
                                table {
                                    width: 100%;
                                    border-collapse: collapse;
                                }
                                table td, table th {
                                    margin: 10px 0;
                                    white-space: nowrap;
                                }
                            </style>
                            </head>
                            <body>${ref.current.outerHTML}<body>
                            </html>`
            const blob = html2Doc.asBlob(html)
            saveAs(blob, '被动资产发现报告.docx')
        } catch (e) {
            message.error('导出失败，请重新导出！')
        } finally {
            callback()
        }
    }, [callback])

    return (
        <div
            style={{
                fontFamily: 'sans-serif',
                position: 'fixed',
                left: 0,
                right: 0,
                overflow: 'visible',
                bottom: '100%',
            }}
        >
            <div ref={ref} className='export-asset-table'>
                <div>
                    <div className='table-first-page'>
                        <h1>被动资产发现报告</h1>
                        <p>{moment().format('YYYY-MM-DD HH:mm:ss')}</p>
                    </div>
                    <div>
                        <h2>1、报告总览</h2>
                        <Descriptions
                            column={1}
                            bordered
                            className='export-overview-table'
                        >
                            <Descriptions.Item
                                label='概述项'
                                className='export-overview-table-head'
                            >
                                <p>描述</p>
                            </Descriptions.Item>
                            <Descriptions.Item label='时间范围'>
                                <p>{overviewData.timeRange.join(' 至 ')}</p>
                            </Descriptions.Item>
                            <Descriptions.Item label='采集节点'>
                                <p>{overviewData.deviceInfo}</p>
                            </Descriptions.Item>
                            <Descriptions.Item label='资产统计'>
                                {asset_data.map(d => (
                                    <p key={d.name}>
                                        {d.name.toUpperCase()}：{d.value}
                                    </p>
                                ))}
                            </Descriptions.Item>
                            <Descriptions.Item label='资产检测范围'>
                                <Descriptions
                                    column={3}
                                    layout='vertical'
                                    className='export-overview-table-range'
                                >
                                    {map(overviewData.internal, (arr, k) => (
                                        <Descriptions.Item
                                            key={k}
                                            label={keyMap[k] || k}
                                        >
                                            {arr.map(d => (
                                                <p key={d.ip}>{d.ip}</p>
                                            ))}
                                        </Descriptions.Item>
                                    ))}
                                </Descriptions>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </div>

                <div>
                    <h2>2、服务</h2>
                    <p>
                        共检测出{srv_name_data.slice(1).length}种服务类型，
                        {midware_name_data.slice(1).length}种中间件类型，
                        {os_name_data.slice(1).length}种操作系统类型，
                        {dev_name_data.slice(1).length}种设备/应用系统类型。
                    </p>
                    <h3>2.1、服务名称</h3>
                    <p>共{srv_name_data.slice(1).length}条</p>
                    <AntdTableSuper
                        rowKey='name'
                        tableClassName='export-table'
                        dataSource={srv_name_data.slice(1)}
                        columns={srvNameColumns}
                        pagination={false}
                        scroll={false}
                    />
                    <h3>2.2、服务类型</h3>
                    <p>共{srv_type_data.slice(1).length}条</p>
                    <AntdTableSuper
                        rowKey='name'
                        tableClassName='export-table'
                        dataSource={srv_type_data.slice(1)}
                        columns={srvTypeColumns}
                        pagination={false}
                        scroll={false}
                    />
                    <h3>2.2、中间件名称</h3>
                    <p>共{midware_name_data.slice(1).length}条</p>
                    <AntdTableSuper
                        rowKey='name'
                        tableClassName='export-table'
                        dataSource={midware_name_data.slice(1)}
                        columns={midNameColumns}
                        pagination={false}
                        scroll={false}
                    />
                    <h3>2.3、中间件类型</h3>
                    <p>共{midware_type_data.slice(1).length}条</p>
                    <AntdTableSuper
                        rowKey='name'
                        tableClassName='export-table'
                        dataSource={midware_type_data.slice(1)}
                        columns={midTypeColumns}
                        pagination={false}
                        scroll={false}
                    />
                    <h3>2.4、设备/应用系统名称</h3>
                    <p>共{dev_name_data.slice(1).length}条</p>
                    <AntdTableSuper
                        rowKey='name'
                        tableClassName='export-table'
                        dataSource={dev_name_data.slice(1)}
                        columns={devNameColumns}
                        pagination={false}
                        scroll={false}
                    />
                    <h3>2.5、设备/应用系统类型</h3>
                    <p>共{dev_type_data.slice(1).length}条</p>
                    <AntdTableSuper
                        rowKey='name'
                        tableClassName='export-table'
                        dataSource={dev_type_data.slice(1)}
                        columns={devTypeColumns}
                        pagination={false}
                        scroll={false}
                    />
                    <h3>2.6、操作系统名称</h3>
                    <p>共{os_name_data.slice(1).length}条</p>
                    <AntdTableSuper
                        rowKey='name'
                        tableClassName='export-table'
                        dataSource={os_name_data.slice(1)}
                        columns={osNameColumns}
                        pagination={false}
                        scroll={false}
                    />
                    <h3>2.6、操作系统类型</h3>
                    <p>共{os_type_data.slice(1).length}条</p>
                    <AntdTableSuper
                        rowKey='name'
                        tableClassName='export-table'
                        dataSource={os_type_data.slice(1)}
                        columns={osTypeColumns}
                        pagination={false}
                        scroll={false}
                    />
                </div>
                <div>
                    <h2>3、HOST</h2>
                    <p>
                        共检测出{host_data[0].value}个HOST，
                        {host_data[1].value}
                        台HOST主机。
                    </p>
                </div>
                <div>
                    <h2>4、URL</h2>
                    <p>
                        共检测出{url_data[0].value}个URL，
                        {url_data[1].value}台URL主机。
                    </p>
                </div>
            </div>
        </div>
    )
}

export default observer(Report)

import { CaretDownOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import React from 'react'
import ExportAssetList from '../export-asset-list'
import ExportAssetReport from '../export-asset-report'

export default function ExportDrop() {
    return (
        <Dropdown
            overlay={
                <Menu>
                    <Menu.Item key='资产报告'>
                        <ExportAssetReport>资产报告</ExportAssetReport>
                    </Menu.Item>
                    <Menu.Item key='服务列表'>
                        <ExportAssetList />
                    </Menu.Item>
                </Menu>
            }
        >
            <Button>
                导出 <CaretDownOutlined />
            </Button>
        </Dropdown>
    )
}

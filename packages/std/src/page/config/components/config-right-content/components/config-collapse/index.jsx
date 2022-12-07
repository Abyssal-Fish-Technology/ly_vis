import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Button, Collapse } from 'antd'
import React, { useState } from 'react'

export default function ConfigCollapse({ title, context }) {
    const [collapseKey, setCollapseKey] = useState('')
    return (
        <div className='other-content'>
            <Collapse activeKey={collapseKey} ghost>
                <Collapse.Panel
                    header={null}
                    showArrow={false}
                    key='other-content'
                >
                    <div className='paragraph-title'>{title}：</div>
                    <div className='paragraph-content'>{context}</div>
                </Collapse.Panel>
            </Collapse>
            <Button
                className='other-btn'
                type='link'
                icon={collapseKey ? <UpOutlined /> : <DownOutlined />}
                size='large'
                onClick={() => {
                    setCollapseKey(collapseKey ? '' : 'other-content')
                }}
            />
        </div>
    )
}

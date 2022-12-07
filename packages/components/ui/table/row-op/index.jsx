import { MoreOutlined } from '@ant-design/icons'
import { Dropdown, Menu, message } from 'antd'
import React, { useRef, useMemo } from 'react'
import style from './index.module.less'

export default function RowOperate({ operations = [] }) {
    const container = useRef(null)
    const useOperations = useMemo(
        () => operations.filter(d => d.authority !== false),
        [operations]
    )
    return (
        <div
            onClick={e => {
                e.stopPropagation()
                if (!useOperations.length) {
                    message.warning('暂无操作权限，请联系管理员！')
                }
            }}
            ref={container}
            className='operate-content-active'
        >
            {useOperations.length === 1 ? (
                <span
                    onClick={useOperations[0].click}
                    className={style['operate-content-span']}
                >
                    {useOperations[0].icon || null}
                    {useOperations[0].child}
                </span>
            ) : (
                <Dropdown
                    disabled={!useOperations.length}
                    onClick={() => {
                        const classList = container.current.parentElement.parentElement.parentElement.querySelectorAll(
                            '.ant-table-cell-fix-right'
                        )
                        classList.forEach(d => {
                            d.classList.remove('zIndex')
                        })
                        container.current.parentElement.classList.add('zIndex')
                    }}
                    destroyPopupOnHide
                    overlay={
                        <Menu>
                            {useOperations.map(operItem => {
                                const {
                                    click = false,
                                    child,
                                    icon = false,
                                    keyValue = false,
                                } = operItem
                                return (
                                    <Menu.Item
                                        onClick={click}
                                        icon={icon}
                                        key={keyValue || child}
                                    >
                                        {child}
                                    </Menu.Item>
                                )
                            })}
                        </Menu>
                    }
                    trigger={['click']}
                    placement='bottomRight'
                >
                    <MoreOutlined
                        style={{
                            fontSize: '20px',
                        }}
                    />
                </Dropdown>
            )}
        </div>
    )
}

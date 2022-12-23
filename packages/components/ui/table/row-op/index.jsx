import { MoreOutlined } from '@ant-design/icons'
import { Dropdown, Menu } from 'antd'
import React, { useRef, useMemo } from 'react'
import withAuth from '../../container/with-auth'
import style from './index.module.less'

function RowOperate({ operations = [], userAuth = {} }) {
    const container = useRef(null)
    const useOperations = useMemo(() => {
        const { handle_auth = false, admin_auth = false } = userAuth
        return operations.filter(d => {
            const { key = '' } = d
            if (key.includes('auth_admin')) {
                return admin_auth
            }
            if (key.includes('auth')) {
                return handle_auth
            }
            return true
        })
    }, [operations, userAuth])
    return (
        <div ref={container} className='operate-content-active'>
            {useOperations.length === 1 ? (
                <span
                    onClick={e => {
                        e.stopPropagation()
                        if (useOperations[0].click) {
                            useOperations[0].click()
                        }
                    }}
                    className={style['operate-content-span']}
                >
                    {useOperations[0].icon || null}
                    {useOperations[0].child}
                </span>
            ) : (
                <Dropdown
                    disabled={!useOperations.length}
                    onClick={e => {
                        e.stopPropagation()
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
                                        onClick={e => {
                                            e.domEvent.stopPropagation()
                                            if (click) {
                                                click()
                                            }
                                        }}
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

export default withAuth(RowOperate)

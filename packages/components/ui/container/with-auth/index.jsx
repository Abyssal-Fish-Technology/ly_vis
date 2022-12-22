import React, { useMemo } from 'react'
import { inject, observer } from 'mobx-react'

/**
 * 计算用户权限的高阶组件，用于角色权限控制
 * @param {*} Component 传入的组件
 * @returns 返回传入的组件，新增参数userauth
 */
export default function withAuth(Component) {
    return inject(stores => ({ userLevel: stores.configStore.userLevel }))(
        observer(({ userLevel, onlyAdmin = false, ...props }) => {
            const userAuth = useMemo(
                () => ({
                    handle_auth: onlyAdmin
                        ? userLevel === 'sysadmin'
                        : userLevel !== 'viewer',
                    admin_auth: ['sysadmin'].includes(userLevel),
                }),
                [onlyAdmin, userLevel]
            )
            return <Component {...props} userAuth={userAuth} />
        })
    )
}

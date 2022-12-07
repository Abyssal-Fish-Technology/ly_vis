import { NavIcon } from '@shadowflow/components/ui/icon/icon-util'

import { inject, observer } from 'mobx-react'

import React, { useContext, useMemo } from 'react'

import TemplateContext from '../../../config-template/context'

function NavTreeNode({ navNodeKey = '', title, configStore }) {
    const { clickHandle, currentTabKey } = useContext(TemplateContext)
    const [configDataKey, configDataType] = useMemo(
        () => navNodeKey.split('|'),
        [navNodeKey]
    )

    const configData = useMemo(() => {
        const typeKey = configDataKey === 'mo' ? 'mogroup' : 'event_type'
        return ['mo', 'event'].includes(configDataKey)
            ? configStore[`${configDataKey}`].filter(
                  d => d[typeKey] === configDataType
              )
            : configStore[`${configDataKey}`] || []
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configStore[configDataKey], configDataType])

    return (
        <li
            className={currentTabKey === navNodeKey ? 'li-active' : ''}
            onClick={() => {
                if (currentTabKey !== navNodeKey) {
                    clickHandle(navNodeKey)
                }
            }}
        >
            <NavIcon />
            <span className='nav-text'>{`${title}（${configData.length}）`}</span>
        </li>
    )
}

export default inject('configStore')(observer(NavTreeNode))

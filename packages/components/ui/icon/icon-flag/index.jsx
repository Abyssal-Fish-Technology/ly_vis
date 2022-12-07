/* your-app/your-components-directory/FlagIcon.js */
// @flow
import React from 'react'
import FlagIconFactory from 'react-flag-icon-css'
import { Tooltip } from 'antd'
import { codesMap, customCode } from './code-custom'

// Please only use `FlagIconFactory` one time in your application, there is no
// need to use it multiple times (it would slow down your app). You may place the
// line below in a `FlagIcon.js` file in your 'components' directory, then
// write `export default FlagIcon` as shown below and import it elsewhere in your app.
const FlagIconDefault = FlagIconFactory(React, {
    useCssModules: false,
    customCodes: customCode,
})

const FlagIcon = ({ code }) => {
    return (
        <FlagIconDefault
            code={code}
            children={
                <Tooltip
                    className='flag-cover'
                    title={codesMap[code] || code}
                />
            }
        />
    )
}
export default FlagIcon

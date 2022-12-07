import { DarkIcon, SunIcon } from '@shadowflow/components/ui/icon/icon-util'
import React, { useState } from 'react'
import 'mutationobserver-shim'
import cssVars from 'css-vars-ponyfill'
import {
    getThemeParams,
    setThemeParams,
} from '@shadowflow/components/utils/universal/methods-storage'

cssVars({
    watch: true,
})

const toggleTheme = theme => {
    const usetheme =
        theme || (getThemeParams('theme') === 'dark' ? 'dark' : 'light')
    document.getElementById('theme').href = `./theme/${usetheme}.css`
    cssVars({
        watch: false,
    })
    setTimeout(() => {
        cssVars({
            watch: true,
        })
    }, 0)
    return theme
}

toggleTheme()

function ChangeTheme() {
    const nowTheme = getThemeParams('theme') === 'dark' ? 'dark' : 'light'

    const [theme, settheme] = useState(nowTheme)

    const changeTheme = newtheme => {
        settheme(newtheme)
        setThemeParams(newtheme)
        toggleTheme(newtheme)
    }

    return (
        <>
            {theme === 'dark' ? (
                <SunIcon
                    onClick={() => changeTheme('light')}
                    className='theme'
                />
            ) : (
                <DarkIcon
                    onClick={() => changeTheme('dark')}
                    className='theme'
                />
            )}
        </>
    )
}

export default ChangeTheme

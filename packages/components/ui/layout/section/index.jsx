import React from 'react'
import style from './index.module.less'

export default function Section(props) {
    const {
        title,
        extraContent,
        children,
        className = '',
        style: css,
        loading = false,
        subTitle = '',
    } = props
    return (
        <div
            className={`${style.section} app-section ${className}`}
            style={css}
        >
            <header className='app-section-header'>
                {title && (
                    <div className='app-section-title'>
                        {title}
                        {subTitle && (
                            <span className='app-section-title-subTitle'>
                                {subTitle}
                            </span>
                        )}
                    </div>
                )}
                {extraContent && (
                    <div className='app-section-header-extra'>
                        {extraContent}
                    </div>
                )}
            </header>

            <div
                className={`app-section-content ${
                    loading ? 'app-loading' : ''
                }`}
            >
                {children}
            </div>
        </div>
    )
}

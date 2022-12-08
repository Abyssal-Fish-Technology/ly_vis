import i18n from '@/locale/i18n'
import { logout } from '@/service'
import { UserOutlined } from '@ant-design/icons'
import { Avatar, Dropdown, Layout, Menu, message, Modal } from 'antd'
import React, { useEffect, useState } from 'react'
import SearchForm from '@/components/form-search'
import { useLocation } from 'react-router-dom'
import { skipPage } from '@/utils/methods-ui'
import {
    getUserName,
    setPrevLocationParams,
} from '@shadowflow/components/utils/universal/methods-storage'
import {
    createUrlParams,
    getUrlParams,
} from '@shadowflow/components/utils/universal/methods-router'
import { TagAttribute } from '@shadowflow/components/ui/tag'
import ChangeTheme from './change-theme'
import style from './index.module.less'

export default function Nav({ data }) {
    return (
        <Layout.Header className={style['app-nav']}>
            <div className='app-nav-container'>
                <div className='layout-left'>
                    <NavLogo />
                    <div className='layout-menu'>
                        <NavMenu data={data} />
                    </div>
                </div>
                <div className='layout-right'>
                    <div className='layout-search'>
                        <NavSearch />
                    </div>
                    <div className='layout-tools'>
                        <NavTools />
                    </div>
                </div>
            </div>
        </Layout.Header>
    )
}

const { subName, version } = window.appConfig
/**
 * logo 和 菜单缩放按钮
 */
function NavLogo() {
    return (
        <div className='app-logo'>
            <span
                className='app-logo-name'
                onClick={() => {
                    skipPage('/')
                }}
            >
                流影
            </span>
            <TagAttribute type='asset' className='app-logo-version'>
                {subName} V{version}
            </TagAttribute>
        </div>
    )
}

function NavSearch() {
    return (
        <span className='nav-search'>
            <div className='search-container'>
                <SearchForm
                    simple
                    onFinish={values => {
                        skipPage(
                            'result/basic',
                            { queryParams: values },
                            false,
                            { isNav: true }
                        )
                    }}
                />
            </div>
        </span>
    )
}

function NavMenu({ data }) {
    const nowPath = useLocation().pathname
    return (
        <Menu
            className='nav-menu'
            theme='light'
            mode='horizontal'
            selectedKeys={[nowPath]}
            onClick={e => {
                skipPage(e.key, {}, false, { isNav: true })
            }}
            getPopupContainer={() => document.querySelector('.layout-left')}
        >
            {data.map(d => {
                return d.children.length ? (
                    <Menu.SubMenu
                        title={d.name}
                        key={d.path}
                        popupClassName='nav-menu-submenu'
                    >
                        {d.children.map(child => (
                            <Menu.Item key={child.path}>
                                <span>{child.name}</span>
                            </Menu.Item>
                        ))}
                    </Menu.SubMenu>
                ) : (
                    <Menu.Item key={d.path}>
                        <span>{d.name}</span>
                    </Menu.Item>
                )
            })}
        </Menu>
    )
}

function NavTools(props) {
    const { history } = props
    const uselang = getUrlParams('language') === 'en' ? 'zh' : 'en'
    const [lang, setlang] = useState(uselang)
    // eslint-disable-next-line no-unused-vars
    const changelang = () => {
        i18n.changeLanguage(lang)
        const newlang = lang === 'zh' ? 'en' : 'zh'
        setlang(newlang)
        history.replace({
            search: createUrlParams({
                language: lang,
            }),
        })
    }
    const { pathname } = useLocation()
    const logoutConfirm = () => {
        Modal.confirm({
            title: '确定要注销登录吗?',
            onOk: () => {
                logout()
                    .then(() => {
                        message.success('注销成功')
                        setPrevLocationParams({
                            pathname,
                            urlParams: getUrlParams(),
                        })
                        skipPage('/login')
                    })
                    .catch(() => message.error('注销失败'))
            },
            okText: '注销',
            cancelText: '取消',
        })
    }

    const userName = getUserName()

    useEffect(() => {
        if (!userName) logout()
    }, [userName])

    return (
        <div className='nav-tools'>
            <ChangeTheme />
            {/* <span className='i18' onClick={changelang}>
                {lang === 'zh' ? '中文' : 'EN'}
            </span> */}
            <Dropdown
                placement='bottomCenter'
                overlayStyle={{
                    width: '80px',
                    marginTop: '120px',
                }}
                overlay={
                    <Menu>
                        <Menu.Item onClick={logoutConfirm}>注销</Menu.Item>
                    </Menu>
                }
            >
                <span className='user'>
                    <Avatar icon={<UserOutlined />} />
                    <span className='user-name'>{userName}</span>
                </span>
            </Dropdown>
        </div>
    )
}

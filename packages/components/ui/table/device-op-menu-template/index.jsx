import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    CaretDownOutlined,
    CopyOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import { copy } from '@shadowflow/components/utils/universal/methods-ui'
import { Descriptions, Menu, Modal } from 'antd'
import { observer } from 'mobx-react'
import deviceOpMenuStore from './store'
import DeviceBadge from '../../icon/device-badge'
import { getDeviceType } from '../../../utils/universal/methods-net'
import style from './index.module.less'

export const getDeviceSearchType = function getType(device) {
    const {
        isOnlyPort,
        isOnlyDomain,
        hasIp,
        hasPort,
        ip,
        port,
        domain,
    } = getDeviceType(device)
    let searchType = 'ip'
    switch (true) {
        case isOnlyPort:
            searchType = 'port'
            break
        case isOnlyDomain:
            searchType = 'dns'
            break
        case hasIp && hasPort:
            searchType = 'ip:port'
            break
        default:
            break
    }
    return {
        ip,
        port,
        dns: domain,
        searchType,
    }
}

export const DeviceOperate = observer(function DeviceOperate({
    children,
    device,
    resultParams,
}) {
    return (
        <div
            className={style['device-op']}
            onClick={e => {
                e.stopPropagation()
            }}
        >
            {device && device !== '-' && (
                <div
                    className='device-content operate-content-default'
                    onClick={e2 => {
                        deviceOpMenuStore.openDeviceMenu(
                            { device, resultParams },
                            e2.nativeEvent
                        )
                    }}
                >
                    <div>{children}</div>
                    <CaretDownOutlined className='device-op-trigger' />
                </div>
            )}
        </div>
    )
})

function DeviceOpMenuTemplate({
    menuList,
    basinInfoHandle,
    tabComponent = null,
}) {
    const [modalVisible, setModalVisible] = useState(false)
    const { visible, position, closeDeviceMenu, device } = deviceOpMenuStore
    const calculateMenuItem = useCallback(menuItem => {
        const {
            type,
            icon,
            menuText,
            child,
            disabled = false,
            click,
            title,
        } = menuItem

        if (type === 'subMenu') {
            return (
                <Menu.SubMenu
                    title={title}
                    icon={icon}
                    key={title}
                    popupClassName='device-op-sub-menu'
                >
                    {child.map(childItem => calculateMenuItem(childItem))}
                </Menu.SubMenu>
            )
        }
        if (type === 'divider') {
            return <Menu.Divider key={menuText} />
        }
        return (
            <Menu.Item
                icon={icon}
                onClick={click}
                disabled={disabled}
                key={menuText}
                className={`${!child ? 'last-menu-item' : 'normal-menu-item'}`}
            >
                {menuText}
            </Menu.Item>
        )
    }, [])
    return (
        <>
            {visible && (
                <div
                    id='device-menu-id'
                    className={style['device-menu']}
                    style={{
                        ...position,
                    }}
                    onMouseEnter={() => {
                        deviceOpMenuStore.visible = true
                    }}
                >
                    <Menu
                        onSelect={() => {
                            closeDeviceMenu()
                        }}
                    >
                        <Menu.Item
                            icon={<CopyOutlined />}
                            onClick={() => copy(device)}
                        >
                            复制设备
                        </Menu.Item>
                        <Menu.Item
                            icon={<ExclamationCircleOutlined />}
                            onClick={() => setModalVisible(true)}
                        >
                            基础信息
                        </Menu.Item>
                        {menuList.map(item => calculateMenuItem(item))}
                    </Menu>
                </div>
            )}
            <BasicInfoModal
                device={device}
                visible={modalVisible}
                closeModal={setModalVisible}
                basinInfoHandle={basinInfoHandle}
                component={tabComponent}
            />
        </>
    )
}

export default observer(DeviceOpMenuTemplate)

// 基本信息弹窗
export const BasicInfoModal = function BasicInfoModal({
    device,
    visible,
    closeModal,
    basinInfoHandle,
    component,
}) {
    const [topInfo, setTopInfo] = useState(null)
    const [portDesc, setPortDesc] = useState([])
    const [loading, setLoading] = useState(false)
    const [badgeInfo, setBadgeInfo] = useState({
        badgeType: 'unknow',
        badgeText: '',
    })
    const { searchType } = useMemo(() => getDeviceSearchType(device), [device])
    const resultDevice = useMemo(() => device.toString().split(':')[0], [
        device,
    ])
    useEffect(() => {
        if (visible) {
            setLoading(true)
            basinInfoHandle()
                .then(res => {
                    const {
                        topInfo: top,
                        portDesc: port = [],
                        badgeInfo: badge = {
                            badgeType: 'unknow',
                            badgeText: '',
                        },
                    } = res
                    setTopInfo(top)
                    setPortDesc(port)
                    setBadgeInfo(badge)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [basinInfoHandle, device, searchType, visible])

    return (
        <Modal
            visible={visible}
            onCancel={() => {
                closeModal(false)
            }}
            footer={false}
            header={false}
            title={device}
            width={900}
            destroyOnClose
            bodyStyle={{ padding: '0 5px 24px 5px' }}
        >
            <div
                className={`${style['basic-container']} ${
                    loading ? 'app-loading' : ''
                }`}
            >
                <div className='basic-top'>
                    <div className='basic-top-left'>
                        <div className='basic-top-left-text'>
                            {resultDevice}
                        </div>
                        {searchType !== 'port' && (
                            <DeviceBadge
                                cssStyle={{
                                    top: 0,
                                    left: 0,
                                    fontSize: '16px',
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0.5,
                                }}
                                deviceType={badgeInfo.badgeType}
                                badgeText={badgeInfo.badgeText}
                            />
                        )}
                    </div>
                    <div className='basic-top-center'>
                        {searchType !== 'port' ? (
                            <Descriptions
                                labelStyle={{
                                    width: '80px',
                                    textAlign: 'right',
                                    display: 'inline-block',
                                }}
                                column={{
                                    xxl: 2,
                                    xl: 2,
                                    lg: 2,
                                    md: 1,
                                    sm: 1,
                                    xs: 1,
                                }}
                            >
                                {topInfo &&
                                    Object.entries(topInfo).map(infoItem => {
                                        const [label, value] = infoItem
                                        return (
                                            <Descriptions.Item
                                                label={label}
                                                key={label}
                                            >
                                                {value || '--'}
                                            </Descriptions.Item>
                                        )
                                    })}
                            </Descriptions>
                        ) : (
                            <ol>
                                {portDesc.map(pItem => (
                                    <li key={pItem}>{pItem}</li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>

                {searchType !== 'port' && component}
            </div>
        </Modal>
    )
}

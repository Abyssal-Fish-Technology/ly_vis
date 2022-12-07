import { InsertRowBelowOutlined, PlusOutlined } from '@ant-design/icons'
import { Card } from 'antd'
import { inject, observer } from 'mobx-react'
import React, { useMemo } from 'react'
import SkipContainer from '@/components/skip-container'

export default inject('configStore')(
    observer(function CatalogueNav({
        path,
        configStoreKey = '',
        title,
        configStore,
        openModalFun,
        modalType,
        addAuth = [],
        userLevel,
    }) {
        const [configDataKey, configDataType] = useMemo(
            () => configStoreKey.split('|'),
            [configStoreKey]
        )
        const dataLength = useMemo(() => {
            const typeKey = configDataKey === 'mo' ? 'mogroup' : 'event_type'
            const result = ['mo', 'event'].includes(configDataKey)
                ? configStore[`${configDataKey}`].filter(
                      d => d[typeKey] === configDataType
                  )
                : configStore[`${configDataKey}`] || []
            return result.length
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [configStore[`${configDataKey}`], configDataType])

        return (
            <Card
                headStyle={{ minHeight: '30px', paddingLeft: '10px' }}
                title={`${title}（${dataLength}）`}
                bodyStyle={{ padding: '20px 15px' }}
            >
                <div className='card-content'>
                    {addAuth.includes(userLevel) ? (
                        <div
                            onClick={() => {
                                openModalFun({ type: modalType })
                            }}
                            className='operate-content-default'
                        >
                            <PlusOutlined />
                            新增
                        </div>
                    ) : null}
                    <SkipContainer
                        className='operate-content-active'
                        message='查看列表'
                        to={{
                            pathname: path,
                            search: {
                                pageParams: {
                                    active: configStoreKey,
                                },
                            },
                        }}
                    >
                        <InsertRowBelowOutlined />
                        查看列表
                    </SkipContainer>
                </div>
            </Card>
        )
    })
)

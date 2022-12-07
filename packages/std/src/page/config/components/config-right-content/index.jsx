import Section from '@shadowflow/components/ui/layout/section'
import { observer } from 'mobx-react'
import React, { memo } from 'react'
import ConfigTable from './components/config-table'
import style from './index.module.less'

function ConfigRightContent({ rightContentData, currentKey }) {
    return (
        <div className={style.configCenter}>
            {rightContentData.map(rightContentItem => {
                const { key, title, CreateDescribe = null } = rightContentItem
                // ...rightContentItem中包含的参数
                // columns, 表格列
                // api,  删除用的api
                // onAdd,  添加弹窗打开方法
                // addAuth = ['sysadmin'],  添加按钮权限
                // editAuth = ['sysadmin'], 修改按钮权限
                // deleteAuth = ['sysadmin'],  删除按钮权限
                // ExpandableCard = null,  展开信息组件
                // deleteCallback = null,  删除方法回调
                // configDataKey,  当前table数据在configStore中变量名称
                // modalType = '',  弹窗的type，主要用于规则页面配置
                // deleteDataFn = null,  外部传入的删除方法，用于需要额外删除方法的页面
                // editFn = null,  外部传入的编辑方法，和删除方法一样
                return (
                    <Section
                        key={title}
                        title={`${title}列表`}
                        style={{
                            display: `${currentKey === key ? 'block' : 'none'}`,
                        }}
                    >
                        {/* <Paragraph>{describe}</Paragraph> */}
                        <div className='describe-content'>
                            {CreateDescribe ? <CreateDescribe /> : null}
                        </div>
                        <ConfigTable
                            configDataKey={key}
                            {...rightContentItem}
                        />
                    </Section>
                )
            })}
        </div>
    )
}

export default memo(observer(ConfigRightContent))

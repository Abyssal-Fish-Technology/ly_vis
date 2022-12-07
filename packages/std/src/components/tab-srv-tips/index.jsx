import { ArrowRightOutlined, SwapLeftOutlined } from '@ant-design/icons'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import { Tooltip } from 'antd'
import { sumBy } from 'lodash'
import React from 'react'
import style from './index.module.less'

export default function SrvTableTips(props) {
    const { type, resData, reqData } = props
    const title = (
        <div className={style.searchInner}>
            <div className='search-inner-key text-center'>
                <span>
                    <ArrowRightOutlined className='red-text' />
                </span>
                <span>{arrangeAlerm(sumBy(resData, 'bytes'))}</span>
                <span>{arrangeAlerm(sumBy(resData, 'pkts'))}</span>
                <span>{arrangeAlerm(sumBy(resData, 'flows'))}</span>
            </div>
            <div className='search-inner-key search-inner-unit text-center'>
                <span>{type}</span>
                <span>bytes</span>
                <span>pkts</span>
                <span>flows</span>
            </div>
            <div className='search-inner-key text-center'>
                <span>
                    <ArrowRightOutlined className='blue-text' />
                </span>
                <span>{arrangeAlerm(sumBy(reqData, 'bytes'))}</span>
                <span>{arrangeAlerm(sumBy(reqData, 'pkts'))}</span>
                <span>{arrangeAlerm(sumBy(reqData, 'flows'))}</span>
            </div>
        </div>
    )
    return (
        <Tooltip title={title} placement='right'>
            <div className={style['connection-detail']}>
                {resData.length}
                <SwapLeftOutlined className='red-text' />
                <SwapLeftOutlined className='blue-text' />
                {reqData.length}
            </div>
        </Tooltip>
    )
}

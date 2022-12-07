import React from 'react'
import SearchForm from '@/components/form-search'
import Section from '@shadowflow/components/ui/layout/section'
import { skipPage } from '@/utils/methods-ui'
import { getUrlParams } from '@shadowflow/components/utils/universal/methods-router'
import moment from 'moment'
import style from './index.module.less'

export default function SearchPage({ resultParams = false }) {
    const params = resultParams || getUrlParams()
    let obj = {}
    if (params.starttime) {
        obj = {
            starttime: [
                moment(Number(params.starttime) * 1000),
                moment(Number(params.endtime) * 1000),
            ],
            devid: params.devid,
        }
    }
    const startSearch = values => {
        skipPage('result/basic', { queryParams: values })
    }
    return (
        <div className={`${style.search}`}>
            <Section>
                <div className='search-content'>
                    <div className='search-title'>全局搜索引擎</div>
                    <SearchForm onFinish={startSearch} conditionValue={obj} />
                </div>
            </Section>
        </div>
    )
}

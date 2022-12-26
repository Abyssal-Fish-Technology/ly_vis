import { inject, observer, Provider } from 'mobx-react'
import React, { useCallback, useEffect, useMemo } from 'react'
import { chain } from 'lodash'
import Toptoolbox from '../../ui/form/toptoolbox'
import columns from './columns'
import Section from '../../ui/layout/section'
import FormFilter from '../../ui/form/form-filter'
import RelationChart from './components/relation-chart'
import AssetTable from './components/asset-table'
import AssetListStore from './store'
import IpChart from './components/ip-chart'
import SrvChart from './components/srv-chart'
import HostChart from './components/host-chart'
import UrlChart from './components/url-chart'
import { AssetDeviceFilter } from './components/asset-device-filter'
import style from './index.module.less'

function AssetList({ internal, pageType = '', topToolBoxAttr = {} }) {
    const store = useMemo(() => new AssetListStore(), [])

    useEffect(() => {
        store.reCalcualteAssetDesc()
    }, [internal, store])

    const {
        useData,
        getData,
        originalData,
        getForm,
        changeFilterCondition,
        currentData,
        changeRelationIp,
    } = store
    const startSearch = useCallback(
        params => {
            return getData(pageType, params)
        },
        [getData, pageType]
    )

    const pageContents = useMemo(() => {
        const chartObj = {
            ip: <IpChart />,
            srv: <SrvChart />,
            host: <HostChart />,
            url: <UrlChart />,
        }
        const titleObj = {
            ip: 'IP列表',
            srv: '端口列表',
            host: '网站列表',
            url: 'URL列表',
        }
        return {
            chartContent: chartObj[pageType],
            columns: columns[pageType],
            headerTitle: titleObj[pageType],
        }
    }, [pageType])

    const filterContent = useMemo(() => {
        const filterFunObj = {
            ip: calcualteIpFilterContent,
            srv: calcualteSrvFilterContent,
            host: calcualteHostFilterContent,
            url: calcualteUrlFilterContent,
        }
        const filterFn = filterFunObj[pageType]
        return filterFn(currentData)
    }, [currentData, pageType])

    return (
        <Provider assetListStore={store}>
            <div className={style['asset-list']}>
                <Toptoolbox
                    callback={startSearch}
                    timeDifference={4}
                    {...topToolBoxAttr}
                />
                <PageHeader
                    navText={['列表', pageContents.headerTitle]}
                    count={currentData.length}
                />
                <FilterContainer
                    getForm={getForm}
                    formContent={filterContent}
                    callback={changeFilterCondition}
                />
                <Section title='' className='chart-section'>
                    {pageContents.chartContent}
                </Section>
                <div className='asset-filter-container' />
                <AssetTable
                    data={useData}
                    columns={pageContents.columns}
                    pageType={pageType}
                    originalData={originalData}
                    changeRelationIp={changeRelationIp}
                />
                <RelationChart />
            </div>
        </Provider>
    )
}

export default inject(stores => ({
    internal: stores.configStore.internal,
}))(observer(AssetList))

function FilterContainer({ getForm, formContent, callback }) {
    return (
        <Section title='筛选查询' className='filter-form'>
            <FormFilter
                getForm={getForm}
                formContent={formContent}
                callback={callback}
                filterBarWrapperSelector='.asset-filter-container'
            />
        </Section>
    )
}

function PageHeader({ navText = [], count = 0 }) {
    return (
        <div className='page-header'>
            {navText.map((d, i) => {
                return (
                    <span className='nav-text' key={d}>
                        {d}
                        {i !== navText.length - 1 && (
                            <span className='gap'>/</span>
                        )}
                    </span>
                )
            })}
            <span className='count'>({count})</span>
        </div>
    )
}

function calcualteIpFilterContent() {
    return [
        {
            name: 'device',
            label: '设备查询',
            content: <AssetDeviceFilter keyArr={['ip']} />,
            type: 'custom',
            basic: true,
        },
        {
            name: 'is_alive',
            label: '活跃状态',
            type: 'tag',
            tagArr: [
                {
                    name: '活跃',
                    value: 1,
                },
                {
                    name: '不活跃',
                    value: 0,
                },
            ],
            basic: true,
        },
    ]
}

function getTagArr(data, key) {
    return chain(data)
        .map(key)
        .flatten()
        .uniq()
        .filter(d => d)
        .map(d => ({
            name: d,
            value: d,
        }))
        .value()
}

function calcualteSrvFilterContent(data) {
    const appProtoArr = getTagArr(data, 'app_proto')
    const protocolArr = getTagArr(data, 'protocol')
    const srvTypeArr = getTagArr(data, 'srv_type')
    const devTypeArr = getTagArr(data, 'dev_type')
    const osTypeArr = getTagArr(data, 'os_type')
    const midWareTypeArr = getTagArr(data, 'midware_type')

    return [
        {
            name: 'device',
            label: 'IP/端口查询',
            content: <AssetDeviceFilter keyArr={['ip', 'port']} />,
            type: 'custom',
            basic: true,
        },
        {
            name: 'is_alive',
            label: '活跃状态',
            type: 'tag',
            tagArr: [
                {
                    name: '活跃',
                    value: 1,
                },
                {
                    name: '不活跃',
                    value: 0,
                },
            ],
        },
        {
            name: 'app_proto',
            label: '应用层协议',
            type: 'tag',
            tagArr: appProtoArr,
            basic: true,
        },
        {
            name: 'protocol',
            label: '传输层协议',
            type: 'tag',
            tagArr: protocolArr,
        },
        {
            name: 'srv_type',
            label: '资产类别',
            type: 'tag',
            tagArr: srvTypeArr,
        },
        {
            name: 'dev_type',
            label: '设备类型',
            type: 'tag',
            tagArr: devTypeArr,
        },
        {
            name: 'os_type',
            label: '操作系统类型',
            type: 'tag',
            tagArr: osTypeArr,
        },
        {
            name: 'midware_type',
            label: '中间件类型',
            type: 'tag',
            tagArr: midWareTypeArr,
        },
    ]
}

function calcualteHostFilterContent(data) {
    const formTypeArr = chain(data)
        .map('formType')
        .flatten()
        .filter(d => d)
        .uniq()
        .map(d => ({
            name: d,
            value: d,
        }))
        .value()

    return [
        {
            name: 'device',
            label: 'IP/端口查询',
            content: <AssetDeviceFilter keyArr={['ip', 'port']} />,
            type: 'custom',
            basic: true,
        },
        {
            name: 'host',
            label: '网站查询',
            content: <AssetDeviceFilter keyArr={['host']} />,
            type: 'custom',
            basic: true,
        },
        {
            name: 'is_alive',
            label: '活跃状态',
            type: 'tag',
            tagArr: [
                {
                    name: '活跃',
                    value: 1,
                },
                {
                    name: '不活跃',
                    value: 0,
                },
            ],
        },
        {
            name: 'formType',
            label: '访问形式',
            type: 'tag',
            tagArr: formTypeArr,
        },
    ]
}

function calcualteUrlFilterContent(data) {
    const retcodeArr = chain(data)
        .map('retcode')
        .flatten()
        .filter(d => d)
        .uniq()
        .map(d => ({
            name: d,
            value: d,
        }))
        .value()

    return [
        {
            name: 'device',
            label: 'IP/端口查询',
            content: <AssetDeviceFilter keyArr={['ip', 'port']} />,
            type: 'custom',
            basic: true,
        },
        {
            name: 'host',
            label: '网站查询',
            content: <AssetDeviceFilter keyArr={['host']} />,
            type: 'custom',
            basic: true,
        },
        {
            name: 'show_url',
            label: 'URL查询',
            content: <AssetDeviceFilter keyArr={['show_url']} />,
            type: 'custom',
            basic: true,
        },
        {
            name: 'is_alive',
            label: '活跃状态',
            type: 'tag',
            tagArr: [
                {
                    name: '活跃',
                    value: 1,
                },
                {
                    name: '不活跃',
                    value: 0,
                },
            ],
        },
        {
            name: 'retcode',
            label: '返回码',
            type: 'tag',
            tagArr: retcodeArr,
        },
    ]
}

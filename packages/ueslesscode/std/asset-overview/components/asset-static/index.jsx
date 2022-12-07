import React from 'react'
import { Statistic } from 'antd'
import moment from 'moment'
import {
    ConsoleSqlOutlined,
    DesktopOutlined,
    GlobalOutlined,
    HddOutlined,
} from '@ant-design/icons'
import BasicEchart from '@/components/chart/chart-basic'
import Section from '@/components/section'
import style from './index.module.less'

export const ASSET_TYPE = {
    ip: {
        type: 'ip',
        name: 'IP',
        icon: DesktopOutlined,
    },
    srv: {
        type: 'srv',
        name: '服务',
        icon: ConsoleSqlOutlined,
    },
    host: {
        type: 'host',
        name: 'HOST',
        icon: HddOutlined,
    },
    url: {
        type: 'url',
        name: 'URL',
        icon: GlobalOutlined,
    },
}

export default function AssetStatic(props) {
    const { assetStatic, className } = props

    const option = {
        grid: {
            left: 0,
            right: 10,
            top: 30,
            bottom: 0,
            containLabel: true,
        },
        tooltip: {
            trigger: 'axis',
            formatter: params => {
                return params.some(_d => _d.value[1])
                    ? `<div>
                ${moment(params[0].name * 1000).format('MM-DD HH:mm')}<br />
                ${params
                    .map(d => {
                        if (!d.value[1]) return ''
                        return `<div class="dot-item">
                        ${d.marker}
                        <span class="dot-item-name" style="width: 40px;">${d.seriesName}</span>
                        <span class="dot-item-value" style="">${d.value[1]}</span>
                    </div>`
                    })
                    .join(' ')}
                </div>`
                    : ''
            },
        },
        legend: {
            textStyle: {
                fontSize: '10',
            },
            icon: 'circle',
            itemGap: 6,
            itemWidth: 8,
            left: 'center',
            top: 0,
        },
        series: assetStatic.map(d => ({
            name: ASSET_TYPE[d.type].name,
            type: 'line',
            showSymbol: false,
            data: d.data,
            clip: true,
            smooth: true,
            encode: {
                x: 0,
                y: 1,
                tooltip: [1],
            },
        })),
        dataZoom: [
            {
                type: 'inside',
            },
        ],
        yAxis: {
            type: 'value',
            minInterval: 10,
            name: '资产数量',
            splitNumber: 2,
            nameTextStyle: {
                fontSize: 9,
                verticalAlign: 'middle',
            },
        },
        xAxis: {
            type: 'category',
            axisLabel: {
                show: true,
                formatter: d => moment(d * 1000).format('MM-DD HH:mm'),
            },
        },
    }
    return (
        <div className={`${style['asset-static']} ${className}`}>
            <Section title=''>
                <div className='asset-content'>
                    <div className='asset-card'>
                        {assetStatic.map(d => {
                            const { count, type } = d
                            const { icon: Icon, name } = ASSET_TYPE[type]
                            return (
                                <div className='item' key={name}>
                                    <Icon className='item-icon' />
                                    <div className='item-content'>
                                        <Statistic value={count} />
                                        <span className='desc'>{name}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className='asset-time'>
                        <BasicEchart
                            data={assetStatic.filter(d => !!d.count)}
                            option={option}
                        />
                    </div>
                </div>
            </Section>
        </div>
    )
}

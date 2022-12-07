import React from 'react'
import Section from '@/components/section'
import style from './index.module.less'
import Statistics from './components/statistics'
import Radar from './components/radar'
import AssetDistributeTree from './components/asset-distribute-tree'

export default function AssetOverviewPage() {
    return (
        <div className={style.page}>
            <div className='section section-1'>
                <Statistics />
                <Radar />
            </div>
            <div className='section section-2'>
                <Section
                    title='资产分布'
                    className='asset-distribute'
                    extraContent={
                        <div className='legend'>
                            {[
                                {
                                    type: 'ip',
                                    color: '#3a65ff',
                                },
                                {
                                    type: 'srv',
                                    color: '#5eff5a',
                                },
                                {
                                    type: 'host',
                                    color: '#ffba69',
                                },
                                {
                                    type: 'url',
                                    color: '#8676ff',
                                },
                            ].map(d => (
                                <span className='legend-item' key={d.type}>
                                    <span
                                        className='legend-item-label'
                                        style={{
                                            backgroundColor: d.color,
                                        }}
                                    />
                                    <span className='legend-item-value'>
                                        {d.type}
                                    </span>
                                </span>
                            ))}
                        </div>
                    }
                >
                    <AssetDistributeTree />
                </Section>
            </div>
        </div>
    )
}

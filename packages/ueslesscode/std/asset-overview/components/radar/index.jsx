import React, { useMemo } from 'react'
import { inject, observer } from 'mobx-react'
import { chain } from 'lodash'
import Section from '@/components/section'
import RingChart from '@/components/chart/chart-ring'
import style from './index.module.less'

function Radar({ assetStore }) {
    const { ipData } = assetStore
    const data = useMemo(() => {
        return chain(ipData)
            .reduce((obj, d) => {
                d.desc.forEach(d1 => {
                    const key = d1
                    if (!obj[key]) {
                        obj[key] = {
                            name: key,
                            data: [],
                        }
                    }
                    obj[key].data.push(d)
                })
                return obj
            }, {})
            .values()
            .map(d => ({
                ...d,
                value: d.data.length,
            }))
            .value()
    }, [ipData])
    return (
        <div className={style.radar}>
            <Section title='录入资产分布'>
                <div className='chart'>
                    <RingChart data={data} title='资产组' />
                    {/* <AssetPieChart data={data} /> */}
                </div>
            </Section>
        </div>
    )
}

export default inject('assetStore')(observer(Radar))

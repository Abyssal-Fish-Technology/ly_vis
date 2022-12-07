import { RingChart } from '@shadowflow/components/charts'
import Section from '@shadowflow/components/ui/layout/section'
import { chain } from 'lodash'
import React, { useMemo, useState } from 'react'
import { Select } from 'antd'

export default function AssetSrvInfo({ srvData, loading }) {
    const descDict = useMemo(() => {
        return {
            srv_name: '服务',
            midware_name: '中间件',
            os_name: '操作系统',
            dev_name: '设备/应用系统',
        }
    }, [])
    const [usekey, setUsekey] = useState('srv_name')
    const srvChartData = useMemo(() => {
        return chain(srvData)
            .countBy(usekey)
            .entries()
            .map(dataItem => ({
                name: dataItem[0] || '其它',
                value: dataItem[1],
            }))
            .value()
    }, [srvData, usekey])

    return (
        <Section
            loading={loading}
            title='服务信息(追踪目标端)'
            extraContent={
                <Select
                    defaultValue='srv_name'
                    onChange={key => setUsekey(key)}
                >
                    {Object.entries(descDict).map(optionItem => (
                        <Select.Option
                            key={optionItem[0]}
                            value={optionItem[0]}
                        >
                            {optionItem[1]}
                        </Select.Option>
                    ))}
                </Select>
            }
        >
            <RingChart title={descDict[usekey]} data={srvChartData} />
        </Section>
    )
}

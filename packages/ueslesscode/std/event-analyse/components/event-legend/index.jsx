import Section from '@shadowflow/components/ui/layout/section'
import { RightOutlined } from '@ant-design/icons'
import { color } from 'd3-color'
import { inject, observer } from 'mobx-react'
import React from 'react'
import style from './index.module.less'

function EventLegend({ legend, colorDict }) {
    return (
        <Section title='图例' className={`${style.legend} an-desc-`}>
            <div className='legend-group'>
                <div className='legend-name'>形状</div>
                <div className='legend-content'>
                    <div className='legend-item'>
                        <div className='legend-item-shape circle' />
                        <div className='legend-item-label'>设备</div>
                    </div>
                    <div className='legend-item'>
                        <div className='legend-item-shape line'>
                            <RightOutlined />
                        </div>
                        <div className='legend-item-label'>关系</div>
                    </div>
                </div>
            </div>
            <div className='legend-group'>
                <div className='legend-name'>颜色</div>
                <div className='legend-content'>
                    {Object.entries(legend.color).map(d => {
                        const legendColor = color(d[1])
                        legendColor.opacity = 0.4
                        const fillcolor = legendColor.toString()
                        return (
                            <div className='legend-item' key={d[0]}>
                                <div
                                    className='legend-item-shape circle'
                                    style={{
                                        borderColor: d[1],
                                        backgroundColor: fillcolor,
                                    }}
                                />
                                <div className='legend-item-label'>
                                    {colorDict[d[0]] || d[0]}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className='legend-group legend-size'>
                <div className='legend-name'>大小</div>
                <div className='legend-content'>
                    <div className='legend-item'>
                        <div className='legend-item-shape circle' />
                        <div className='legend-item-label'>{legend.size}</div>
                        <div className='legend-item-shape circle big' />
                    </div>
                </div>
            </div>
        </Section>
    )
}

export default inject(stores => ({
    legend: stores.eventLinkStore.legend,
    colorDict: stores.eventLinkStore.colorDict,
}))(observer(EventLegend))

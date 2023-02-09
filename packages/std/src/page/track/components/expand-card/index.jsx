import React from 'react'
import BasicInfo from './components/info-basic'
import EventInfo from './components/info-event'
import style from './index.module.less'

export default function ExpandCard({ moinfo, params }) {
    return (
        <div className={style['mo-info']}>
            <BasicInfo moinfo={moinfo} />
            <div className='otherInfo'>
                <EventInfo params={params} moinfo={moinfo} />
            </div>
        </div>
    )
}

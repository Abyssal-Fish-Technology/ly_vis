import React from 'react'
import { Result, Button } from 'antd'
import { Link } from 'react-router-dom'

export default function Page404() {
    return (
        <div className='page-wrap nomatch-page'>
            <Result
                status='404'
                title='404'
                subTitle='对不起, 访问的页面不存在.'
                extra={
                    <Button type='primary'>
                        <Link to='/'>回到首页</Link>
                    </Button>
                }
            />
        </div>
    )
}

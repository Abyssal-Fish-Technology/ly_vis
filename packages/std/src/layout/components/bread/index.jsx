import React, { useMemo } from 'react'
import { Breadcrumb } from 'antd'
import { useLocation } from 'react-router'

export default function Bread({ data }) {
    const nowPath = useLocation().pathname
    const nowFirstPath = useMemo(() => {
        return nowPath.match(/\/\w*/)[0]
    }, [nowPath])

    const breadArr = useMemo(() => {
        const thisFirstRoute = data.find(d => d.path === nowFirstPath)
        const arr = [thisFirstRoute.name]
        if (thisFirstRoute.children) {
            arr.push(thisFirstRoute.children.find(d => d.path === nowPath).name)
        }
        return arr
    }, [data, nowFirstPath, nowPath])

    return (
        <Breadcrumb style={{ margin: '16px 0' }}>
            {breadArr.map(d => (
                <Breadcrumb.Item key={d}>{d}</Breadcrumb.Item>
            ))}
        </Breadcrumb>
    )
}

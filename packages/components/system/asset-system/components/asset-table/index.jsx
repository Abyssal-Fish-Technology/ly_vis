import { formatDuration } from '@shadowflow/components/utils/universal/methods-time'
import { arrangeAlerm } from '@shadowflow/components/utils/universal/methods-traffic'
import { Tooltip } from 'antd'
import { chain, forEach, isEmpty, parseInt } from 'lodash'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    EyeOutlined,
    FolderOutlined,
    InfoCircleOutlined,
    PartitionOutlined,
    RedoOutlined,
} from '@ant-design/icons'
import {
    axisBottom,
    drag,
    extent,
    scaleLinear,
    scaleOrdinal,
    select,
    // mouse,
    pointer,
    path,
} from 'd3'
import moment from 'moment'
import style from './index.module.less'
import EvidenceModal from './components/evidence-modal'
import AssetMoreInfo from './components/asset-moreinfo'
import { BasicEchart, BasicCustomChart } from '../../../../charts'
import { rowKey } from '../../columns'
import RowOperate from '../../../../ui/table/row-op'
import { getFields } from '../../config'
import { AntdTableSuper } from '../../../../ui/antd-components-super'

function AssetTable({
    data,
    columns,
    pageType,
    originalData,
    changeRelationIp,
    headerLefttContext = false, // 新增一个参数，当不需要标题时，左侧可以放入自定义的内容，string或者组件都可以
}) {
    // 控制展开
    const [expandRowKey, setexpandRowkey] = useState([])

    const changeExpandRowKey = useCallback(
        assetDataItem => {
            const thisKey = rowKey(assetDataItem)
            setexpandRowkey(expandRowKey.includes(thisKey) ? [] : [thisKey])
        },
        [setexpandRowkey, expandRowKey]
    )

    // 控制数据详情
    const [moreInfoData, setmoreInfoData] = useState(false)

    const table_title = useMemo(() => {
        const titleObj = {
            srv: '端口列表',
            ip: 'IP列表',
            host: '网站列表',
            url: 'URL列表',
        }
        return titleObj[pageType]
    }, [pageType])

    const [rowData, setRowData] = useState([])

    const useColumns = useMemo(() => {
        const operateColumns = {
            title: () => '操作',
            key: 'operate',
            width: 60,
            fixed: 'right',
            render: (t, record) => (
                <RowOperate
                    operations={[
                        ['srv'].includes(pageType) && {
                            keyValue: 'bxq',
                            icon: <FolderOutlined />,
                            click: () => {
                                setRowData(record.data)
                            },
                            child: '包内容',
                        },
                        {
                            keyValue: 'glt',
                            icon: <PartitionOutlined />,
                            click: () => {
                                changeRelationIp(record.ip, record.port)
                                setTimeout(() => {
                                    window.scrollTo(0, 9999)
                                }, 0)
                            },
                            child: '关联图',
                        },
                        {
                            keyValue: 'jcxq',
                            icon: <EyeOutlined />,
                            click: () => {
                                changeExpandRowKey(record)
                            },
                            child: '活跃详情',
                        },
                        {
                            keyValue: 'moreinfo',
                            icon: <InfoCircleOutlined />,
                            click: () => {
                                setmoreInfoData(record)
                            },
                            child: '更多信息',
                        },
                    ].filter(d => d)}
                />
            ),
        }
        return [...columns.filter(d => !d.hide), operateColumns]
    }, [changeExpandRowKey, changeRelationIp, columns, pageType])

    const keyMap = useMemo(() => {
        return columns.map(d => ({
            label: d.title,
            key: d.dataIndex,
        }))
    }, [columns])

    const exportFields = useMemo(() => {
        return getFields(pageType)
    }, [pageType])

    const [selectData, setSelectData] = useState([])

    const selectOriginalData = useMemo(() => {
        return chain(selectData).map('data').flatten().value()
    }, [selectData])

    const fileName = useMemo(() => {
        const nameObj = {
            ip: 'IP数据',
            srv: '端口数据',
            host: 'HOST数据',
            url: 'URL数据',
        }
        return nameObj[pageType]
    }, [pageType])

    const selectCallBack = useCallback((keys, rows) => {
        setSelectData(rows)
    }, [])

    return (
        <div className={style['asset-table']}>
            <AntdTableSuper
                ipKeys={['ip']}
                rowKey={rowKey}
                headerTitle={headerLefttContext || table_title}
                onRow={() => ({
                    onClick(e) {
                        e.stopPropagation()
                        changeExpandRowKey([])
                    },
                })}
                dataSource={data}
                columns={useColumns}
                exportParams={{
                    fields: exportFields,
                    exportData: data,
                    selectData,
                    originalData,
                    selectOriginalData,
                    fileName,
                }}
                tableAlertRender={false}
                expandedRowKeys={expandRowKey}
                expandable={{
                    expandRowByClick: false,
                    expandIconColumnIndex: -1,
                    expandedRowRender: record => {
                        return (
                            <ExpandContent
                                record={record}
                                type={pageType}
                                changeData={setRowData}
                            />
                        )
                    },
                }}
                sortDirections={['descend', 'ascend']}
                selectionCallBack={selectCallBack}
            />
            <AssetMoreInfo
                data={moreInfoData}
                closeCallback={() => setmoreInfoData(false)}
                keyMap={keyMap}
            />

            <EvidenceModal
                pageType={pageType}
                rowData={rowData}
                resetData={setRowData}
            />
        </div>
    )
}

export default AssetTable

function listToTree(list) {
    const map = {}
    let node
    const tree = []
    for (let i = 0; i < list.length; i += 1) {
        map[list[i].name] = list[i]
        list[i].children = []
    }
    for (let i = 0; i < list.length; i += 1) {
        node = list[i]
        if (node.parentid !== undefined) {
            map[node.parentid].children.push(node)
        } else {
            tree.push(node)
        }
    }
    return tree
}

function AssetInfoTreeChart({ data }) {
    const [height, setheight] = useState(200)
    const parentdict = useMemo(
        () => ({
            os: '操作系统',
            srv: '服务',
            midware: '中间件',
            dev: '设备/应用系统',
        }),
        []
    )
    const useData = useMemo(() => {
        const flatArr = chain(data)
            .reduce(
                (arr, assetItem) => {
                    const keyArr = ['midware', 'os', 'srv', 'dev']
                    keyArr.forEach(keyItem => {
                        if (assetItem[`${keyItem}_type`]) {
                            const typeParent = parentdict[keyItem]
                            arr.push(
                                {
                                    name: typeParent,
                                    parentid: arr[1].name,
                                },
                                {
                                    name: assetItem[`${keyItem}_type`],
                                    parentid: parentdict[keyItem],
                                },
                                {
                                    name: assetItem[`show_${keyItem}_name`],
                                    parentid: assetItem[`${keyItem}_type`],
                                }
                            )
                        }
                    })
                    return arr
                },
                [
                    {
                        name: data[0].ip,
                    },
                    {
                        name: data[0].port,
                        parentid: data[0].ip,
                    },
                ]
            )
            .uniqBy(d => `${d.name}-${d.parentid}`)
            .value()

        const parentIdArr = flatArr.map(d => d.parentIdArr)
        const leafCount = flatArr.filter(d => !parentIdArr.includes(d.name))
            .length
        const treeArr = listToTree(flatArr)
        setheight(leafCount * 12)
        return treeArr
    }, [data, parentdict])
    const option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
        },
        series: [
            {
                type: 'tree',
                data: useData,
                right: '20%',
                top: '0',
                bottom: '0',
                symbolSize: 7,
                label: {
                    position: 'left',
                    verticalAlign: 'middle',
                    align: 'right',
                    fontSize: 12,
                },
                leaves: {
                    label: {
                        position: 'right',
                        verticalAlign: 'middle',
                        align: 'left',
                    },
                },
                emphasis: {
                    focus: 'descendant',
                },
                lineStyle: {
                    width: 1,
                },
                expandAndCollapse: false,
                animationDuration: 550,
                animationDurationUpdate: 750,
            },
        ],
    }

    return (
        <div
            style={{
                height: `${height}px`,
                marginBottom: '40px',
            }}
        >
            <div className='chart-title'>图一: 检出信息分类归属</div>
            <BasicEchart data={data} option={option} />
        </div>
    )
}

function calculateTipsInfo(data, type, changeData) {
    const commonInfo = {
        时间: `${moment(data.starttime * 1000).format('HH:mm:ss')}`,
        持续: formatDuration(data.duration),
        字节: arrangeAlerm(data.bytes),
        包数: arrangeAlerm(data.pkts),
        流数: arrangeAlerm(data.flows),
        服务: data.show_srv_name,
        操作系统: data.show_os_name,
        中间件: data.show_midware_name,
        '设备/应用系统': data.show_dev_name,
        设备: data.show_dev_name,
        端口: data.port,
    }

    const getInfo = keyArr => {
        const useObj = keyArr.reduce((obj, keyItem) => {
            obj[keyItem] = commonInfo[keyItem]
            return obj
        }, {})
        return Object.entries(useObj).filter(d => d[1])
    }

    let mainInfo = []
    let detailInfo = {}

    const PcapNode = ({ text, currentData }) => {
        return (
            <>
                {text}
                <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        changeData([currentData])
                    }}
                >
                    <Tooltip title='查看PCAP包详情'>
                        <EyeOutlined />
                    </Tooltip>
                </span>
            </>
        )
    }

    switch (type) {
        case 'srv':
            mainInfo = getInfo([
                '服务',
                '操作系统',
                '中间件',
                '设备/应用系统',
            ]).map(d => {
                return [[d[0]], <PcapNode text={d[1]} currentData={data} />]
            })

            if (mainInfo.length === 0) {
                mainInfo.push(['服务', '无'])
            }
            detailInfo = getInfo(['时间', '持续', '字节', '包数', '流数'])
            break
        case 'ip':
            mainInfo = getInfo(['时间', '持续'])
            detailInfo = getInfo(['字节', '包数', '流数'])
            break
        case 'host':
        case 'url':
            mainInfo = getInfo(['时间', '持续', '端口'])
            detailInfo = getInfo(['字节', '包数', '流数'])
            break
        default:
            break
    }
    return [mainInfo, detailInfo]
}

function AssetTimeLine({ data, type, changeData }) {
    const container = useRef(null)
    const [top, right, bottom, left] = useMemo(() => [0, 10, 20, 40], [])
    const [height, setHeight] = useState(100)
    const [realSize, setRealSize] = useState({
        realHeight: 100,
        realWidth: 100,
    })

    const lineY = -15

    const formatData = useMemo(() => {
        return data.map(d => {
            const [mainInfo, detailInfo] = calculateTipsInfo(
                d,
                type,
                changeData
            )
            return {
                day: moment(d.starttime * 1000).format('MM-DD'),
                detailInfo,
                mainInfo,
                ...d,
            }
        })
    }, [changeData, data, type])

    const dayArr = useMemo(() => {
        const timeArr = chain(formatData)
            .map(d => [d.starttime, d.endtime])
            .flatten()
            .value()
        const [minMoment, maxMoment] = extent(timeArr).map(d =>
            moment(d * 1000)
        )
        const dayGap = Math.ceil(
            maxMoment.startOf().diff(minMoment.endOf(), 'days', true)
        )
        const arr = [minMoment.format('MM-DD')]
        for (let i = 0; i < dayGap; i += 1) {
            arr.push(
                minMoment
                    .clone()
                    .add(i + 1, 'day')
                    .format('MM-DD')
            )
        }

        return arr
            .map(dayItem => ({
                day: dayItem,
                data: formatData.filter(d => d.day === dayItem),
            }))
            .filter(d => d.data.length > 0)
    }, [formatData])

    const [heightItemArr, setheightItemArr] = useState([])
    const dayScale = useMemo(
        () =>
            scaleOrdinal()
                .domain(dayArr.map(d => d.day))
                .range(heightItemArr),
        [dayArr, heightItemArr]
    )
    useEffect(() => {
        const newheigthItemArr = []
        const lineHeight = 10
        const newGrpahHeight = dayArr.reduce((heightadd, d) => {
            const thisDayHeight = chain(d.data)
                .map(d1 => d1.mainInfo.length)
                .max()
                .value()
            const newHeightAdd = heightadd + thisDayHeight * lineHeight + 40
            newheigthItemArr.push(newHeightAdd)
            return newHeightAdd
        }, 0)
        setheightItemArr(newheigthItemArr)
        const autoheight = newGrpahHeight + top + bottom
        setHeight(autoheight)
    }, [bottom, dayArr, top])

    const timeScale = useMemo(() => {
        return scaleLinear()
            .domain([0, 3600 * 24])
            .range([0, realSize.realWidth])
    }, [realSize])

    const svgRef = useRef(null)

    useEffect(() => {
        const xAxis = axisBottom().scale(timeScale).tickValues([])
        select(svgRef.current).selectAll('.xAxis-item').call(xAxis)
    }, [timeScale])

    const useData = useMemo(() => {
        return formatData.map((d, i) => {
            const day = moment(d.starttime * 1000).format('MM-DD')
            const time =
                moment(d.starttime * 1000).unix() -
                moment(d.starttime * 1000)
                    .set({
                        hour: 0,
                        minute: 0,
                        second: 0,
                    })
                    .unix()

            const x = timeScale(time)
            const y = dayScale(day) || 0
            return {
                x,
                y,
                gAttr: {
                    key: `${d.starttime}-${d.endtime}-${i})}`,
                    transform: `translate(${x}, ${y})`,
                    className: 'unit-item',
                },
                cAttr: {
                    r: 4,
                },
                data: d,
            }
        })
    }, [formatData, dayScale, timeScale])

    const [showtips, setshowtips] = useState('')
    const [clickSign, setClickSign] = useState({})

    useEffect(() => {
        setTimeout(() => {
            let styleobj = {
                x: 0,
                y: 0,
            }
            let moveDis = 0
            let isDrag = false
            select(container.current)
                .selectAll('.tips')
                .call(
                    drag()
                        .on('start', function start(e) {
                            const [x] = pointer(e, container.current)
                            const originLeft = parseInt(
                                select(this).style('left')
                            )
                            styleobj = {
                                ...styleobj,
                                x,
                                originLeft:
                                    (realSize.realWidth + left + right) *
                                    (originLeft / 100),
                            }
                        })
                        .on('drag', function draging(e) {
                            const [nowx] = pointer(e, container.current)
                            const { x, originLeft } = styleobj
                            const nowLeft = originLeft + (nowx - x)
                            select(this).style(
                                'left',
                                `${
                                    (nowLeft /
                                        (realSize.realWidth + left + right)) *
                                    100
                                }%`
                            )
                            const lineKey = select(this).attr('data-key')
                            forEach(
                                select(container.current).selectAll(
                                    '.label-line'
                                )._groups[0],
                                d => {
                                    if (
                                        select(d).attr('data-key') === lineKey
                                    ) {
                                        const lineX = Number(
                                            select(d).attr('data-x')
                                        )
                                        const originX = lineX + left - 70
                                        const linePath = path()
                                        moveDis = nowLeft - originX
                                        linePath.moveTo(moveDis, lineY)
                                        linePath.bezierCurveTo(
                                            moveDis + moveDis / 4,
                                            -1.5,
                                            -10,
                                            -15,
                                            0,
                                            0
                                        )
                                        select(d).attr('d', linePath.toString())
                                    }
                                }
                            )
                            isDrag = true
                        })
                        .on('end', function draged() {
                            if (isDrag) {
                                const nowKey = select(this).attr('data-key')
                                const signObj = { ...clickSign }
                                signObj[nowKey] = moveDis
                                setClickSign({ ...signObj })
                            }
                        })
                )
        }, 0)
    }, [clickSign, left, lineY, realSize, right])

    const initPath = useMemo(() => {
        const pathd = path()
        pathd.moveTo(0, lineY)
        pathd.bezierCurveTo(0, -10, 0, -10, 0, 0)
        return pathd.toString()
    }, [lineY])

    return (
        <div className={style['asset-time-chart-container']} ref={container}>
            <div
                className='refresh-icon'
                style={{ display: `${!isEmpty(clickSign) ? 'block' : 'none'}` }}
                onClick={() => {
                    setClickSign({})
                    select(container.current)
                        .selectAll('.label-line')
                        .attr('d', initPath)
                }}
            >
                <Tooltip title='全部重置'>
                    <RedoOutlined />
                </Tooltip>
            </div>
            <div className='chart-title'>
                {`图${type === 'srv' ? '二' : '一'}：检出时间分布`}
            </div>
            <div ref={svgRef} className='asset-time-chart'>
                <BasicCustomChart
                    parentRef={svgRef}
                    chartPadding={{ top, right, bottom, left }}
                    data={useData}
                    callbackRealSize={setRealSize}
                    customHeight={height}
                >
                    <g transform={`translate(${left}, ${top})`}>
                        <g className='split-g'>
                            {[6, 9, 12, 18, 22].map(d => {
                                const x = timeScale(d * 3600)
                                return (
                                    <g transform={`translate(${x}, 0)`} key={x}>
                                        <line
                                            x1={0}
                                            y1={40}
                                            x2={0}
                                            y2={
                                                realSize.realHeight +
                                                bottom -
                                                10
                                            }
                                            key={d}
                                        />
                                        <text y={realSize.realHeight + bottom}>
                                            {`${d}:00`}
                                        </text>
                                    </g>
                                )
                            })}
                        </g>
                        <g className='axis-g'>
                            {dayArr.map(d => (
                                <g
                                    key={d.day}
                                    transform={`translate(0, ${
                                        dayScale(d.day) || 0
                                    })`}
                                    className={`xAxis-item axis-${d.day}`}
                                >
                                    <text x={-10} className='xAxis-label'>
                                        {d.day}
                                    </text>
                                </g>
                            ))}
                        </g>
                        <g className='unit-g'>
                            {useData.map(d => {
                                let opacity = showtips ? 0.1 : 1
                                if (showtips && showtips === d.gAttr.key)
                                    opacity = 1

                                return (
                                    <g
                                        {...d.gAttr}
                                        opacity={opacity}
                                        onMouseEnter={() => {
                                            setshowtips(d.gAttr.key)
                                        }}
                                        onMouseLeave={() => setshowtips(false)}
                                    >
                                        <path
                                            className='label-line'
                                            d={initPath}
                                            data-key={d.gAttr.key}
                                            data-x={d.x}
                                        />
                                        {/* <line
                                        className='label-line'
                                        {...{
                                            x1: 0,
                                            y1: -20,
                                            x2: 0,
                                            y2: 0,
                                        }}
                                    /> */}
                                        <circle {...d.cAttr} />
                                    </g>
                                )
                            })}
                        </g>
                    </g>
                </BasicCustomChart>
            </div>
            {useData.map(d => {
                const {
                    gAttr: { key: gAttrKey },
                } = d
                let opacity = showtips ? 0.1 : 1
                if (showtips && showtips === gAttrKey) {
                    opacity = 1
                }
                const isSelect = showtips === gAttrKey
                const tipsWidth = isSelect ? 400 : 140
                const x = clickSign[gAttrKey] ? clickSign[gAttrKey] + d.x : d.x
                let tipsLeft = Math.max(0, left + x - tipsWidth / 2)
                if (tipsLeft + tipsWidth > realSize.realWidth + left + right) {
                    tipsLeft = realSize.realWidth + left + right - tipsWidth
                }
                return (
                    <SmallTips
                        data-key={gAttrKey}
                        data={d.data}
                        key={gAttrKey}
                        eventAttr={{
                            onMouseEnter: () => {
                                setshowtips(gAttrKey)
                            },
                            onMouseLeave: () => {
                                setshowtips(false)
                            },
                        }}
                        style={{
                            left: `${
                                (tipsLeft /
                                    (realSize.realWidth + left + right)) *
                                100
                            }%`,
                            bottom: `${height + 20 - d.y}px`,
                            opacity,
                        }}
                        showDetail={isSelect}
                        type={type}
                        className={isSelect ? 'show' : ''}
                        mainInfo={d.data.mainInfo}
                        detailInfo={d.data.detailInfo}
                    />
                )
            })}
        </div>
    )
}

function SmallTips({
    data,
    className = '',
    showDetail = false,
    eventAttr,
    type,
    detailInfo = [],
    mainInfo = [],
    ...attr
}) {
    return (
        <div className={`tips ${className}`} {...attr}>
            <div className='content' {...eventAttr}>
                <div className='detail-info'>
                    {showDetail &&
                        detailInfo.map(d => (
                            <div className='content-item' key={d[0]}>
                                <div className='content-item-label'>{`${d[0]}：`}</div>
                                <div className='content-item-value'>{d[1]}</div>
                            </div>
                        ))}
                </div>
                <div className='gap' />
                <div className='main-info'>
                    {mainInfo.map(d => (
                        <div className='content-item' key={d[0]}>
                            <div className='content-item-label'>{`${d[0]}：`}</div>
                            <div className='content-item-value'>{d[1]}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function ExpandContent({ record, type, changeData }) {
    const { data } = record
    return (
        <div className={style['asset-table-expand']}>
            {type === 'srv' && <AssetInfoTreeChart data={data} />}
            <AssetTimeLine changeData={changeData} data={data} type={type} />
        </div>
    )
}

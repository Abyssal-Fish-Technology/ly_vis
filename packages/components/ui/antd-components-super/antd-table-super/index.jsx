import React, {
    useEffect,
    createContext,
    useState,
    useContext,
    useCallback,
    useRef,
    useMemo,
} from 'react'
import { geoinfo } from '@/service'
import ProTable from '@ant-design/pro-table'
import { chain, compact, isArray, isEmpty, isObject, reduce } from 'lodash'
import { Button } from 'antd'
import FlagIcon from '../../icon/icon-flag'
import ExportTableComponent from '../../table/export-table'
import style from './index.module.less'

const FlagCodeContext = createContext({})
const { Provider: FlagProvider } = FlagCodeContext

/**
 * 基于ProTable做个自己的一个table封装组件
 * @param {ipKeys | Array}  数组中的项是ip的字段名，用于国旗图标的显示
 * @param {rowKey | String}  每自定义的每一行的key值，可以通过function返回key字符串。function参数就是record
 * @param {options | Object}  table 工具栏，设为 false 时不显示.传入 function 会点击时触发
 * @param {onChange | Function}  分页、排序、筛选变化时触发的回调函数
 * @param {columns | Array}  是table的columns，传入后还要进行一次空值显示的格式化
 * @param {dataSource | Array}  数据
 * @param {pagination | Object}  分页的配置，有默认的配置，这里传入的是额外的配置，也可以替换默认配置
 * @param {rowSelection | Object}  批量选择的配置，有默认的配置
 * @param {selectionCallBack | Function}  批量选中后的回调函数，把选中项作为参数传出去，如果需要批量操作就传入该方法，否则视为不开启多选功能
 * @param {toolBarRender | Function}  右上角工具栏，function返回DOM数组，例如右上角的导出按钮，和正常的写法一样
 * @param {exportParams | Object}  数据导出的配置项，包括 fields、exportData、selectData、originalData、selectOriginalData、fileName，配置项为空时无导出按钮,toolBarRender为false时不显示
 * @param {sortDirections | Array}  支持的排序方式，取值为 ascend descend, 值在数组中的先后顺序表示首次点击排序时的方式
 * @param {search | Object}  搜索表单，目前用不上所以默认为false，需要的时候传入配置项即可
 * @param {scroll | Object}  滚动，可设置横向和纵向滚动，指定滚动区域的宽高，也可以指定onchange之后是否滚动到表格顶部，默认设置了横向滚动
 * @param {tableAlertRender | Function}  自定义批量操作工具栏左侧信息区域,function传入两个参数：当前选择项数组以及清除选项的方法（清除方法是自带的），传入false不显示
 * @param {tableAlertOptionRender | Function}  自定义批量操作工具栏右侧选项区域，同样也是function返回dom，参数和tableAlertRender一样，例如批量删除等可以放在里面，现在打算把大部分table的批量操作统一样式（除开特殊需求的，例如总览的工作台，地方太小放不下）
 * @param {changePageCallBack | Function}  分页变化的回调函数，page和size 作为参数
 * @param {showBoxShadow | Boolean}  表示table是否展示阴影
 * @param {tableProps | Object}  其它的 table配置
 * @returns
 */
export default function AntdTableSuper({
    ipKeys = [],
    rowKey = '',
    options = { reload: false, fullScreen: false },
    onChange = () => {},
    columns = [],
    dataSource = [],
    pagination = {},
    rowSelection = {},
    selectionCallBack = false,
    toolBarRender = () => [],
    exportParams = false,
    sortDirections = ['descend', 'ascend'],
    search = false,
    scroll = { x: true },
    tableAlertRender = ({ selectedRowKeys, onCleanSelected }) => {
        return (
            <div className='select-info-box'>
                已选择
                <span className='select-number'>{selectedRowKeys.length}</span>
                项目
                <Button type='link' onClick={() => onCleanSelected()}>
                    取消选择
                </Button>
            </div>
        )
    },
    tableAlertOptionRender = false,
    changePageCallBack = false,
    showBoxShadow = true,
    ...tableProps
}) {
    const paginationRef = useRef()
    const [page, setPage] = useState({ size: 10, page: 1 })

    const usePagination = useMemo(() => {
        return pagination
            ? {
                  position: ['topRight', 'bottomRight'],
                  pageSize: page.size,
                  ...pagination,
              }
            : false
    }, [page, pagination])

    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [selectedRows, setSelectedRows] = useState([])

    useEffect(() => {
        setSelectedRowKeys([])
        setSelectedRows([])
    }, [dataSource, page, setSelectedRowKeys])

    useEffect(() => {
        if (changePageCallBack) {
            changePageCallBack(page)
        }
    }, [changePageCallBack, page])

    useEffect(() => {
        if (selectionCallBack) {
            selectionCallBack(selectedRowKeys, selectedRows)
        }
    }, [selectionCallBack, selectedRows, selectedRowKeys])

    paginationRef.current = usePagination

    const [flagCodeObj, setflagCodeObj] = useState({})

    const ipKeysStr = ipKeys.join()

    const initData = useCallback(
        (dataSources, start, end) => {
            const ipKeysArr = ipKeysStr.split(',')
            const useStr = chain(dataSources)
                .slice(start, end)
                .map(d => ipKeysArr.map(k => d[k]))
                .flatten()
                .uniq()
                .compact()
                .join()
                .value()
            if (useStr) {
                geoinfo(useStr).then(res => {
                    const flagCodeObjs = reduce(
                        res,
                        (obj, d) => {
                            const { ip: key, result = [] } = d
                            obj[key] =
                                (result[11] || '').toLocaleLowerCase() ||
                                (result[0] === '局域网' ? 'lan' : 'unknow')
                            return obj
                        },
                        {}
                    )
                    setflagCodeObj(flagCodeObjs)
                })
            }
        },
        [ipKeysStr]
    )

    useEffect(() => {
        const pageSize =
            paginationRef.current === false
                ? dataSource.length
                : (paginationRef.current || {}).pageSize ||
                  (paginationRef.current || {}).defaultPageSize ||
                  10
        initData(dataSource, 0, pageSize)
    }, [dataSource, initData])

    const handleChange = useCallback(
        (...args) => {
            const [{ current, pageSize }, , , { currentDataSource }] = args
            const { size, page: oldPage } = page
            const start = (current - 1) * pageSize
            const end = current * pageSize
            initData(currentDataSource, start, end)
            if (size !== pageSize || oldPage !== current) {
                setPage({ size: pageSize, page: current })
            }

            onChange(...args)
        },
        [initData, onChange, page]
    )

    const useColumns = useMemo(() => {
        const result = columns.map(d => {
            const { render = '' } = d
            return {
                ...d,
                render: (d1 = '', r, i, a) => {
                    // 分别对d1 为对象、数组和字符串的情况做了真值判断
                    const objResult = isObject(d1) ? !isEmpty(d1) : true
                    const arrResult = isArray(d1)
                        ? compact(d1).length > 0
                        : true

                    const resultText =
                        render && d1 !== '-' ? render(d1, r, i, a) : d1
                    return objResult && arrResult ? resultText : '-'
                },
            }
        })

        return result
    }, [columns])

    const useToolBarRender = useMemo(() => {
        const toolArr = []
        if (toolBarRender) {
            toolArr.push(...toolBarRender())
            if (exportParams) {
                toolArr.push(<ExportTableComponent {...exportParams} />)
            }
        }
        return toolBarRender ? () => toolArr : false
    }, [exportParams, toolBarRender])

    return (
        <div
            className={`${style['antd-table-super']} ${
                showBoxShadow ? '' : style['hide-box-shadow']
            } `}
        >
            <FlagProvider value={flagCodeObj}>
                <ProTable
                    rowKey={rowKey}
                    search={search}
                    options={options}
                    dataSource={dataSource}
                    scroll={scroll}
                    onChange={handleChange}
                    columns={useColumns}
                    pagination={usePagination}
                    toolBarRender={useToolBarRender}
                    rowSelection={
                        selectionCallBack
                            ? {
                                  selectedRowKeys,
                                  onChange: (keys, rows) => {
                                      setSelectedRowKeys(keys)
                                      setSelectedRows(rows)
                                  },
                                  ...rowSelection,
                              }
                            : false
                    }
                    tableAlertRender={tableAlertRender}
                    tableAlertOptionRender={tableAlertOptionRender}
                    sortDirections={sortDirections}
                    {...tableProps}
                />
            </FlagProvider>
        </div>
    )
}

// columns的render中渲染
export function TdFlag({ ip }) {
    const flagCodeObj = useContext(FlagCodeContext)
    return typeof flagCodeObj[ip] !== 'undefined' ? (
        <FlagIcon code={flagCodeObj[ip]} />
    ) : null
}

import React from 'react'
import { Input, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words'
import { isArray } from 'lodash'
import { TagAttribute } from '../../ui/tag'
import { getDeviceType } from './methods-net'

/** ********************************************************************** TableSortHandler start ***********************************************************************
 ** 表格排序方法
 ** 关键字： sort
 * */

/**
 * 表格字段排序
 * @param {String} key
 */
export function valueSort(key, objKeyArr) {
    return (a, b) => {
        const [valueA, valueB] = [a[key], b[key]]
        const aType = Object.prototype.toString.call(valueA)
        let [resultA, resultB] = [a[key], b[key]]
        if (aType === '[object String]') {
            const {
                hasIp: hasIp_A = false,
                isOnlyPort: isOnlyPortA = false,
            } = getDeviceType(valueA)
            const {
                hasIp: hasIp_B = false,
                isOnlyPort: isOnlyPortB = false,
            } = getDeviceType(valueB)

            if (hasIp_A && hasIp_B) {
                const [ipA, portA = '00000'] = valueA.split(':')
                const [ipB, portB = '00000'] = valueB.split(':')
                resultA = [
                    ipA
                        .split('.')
                        .map(e => e.padStart(3, '0'))
                        .join(''),
                    portA.padStart(5, '0'),
                ].join('')
                resultB = [
                    ipB
                        .split('.')
                        .map(e => e.padStart(3, '0'))
                        .join(''),
                    portB.padStart(5, '0'),
                ].join('')
            }
            if (isOnlyPortA && isOnlyPortB) {
                resultA = Number(valueA)
                resultB = Number(valueB)
            }
        }

        if (aType === '[object Array]') {
            resultA = valueA.length || 0
            resultB = valueB.length || 0
        }
        if (aType === '[object Object]') {
            objKeyArr.forEach(d => {
                resultA = resultA[d] || ''
                resultB = resultB[d] || ''
            })
            if (isArray(resultA)) {
                resultA = resultA.length
                resultB = resultB.length
            }
        }
        return resultA > resultB ? 1 : -1
    }
}

/** ***********************************************************************  end ************************************************************************* */

/** ********************************************************************** TableStyleHandler start ***********************************************************************
 ** 表格样式方法
 ** 关键字： style
 * */

/**
 * 表格高度样式计算
 * @param {String} searchText
 */
export function withHighlight(searchText) {
    return ({ children }) => {
        return (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={children.toString ? children.toString() : ''}
            />
        )
    }
}

/** ***********************************************************************  end ************************************************************************* */

/** ********************************************************************** TableSearchHandler start ***********************************************************************
 ** 表格样式方法
 ** 关键字： style
 * */

/**
 * 表头字段内容搜索方法
 * @param {String} dataIndex
 * @param {DOM} render
 * @return {Array}
 */
export function GetColumnSearchProps(dataIndex, render) {
    const filterState = {
        inputEle: null,
        searchText: '',
    }

    const handleSearch = (selectedKeys, confirm) => {
        confirm()
        ;[filterState.searchText] = selectedKeys
    }
    const handleReset = clearFilters => {
        clearFilters()
        filterState.searchText = ''
    }
    return {
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
        }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        filterState.inputEle = node
                    }}
                    // placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() => handleSearch(selectedKeys, confirm)}
                    style={{
                        width: 128,
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Button
                    type='primary'
                    onClick={() => handleSearch(selectedKeys, confirm)}
                    icon={<SearchOutlined />}
                    size='small'
                    style={{ width: 60, marginRight: 8 }}
                >
                    搜索
                </Button>
                <Button
                    onClick={() => handleReset(clearFilters)}
                    size='small'
                    style={{ width: 60 }}
                >
                    重置
                </Button>
            </div>
        ),
        filterIcon: filtered => (
            <SearchOutlined
                style={{ color: filtered ? '#4091f7' : undefined }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex]
                      .toString()
                      .toLowerCase()
                      .includes(value.toLowerCase())
                : false,
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => filterState.inputEle.select(), 100)
            }
        },
        render(t, d, i) {
            const H = withHighlight(filterState.searchText)
            return render ? render(t, d, i, H) : <H>{t}</H>
        },
    }
}

/** ***********************************************************************  end ************************************************************************* */

/**
 * 数组中多个值展示tag计算
 * @param {String | Array} value 传入的值，可以使数组或按指定分隔符转换的数组字符串
 * @param {String} separator 自定义的分隔符
 * @param {String} tagType tag类型，包括： mo、event、asset、eventDetail、sfaeTi、black
 * @returns Tag
 */
export function calculateTags(value = '', separator = '', tagType = '') {
    let resultList = value
    if (!isArray(value) && separator) {
        resultList = value.split(separator)
    } else if (isArray(value)) {
        resultList = value
    } else {
        resultList = [value]
    }
    return (
        <div>
            {resultList
                .filter(d1 => d1 && d1 !== ' ')
                .map(d => {
                    return d ? (
                        <TagAttribute key={d} type={tagType}>
                            {d}
                        </TagAttribute>
                    ) : null
                })}
        </div>
    )
}

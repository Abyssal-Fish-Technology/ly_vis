import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { Button, Col, Form, Row } from 'antd'
import { chain, isArray } from 'lodash'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getUrlParams } from '../../../utils/universal/methods-router'
import { TagAttribute } from '../../tag'
import style from './index.module.less'

export function TagArray({ tagArr, value = [], onChange, callback }) {
    const useTagArr = [
        {
            name: '全部',
            value: '$_all',
        },
        ...tagArr,
    ]

    const getNewValue = valueItem => {
        if (valueItem === '$_all') {
            onChange([])
            callback()
            return
        }
        const newValue = [...value]
        const index = value.indexOf(valueItem)
        if (index > -1) {
            newValue.splice(index, 1)
        } else {
            newValue.push(valueItem)
        }
        onChange(newValue)
        callback()
    }

    return useTagArr.map(tagItem => {
        const { name, value: itemValue } = tagItem
        const isSelect = value.includes(itemValue)
        const color =
            isSelect || (!value.length && itemValue === '$_all') ? 'blue' : ''
        return (
            <TagAttribute
                color={color}
                key={itemValue}
                value={itemValue}
                onClick={() => getNewValue(itemValue)}
                className='filter-tag'
            >
                {name}
            </TagAttribute>
        )
    })
}

// 插入展示器
function FilterBar({ wraperSelector, conditionArray, cancelCB }) {
    const [currentNode, setCurrentNode] = useState(null)
    useEffect(() => {
        setCurrentNode(
            Object.prototype.toString.call(wraperSelector) ===
                '[object HTMLDivElement]'
                ? wraperSelector
                : document.querySelector(wraperSelector)
        )
    }, [wraperSelector, conditionArray])

    return (
        <div>
            {conditionArray.length > 0 &&
                currentNode &&
                createPortal(
                    <div className={style['form-filter-show']}>
                        <TagAttribute
                            onClick={() => {
                                cancelCB()
                            }}
                            className='form-filter-show-tag'
                        >
                            重置
                        </TagAttribute>
                        <span className='split'>:</span>
                        {conditionArray.map(tagItem => {
                            const { key, secondKey = '', value, name } = tagItem
                            return (
                                <TagAttribute
                                    onClose={() => {
                                        cancelCB(key, value, secondKey)
                                    }}
                                    closable
                                    key={`${key}-${secondKey}-${value}`}
                                    className='form-filter-show-tag'
                                >
                                    {name}
                                </TagAttribute>
                            )
                        })}
                    </div>,
                    currentNode
                )}
        </div>
    )
}

/**
 * ***************************
 * 生成查询条件UI, 并返回查询的值
 * ***************************
 * @param {formContent} Array,
 * eg: [
 *  {
        name: 'protocol', // 表单元素的key
        label: '协议', // 表单元素的label
        type: 'tag', //【tag, custom】 tag是自动生成标签选择条目，custom是自定义。
        tagArr: [ // 当 type = tag的时候的数据
            {
                name: 'TCP协议', // tagItem的展示内容
                value: 'tcp', // tagItem实际的value
            },
        ],
    },
    {
        name: 'isEvent',
        label: '事件命中',
        type: 'custom', //自定义组件
        content: <Input />, // 自定义组件内容
    },
 * ]
 * @param {callback} Fun, 回调函数
 * @param {getForm} Fun 获取当前表单的form
 * @param {filterBarInsertClassName} String,
 * 查询条件展示的条状图，需要展示的在哪个元素的前面 回调函数
 * @param {simply} Boolean 是否展示简化模式，默认为false
 * @param {simply} 是否展示简化模式，默认为false
 *
 * @returns
 */
export default function FormFilter({
    formContent,
    callback,
    getForm,
    formAttr = {},
    filterBarWrapperSelector = false,
}) {
    const [form] = Form.useForm()
    const [filterCondition, setFilterCondition] = useState([])

    // 目前使用值和显示值不一样的有两个：Select 和 TagArr
    const translateObj = chain(formContent)
        .filter(d => d.type === 'tag')
        .map(d => [d.name, d.tagArr])
        .reduce((obj, d) => {
            const [name, valueArr] = d
            const detailObj = {}
            valueArr.forEach(v => {
                detailObj[v.value] = v.name
            })
            obj[name] = detailObj
            return obj
        }, {})
        .value()

    useEffect(() => {
        const c = getUrlParams('filterCondition')
        if (c && c.moid) {
            // moSelect组件中的id是Number，转换一下
            c.moid = Number(c.moid)
        }
        const result = chain(c)
            .entries()
            .map(item => {
                const [key, value] = item
                if (isArray(value)) {
                    const valueArr = []
                    value.forEach(d => {
                        valueArr.push(...d.split(','))
                    })
                    return {
                        key,
                        value: valueArr,
                    }
                }
                return {
                    key,
                    value,
                }
            })
            .reduce((obj, item) => {
                const { key, value } = item
                obj[key] = value
                return obj
            }, {})
            .value()

        form.setFieldsValue(result)
        form.submit()
    }, [form])

    useEffect(() => {
        if (getForm) {
            getForm(form)
        }
    }, [getForm, form])

    /**
     * 目前的值有三种数据格式。
     * 1, String.Number,Boollean等单一格式的
     * 2, Array，内部也是单一格式。主要针对一个属性的多种值。
     * 3, Obj, 内部也是由单一格式组成，主要是针对一些复杂的组件查询，
     *    最难的也是Obj，输出形式应该把Obj的给解构出去。
     */
    function formSubmit(formValue) {
        // 获取有意义的值
        /**
         * 本组件的意义是产生具体的查询条件，所以只返回具体的操作后的结果，
         * 无操作或者无意义的值都不予返回。
         * 这也就决定了关于callback,只能循环真正的值
         *
         * 目前无意义的值：
         * 1、undefined，因为没有默认值。
         *  是undefined的值就直接剔除出去，因为你不清楚他本该的值的数据类型。
         * 2、[]，空数组，对应多选值的全选状态！应该在返回值中剔除
         * 3、''，空字符串，对应的应该是没有任何操作，应该在返回值中剔除
         * 4、{}, 空对象，空对象本身是不应该出现的，//!因为存在Obj必定有值
         * !应该是在结构这个对象的时候，展示出来的具体值的时候再决定是否留住
         * 5、0和false。这个应该是用户操作的结果需要保留。
         *
         * ?所以应该 先将Obj的全部解构，然后再将undefined, [], ''全部删除。
         */
        const newobj = chain(formValue)
            .entries()
            // 将最外层的Obj解构出来
            .reduce((arr, valueItem) => {
                if (
                    Object.prototype.toString.call(valueItem[1]) ===
                    '[object Object]'
                ) {
                    arr.push(...Object.entries(valueItem[1]))
                } else {
                    arr.push(valueItem)
                }
                return arr
            }, [])
            // 移除未操作的值
            .filter(valueItem => {
                const [, value] = valueItem
                return (
                    (Array.isArray(value) && value.length > 0) ||
                    (!Array.isArray(value) &&
                        value !== undefined &&
                        value !== '')
                )
            })
            .reduce((obj, valueItem) => {
                const [key, value] = valueItem
                obj[key] = value
                return obj
            }, {})
            .value()

        const newFilterCondition = Object.entries(formValue)
            .reduce((arr, valueItem) => {
                const [key, value] = valueItem
                if (Array.isArray(value)) {
                    arr.push(
                        ...value.map(d => ({
                            name: translateObj[key][d] || d,
                            key,
                            value: d,
                        }))
                    )
                } else if (
                    Object.prototype.toString.call(value) === '[object Object]'
                ) {
                    arr.push(
                        ...Object.entries(value).map(d => ({
                            name: d[1],
                            key,
                            secondKey: d[0],
                            value: d[1],
                        }))
                    )
                } else {
                    arr.push({
                        name: value,
                        key,
                        value,
                    })
                }
                return arr
            }, [])
            .filter(d => ![undefined, ''].includes(d.value))
        setFilterCondition(newFilterCondition)
        if (callback) callback(newobj)
    }

    function resetForm() {
        form.resetFields()
        formSubmit({})
    }

    const [fold, setfold] = useState(true)

    return (
        <div>
            <Form
                form={form}
                onFinish={formSubmit}
                className={`${style['form-filter']} ${fold ? 'fold' : ''}`}
                {...formAttr}
            >
                <Row>
                    {formContent.map(formItem => {
                        // form-filter内容布局调整，使用antd的栅格来做的布局：
                        // 1、tag类型的只能单独占一行，常规表单默认是inline布局（目前都是custom类型）
                        // 2、按栅格均分为三列，配置时可以额外传入一个参数 colSize，它的值可以是1、2、3，默认为1
                        // 3、colSize=1（span=8），colSize=2（span=16），colSize=3（span=24），tag类型直接就是24（不会被colSize影响），默认colSize=1
                        // 4、labelCol：label在栅格中的所占的比例，span为8时，labelCol=6，span=16时，labelCol=3，span=24时，labelCol=2。
                        // labelCol值2、3、6的取值依据，最开始每个类型都占据一行时也就是span=24时，labelcol设置的是2，现在依然延续这个设置，只是多了两种情况
                        // 为了保持labelCol的宽度一致（美观），所以等比增加labcol的值
                        const {
                            type = 'custom',
                            name,
                            label,
                            content,
                            tagArr,
                            itemAttr = {},
                            colSize = 1,
                        } = formItem
                        let contentItem = ''

                        const gridObj = {
                            1: { span: 8, labelCol: 6 },
                            2: { span: 16, labelCol: 3 },
                            3: { span: 24, labelCol: 2 },
                        }
                        const { span, labelCol } = gridObj[colSize]
                        switch (type) {
                            case 'custom':
                                contentItem = content
                                break
                            case 'tag':
                                contentItem = (
                                    <TagArray
                                        callback={() => form.submit()}
                                        tagArr={tagArr}
                                    />
                                )
                                break
                            default:
                                break
                        }
                        return (
                            <Col span={type === 'tag' ? 24 : span} key={name}>
                                <Form.Item
                                    {...itemAttr}
                                    className={`${
                                        formItem.basic ? '' : 'minor'
                                    } ${type === 'tag' ? 'tag-content' : ''}`}
                                    name={name}
                                    label={label}
                                    labelCol={{
                                        span: type === 'tag' ? 2 : labelCol,
                                    }}
                                >
                                    {contentItem}
                                </Form.Item>
                            </Col>
                        )
                    })}
                    <Col flex='auto' span={24}>
                        <Form.Item className='operate-button'>
                            <Button
                                className='operate-item'
                                onClick={resetForm}
                            >
                                重置
                            </Button>
                            <Button
                                type='primary'
                                className='operate-item'
                                htmlType='submit'
                            >
                                查询
                            </Button>
                            <Button
                                size='small'
                                type='link'
                                className='operate-item'
                                icon={fold ? <DownOutlined /> : <UpOutlined />}
                                onClick={() => setfold(!fold)}
                            >
                                {fold ? '展开' : '收起'}
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            <FilterBar
                wraperSelector={filterBarWrapperSelector}
                conditionArray={filterCondition}
                cancelCB={(key = 'all', value, secondKey) => {
                    if (key === 'all') {
                        resetForm()
                        return
                    }
                    const nowValue = form.getFieldValue(key)
                    if (Array.isArray(nowValue)) {
                        form.setFieldsValue({
                            [key]: nowValue.filter(d => d !== value),
                        })
                    } else if (
                        Object.prototype.toString.call(nowValue) ===
                        '[object Object]'
                    ) {
                        form.setFieldsValue({
                            [key]: {
                                ...nowValue,
                                [secondKey]: '',
                            },
                        })
                    } else {
                        form.setFieldsValue({
                            [key]: '',
                        })
                    }
                    formSubmit(form.getFieldsValue())
                }}
            />
        </div>
    )
}

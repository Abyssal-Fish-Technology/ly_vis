import React, { useCallback, useEffect, useState } from 'react'
import { Form, Button } from 'antd'
import { observer } from 'mobx-react'
import moment from 'moment'
import { chain, isEmpty } from 'lodash'
import { DeviceSelect, DateTimeRangePicker } from '../form-components'
import { rountTime5Min } from '../../../utils/universal/methods-time'
import { getUrlParams } from '../../../utils/universal/methods-router'
import style from './index.module.less'
import { setTopToolBoxParams } from '../../../utils/universal/methods-storage'

const FormItem = Form.Item

const Toptoolbox = ({
    toolboxArr = ['time', 'device', 'refresh'],
    extra,
    callback = () => {},
    timeDifference = 24,
    formData = {}, // 外部传入表单的值，通过这个可以从外部控制表单值
}) => {
    const [form] = Form.useForm()
    const [formCondition, setformCondition] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isEmpty(formData)) {
            form.setFieldsValue(formData)
        }
    }, [formData, form])

    const getFiledValue = useCallback(() => {
        setLoading(true)
        form.validateFields()
            .then(val => {
                const { time, devid, ...otherParams } = val
                let newCondition = {}
                // otherParams是自定义添加项的参数集合，因为不确定有哪些，还需做一个判断，有值的才会放入回调函数参数中
                const useOtherParams = chain(otherParams)
                    .entries()
                    .filter(d => d[0] && d[1])
                    .reduce((obj, item) => {
                        const [key, value] = item
                        obj[key] = value
                        return obj
                    }, {})
                    .value()
                if (!isEmpty(useOtherParams)) {
                    newCondition = {
                        ...useOtherParams,
                    }
                }
                if (time) {
                    const [starttime, endtime] = val.time.map(t =>
                        moment.isMoment(t) ? t.unix() : t
                    )
                    newCondition = {
                        ...newCondition,
                        starttime,
                        endtime,
                    }
                }
                if (devid) {
                    newCondition = {
                        ...newCondition,
                        devid,
                    }
                }

                setTopToolBoxParams(newCondition)
                setformCondition(newCondition)
                callback(newCondition).finally(() => {
                    setLoading(false)
                })
            })
            .catch(() => false)
    }, [callback, form])

    // 初始化值
    useEffect(() => {
        const { endtime, starttime, devid } = getUrlParams('queryParams') || {}
        const nowEndtime = endtime ? moment(endtime, 'X') : moment()
        const nowStarttime = starttime
            ? moment(starttime, 'X')
            : nowEndtime.clone().subtract(Number(timeDifference), 'h')
        const obj = {
            time: [nowStarttime, nowEndtime].map(t => rountTime5Min(t.unix())),
        }
        if (devid) {
            obj.devid = devid
        }

        form.setFieldsValue(obj)
        getFiledValue()
    }, [callback, form, getFiledValue, timeDifference])

    const toolboxItemObj = {
        time: (
            <DateTimeRangePicker
                name='time'
                key='time'
                inputProps={{
                    result: formCondition,
                    openChange: getFiledValue,
                }}
            />
        ),
        device: (
            <DeviceSelect
                name='devid'
                label='采集节点'
                key='devid'
                inputProps={{ className: 'toolbox-node' }}
            />
        ),
        refresh: (
            <FormItem key='refesh'>
                <Button type='primary' onClick={getFiledValue}>
                    刷新
                </Button>
            </FormItem>
        ),
    }

    const [fixedRight, setFixedRight] = useState(0)

    useEffect(() => {
        const calcFixed = () => {
            const bodyWidth = document.body.clientWidth

            if (bodyWidth >= 1440) {
                setFixedRight((bodyWidth - 1440) / 2)
            } else {
                setFixedRight(0)
            }
        }
        calcFixed()
        window.addEventListener('resize', calcFixed, false)
        return () => {
            window.removeEventListener('resize', calcFixed)
        }
    }, [])

    return (
        <div className={style.toolboxs}>
            <div className={`${loading ? 'app-loading' : ''} page-loading `} />
            <Form
                form={form}
                layout='inline'
                className='toolbox-form'
                style={{ marginRight: fixedRight }}
            >
                {!!extra &&
                    extra.map(d => {
                        const {
                            key,
                            props: {
                                name = '',
                                label = '',
                                valuepropname = '',
                            }, // 自定添加项可以传入字段名name和label
                        } = d
                        return (
                            <FormItem
                                key={key}
                                label={label}
                                name={name}
                                valuePropName={valuepropname}
                            >
                                {d}
                            </FormItem>
                        )
                    })}
                {toolboxArr.map(d => toolboxItemObj[d])}
            </Form>
        </div>
    )
}

export default observer(Toptoolbox)

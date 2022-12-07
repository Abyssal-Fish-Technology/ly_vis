import { eventEvidence } from '@/service'
import { CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Descriptions, Tooltip } from 'antd'
import { chain, find, isEmpty, isObject, maxBy } from 'lodash'
import { parse } from 'qs'
import React, { useCallback, useMemo, useState, useEffect, memo } from 'react'

import { formatTimestamp } from '../../../utils/universal/methods-time'
import { copy } from '../../../utils/universal/methods-ui'
import { AntdEmptySuper } from '../../antd-components-super'
import UnitContainer from '../unit-container'
import style from './index.module.less'

function CopyContainer({ title, content, children }) {
    return (
        <>
            {children}
            {content && (
                <Tooltip title={title}>
                    <CopyOutlined
                        onClick={() => {
                            copy(content)
                        }}
                    />
                </Tooltip>
            )}
        </>
    )
}

function TooltipLable({ label, tooltips }) {
    return (
        <>
            <span>{label}</span>
            <span style={{ marginLeft: '3px' }}>
                <Tooltip title={tooltips}>
                    <QuestionCircleOutlined />
                </Tooltip>
            </span>
        </>
    )
}

function HttpPayloadContent(httpPayload) {
    // 为了解决payload中出现'../'的情况，这里需要把header分割一下，'..'作为split的分隔符只适用于HTTP/之后的内容
    const httpIndex = httpPayload.header.indexOf(
        '..',
        httpPayload.header.indexOf('HTTP/')
    )
    const isResponse =
        httpPayload.header.slice(0, 4).toLocaleUpperCase() === 'HTTP'
    const isRequestGet =
        httpPayload.header.slice(0, 3).toLocaleUpperCase() === 'GET'
    const isRequestPost =
        httpPayload.header.slice(0, 4).toLocaleUpperCase() === 'POST'

    const httpHeaderStr = httpPayload.header.substr(0, httpIndex)
    let payload_params = ''
    const parseHeader = chain(httpPayload.header.substr(httpIndex))
        .split('..')
        .unshift(httpHeaderStr)
        .filter(d => d)
        .map((d, i) => {
            const [headerlabel, ...headerValueArr] = d.includes('HTTP/')
                ? [d]
                : d.split(':')
            // HTTP信息单独占一行，所以检测label中是否含有http，如有，就从indexOf的索引值开始切割，前面的为请求头，
            // 后面的是http信息，有时候请求头为空，所以需要判断,http后面还可能会跟请求状态，也需要判断一下
            if (headerlabel.includes('HTTP/')) {
                const httpStr = headerlabel.substring(
                    headerlabel.indexOf('HTTP/')
                )
                const headarr = []
                const headerStr = headerlabel.substring(
                    0,
                    headerlabel.indexOf('HTTP/') - 1
                )
                // 只有请求包才有Request URL 和 Request Method，所以判断一下如果headerStr有POST或者GET时才进入，如果是相应包，开头就是HTTP，不会有GET和POST
                if (headerStr && (isRequestGet || isRequestPost)) {
                    const sliceIndex = isRequestPost ? 4 : 3
                    const requestMethod = headerStr.slice(0, sliceIndex)
                    const url = headerStr.slice(sliceIndex)

                    const [requestUrl, params] = url.includes('??')
                        ? [url, '']
                        : url.split('?')
                    headarr.push(
                        {
                            label: 'Request URL',
                            value: isRequestPost ? url : requestUrl,
                            i,
                        },
                        {
                            label: 'Request Method',
                            value: requestMethod,
                            i,
                        }
                    )
                    if (params) {
                        payload_params = params
                    }
                }
                // 适配有状态码的情况，http协议之后有状态码，使用substring截断，之后还有还有值的话就是状态码，把它们拼接起来
                const agreement = httpStr.substring(8)
                    ? `${httpStr.substring(0, 8)} ${httpStr
                          .substring(9)
                          .replace('.', ' ')}`
                    : httpStr.substring(0, 8)
                headarr.push({
                    label: agreement,
                    value: '',
                    i,
                })

                return headarr
            }
            return {
                label: headerlabel,
                value: headerValueArr ? headerValueArr.join(':') : '',
                i,
            }
        })
        .flatten()
        .value()

    const formatGetParams = formatData => {
        try {
            return parse(formatData)
        } catch (e) {
            return formatData
        }
    }
    const formatPostParams = formatData => {
        try {
            const { value = '' } =
                find(
                    parseHeader,
                    d => d.label.toLocaleLowerCase() === 'content-type'
                ) || {}
            if (
                value
                    .toLocaleLowerCase()
                    .indexOf('application/x-www-form-urlencoded') >= 0
            ) {
                console.log(222)
                return parse(formatData)
            }
            return JSON.parse(formatData.replace('\\"', ''))
        } catch (e) {
            return formatData
        }
    }

    const requestCopyContext = isRequestPost ? httpPayload.body : payload_params
    const requestParseBody = isRequestPost
        ? formatPostParams(httpPayload.body)
        : formatGetParams(payload_params)

    const contextObj = {
        headerLabel: !isResponse ? '请求头' : '响应头',
        bodyLabel: !isResponse ? '请求参数' : '返回内容',
        copyContent: !isResponse ? requestCopyContext : httpPayload.body,
        parseBody: !isResponse ? requestParseBody : httpPayload.body,
    }
    const { headerLabel, bodyLabel, copyContent, parseBody } = contextObj
    const payload_label_width =
        isObject(parseBody) && !isEmpty(parseBody)
            ? maxBy(Object.keys(parseBody), d => d.length).length * 8
            : 0

    return [
        <Descriptions.Item
            label={
                <TooltipLable
                    label={headerLabel}
                    tooltips='无法识别字符记为“.”'
                />
            }
            span={4}
            key='Header'
        >
            <div className='description-content http-content'>
                <CopyContainer
                    title={`复制${headerLabel}`}
                    content={httpPayload.header}
                />
                {httpPayload.header.includes('HTTP/') ? (
                    <>
                        {parseHeader.map(d => (
                            <p
                                className='header-p'
                                key={`${d.label}_${d.value}_${d.i}`}
                            >
                                <span
                                    className='cap-item-label'
                                    title={d.label}
                                >
                                    {d.label}
                                </span>
                                {d.value && (
                                    <>
                                        :
                                        <span className='cap-item-value'>
                                            {d.value}
                                        </span>
                                    </>
                                )}
                            </p>
                        ))}
                    </>
                ) : (
                    httpPayload.header
                )}
            </div>
        </Descriptions.Item>,
        <Descriptions.Item
            label={
                <TooltipLable
                    label={bodyLabel}
                    tooltips='无法识别字符记为“.”'
                />
            }
            span={4}
            key='body'
        >
            <div className='description-content http-content'>
                <CopyContainer
                    title={`复制${bodyLabel}`}
                    content={copyContent}
                />
                <>
                    {isObject(parseBody) ? (
                        <>
                            <p>{!isEmpty(parseBody) && '{'}</p>
                            <div className='payload-content'>
                                {Object.entries(parseBody).map(d => {
                                    const [label, value] = d
                                    return (
                                        <div
                                            className='payload-content-item'
                                            key={`${label}_${value}_${d.i}`}
                                            style={{
                                                gridTemplateColumns: `${payload_label_width}px 8px auto`,
                                            }}
                                        >
                                            <div
                                                className='payload-item-label'
                                                title={label}
                                            >
                                                {label}
                                            </div>
                                            <div>:</div>
                                            <div className='payload-item-value'>
                                                {isObject(value)
                                                    ? JSON.stringify(value)
                                                    : value}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <p>{!isEmpty(parseBody) && '}'}</p>
                        </>
                    ) : (
                        parseBody
                    )}
                </>
            </div>
        </Descriptions.Item>,
    ]
}

function AnotherPayloadContent(payload) {
    return [
        <Descriptions.Item
            label={
                <TooltipLable label='解析后' tooltips='无法识别字符记为“.”' />
            }
            span={8}
            key='解析后'
        >
            <div className='description-content'>
                <CopyContainer title='复制包内容' content={payload} />
                <p>{payload}</p>
            </div>
        </Descriptions.Item>,
    ]
}

export const formatEvidenceData = (resData, time) => {
    const formatterHttpPayload = payload => {
        const vilidStr = payload.substr(0, 10)
        const isHttpArr = []
        ;['GET', 'POST', 'PUT', 'HTTP/'].forEach(strItem => {
            isHttpArr.push(vilidStr.indexOf(strItem) >= 0)
        })
        if (isHttpArr.includes(true)) {
            const [httpHeader, ...httpBody] = payload.split('....')
            return {
                header: httpHeader,
                body: httpBody.join(),
            }
        }
        return ''
    }
    return {
        time: resData.time_sec
            ? formatTimestamp(resData.time_sec)
            : formatTimestamp(time.toString().substr(0, 10)),
        copyTime: time,
        httpPayload: formatterHttpPayload(resData.payload || ''),
        ...resData,
    }
}

function EvidenceContent({ params = {}, data = false }) {
    const [loading, setLoading] = useState(false)
    const [evidenceData, setevidenceData] = useState({})
    const getPayload = useCallback(paramsData => {
        setLoading(true)
        eventEvidence(paramsData)
            .then(res => {
                let result = {}
                if (res[0]) {
                    const [resData] = res
                    result = formatEvidenceData(resData, paramsData.time)
                }
                setevidenceData(result)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        if (!isEmpty(params)) {
            getPayload(params)
        } else if (data) {
            setevidenceData(data)
        }
    }, [data, getPayload, params])

    const {
        time,
        pktlen,
        caplen,
        protocol,
        sip,
        smac,
        dip,
        dmac,
        httpPayload,
        payload,
    } = useMemo(() => evidenceData, [evidenceData])
    const payloadShowContent = useMemo(() => {
        return httpPayload
            ? HttpPayloadContent(httpPayload)
            : AnotherPayloadContent(payload)
    }, [httpPayload, payload])

    const deviceNode = useMemo(() => {
        if (evidenceData.devid) {
            return find(window.device, d => d.id === evidenceData.devid).name
        }
        return ''
    }, [evidenceData])

    return (
        <div
            className={`${style['evidence-modal-container']} ${
                loading ? 'app-loading' : ''
            } `}
        >
            {!isEmpty(evidenceData) ? (
                <Descriptions column={8} size='small'>
                    <Descriptions.Item label='时间' span={8}>
                        {time}
                    </Descriptions.Item>
                    <Descriptions.Item label='节点' span={2}>
                        {deviceNode}
                    </Descriptions.Item>
                    <Descriptions.Item label='包长度' span={2}>
                        {pktlen || 0}
                        <UnitContainer unit='字节' />
                    </Descriptions.Item>
                    <Descriptions.Item label='抓取长度' span={2}>
                        {caplen || 0}
                        <UnitContainer unit='字节' />
                    </Descriptions.Item>
                    <Descriptions.Item label='协议' span={2}>
                        {protocol}
                    </Descriptions.Item>
                    <Descriptions.Item label='发起方' span={2}>
                        {sip}
                    </Descriptions.Item>
                    <Descriptions.Item label='Mac地址' span={2}>
                        {smac}
                    </Descriptions.Item>
                    <Descriptions.Item label='接收方' span={2}>
                        {dip}
                    </Descriptions.Item>
                    <Descriptions.Item label='Mac地址' span={2}>
                        {dmac}
                    </Descriptions.Item>
                    {payloadShowContent}
                </Descriptions>
            ) : (
                <AntdEmptySuper
                    comStyle={{
                        height: 150,
                    }}
                />
            )}
        </div>
    )
}

export default memo(EvidenceContent)

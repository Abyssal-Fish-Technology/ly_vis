import React from 'react'
import { BasicEchart } from '@shadowflow/components/charts'
import { calculateRiskScore } from '@shadowflow/components/utils/business/methods-ti'

export default function Score({ score = 0 }) {
    const option = {
        tooltip: {
            formatter: '{a}{b} : {c}分',
        },
        min: 0,
        max: 220,
        title: {
            text: `威胁评分: ${score}`,
            top: '82%',
            left: 'center',
            textStyle: {
                fontWeight: 'normal',
                fontSize: 14,
            },
        },
        series: [
            {
                name: '评分',
                type: 'gauge',
                detail: {
                    formatter: value => calculateRiskScore(Number(value)),
                    fontSize: 16,
                    offsetCenter: [0, '48%'],
                },
                radius: '90%',
                data: [{ value: score, name: '' }],
                axisLine: {
                    lineStyle: {
                        width: 13,
                        color: [
                            [0.199, '#44e140'],
                            [0.4, '#DBDFF1'],
                            [0.6, '#feca4f'],
                            [0.8, '#ffa63f'],
                            [1, '#FF2D2E'],
                        ],
                    },
                },
                axisTick: {
                    length: 20,
                    lineStyle: {
                        color: 'auto',
                    },
                },
                splitLine: {
                    length: 20,
                    lineStyle: {
                        color: 'auto',
                    },
                },
                min: 0,
                max: 5,
            },
        ],
    }

    return <BasicEchart data={[score]} option={option} />
}

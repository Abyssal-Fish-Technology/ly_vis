import moment from 'moment'

/** ********************************************************************** TimeVerify start ***********************************************************************
 ** 时间验证方法集合
 ** 关键字： verify
 * */

/**
 * 时间戳验证
 * @param {Number} time
 * @return 验证结果
 */
export function not10Length(time) {
    if (time.toString().length !== 10) {
        console.log('时间不是10位！', time)
        return true
    }
    return false
}

/** ***********************************************************************  end ************************************************************************* */

/** ********************************************************************** TimeFormatter start ***********************************************************************
 ** 时间格式化方法集合
 ** 关键字： formatter
 * */

/**
 * 将秒级的时长语义化为字符串
 * @param {Number} value 以秒为单位的时长
 * @return 如：13天2小时5分15秒
 */
export function formatDuration(value = 0) {
    const { _data } = moment.duration(value, 's')
    const { years, months, days, hours, minutes, seconds } = _data
    const durationStr = [
        {
            name: '年',
            value: years,
        },
        {
            name: '月',
            value: months,
        },
        {
            name: '天',
            value: days,
        },
        {
            name: '小时',
            value: hours,
        },
        {
            name: '分钟',
            value: minutes,
        },
        {
            name: '秒',
            value: seconds,
        },
    ]
        .filter(d => d.value)
        .map(d => `${d.value}${d.name}`)
        .join('')
    return durationStr || '0秒'
}

/**
 * 将时间戳格式化本地字符串。支持如下三种导出格式。
 * @param {Number} time 秒级时间戳
 * @param {String} askPart 想要的格式
 */
export function formatTimestamp(time, askPart = 'all') {
    let useTime = time
    if (!time) useTime = new Date().getTime()
    if (useTime.toString().length === 10) {
        useTime = time * 1000
    }
    let timeStr = ''
    switch (askPart) {
        case 'day':
            timeStr = moment(useTime).format('YYYY-MM-DD')
            break
        case 'noday':
            timeStr = moment(useTime).format('HH:mm:ss')
            break
        case 'onlyHourMin':
            timeStr = moment(useTime).format('HH:mm')
            break
        case 'min':
            timeStr = moment(useTime).format('YYYY-MM-DD HH:mm')
            break
        case 'all':
            timeStr = moment(useTime).format('YYYY-MM-DD HH:mm:ss')
            break
        default:
            timeStr = moment(useTime).format(askPart)
            break
    }
    return timeStr
}

/** ***********************************************************************  end ************************************************************************* */

/** ********************************************************************** TimeCalculate start ***********************************************************************
 ** 时间计算方法集合
 ** 关键字： calculate
 * */

/**
 * 将传入时间对整到 5分钟的程度，
 * !注意 如果传入的时间本身就是5分钟的整数倍，那么返回的是本身。
 * @param {Number} time 秒级时间戳
 * @param {String: front | back} direction 计算方向：向后还是向前，比如：53分，向前是50，向后是55
 * @return 新的秒级时间戳
 */
export function rountTime5Min(time, direction = 'front') {
    const useTime = time * 1000
    let addTime = 0
    if (direction === 'back' && new Date(useTime).getMinutes() % 5 !== 0) {
        addTime = 300
    }
    const newTime = Math.floor(useTime / 300000) * 300 + addTime
    return newTime
}

/**
 * 计算星期天
 * @param {String|Number} dayKey
 * @return {String}
 */
export function calculateWeekday(dayKey) {
    const weekdayObj = {
        0: '周日',
        1: '周一',
        2: '周二',
        3: '周三',
        4: '周四',
        5: '周五',
        6: '周六',
    }
    return weekdayObj[dayKey]
}

/**
 * 传入秒级时间或者Moment对象，计算出该时刻属于每一天的什么时刻。
 * hour是24小时制的
 */
export function calculateDayStage(day) {
    const hour = moment(day, 'X').hours()
    let stage = '未知'
    switch (true) {
        case hour >= 0 && hour < 5:
            stage = '凌晨'
            break

        case hour >= 5 && hour < 9:
            stage = '早间'
            break

        case hour >= 9 && hour < 12:
            stage = '上午'
            break

        case hour >= 12 && hour < 14:
            stage = '午间'
            break

        case hour >= 14 && hour < 18:
            stage = '下午'
            break
        case hour >= 18 && hour < 20:
            stage = '晚间'
            break
        case hour >= 20 && hour < 24:
            stage = '深夜'
            break
        default:
            break
    }
    return stage
}

/**
 * 格式化国际标准时间格式
 * @param {*} date 传入的标准时间，如：2021-07-26T03:06:19Z
 * @returns
 */
export function formateUTC(date = '') {
    return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : ''
}

/** ***********************************************************************  end ************************************************************************* */

import fetch from '@/service/fetch'
import { initial } from 'lodash'

// 查询指定时间内的sus连接,然后将所有的威胁IP返回过来
export function susInfoGet(params) {
    // !把endtime向后推移五分钟，是为了适配topn的数据规则，防止遗漏sus连接。
    params.endtime += 300
    const useParams = {
        limit: 0,
        type: 'sus',
        ti_mark: 'res',
        ...params,
    }
    return new Promise(resolve => {
        fetch.post('feature', useParams).then(res => {
            resolve(initial(res))
        })
    })
}

window.appConfig = {
    baseUrl: '/d/', // baseUrl是Server接口文件部署的基础路径，默认在/Server/www/d下，如果没有修改路径就无需改动
    subName: '开源版',
    version: '1.0.1',
    company: '',
    capabilityDescription: [
        {
            title: '高级网络行为分析系统',
            text: '专注基于流量的网络行为识别与分析、威胁行为检测与追溯',
        },
        {
            title: '丰富的行为检测能力',
            text: '支持隧道通讯、挖矿、注入、异常服务等20余种高级威胁行为检测',
        },
        {
            title: '多元化安全应用场景',
            text: '适用于安全运维、攻防演练、异常检测、威胁调查分析等应用场景',
        },
        {
            title: '强大的可视化展示与分析',
            text:
                '看清网络通讯、看见网络行为、看懂网络威胁，守护用户数字化发展之路',
        },
    ],
    ignoreEventIpArr: ['0.0.0.0', '255.255.255.255'],
    ignoreEventSwitch: true, // 是否忽略IgnoreEventIpArr中的设备事件
    eventFeatureLimit: 100, // 事件Feature接口的条数
    isCacheRequset: true, // 缓存开关
}

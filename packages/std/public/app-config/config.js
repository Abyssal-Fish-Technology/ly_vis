window.appConfig = {
    baseUrl: '/d/',
    subName: '开源版',
    version: '1.0.1',
    company: '',
    capabilityDescription: [
        {
            title: '强大的威胁识别能力',
            text: '支持十余种告警类型，内置大量告警规则，安装即可运行。',
        },
        {
            title: '丰富的威胁情报数据',
            text: '十亿级情报数据支撑，周更新量可达3000+。',
        },
        {
            title: '全面的被动资产发现',
            text: '支持IP、URL、HOST、Service等多种资产类型被动发现。',
        },
        {
            title: '易用的可视分析界面',
            text:
                '高效易用的可视分析工具，快速发现高级威胁，分析攻击模式，描绘攻击路径。',
        },
    ],
    ignoreEventIpArr: ['0.0.0.0', '255.255.255.255'],
    ignoreEventSwitch: true, // 是否忽略IgnoreEventIpArr中的设备事件
    eventFeatureLimit: 100, // 事件Feature接口的条数
    isCacheRequset: true, // 缓存开关
}

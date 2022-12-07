import { observable, action, computed } from 'mobx'
import { eventGet } from '@/service'
import { chain, intersection, isEmpty, sumBy, values } from 'lodash'
import { formatEventData } from '@/utils/methods-event'
import { getIpAssetInfo } from '@shadowflow/components/utils/business/methods-asset'
import { getDeviceType } from '@shadowflow/components/utils/universal/methods-net'

function findTree(selectArr, data, treeObj) {
    if (!data.length) return []
    const newSelectArr = []
    let isMatch = false
    const newdata = data.filter(d => {
        const { attackNode, victimNode } = d
        const matchArr = intersection([attackNode, victimNode], selectArr)
        matchArr.forEach(selectItem => {
            const newDevice =
                selectItem === victimNode ? attackNode : victimNode
            newSelectArr.push(newDevice)
            const treePath = [...treeObj[selectItem].parentArr, selectItem]
            if (!treeObj[newDevice]) {
                treeObj[newDevice] = {
                    name: newDevice,
                    parent: selectItem,
                    data: [],
                    treePath,
                    parentData: [], // 子节点和父节点的事件数据
                    childData: [], //  父节点和子节点的事件数据
                    parentArr: [...treeObj[selectItem].parentArr, selectItem], // 层级的顺序
                    childArr: [],
                }
            }
            treeObj[newDevice].parentData.push(d)
            treeObj[newDevice].data.push(d)

            if (!treeObj[selectItem].childArr.includes(newDevice)) {
                treeObj[selectItem].childArr.push(newDevice)
            }

            treeObj[selectItem].childData.push(d)
            treeObj[selectItem].data.push(d)
        })
        if (matchArr.length > 0) isMatch = true
        return !matchArr.length
    })
    if (isMatch) {
        findTree(newSelectArr, newdata, treeObj)
    }
    const treeArr = values(treeObj)
    return treeArr
}

function calcualteTppNode(data) {
    if (!data.length) {
        return []
    }
    const nodes = chain(data)
        .reduce((obj, d) => {
            const { victimNode } = d
            if (!obj[victimNode]) {
                obj[victimNode] = {
                    name: victimNode,
                    parent: 'root',
                    data: [],
                    parentData: [], // 子节点和父节点的事件数据
                    childData: [], //
                    childArr: [], //
                }
            }
            obj[victimNode].data.push(d)
            obj[victimNode].childData.push(d)
            return obj
        }, {})
        .values()
        .forEach(d => {
            d.eventCount = d.data.length
            d.childEventCount = d.childData.length
            d.parentEventCount = 0
            d.isFirstLayer = true
        })
        .orderBy('eventCount', 'desc')
        .slice(0, 50)
        .value()
    return nodes
}
export class EventanalyseStore {
    // =============================== 获取数据 ===============================
    // 请求参数
    @observable params = {}

    // ============== 格式化后的数据 ==============
    @observable formatData = []

    @action.bound getData(params) {
        this.params = params
        return eventGet(params).then(eventRes => {
            const result = formatEventData(eventRes)
            result.forEach(eventItem => {
                const { victimIp, attackIp, victimPort, type } = eventItem
                const attackNode = type === 'srv' ? '异常服务攻击源' : attackIp
                const victimNode = type === 'port_scan' ? victimPort : victimIp
                eventItem.attackNode = attackNode
                eventItem.victimNode = victimNode
            })
            this.formatData = result
            this.useData = result
            this.params = params
        })
    }

    @action.bound changeProcessed(changeObj) {
        this.formatData = this.formatData.map(d => ({
            ...d,
            proc_status: changeObj[d.id] || d.proc_status,
        }))
    }

    // ============== 页面使用数据 ==============

    @observable useData = []

    @action.bound changeUseData(newUseData) {
        this.useData = newUseData
    }

    // ============== 表格数据 ==============
    @observable tableData = []

    @action.bound changeTableData(newTableData) {
        this.tableData = newTableData
    }

    // 根据可观测IP，去生成可观测IP生成的原始事件树。
    @observable observableIp = ''

    @action.bound changeObservableIp(newIp) {
        this.observableIp = newIp
    }

    @computed get observableIpEventTree() {
        const graphNode = this.observableIp
            ? findTree([this.observableIp], this.useData, {
                  [this.observableIp]: {
                      name: this.observableIp,
                      parent: 'root',
                      data: [],
                      parentData: [],
                      childData: [],
                      parentArr: [],
                      childArr: [],
                  },
              })
            : calcualteTppNode(this.useData)

        graphNode.forEach(nodeItem => {
            const { data: allData, childData, parentData, name } = nodeItem
            nodeItem.childEventCount = childData.length
            nodeItem.parentEventCount = parentData.length

            // 补充Size
            nodeItem.eventCount = allData.length
            nodeItem.duration = sumBy(allData, 'duration')
            nodeItem.peerDeviceCount =
                chain(allData)
                    .map(d => [d.victimNode, d.attackNode])
                    .flatten()
                    .uniq()
                    .value().length - 1

            // 补充Color映射
            let nodeType = 'unknow'
            if (!isEmpty(getDeviceType(name))) {
                nodeType = getIpAssetInfo(name).isAsset ? 'asset' : 'unknow'
            }
            if (
                allData.includes(d => d.type === 'ti' && d.attackNode === name)
            ) {
                nodeType = 'threat'
            }
            nodeItem.nodeType = [
                {
                    name: nodeType,
                    value: 1,
                },
            ]
            nodeItem.attackType = chain(allData)
                .reduce((obj, d) => {
                    const key = d.victimNode === name ? 'victim' : 'attack'
                    obj[key] = {
                        name: key,
                        value: obj[key] ? obj[key].value + 1 : 1,
                    }
                    return obj
                }, {})
                .values()
                .value()
            nodeItem.eventType = chain(allData)
                .countBy('show_type')
                .entries()
                .map(d => {
                    return {
                        name: d[0],
                        value: d[1],
                    }
                })
                .value()
        })
        console.log(graphNode)
        return graphNode
    }
}

export class EventLinkStore {
    @observable settingVis = false

    @action.bound closeSetting() {
        this.settingVis = false
    }

    @action.bound openSetting() {
        this.settingVis = true
    }

    @observable graphSetting = {
        showLabel: true,
        showType: false,
        color: 'attackType',
        size: 'eventCount',
        distance: 80,
        strength: -20,
        collide: 6,
        center: true,
        drag: true,
    }

    @action.bound changeGraphSetting(newSetting) {
        this.graphSetting = newSetting
    }

    sizeDict = {
        eventCount: '事件数量',
        peerDeviceCount: '对端设备数量',
        duration: '攻击时长',
    }

    colorDict = {
        asset: '资产设备',
        threat: '威胁设备',
        unknown: '未知设备',
        attack: '攻击设备',
        victim: '受害设备',
    }

    @observable colorObj = {
        nodeType: {},
        attackType: {},
        eventType: {},
    }

    @computed get legend() {
        const colorLegend = this.colorObj[this.graphSetting.color]
        const sizeLegend = this.sizeDict[this.graphSetting.size]
        const newLegend = {
            color: colorLegend,
            size: sizeLegend,
        }
        return newLegend
    }

    // @observable history = []

    // @action.bound refreshHistory() {}

    // @action.bound selectHistory(direction) {}

    // @action.bound changeHistory() {}
}

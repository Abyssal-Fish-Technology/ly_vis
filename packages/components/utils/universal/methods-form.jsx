/** ********************************************************************** FormFormatter start ***********************************************************************
 ** 表单格式化方法集合
 ** 关键字： formatter
 * */
/**
 * mo字段解析
 * @param {String} field
 */
export function formatterMoField(field) {
    const fieldObj = {
        id: 'ID',
        desc: '描述',
        protocol: '协议',
        filter: '过滤规则',
        direction: '方向',
        mogroup: '追踪分组',
        tag: '标签',
        pport: '对端端口',
        pip: '对端IP',
        moport: '追踪目标端口',
        moip: '追踪目标IP',
        devid: '数据源',
        addtime: '添加时间',
        groupid: 'groupid',
    }
    return fieldObj[field] || field
}

/** ***********************************************************************  end ************************************************************************* */

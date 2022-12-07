# 事件子系统说明

## 角色

整体事件系统分布：

```mermaid
graph LR
原始数据 --> 格式化数据 --> 业务数据
```

第一层：服务器数据库中。不变的原始数据。完全由后台处理。

**第二层：一系列最基础的业务配置。也就是我们的这个子系统。几乎不变的对应规则。也可以叫浅业务数据。兼容性较高。**

第三层：具体的业务层。深业务数据，只针对于某个项目中或项目中的模块使用。



Event-System就是在做第二层的事情。也就是浅业务层。

## 背景

后台事件类型变更过快，而在系统中，事件的应用极为松散，并且牵扯面非常广。

事件数据本身又抽象程度极高，响应的解析规则非常复杂。

总的来说，每次添加一个事件或者修改一个事件都会导致极大的工作量，并且对页面的破坏性很强。

所以我们需要将事件的业务逻辑进行抽象封装。

整体思想是由简单的配置去生成每个事件对应的方法、UI。从而达到修改事件类型的时候减少工作量。

而事件子系统就是提供这个收敛的配置数据和一层基础的方法。



## 事件系统的功能

## 文件结构

```
/config
	/event
		/event-item 
			index.js // 每一个事件配置
	/public 
		-index.js // 一些通用的配置
	-index.js 将所有的事件配置合并导出为EventConfig
	
/methods
	-index.js // 封装的一些底层的事件方法
	
index.js // 将method和config统一导出
```



## 使用方法

### 1、新建配置

在`config/event`下新建事件类型的文件夹和index.js

每一个EventItem的组成如下，以`黑名单事件`为例：

```js
// 具体的详细配置表格
const detailConfigColumns = [
    {
        title: '最大值',
        dataIndex: 'max',
    },
    {
        title: '数据单位',
        dataIndex: 'data_type',
    },
]

// 具体的详细配置Form
const detailConfigForms = [
    {
        label: '最小值',
        valueKey: 'min',
    },
    {
        label: '最大值',
        valueKey: 'max',
    },
]

const EventBlack = {
    type: 'black',
    name: '黑名单事件',
    objOrder: [0, 1, 2, 3],
    detailConfigColumns,
    detailConfigForms,
  	
  	/**
  		以下的共有的参数在config/index.js中会自动生成。
      params: EVENT_PARAMS,
      columns: EVENT_COLUMNS,
      forms: EVENT_FORM,
      config: {
            params: {
                ...EVENT_CONFIG_PARAMS,
                event_type: d.type,
            },
            columns: d.detailConfigColumns,
            forms: d.detailConfigForms,
        },
  	*/
}

export default EventBlack

```

### 2、主动导出

在`config/index.js`的`EventArr`变量中引入该事件类型。

结束

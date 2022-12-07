# SkipPage规则
## 页面已有的跳转

目前的由用户触发的页面跳转有以下规则

### 页面内部跳转

- 总览运维：
    - 事件列表
        - 威胁设备
        - 来源
        - 受害目标
        - 资产组
    - 事件分析页面
        - 无任何参数
- 追踪页面：
    - 事件列表
    - 资产列表


### 导航跳转

- 导航菜单跳转

### 特殊跳转

- 调往全局搜索。

## 参数的类型
- 系统参数 (用来生成filter)：system
    - 主题
    
- 过滤参数（用来初始化tableFilter的各个选项）：filterCondition
    - 该页面的tableFilter需要什么，那么它就应该是什么。
    
- 请求参数 (用来初始化toptoolbox、全局搜索参数)：queryParams
    - starttime
    - endtime
    - devid
    - 全局搜索参数
    
- 页面功能参数：pageParams

    - 例如配置页面目录,事件分析等

    


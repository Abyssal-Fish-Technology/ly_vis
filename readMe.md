# 可视化交互分析界面说明文档

## 界面部署

将下载的 `release` 或者本地打包的文件部署在服务器的 `home/Server/www/ui`文件路径下。

部署完成后，使用Chrome浏览器访问 `your server:18080/ui` ，如出现登录页面则部署成功。

## 环境介绍

### 运行环境

- 开发工具：Visual Studio Code

- 插件：
  
  - EditorConfig for VS Code
  - ESLint
  - Stylelint

- 编辑工具：node >= v16.13.1

- 包管理工具：Yarn >= v1.22.1

- 运行环境：
  
  - 推荐 Chrome 浏览器，其他现代浏览器不保证完全兼容
  - 屏幕分辨率 >= 1024

### 启动项目

1. 下载代码。

```
git clone https://gitee.com/abyssalfish-os/ly_vis.git
```

2. 初始化仓库。进入仓库，执行 `yarn`。

```
cd ly-vis
yarn
```

3. 配置服务器信息。

打开 `/packages/std/config-overrides.js`文件。修改 `devServerConfig`中 `target`变量为自己数据的Server路径。

```javascript
const devServerConfig = () => config => {
    return {
        ...config,
        proxy: {
            '/d/': {
                target: Your Server,
                changeOrigin: true,
            },
        },
    }
}
```

4. 运行项目。

```
yarn std start
```

项目会唤醒浏览器，自动访问[localhost:8004](localhost:8004)，展示为登录页面。如启动程序运行完毕之后未能自动访问，则需要手动访问。

### 开发

项目采用create-react-app + antd为基础架构，采用multi-repo的仓库管理方式，本仓库仅包含其中一个主项目仓库和共用组件库，仍保持多仓库的代码结构。

#### 目录结构介绍

仅介绍开发过程中会涉及到的文件路径：

```java
- packages // 仓库集合
  - components // 仓库1：公用组件库
    - charts // 图标库
    - config-store // 全局变量模板
    - locale // 词汇翻译对照表
    - request-config // Ajax请求封装
    - style // 产品基础样式
    - system // 子模块系统
      - event-system // 事件子系统
    - ui // ui组件库
    - utils // 计算函数库
  - std // 仓库2： 项目仓库
    - doc // 开发复杂逻辑文档
    - public // create-react-app自带的公共文件夹
      - app-config // 一些系统变量和开关的配置
      - template // 数据导入模板
      - theme // 主题样式表
    - src // 项目源代码
      - components // 组件库
      - config // 路由配置
      - layout // 布局配置
      - locale // i18配置
      - page // 页面代码
        - 404 // 404页面
        - config // 配置页面
        - event // 事件页面
        - login // 登录页面
        - overview // 总览页面
        - result // 全局搜索结果页面
        - search // 全局搜索页面
        - track // 跟踪页面
      - service // API配置
      - style // 仓库2私有样式
      - utils // 仓库2私有工具函数
      - index.jsx // 入口文件
      - router.jsx // 路由组件
    - config-overrides.js // 仓库2拓展webpack配置。
- .prettierrc.js // prettier代码规范配置
- .eslintrc.js // eslint代码规范配置
- .stylelintrc.js // stylelint/css规范配置
```

#### Git Commit

采用了[Angular提交信息规范](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)，所以在提交commit信息时，需要采用以下命令代替 `git commit`。

```
yarn commit
```

按照以下五个问题填入commit信息：

- Select the type of change that you're committing：更新类型（必填）
  
  - feat：新功能
  - fix：修复BUG
  - docs：文档修改
  - style：代码样式
  - refactor：重构工作
  - perf：性能相关
  - test：测试相关
  - build：打包配置相关
  - ci：对CI配置文件或脚本进行了修改
  - chore：修改主要业务代码以外的代码
  - revert：版本回退

- What is the scope of this change：影响范围

- Write a short, imperative tense description of the change：简要说明（必填）

- Provide a longer description of the change: (press enter to skip)：详细说明

- Are there any breaking changes：是否有重大变动，主要是不兼容变动，默认否

- Does this change affect any open issues：是否影响了哪些开放的issus，默认否

如果提交失败请检查Eslint、Stylelint等工具是否报错。

### 打包

进入项目文件后，执行以下命令，等待打包完成。

```
yarn std build
```

打包后文件会在 ` packages/std/build` 文件夹下。

## 联系我们

如果在开发、部署、产品使用的过程中遇到任何问题，或者技术讨论、产品咨询、商务合作等，都欢迎前来联系我们！

联系邮箱：[sales@abyssalfish.com.cn](mailto:sales@abyssalfish.com.cn)

联系微信：

<img title="" src="readMe.asset/d82523bdb256631fe00f146816a5a5f8e118a9c0.jpeg" alt="" width="186"><img title="" src="readMe.asset/31b954507ea12494d64049d95cb847387619089a.png" alt="" width="175">

import {
    CloudServerOutlined,
    DatabaseOutlined,
    DesktopOutlined,
    GlobalOutlined,
} from '@ant-design/icons'

export const ASSET_TYPE = [
    {
        type: 'ip',
        name: '活跃ip',
        icon: DesktopOutlined,
    },
    {
        type: 'srv',
        name: '端口服务',
        icon: CloudServerOutlined,
    },
    {
        type: 'host',
        name: 'HOST域名',
        icon: DatabaseOutlined,
    },
    {
        type: 'url',
        name: 'URL',
        icon: GlobalOutlined,
    },
]

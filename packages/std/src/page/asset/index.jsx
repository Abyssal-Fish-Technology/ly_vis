import { observer } from 'mobx-react'
import React from 'react'
import ExportDrop from '@shadowflow/components/system/asset-system/components/export-report/export-drop'
import AssetList from '@shadowflow/components/system/asset-system'

const topToolBoxAttr = {
    extra: [<ExportDrop />],
}

export const PageIp = observer(() => {
    return <AssetList pageType='ip' topToolBoxAttr={topToolBoxAttr} />
})

export const PageSrv = observer(() => {
    return <AssetList pageType='srv' topToolBoxAttr={topToolBoxAttr} />
})

export const PageHost = observer(() => {
    return <AssetList pageType='host' topToolBoxAttr={topToolBoxAttr} />
})

export const PageUrl = observer(() => {
    return <AssetList pageType='url' topToolBoxAttr={topToolBoxAttr} />
})

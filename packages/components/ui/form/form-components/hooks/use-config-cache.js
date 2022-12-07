import { MobXProviderContext } from 'mobx-react'
import { useContext } from 'react'

export default function useConfigCache(cacheType) {
    const { configStore } = useContext(MobXProviderContext)

    const useCache = configStore[cacheType] || null

    return {
        cache: useCache,
        configStore,
    }
}

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getUrlParams } from '@shadowflow/components/utils/universal/methods-router'
import zh from './zh.json'
import en from './en.json'

const resources = {
    en: {
        common: {
            ...en,
        },
    },
    zh: {
        // name space
        common: {
            ...zh,
        },
    },
}

const lng = getUrlParams('language') || 'zh'

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng,
        keySeparator: false,
        interpolation: {
            escapeValue: false,
        },
        ns: ['common'],
        defaultNS: 'common',
    })

export default i18n

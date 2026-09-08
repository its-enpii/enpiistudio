import { inject } from 'vue'
import { createT, enpiiI18nKey } from '../i18n'

export function useT() {
    return inject(enpiiI18nKey, null) ?? createT('id')
}

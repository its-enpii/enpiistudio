import { computed, inject, ref } from 'vue';
import { enpiiAppModeKey } from '../plugin';

const isOffline = ref(typeof navigator !== 'undefined' ? !navigator.onLine : false);

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => { isOffline.value = false; });
    window.addEventListener('offline', () => { isOffline.value = true; });
    window.addEventListener('app:network-error', () => { isOffline.value = true; });
}

export function useAppMode() {
    const config = inject(enpiiAppModeKey, {});

    const isDesktop = computed(() => Boolean(window.desktopAPI?.isDesktop || config?.isDesktop));
    const isReadOnly = computed(() => isOffline.value || Boolean(config?.isReadOnly));

    return { isOffline, isDesktop, isReadOnly };
}

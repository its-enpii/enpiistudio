<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import AppButton from './EnpiiButton.vue';
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT'

const t = useT()

const isOffline = ref(typeof navigator !== 'undefined' ? !navigator.onLine : false);
const isReconnected = ref(false);
const isChecking = ref(false);
const customMessage = ref('');
let reconnectedTimer = null;

function onOnline() {
    isOffline.value = false;
    customMessage.value = '';
    isReconnected.value = true;
    clearTimeout(reconnectedTimer);
    reconnectedTimer = setTimeout(() => {
        isReconnected.value = false;
    }, 3500);
}

function onOffline() {
    isOffline.value = true;
    isReconnected.value = false;
}

function onNetworkError(event) {
    isOffline.value = true;
    isReconnected.value = false;
    if (event.detail && typeof event.detail.message === 'string') {
        customMessage.value = event.detail.message;
    }
}

async function reconnect() {
    isChecking.value = true;
    try {
        const res = await fetch(`/desktop/sync/status?_t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store',
        });
        if (res.ok) {
            onOnline();
        } else {
            isOffline.value = true;
        }
    } catch {
        isOffline.value = true;
    } finally {
        isChecking.value = false;
    }
}

onMounted(() => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('app:network-error', onNetworkError);
});

onUnmounted(() => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
    window.removeEventListener('app:network-error', onNetworkError);
    clearTimeout(reconnectedTimer);
});
</script>

<template>
    <div class="enpii-offline-banner__region fixed top-0 right-0 left-0 z-index-toast flex justify-center p-3 md:p-4">
        <Transition name="banner">
            <div
                v-if="isOffline"
                class="enpii-offline-banner enpii-offline-banner--offline flex w-full max-w-[min(42rem,100%)] items-center justify-between gap-4 p-3 rounded-2xl border border-solid border-error/25 bg-error-container text-on-error-container shadow-xl backdrop-blur-xl pointer-events-auto"
                role="alert"
                aria-live="assertive"
            >
                <div class="enpii-offline-banner__content flex min-w-0 items-center gap-3">
                    <AppIcon name="wifi_off" tone="warning" container-size="9" container-shape="pill" class="enpii-offline-banner__icon" />
                    <div class="enpii-offline-banner__body min-w-0">
                        <p class="enpii-offline-banner__title m-0 text-xs md:text-sm font-semibold">{{ t('offlineBanner.title') }}</p>
                        <p class="enpii-offline-banner__message m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.6875rem] md:text-xs opacity-90">
                            {{ customMessage || t('offlineBanner.message') }}
                        </p>
                    </div>
                </div>
                <div class="enpii-offline-banner__action shrink-0">
                    <AppButton
                        variant="secondary"
                        size="compact"
                        icon="refresh"
                        :loading="isChecking"
                        :aria-label="t('offlineBanner.checkServerAria')"
                        @click="reconnect"
                    >
                        {{ t('offlineBanner.checkServer') }}
                    </AppButton>
                </div>
            </div>

            <div
                v-else-if="isReconnected"
                class="enpii-offline-banner enpii-offline-banner--online flex w-full max-w-[min(36rem,100%)] items-center justify-start gap-4 p-3 rounded-2xl border border-solid border-secondary/30 bg-secondary-container/95 text-on-secondary shadow-xl backdrop-blur-xl pointer-events-auto"
                role="status"
                aria-live="polite"
            >
                    <AppIcon name="wifi" tone="success" container-size="9" container-shape="pill" filled class="enpii-offline-banner__icon" />
                <div class="enpii-offline-banner__body min-w-0">
                    <p class="enpii-offline-banner__title m-0 text-xs md:text-sm font-semibold">{{ t('offlineBanner.reconnectedTitle') }}</p>
                    <p class="enpii-offline-banner__message m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[0.6875rem] md:text-xs opacity-90">{{ t('offlineBanner.reconnectedMessage') }}</p>
                </div>
            </div>
        </Transition>
    </div>
</template>

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
    <div class="enpii-offline-banner__region">
        <Transition name="banner">
            <div
                v-if="isOffline"
                class="enpii-offline-banner enpii-offline-banner--offline"
                role="alert"
                aria-live="assertive"
            >
                <div class="enpii-offline-banner__content">
                    <AppIcon name="wifi_off" tone="warning" container-size="9" container-shape="pill" class="enpii-offline-banner__icon" />
                    <div class="enpii-offline-banner__body">
                        <p class="enpii-offline-banner__title">{{ t('offlineBanner.title') }}</p>
                        <p class="enpii-offline-banner__message">
                            {{ customMessage || t('offlineBanner.message') }}
                        </p>
                    </div>
                </div>
                <div class="enpii-offline-banner__action">
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
                class="enpii-offline-banner enpii-offline-banner--online"
                role="status"
                aria-live="polite"
            >
                    <AppIcon name="wifi" tone="success" container-size="9" container-shape="pill" filled class="enpii-offline-banner__icon" />
                <div class="enpii-offline-banner__body">
                    <p class="enpii-offline-banner__title">{{ t('offlineBanner.reconnectedTitle') }}</p>
                    <p class="enpii-offline-banner__message">{{ t('offlineBanner.reconnectedMessage') }}</p>
                </div>
            </div>
        </Transition>
    </div>
</template>

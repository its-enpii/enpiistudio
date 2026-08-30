<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { enpiiAppModeKey, enpiiNavigationKey } from '../plugin';
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT'

const t = useT()

const navigation = inject(enpiiNavigationKey, {});
const appMode = inject(enpiiAppModeKey, {});
const currentUser = inject('enpii:user', null);
const tenant = inject('enpii:tenant', null);
const isDesktop = ref(false);
const isMaximized = ref(false);
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
const isSyncing = ref(false);
const isClosing = ref(false);
const syncMessage = ref('');

let removeMaximizeListener = null;
let removeCloseListener = null;

function checkOnline() {
    isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : true;
}

const currentUserName = computed(() => {
    return currentUser?.name || t('titleBar.officer');
});

async function triggerSync() {
    if (isSyncing.value || !isOnline.value) return;
    isSyncing.value = true;
    syncMessage.value = t('titleBar.syncing');
    try {
        const res = await fetch('/desktop/sync/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        if (res.ok) {
            syncMessage.value = t('titleBar.syncSuccess');
            window.desktopAPI?.sendNotification?.({
                title: t('titleBar.syncSuccessNotification'),
                body: t('titleBar.syncSuccessBody', { user: currentUserName.value }),
                url: '/dashboard',
            });
            setTimeout(() => { syncMessage.value = ''; }, 3000);
        } else {
            syncMessage.value = t('titleBar.syncFailed');
            setTimeout(() => { syncMessage.value = ''; }, 3000);
        }
    } catch {
        syncMessage.value = t('titleBar.connectionFailed');
        setTimeout(() => { syncMessage.value = ''; }, 3000);
    } finally {
        isSyncing.value = false;
    }
}

function handleMinimize() {
    window.desktopAPI?.minimize?.();
}

function handleMaximize() {
    window.desktopAPI?.maximize?.();
}

async function handleClose() {
    if (isClosing.value) return;
    isClosing.value = true;

    // Trigger visual Goodbye / Exit Screen
    window.dispatchEvent(new CustomEvent('desktop:closing', {
        detail: { message: t('titleBar.savingSession') }
    }));

    if (currentUser) {
        // Logged in user: perform clean logout before closing desktop window
        try {
            Promise.resolve(navigation.logout?.()).finally(() => {
                window.desktopAPI?.close?.();
            });

            // Fallback safety timeout if request takes too long
            setTimeout(() => {
                window.desktopAPI?.close?.();
            }, 1200);
        } catch {
            window.desktopAPI?.close?.();
        }
    } else {
        // Guest user: close window immediately
        window.desktopAPI?.close?.();
    }
}

onMounted(async () => {
    isDesktop.value = Boolean(window.desktopAPI?.isDesktop || appMode?.isDesktop);

    if (window.desktopAPI?.isMaximized) {
        isMaximized.value = await window.desktopAPI.isMaximized();
    }

    if (window.desktopAPI?.onMaximizeChange) {
        removeMaximizeListener = window.desktopAPI.onMaximizeChange((maximized) => {
            isMaximized.value = maximized;
        });
    }

    if (window.desktopAPI?.onCloseRequested) {
        removeCloseListener = window.desktopAPI.onCloseRequested(() => {
            handleClose();
        });
    }

    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);
    window.addEventListener('app:trigger-sync', triggerSync);
});

onUnmounted(() => {
    if (removeMaximizeListener) {
        removeMaximizeListener();
    }
    if (removeCloseListener) {
        removeCloseListener();
    }
    window.removeEventListener('online', checkOnline);
    window.removeEventListener('offline', checkOnline);
    window.removeEventListener('app:trigger-sync', triggerSync);
});

const tenantName = computed(() => {
    return tenant?.name || 'Enpii Studio Desktop';
});
</script>

<template>
    <header
        v-if="isDesktop"
        class="enpii-desktop-title-bar"
        style="-webkit-app-region: drag;"
    >
        <!-- Left Side: App Indicator & Status -->
        <div class="enpii-desktop-title-bar__start" style="-webkit-app-region: no-drag;">
            <div class="enpii-desktop-title-bar__brand">
                <div class="enpii-desktop-title-bar__brand-mark">S</div>
                <span class="enpii-desktop-title-bar__brand-name">ENPII</span>
            </div>

            <div class="enpii-desktop-title-bar__divider"></div>

            <!-- Online/Offline Indicator Badge -->
            <div
                v-if="isOnline"
                class="enpii-desktop-title-bar__status enpii-desktop-title-bar__status--online"
                :title="t('titleBar.onlineTitle')"
            >
                <span class="enpii-desktop-title-bar__pulse-wrap">
                    <span class="enpii-desktop-title-bar__pulse"></span>
                    <span class="enpii-desktop-title-bar__dot enpii-desktop-title-bar__dot--online"></span>
                </span>
                <span>Online</span>
            </div>

            <div
                v-else
                class="enpii-desktop-title-bar__status enpii-desktop-title-bar__status--offline"
                :title="t('titleBar.offlineTitle')"
            >
                <span class="enpii-desktop-title-bar__dot enpii-desktop-title-bar__dot--offline"></span>
                <span>{{ t('titleBar.offlineLabel') }}</span>
            </div>

            <!-- Quick Sync Button -->
            <button
                v-if="isOnline"
                type="button"
                class="enpii-desktop-title-bar__sync"
                :disabled="isSyncing || isClosing"
                :title="t('titleBar.syncTitle')"
                @click="triggerSync"
            >
                <svg
                    class="enpii-desktop-title-bar__sync-icon"
                    :class="{ 'enpii-desktop-title-bar__sync-icon--active': isSyncing }"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{{ syncMessage || t('titleBar.syncButton') }}</span>
            </button>
        </div>

        <!-- Center: Draggable Window Title -->
        <div class="enpii-desktop-title-bar__title">
            {{ tenantName }}
        </div>

        <!-- Right Side: Native Window Controls (Minimize / Maximize / Close) -->
        <div class="enpii-desktop-title-bar__controls" style="-webkit-app-region: no-drag;">
            <!-- Minimize -->
            <button
                type="button"
                class="enpii-desktop-title-bar__control"
                title="Minimize"
                aria-label="Minimize"
                :disabled="isClosing"
                @click="handleMinimize"
            >
                <svg class="enpii-desktop-title-bar__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
            </button>

            <!-- Maximize / Restore -->
            <button
                type="button"
                class="enpii-desktop-title-bar__control"
                :title="isMaximized ? 'Restore' : 'Maximize'"
                :aria-label="isMaximized ? 'Restore' : 'Maximize'"
                :disabled="isClosing"
                @click="handleMaximize"
            >
                <svg v-if="!isMaximized" class="enpii-desktop-title-bar__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="5" y="5" width="14" height="14" rx="1.5" stroke-width="2" />
                </svg>
                <svg v-else class="enpii-desktop-title-bar__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="7" y="7" width="12" height="12" rx="1" stroke-width="1.8" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5h8a2 2 0 012 2v8" />
                </svg>
            </button>

            <!-- Close (Logout & Exit) -->
            <button
                type="button"
                class="enpii-desktop-title-bar__control enpii-desktop-title-bar__control--close"
                :class="{ 'enpii-desktop-title-bar__control--closing': isClosing }"
                :title="t('titleBar.closeTitle')"
                :aria-label="t('titleBar.closeTitle')"
                :disabled="isClosing"
                @click="handleClose"
            >
                <svg v-if="!isClosing" class="enpii-desktop-title-bar__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <svg v-else class="enpii-desktop-title-bar__icon enpii-desktop-title-bar__spinner" fill="none" viewBox="0 0 24 24">
                    <circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </button>
        </div>
    </header>
</template>

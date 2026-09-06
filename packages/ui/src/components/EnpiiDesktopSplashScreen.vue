<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { enpiiAppModeKey } from '../plugin';
import { useT } from '../composables/useT'

const t = useT()

const appMode = inject(enpiiAppModeKey, {});
const tenant = inject('enpii:tenant', null);
const isDesktop = ref(false);
const showSplash = ref(false);
const showExit = ref(false);
const splashProgress = ref(15);
const splashStatus = ref(t('splash.loadingModules'));
const exitStatus = ref(t('splash.savingSession'));

let progressInterval = null;

const tenantName = computed(() => {
    return tenant?.name || 'Enpii Studio';
});

function triggerExitScreen(detail = {}) {
    showExit.value = true;
    if (detail.message) {
        exitStatus.value = detail.message;
    }
}

onMounted(() => {
    isDesktop.value = Boolean(window.desktopAPI?.isDesktop) || Boolean(appMode?.isDesktop);

    // Only show opening splash screen on initial desktop app launch
    const hasShownSplash = sessionStorage.getItem('enpii_desktop_splash_shown');
    if (isDesktop.value && !hasShownSplash) {
        showSplash.value = true;
        sessionStorage.setItem('enpii_desktop_splash_shown', 'true');

        // Progress bar simulation for smooth startup feeling
        progressInterval = setInterval(() => {
            if (splashProgress.value < 90) {
                splashProgress.value += 25;
                if (splashProgress.value >= 40 && splashProgress.value < 70) {
                    splashStatus.value = t('splash.preparingDb');
                } else if (splashProgress.value >= 70) {
                    splashStatus.value = t('splash.checkingAuth');
                }
            }
        }, 300);

        setTimeout(() => {
            splashProgress.value = 100;
            splashStatus.value = t('splash.ready');
            setTimeout(() => {
                showSplash.value = false;
                if (progressInterval) clearInterval(progressInterval);
            }, 400);
        }, 1600);
    }

    // Listen for desktop closing event
    window.addEventListener('desktop:closing', (e) => {
        triggerExitScreen(e.detail || {});
    });
});

onUnmounted(() => {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    window.removeEventListener('desktop:closing', triggerExitScreen);
});
</script>

<template>
    <!-- 1. Opening Splash Screen -->
    <Transition name="splash-fade">
        <div
            v-if="showSplash"
            class="enpii-desktop-splash-screen__splash fixed inset-0 z-[9999] flex h-screen w-screen flex-col items-center justify-center bg-primary-deep text-on-primary select-none"
            style="-webkit-app-region: drag;"
        >
            <!-- Background Ambient Glow -->
            <div class="enpii-desktop-splash-screen__glow absolute -left-24 -top-24 h-96 w-96 rounded-full bg-secondary/15 [filter:blur(64px)]"></div>
            <div class="enpii-desktop-splash-screen__glow absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-secondary/15 [filter:blur(64px)]"></div>

            <div class="enpii-desktop-splash-screen__content relative flex flex-col items-center px-6 text-center" style="-webkit-app-region: no-drag;">
                <!-- Animated App Logo -->
                <div class="enpii-desktop-splash-screen__logo-wrap relative mb-6 flex items-center justify-center">
                    <div class="enpii-desktop-splash-screen__logo-halo absolute -inset-4 rounded-2xl bg-secondary/20 [filter:blur(24px)] motion-safe:animate-[splash-pulse_2s_ease-in-out_infinite]"></div>
                    <div class="enpii-desktop-splash-screen__logo relative flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary shadow-overlay outline outline-1 outline-on-primary/20">
                        <span class="text-on-primary text-3xl font-semibold tracking-wide">S</span>
                    </div>
                </div>

                <!-- Welcome Text -->
                <h1 class="enpii-desktop-splash-screen__title m-0 text-on-primary text-2xl font-semibold tracking-tight sm:text-3xl">
                    {{ t('splash.welcome') }}
                </h1>
                <p class="enpii-desktop-splash-screen__subtitle mt-1 text-success-text text-sm font-semibold tracking-wide">
                    Enpii Studio Desktop
                </p>
                <p class="enpii-desktop-splash-screen__tenant mt-1 mb-0 max-w-80 truncate text-on-surface-variant text-xs">
                    {{ tenantName }}
                </p>

                <!-- Loading Bar & Status -->
                <div class="enpii-desktop-splash-screen__progress-wrap mt-8 w-64">
                    <div class="enpii-desktop-splash-screen__progress-track h-2 w-full overflow-hidden rounded-full bg-neutral-border outline outline-1 outline-white/10">
                        <div
                            class="enpii-desktop-splash-screen__progress-bar h-full rounded-full bg-gradient-to-r from-secondary to-success-text transition-all duration-300 ease-emphasized"
                            :style="{ width: `${splashProgress}%` }"
                        ></div>
                    </div>
                    <div class="enpii-desktop-splash-screen__progress-meta mt-2 flex justify-between text-on-surface-variant text-[.6875rem]">
                        <span>{{ splashStatus }}</span>
                        <span class="enpii-desktop-splash-screen__percent font-mono text-success-text">{{ splashProgress }}%</span>
                    </div>
                </div>
            </div>

            <!-- Footer copyright / version -->
            <div class="enpii-desktop-splash-screen__footer absolute bottom-6 text-on-surface-variant text-[.6875rem]">
                {{ t('splash.footer') }}
            </div>
        </div>
    </Transition>

    <!-- 2. Closing / Exit Screen -->
    <Transition name="exit-fade">
        <div
            v-if="showExit"
            class="enpii-desktop-splash-screen__exit fixed inset-0 z-[9999] flex h-screen w-screen cursor-wait flex-col items-center justify-center bg-primary-deep/95 text-on-primary select-none [backdrop-filter:blur(24px)]"
            style="-webkit-app-region: drag;"
        >
            <div class="enpii-desktop-splash-screen__content relative flex flex-col items-center px-6 text-center" style="-webkit-app-region: no-drag;">
                <!-- Animated Exit Spinner -->
                <div class="enpii-desktop-splash-screen__logo-wrap relative mb-6 flex items-center justify-center">
                    <div class="enpii-desktop-splash-screen__logo-halo absolute -inset-3 rounded-full bg-error/15"></div>
                    <div class="enpii-desktop-splash-screen__logo relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-outline-variant bg-primary-deep shadow-xl">
                        <svg class="enpii-desktop-splash-screen__spinner h-7 w-7 text-success-text motion-safe:animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>

                <h2 class="enpii-desktop-splash-screen__title m-0 text-on-primary text-xl font-semibold tracking-tight">
                    {{ t('splash.goodbye') }}
                </h2>
                <p class="enpii-desktop-splash-screen__tenant mt-1 mb-0 max-w-80 truncate text-on-surface-variant text-xs">
                    {{ exitStatus }}
                </p>

                <div class="enpii-desktop-splash-screen__closing mt-6 flex items-center gap-2 text-on-surface-variant text-[.6875rem] font-medium">
                    <span class="enpii-desktop-splash-screen__pulse inline-block h-2 w-2 rounded-full bg-secondary motion-safe:animate-[splash-ping_1s_cubic-bezier(0,0,.2,1)_infinite]"></span>
                    <span>{{ t('splash.closingApp') }}</span>
                </div>
            </div>
        </div>
    </Transition>
</template>

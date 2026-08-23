<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';
import { enpiiAppModeKey } from '../plugin';

const appMode = inject(enpiiAppModeKey, {});
const tenant = inject('enpii:tenant', null);
const isDesktop = ref(false);
const showSplash = ref(false);
const showExit = ref(false);
const splashProgress = ref(15);
const splashStatus = ref('Memuat modul sistem...');
const exitStatus = ref('Menyimpan sesi & mengamankan data...');

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
                    splashStatus.value = 'Menyiapkan database lokal...';
                } else if (splashProgress.value >= 70) {
                    splashStatus.value = 'Memeriksa otentikasi...';
                }
            }
        }, 300);

        setTimeout(() => {
            splashProgress.value = 100;
            splashStatus.value = 'Siap!';
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
            class="enpii-desktop-splash-screen__splash"
            style="-webkit-app-region: drag;"
        >
            <!-- Background Ambient Glow -->
            <div class="enpii-desktop-splash-screen__glow enpii-desktop-splash-screen__glow--top"></div>
            <div class="enpii-desktop-splash-screen__glow enpii-desktop-splash-screen__glow--bottom"></div>

            <div class="enpii-desktop-splash-screen__content" style="-webkit-app-region: no-drag;">
                <!-- Animated App Logo -->
                <div class="enpii-desktop-splash-screen__logo-wrap">
                    <div class="enpii-desktop-splash-screen__logo-halo"></div>
                    <div class="enpii-desktop-splash-screen__logo">
                        <span>S</span>
                    </div>
                </div>

                <!-- Welcome Text -->
                <h1 class="enpii-desktop-splash-screen__title">
                    Selamat Datang
                </h1>
                <p class="enpii-desktop-splash-screen__subtitle">
                    Enpii Studio Desktop
                </p>
                <p class="enpii-desktop-splash-screen__tenant">
                    {{ tenantName }}
                </p>

                <!-- Loading Bar & Status -->
                <div class="enpii-desktop-splash-screen__progress-wrap">
                    <div class="enpii-desktop-splash-screen__progress-track">
                        <div
                            class="enpii-desktop-splash-screen__progress-bar"
                            :style="{ width: `${splashProgress}%` }"
                        ></div>
                    </div>
                    <div class="enpii-desktop-splash-screen__progress-meta">
                        <span>{{ splashStatus }}</span>
                        <span class="enpii-desktop-splash-screen__percent">{{ splashProgress }}%</span>
                    </div>
                </div>
            </div>

            <!-- Footer copyright / version -->
            <div class="enpii-desktop-splash-screen__footer">
                Sistem Informasi Dana Bergulir Masyarakat
            </div>
        </div>
    </Transition>

    <!-- 2. Closing / Exit Screen -->
    <Transition name="exit-fade">
        <div
            v-if="showExit"
            class="enpii-desktop-splash-screen__exit"
            style="-webkit-app-region: drag;"
        >
            <div class="enpii-desktop-splash-screen__content" style="-webkit-app-region: no-drag;">
                <!-- Animated Exit Spinner -->
                <div class="enpii-desktop-splash-screen__logo-wrap enpii-desktop-splash-screen__logo-wrap--exit">
                    <div class="enpii-desktop-splash-screen__logo-halo enpii-desktop-splash-screen__logo-halo--danger"></div>
                    <div class="enpii-desktop-splash-screen__logo enpii-desktop-splash-screen__logo--exit">
                        <svg class="enpii-desktop-splash-screen__spinner" fill="none" viewBox="0 0 24 24">
                            <circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>

                <h2 class="enpii-desktop-splash-screen__title enpii-desktop-splash-screen__title--sm">
                    Sampai Jumpa!
                </h2>
                <p class="enpii-desktop-splash-screen__tenant">
                    {{ exitStatus }}
                </p>

                <div class="enpii-desktop-splash-screen__closing">
                    <span class="enpii-desktop-splash-screen__pulse"></span>
                    <span>Menutup aplikasi dengan aman...</span>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useTheme } from '../composables/useTheme';
import { useT } from '../composables/useT';

const model = defineModel({ type: Boolean, default: false });
const { theme, themes, setTheme } = useTheme();
const t = useT();
const panel = ref(null);

function choose(id) {
    setTheme(id);
    setTimeout(() => {
        model.value = false;
    }, 120);
}

function onDocMouseDown(e) {
    if (!model.value) return;
    if (panel.value?.contains(e.target)) return;
    if (e.target.closest('[data-theme-trigger]')) return;
    model.value = false;
}

function onEsc(e) {
    if (e.key === 'Escape' && model.value) {
        model.value = false;
    }
}

watch(model, (open) => {
    if (open) {
        document.addEventListener('mousedown', onDocMouseDown);
        document.addEventListener('keydown', onEsc);
    } else {
        document.removeEventListener('mousedown', onDocMouseDown);
        document.removeEventListener('keydown', onEsc);
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocMouseDown);
    document.removeEventListener('keydown', onEsc);
});
</script>

<template>
    <Teleport to="body">
        <Transition name="theme-menu">
            <div
                v-if="model"
                ref="panel"
                role="menu"
                :aria-label="t('themeMenu.ariaLabel')"
                class="enpii-theme-menu__panel fixed right-4 top-[4.5rem] z-modal w-64 origin-top-right overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-overlay"
            >
                <p class="enpii-theme-menu__title m-0 border-b border-outline-variant/50 bg-surface-container-low/40 px-4 py-2 text-on-surface-variant text-[.625rem] font-semibold">
                    Tema tampilan
                </p>
                <div class="enpii-theme-menu__options p-1">
                    <button
                        v-for="themeOption in themes"
                        :key="themeOption.id"
                        type="button"
                        role="menuitemradio"
                        :aria-checked="theme === themeOption.id"
                        :aria-label="t('themeMenu.selectTheme', { label: themeOption.label })"
                        class="enpii-theme-menu__option flex w-full cursor-pointer items-center gap-3 rounded-md border-0 bg-none px-3 py-2 text-left text-sm transition-all duration-fast ease-emphasized hover:bg-surface-container-low"
                        :class="{ 'bg-primary-container/40 font-semibold': theme === themeOption.id }"
                        @click="choose(themeOption.id)"
                    >
                        <span class="enpii-theme-menu__swatch inline-grid h-6 w-9 shrink-0 grid-flow-col gap-1 overflow-hidden rounded-md border border-outline-variant p-1" :data-for="themeOption.id" aria-hidden="true"><i class="bg-primary" /><i class="bg-surface" /><i class="bg-on-surface" /></span>
                        <span class="enpii-theme-menu__label min-w-0 flex-1 truncate text-primary-text font-semibold">{{ themeOption.label }}</span>
                        <AppIcon v-if="theme === themeOption.id" name="check_circle" filled class="enpii-theme-menu__check h-5 w-5 scale-105 text-secondary transition-transform duration-base ease-emphasized" />
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

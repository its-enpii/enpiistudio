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
                class="enpii-theme-menu__panel"
            >
                <p class="enpii-theme-menu__title">
                    Tema tampilan
                </p>
                <div class="enpii-theme-menu__options">
                    <button
                        v-for="themeOption in themes"
                        :key="themeOption.id"
                        type="button"
                        role="menuitemradio"
                        :aria-checked="theme === themeOption.id"
                        :aria-label="t('themeMenu.selectTheme', { label: themeOption.label })"
                        class="enpii-theme-menu__option"
                        :class="{ 'enpii-theme-menu__option--active': theme === themeOption.id }"
                        @click="choose(themeOption.id)"
                    >
                        <span class="enpii-theme-menu__swatch" :data-for="themeOption.id" aria-hidden="true"><i /><i /><i /></span>
                        <span class="enpii-theme-menu__label">{{ themeOption.label }}</span>
                        <AppIcon v-if="theme === themeOption.id" name="check_circle" filled class="enpii-theme-menu__check" />
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>


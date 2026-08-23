<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useTheme } from '../composables/useTheme';

const model = defineModel({ type: Boolean, default: false });
const { theme, themes, setTheme } = useTheme();
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
                aria-label="Pilih tema tampilan"
                class="enpii-theme-menu__panel"
            >
                <p class="enpii-theme-menu__title">
                    Tema tampilan
                </p>
                <div class="enpii-theme-menu__options">
                    <button
                        v-for="t in themes"
                        :key="t.id"
                        type="button"
                        role="menuitemradio"
                        :aria-checked="theme === t.id"
                        :aria-label="`Pilih tema ${t.label}`"
                        class="enpii-theme-menu__option"
                        :class="{ 'enpii-theme-menu__option--active': theme === t.id }"
                        @click="choose(t.id)"
                    >
                        <span class="enpii-theme-menu__swatch" :data-for="t.id" aria-hidden="true"><i /><i /><i /></span>
                        <span class="enpii-theme-menu__label">{{ t.label }}</span>
                        <AppIcon v-if="theme === t.id" name="check_circle" filled class="enpii-theme-menu__check" />
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>


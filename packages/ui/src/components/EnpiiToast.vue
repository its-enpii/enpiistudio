<script setup>
import { computed, inject, onBeforeUnmount, watch } from 'vue';
import { useToast } from '../composables/useToast';
import { enpiiFlashKey } from '../plugin';
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';

const { toastState, show, dismiss, pause, resume } = useToast();
const flash = computed(() => inject(enpiiFlashKey, {}));

const props = defineProps({
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

watch(flash, (value) => {
    if (!value || typeof value !== 'object') return;
    if (value.success != null) show('success', value.success);
    else if (value.error != null) show('error', value.error);
    else if (value.warning != null) show('warning', value.warning);
    else if (value.info != null) show('info', value.info);
}, { immediate: true });

onBeforeUnmount(() => {
    dismiss();
});
</script>

<template>
    <Teleport to="body">
        <div
            class="enpii-toast__region"
            aria-live="polite"
        >
            <Transition name="toast">
                <div
                    v-if="toastState.visible"
                    role="status"
                    class="enpii-toast"
                    :class="[shapeClass, `enpii-toast--${toastState.tone}`]"
                    @mouseenter="pause"
                    @mouseleave="resume"
                >
                    <!-- Left Icon Badge -->
                    <div
                        class="enpii-toast__icon"
                    >
                        <AppIcon :name="toastState.tone === 'error' ? 'error' : toastState.tone === 'warning' ? 'warning' : toastState.tone === 'success' ? 'check_circle' : 'info'" />
                    </div>

                    <!-- Message Body -->
                    <div class="enpii-toast__body">
                        <p
                            v-if="toastState.title"
                            class="enpii-toast__title"
                        >
                            {{ toastState.title }}
                        </p>
                        <p class="enpii-toast__message">
                            {{ toastState.message }}
                        </p>
                    </div>

                    <!-- Close Button -->
                    <button
                        type="button"
                        class="enpii-toast__close"
                        aria-label="Tutup notifikasi"
                        @click="dismiss"
                    >
                        <AppIcon name="close" />
                    </button>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>

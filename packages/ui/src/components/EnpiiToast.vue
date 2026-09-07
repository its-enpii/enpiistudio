<script setup>
import { computed, inject, onBeforeUnmount, watch } from 'vue';
import { useToast } from '../composables/useToast';
import { useT } from '../composables/useT';
import { enpiiFlashKey } from '../plugin';
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';

const t = useT();

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
}, { immediate: true, deep: true });

onBeforeUnmount(() => {
    dismiss();
});

const toastIconToneClasses = {
    success: '[background-color:var(--tone-success-soft-bg)] [color:var(--tone-success-soft-fg)]',
    error: '[background-color:var(--tone-danger-soft-bg)] [color:var(--tone-danger-soft-fg)]',
    warning: '[background-color:var(--tone-warning-soft-bg)] [color:var(--tone-warning-soft-fg)]',
    info: '[background-color:var(--tone-info-soft-bg)] [color:var(--tone-info-soft-fg)]',
};
</script>

<template>
    <Teleport to="body">
        <div
            class="enpii-toast__region fixed top-4 right-0 left-0 z-toast flex justify-center px-4 sm:justify-end sm:px-6"
            aria-live="polite"
        >
            <Transition
                name="toast"
                enter-active-class="transition-[opacity,transform] duration-normal ease-standard"
                leave-active-class="transition-[opacity,transform] duration-normal ease-standard"
                enter-from-class="opacity-0 -translate-y-3 scale-[0.96]"
                leave-to-class="opacity-0 -translate-y-3 scale-[0.96]"
            >
                <div
                    v-if="toastState.visible"
                    role="status"
                    class="enpii-toast flex items-center gap-3 w-[min(28rem,100%)] border border-solid [border-width:var(--control-border-width)] [border-color:var(--overlay-border-color)] rounded-2xl [background-color:var(--overlay-surface-bg)] [color:var(--overlay-surface-fg)] py-3 px-4 shadow-overlay pointer-events-auto"
                    :class="[shapeClass, `enpii-toast--${toastState.tone}`]"
                    @mouseenter="pause"
                    @mouseleave="resume"
                >
                    <!-- Left Icon Badge -->
                    <div
                        class="enpii-toast__icon grid place-items-center w-9 h-9 shrink-0 border border-solid [border-width:var(--control-border-width)] border-transparent rounded-control [background-color:var(--tone-neutral-soft-bg)] [&_svg,&_i,&_.material-icons]:w-5 [&_svg,&_i,&_.material-icons]:h-5 [&_svg,&_i,&_.material-icons]:text-[1.25rem]"
                        :class="toastIconToneClasses[toastState.tone]"
                    >
                        <AppIcon :name="toastState.tone === 'error' ? 'error' : toastState.tone === 'warning' ? 'warning' : toastState.tone === 'success' ? 'check_circle' : 'info'" />
                    </div>

                    <!-- Message Body -->
                    <div class="enpii-toast__body min-w-0 flex-1">
                        <p
                            v-if="toastState.title"
                            class="enpii-toast__title mb-1 [color:var(--tone-neutral-fg)] text-xs font-semibold"
                        >
                            {{ toastState.title }}
                        </p>
                        <p class="enpii-toast__message text-sm font-semibold leading-[1.375]">
                            {{ toastState.message }}
                        </p>
                    </div>

                    <!-- Close Button -->
                    <button
                        type="button"
                        class="enpii-toast__close grid place-items-center w-8 h-8 shrink-0 border-0 bg-transparent [color:var(--tone-neutral-fg)] rounded-[9999px] cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:[background-color:var(--tone-neutral-soft-bg)] hover:[color:var(--tone-neutral-soft-fg)] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-offset:var(--focus-offset)] focus-visible:outline-focus"
                        :aria-label="t('toast.close')"
                        @click="dismiss"
                    >
                        <AppIcon name="close" />
                    </button>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>

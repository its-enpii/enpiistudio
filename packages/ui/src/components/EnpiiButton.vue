<script setup>
defineOptions({ inheritAttrs: false });

import { computed } from 'vue';
import { useShape } from '../composables/useShape';
import { useFormSubmitState } from '../composables/useFormSubmitState';
import AppIcon from './EnpiiIcon.vue';

const props = defineProps({
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'default' },
    icon: { type: String, default: null },
    iconOnly: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
    ariaLabel: { type: String, default: null },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const { isFormSubmitting, isFormDisabled } = useFormSubmitState();

const isLoading = computed(() => props.loading || (props.type === 'submit' && isFormSubmitting()));
const isDisabled = computed(() => props.disabled || isFormDisabled());
const formSubmittingTracked = computed(isFormSubmitting);

const shapeClass = useShape(props);

const sizeClass = computed(() => {
    if (props.iconOnly) return 'w-control-height px-0 aspect-square';
    switch (props.size) {
        case 'sm':
        case 'compact': return 'min-h-control-sm py-2 px-3 text-sm';
        case 'lg':
        case 'large': return 'min-h-[3.5rem] py-3 px-6 text-lg';
        case 'default':
        case 'md':
        default: return 'min-h-control py-control-block px-control-inline text-control';
    }
});

const variantClass = computed(() => {
    switch (props.variant) {
        case 'success': return 'bg-secondary text-on-secondary';
        case 'secondary': return 'border-outline-variant bg-surface-container-lowest text-primary-text';
        case 'outline': return 'border-primary bg-transparent text-primary-text';
        case 'ghost': return 'bg-transparent text-primary-text';
        case 'danger': return 'bg-error text-on-error';
        case 'tertiary': return 'bg-tertiary-container text-on-tertiary';
        case 'primary':
        default: return 'bg-primary text-on-primary';
    }
});

const shapeUtility = computed(() => {
    if (props.shape === 'pill') return 'rounded-full';
    if (props.shape === 'sharp') return 'rounded-none';
    return 'rounded-control';
});
</script>

<template>
    <button
        :type="type"
        :disabled="isDisabled || isLoading"
        class="enpii-button relative inline-flex items-center justify-center gap-2 m-0 border border-solid border-transparent font-semibold font-sans no-underline cursor-pointer transition-all duration-fast ease-emphasized hover:enabled:brightness-96 active:enabled:scale-98 focus-visible:outline-4 focus-visible:outline-focus focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
        :class="[
            `enpii-button--${variant}`,
            `enpii-button--${size}`,
            iconOnly && 'enpii-button--icon-only',
            isLoading && 'enpii-button--loading pointer-events-none',
            shapeClass,
            sizeClass,
            variantClass,
            shapeUtility,
        ]"
        :aria-busy="isLoading"
        :aria-label="ariaLabel || undefined"
        v-bind="$attrs"
    >
        <span v-if="isLoading" class="enpii-button__spinner size-5 rounded-full border-2 border-current/30 border-t-current animate-spin" aria-hidden="true" />
        <AppIcon v-else-if="icon" :name="icon" class="enpii-button__icon text-xl leading-none transition-transform duration-fast ease-emphasized group-hover:enabled:-translate-y-px" />
        <slot />
    </button>
</template>

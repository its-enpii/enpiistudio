<script setup>
defineOptions({ inheritAttrs: false });

import { computed } from 'vue';
import AppIcon from './AppIcon.vue';

const props = defineProps({
    variant: { type: String, default: 'primary' },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl', 'compact', 'default', 'large'].includes(value),
    },
    icon: { type: String, default: null },
    trailingIcon: { type: String, default: null },
    iconOnly: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
    ariaLabel: { type: String, default: null },
});

const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container disabled:bg-primary/60',
    success: 'bg-secondary text-on-secondary hover:brightness-110 disabled:bg-secondary/60',
    secondary: 'border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container-low',
    outline: 'border border-primary bg-transparent text-primary hover:bg-primary-container/20 disabled:border-primary/40',
    ghost: 'bg-transparent text-primary hover:bg-surface-container-low',
    danger: 'bg-error text-on-error hover:brightness-90 disabled:bg-error/60',
    tertiary: 'bg-tertiary text-on-tertiary hover:brightness-110 disabled:bg-tertiary/60',
};

const sizes = {
    sm: 'min-h-10 px-3 text-sm',
    md: 'min-h-12 px-5 text-base',
    lg: 'min-h-14 px-6 text-lg',
    xl: 'min-h-16 px-8 text-xl',
    compact: 'min-h-10 px-3 text-sm',
    default: 'min-h-12 px-5 text-base',
    large: 'min-h-14 px-6 text-lg',
};
const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-2xl',
    compact: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
};
const iconSize = computed(() => iconSizes[props.size] || iconSizes.md);
</script>

<template>
    <button
        :type="type"
        :disabled="disabled || loading"
        class="inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
        :class="[variants[variant] || variants.primary, iconOnly ? 'aspect-square p-0' : sizes[size] || sizes.default]"
        :aria-busy="loading"
        :aria-label="ariaLabel || undefined"
        v-bind="$attrs"
    >
        <span v-if="loading" class="animate-spin rounded-full border-2 border-current/30 border-t-current" :class="iconSize" aria-hidden="true" />
        <AppIcon v-else-if="icon" :name="icon" :class="iconSize" />
        <slot />
        <AppIcon v-if="trailingIcon && !loading" :name="trailingIcon" :class="iconSize" />
    </button>
</template>

<script setup>
defineOptions({ inheritAttrs: false });

import { useShape } from '../composables/useShape';
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

const shapeClass = useShape(props);
</script>

<template>
    <button
        :type="type"
        :disabled="disabled || loading"
        class="enpii-button"
        :class="[`enpii-button--${variant}`, `enpii-button--${size}`, iconOnly && 'enpii-button--icon-only', loading && 'enpii-button--loading', shapeClass]"
        :aria-busy="loading"
        :aria-label="ariaLabel || undefined"
        v-bind="$attrs"
    >
        <span v-if="loading" class="enpii-button__spinner" aria-hidden="true" />
        <AppIcon v-else-if="icon" :name="icon" class="enpii-button__icon" />
        <slot />
    </button>
</template>

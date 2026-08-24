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
// keep reactivity: computed above reads through getters; ensure tracked
const formSubmittingTracked = computed(isFormSubmitting);

const shapeClass = useShape(props);
</script>

<template>
    <button
        :type="type"
        :disabled="isDisabled || isLoading"
        class="enpii-button"
        :class="[`enpii-button--${variant}`, `enpii-button--${size}`, iconOnly && 'enpii-button--icon-only', isLoading && 'enpii-button--loading', shapeClass]"
        :aria-busy="isLoading"
        :aria-label="ariaLabel || undefined"
        v-bind="$attrs"
    >
        <span v-if="isLoading" class="enpii-button__spinner" aria-hidden="true" />
        <AppIcon v-else-if="icon" :name="icon" class="enpii-button__icon" />
        <slot />
    </button>
</template>

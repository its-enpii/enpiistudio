<script setup>
import { computed } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import AppTooltip from './EnpiiTooltip.vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    name: { type: String, default: null },
    icon: { type: String, default: null },
    tone: {
        type: String,
        default: 'neutral',
        validator: (value) => ['neutral', 'success', 'warning', 'danger', 'error', 'info', 'primary', 'secondary', 'tertiary'].includes(value),
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
    rounded: {
        type: String,
        default: 'lg',
        validator: (value) => ['square', 'lg', 'full'].includes(value),
    },
    filled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    type: { type: String, default: 'button' },
    ariaLabel: { type: String, default: null },
    tooltip: { type: String, default: null },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);
const iconName = computed(() => props.name || props.icon || '');

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-8 h-8';
        case 'lg': return 'w-12 h-12';
        case 'md':
        default: return 'w-12 h-12';
    }
});

const roundedUtility = computed(() => {
    if (props.shape === 'pill' || props.rounded === 'full') return 'rounded-full';
    if (props.shape === 'sharp' || props.rounded === 'square') return 'rounded-none';
    if (props.shape === 'rounded') return 'rounded-control';
    return 'rounded-lg';
});

const toneClass = computed(() => {
    if (props.filled) {
        switch (props.tone) {
            case 'primary':
            case 'info': return 'bg-primary text-on-primary';
            case 'secondary':
            case 'success': return 'bg-secondary text-on-secondary';
            case 'warning':
            case 'tertiary': return 'bg-tertiary text-on-tertiary';
            case 'danger':
            case 'error': return 'bg-error text-on-error';
            case 'neutral':
            default: return 'bg-surface-container-low text-on-surface';
        }
    } else {
        switch (props.tone) {
            case 'primary':
            case 'info': return 'text-primary-text';
            case 'secondary':
            case 'success': return 'text-on-secondary';
            case 'warning':
            case 'tertiary': return 'text-on-tertiary';
            case 'danger':
            case 'error': return 'text-danger-text';
            case 'neutral':
            default: return 'text-on-surface-variant hover:enabled:bg-surface-container-low hover:enabled:text-primary-text';
        }
    }
});

const buttonClass = computed(() => [
    'enpii-icon-button',
    'relative inline-flex items-center justify-center shrink-0 border-0 bg-transparent text-inherit cursor-pointer transition-all duration-fast ease-emphasized focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-2 active:enabled:scale-90 hover:enabled:scale-103 disabled:opacity-60 disabled:cursor-not-allowed',
    `enpii-icon-button--${props.size}`,
    `enpii-icon-button--${props.rounded}`,
    shapeClass.value,
    props.filled ? `enpii-icon-button--filled-${props.tone}` : `enpii-icon-button--${props.tone}`,
    (props.disabled || props.loading) ? 'enpii-icon-button--disabled' : '',
    sizeClass.value,
    roundedUtility.value,
    toneClass.value,
]);

const iconClass = computed(() => {
    let sizeUtility = 'text-xl leading-none';
    if (props.size === 'sm') sizeUtility = 'text-lg leading-none';
    else if (props.size === 'lg') sizeUtility = 'text-2xl leading-none';

    if (!props.loading) return `enpii-icon-button__icon ${sizeUtility}`;
    return `enpii-icon-button__icon enpii-icon-button__icon--${props.size} animate-spin ${sizeUtility}`;
});
</script>

<template>
    <AppTooltip v-if="tooltip" :text="tooltip">
        <button
            :type="type"
            :class="buttonClass"
            :disabled="disabled || loading"
            :aria-label="ariaLabel || iconName"
            :aria-busy="loading || undefined"
        >
            <AppIcon v-if="!loading" :name="iconName" :class="iconClass" />
            <span v-else class="material-symbols-outlined enpii-icon-button__spinner" :class="iconClass">progress_activity</span>
        </button>
    </AppTooltip>
    <button
        v-else
        :type="type"
        :class="buttonClass"
        :disabled="disabled || loading"
        :aria-label="ariaLabel || iconName"
        :aria-busy="loading || undefined"
    >
        <AppIcon v-if="!loading" :name="iconName" :class="iconClass" />
        <span v-else class="material-symbols-outlined enpii-icon-button__spinner" :class="iconClass">progress_activity</span>
    </button>
</template>

<script setup>
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

const iconName = props.name || props.icon || '';

function buttonClass() {
    return [
        'enpii-icon-button',
        `enpii-icon-button--${props.size}`,
        `enpii-icon-button--${props.rounded}`,
        shapeClass.value,
        props.filled ? `enpii-icon-button--filled-${props.tone}` : `enpii-icon-button--${props.tone}`,
        (props.disabled || props.loading) ? 'enpii-icon-button--disabled' : ''
    ];
}
function iconClass() {
    if (!props.loading) return 'enpii-icon-button__icon';
    return `enpii-icon-button__icon enpii-icon-button__icon--${props.size}`;
}
</script>

<template>
    <AppTooltip v-if="tooltip" :text="tooltip">
        <button
            :type="type"
            :class="buttonClass()"
            :disabled="disabled || loading"
            :aria-label="ariaLabel || iconName"
            :aria-busy="loading || undefined"
        >
            <AppIcon v-if="!loading" :name="iconName" :class="iconClass()" />
            <span v-else class="material-symbols-outlined enpii-icon-button__spinner" :class="iconClass()">progress_activity</span>
        </button>
    </AppTooltip>
    <button
        v-else
        :type="type"
        :class="buttonClass()"
        :disabled="disabled || loading"
        :aria-label="ariaLabel || iconName"
        :aria-busy="loading || undefined"
    >
        <AppIcon v-if="!loading" :name="iconName" :class="iconClass()" />
        <span v-else class="material-symbols-outlined enpii-icon-button__spinner" :class="iconClass()">progress_activity</span>
    </button>
</template>

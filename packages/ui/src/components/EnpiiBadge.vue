<script setup>
import { computed } from 'vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    tone: {
        type: String,
        default: 'neutral',
        validator: (value) => [
            'neutral', 'success', 'warning', 'error', 'primary',
            'success-soft', 'warning-soft', 'error-soft', 'info-soft', 'primary-soft',
        ].includes(value),
    },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
    pill: {
        type: Boolean,
        default: false,
    },
    size: {
        type: String,
        default: 'sm',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
});

const shapeClass = useShape(props);

const sizeClass = computed(() => {
    switch (props.size) {
        case 'md': return 'py-1.5 px-2.5 text-[0.8125rem]';
        case 'lg': return 'py-2.5 px-4 border-[1.5px] text-lg font-semibold tracking-wide';
        case 'sm':
        default: return 'py-1 px-2 text-xs font-semibold';
    }
});

const toneClass = computed(() => {
    switch (props.tone) {
        case 'success': return '[background-color:var(--tone-success-bg)] [color:var(--tone-success-fg)]';
        case 'warning': return '[background-color:var(--tone-warning-bg)] [color:var(--tone-warning-fg)]';
        case 'error': return '[background-color:var(--tone-danger-bg)] [color:var(--tone-danger-fg)]';
        case 'primary':
        case 'info-soft': return '[background-color:var(--tone-info-bg)] [color:var(--tone-info-fg)]';
        case 'success-soft': return '[background-color:var(--tone-success-soft-bg)] [color:var(--tone-success-soft-fg)]';
        case 'warning-soft': return '[background-color:var(--tone-warning-soft-bg)] [color:var(--tone-warning-soft-fg)]';
        case 'error-soft': return '[background-color:var(--tone-danger-soft-bg)] [color:var(--tone-danger-soft-fg)]';
        case 'primary-soft': return '[background-color:var(--tone-primary-soft-bg)] [color:var(--tone-primary-soft-fg)]';
        case 'neutral':
        default: return '[background-color:var(--tone-neutral-soft-bg)] [color:var(--tone-neutral-soft-fg)]';
    }
});

const shapeUtility = computed(() => {
    if (props.shape === 'pill' || props.pill || props.tone.endsWith('-soft')) return 'rounded-full';
    if (props.shape === 'sharp') return 'rounded-none';
    return 'rounded-control';
});
</script>

<template>
    <span
        class="enpii-badge inline-flex items-center border border-solid [border-width:var(--control-border-width)] border-transparent font-sans leading-none"
        :class="[
            `enpii-badge--${tone}`,
            `enpii-badge--${size}`,
            (pill || tone.endsWith('-soft')) && 'enpii-badge--pill',
            shapeClass,
            sizeClass,
            toneClass,
            shapeUtility,
        ]"
    ><slot /></span>
</template>

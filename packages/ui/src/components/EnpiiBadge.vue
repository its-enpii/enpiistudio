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
        case 'lg': return 'py-2.5 px-4 border-[1.5px] text-lg font-extrabold tracking-wide';
        case 'sm':
        default: return 'py-1 px-2 text-xs font-semibold';
    }
});

const toneClass = computed(() => {
    switch (props.tone) {
        case 'success': return 'bg-success-border text-success-text';
        case 'warning': return 'bg-warning-text text-on-primary';
        case 'error': return 'bg-error-container text-on-error-container';
        case 'primary':
        case 'info-soft': return 'bg-primary text-on-primary';
        case 'success-soft': return 'bg-badge-success-soft text-success-text';
        case 'warning-soft': return 'bg-badge-warning-soft text-warning-text';
        case 'error-soft': return 'bg-badge-error-soft text-danger-text';
        case 'primary-soft': return 'bg-badge-primary-soft text-primary-text';
        case 'neutral':
        default: return 'bg-neutral-soft text-neutral-text';
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
        class="enpii-badge inline-flex items-center border border-solid border-transparent font-sans leading-none"
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

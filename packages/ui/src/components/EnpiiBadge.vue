<script setup>
import { useShape } from '../composables/useShape';

const props = defineProps({
    tone: {
        type: String,
        default: 'neutral',
        validator: (value) => [
            // Solid tones (default)
            'neutral', 'success', 'warning', 'error', 'primary',
            // Soft tones — lighter background, stronger text. Useful when paired
            // next to other UI elements (rows, cells, banners).
            'success-soft', 'warning-soft', 'error-soft', 'info-soft', 'primary-soft',
        ].includes(value),
    },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);
</script>

<template>
    <span class="enpii-badge" :class="[`enpii-badge--${tone}`, tone.endsWith('-soft') && 'enpii-badge--pill', shapeClass]"><slot /></span>
</template>

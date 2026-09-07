<script setup>
import { useShape } from '../composables/useShape';

const props = defineProps({
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);
</script>

<template>
    <div class="enpii-stat-tile py-3 px-4 rounded-control bg-surface-container-low" :class="shapeClass">
        <p class="enpii-stat-tile__label m-0 text-on-surface-variant text-xs">{{ label }}</p>
        <p class="enpii-stat-tile__value m-0 tabular-nums text-primary-text text-xl font-semibold">{{ value }}</p>
    </div>
</template>

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
    <div class="enpii-stat-tile" :class="shapeClass">
        <p class="enpii-stat-tile__label">{{ label }}</p>
        <p class="enpii-stat-tile__value">{{ value }}</p>
    </div>
</template>

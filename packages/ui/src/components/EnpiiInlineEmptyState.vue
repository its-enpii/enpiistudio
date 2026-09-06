<script setup>
import { useShape } from '../composables/useShape';

const props = defineProps({
    message: { type: String, required: true },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);
</script>

<template>
    <div class="enpii-inline-empty-state p-4 border border-solid border-outline-variant rounded-control bg-surface-container-low text-on-surface-variant text-sm" :class="shapeClass">
        {{ message }}
    </div>
</template>

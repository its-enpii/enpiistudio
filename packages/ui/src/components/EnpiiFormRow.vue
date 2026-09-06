<script setup>
import { useShape } from '../composables/useShape';

const props = defineProps({
    columns: {
        type: [String, Number],
        default: 2,
        validator: (value) => ['auto', 'full', '1', '2', '3', '4', '5', '6'].includes(String(value)),
    },
    compact: { type: Boolean, default: false },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);
</script>

<template>
    <div class="enpii-form-row grid grid-cols-1 gap-6" :class="[compact ? 'gap-4' : '', `enpii-form-row--${props.columns}`, shapeClass]">
        <slot />
    </div>
</template>

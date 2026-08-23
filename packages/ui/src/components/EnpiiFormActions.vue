<script setup>
import { useShape } from '../composables/useShape';

const props = defineProps({
    align: {
        type: String,
        default: 'between',
        validator: (value) => ['start', 'end', 'between'].includes(value),
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
    <div
        class="enpii-form-actions"
        :class="[shapeClass, { 'enpii-form-actions--start': align === 'start', 'enpii-form-actions--end': align === 'end', 'enpii-form-actions--between': align === 'between' }]"
    >
        <slot />
    </div>
</template>

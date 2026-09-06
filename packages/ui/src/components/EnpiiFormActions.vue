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
        class="enpii-form-actions flex flex-wrap items-center gap-3"
        :class="[shapeClass, align === 'start' ? 'justify-start' : align === 'end' ? 'justify-end' : 'justify-between']"
    >
        <slot />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    padded: { type: Boolean, default: true },
    bordered: { type: Boolean, default: false },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const root = ref(null);
const shapeClass = useShape(props);
defineExpose({ root });
</script>

<template>
    <section ref="root" class="enpii-card" :class="[{ 'enpii-card--unpadded': !padded, 'enpii-card--bordered': bordered }, shapeClass]">
        <header v-if="$slots.header" class="enpii-card__header">
            <slot name="header" />
        </header>
        <slot />
    </section>
</template>

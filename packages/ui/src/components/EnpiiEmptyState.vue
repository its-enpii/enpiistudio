<script setup>
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);
</script>

<template>
    <div class="enpii-empty-state" :class="shapeClass">
        <div class="enpii-empty-state__inner">
            <AppIcon :name="icon" class="enpii-empty-state__icon" />
            <p class="enpii-empty-state__title">{{ title }}</p>
            <p v-if="description" class="enpii-empty-state__description">{{ description }}</p>
            <div v-if="$slots.default" class="enpii-empty-state__actions"><slot /></div>
        </div>
    </div>
</template>

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
    <div class="enpii-empty-state grid min-h-40 place-items-center p-6 rounded-control bg-surface-container-low text-on-surface-variant text-center" :class="shapeClass">
        <div class="enpii-empty-state__inner max-w-[28rem]">
            <AppIcon :name="icon" class="enpii-empty-state__icon text-[2.25rem] leading-none text-outline" />
            <p class="enpii-empty-state__title mt-2 mb-0 text-inherit text-base font-semibold">{{ title }}</p>
            <p v-if="description" class="enpii-empty-state__description mt-1 mb-0 text-sm">{{ description }}</p>
            <div v-if="$slots.default" class="enpii-empty-state__actions mt-4"><slot /></div>
        </div>
    </div>
</template>

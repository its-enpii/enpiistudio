<script setup>
import { useShape } from '../composables/useShape';

const props = defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);
</script>

<template>
    <header class="enpii-page-header flex flex-col justify-between gap-4 md:flex-row md:items-center" :class="shapeClass">
        <div class="enpii-page-header__heading min-w-0">
            <h1 class="enpii-page-header__title m-0 [color:var(--card-fg)] text-2xl font-semibold">{{ title }}</h1>
            <p v-if="subtitle || $slots.default" class="enpii-page-header__subtitle mt-1">
                <slot>{{ subtitle }}</slot>
            </p>
        </div>
        <slot name="actions" />
    </header>
</template>

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
    <header class="enpii-page-header" :class="shapeClass">
        <div class="enpii-page-header__heading">
            <h1 class="enpii-page-header__title">{{ title }}</h1>
            <p v-if="subtitle || $slots.default" class="enpii-page-header__subtitle">
                <slot>{{ subtitle }}</slot>
            </p>
        </div>
        <slot name="actions" />
    </header>
</template>

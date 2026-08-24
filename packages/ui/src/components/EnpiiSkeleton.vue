<script setup>
import { computed, useId } from 'vue';

const props = defineProps({
    variant: { type: String, default: 'text', validator: (value) => ['text', 'circle', 'rectangle'].includes(value) },
    repeat: { type: Number, default: 1 },
});

const items = computed(() => Array.from({ length: Math.max(1, props.repeat) }, (_, index) => index));
</script>

<template>
    <div class="enpii-skeleton" :class="`enpii-skeleton--${variant}`" aria-hidden="true">
        <span v-for="item in items" :key="item" class="enpii-skeleton__item" />
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: { type: String, default: 'text', validator: (value) => ['text', 'circle', 'rectangle'].includes(value) },
    repeat: { type: Number, default: 1 },
});

const items = computed(() => Array.from({ length: Math.max(1, props.repeat) }, (_, index) => index));

const itemVariantClasses = {
    text: 'h-4 rounded-[9999px]',
    circle: 'w-12 h-12 rounded-full',
    rectangle: 'h-24 rounded-control',
};
</script>

<template>
    <div class="enpii-skeleton grid gap-2" :class="`enpii-skeleton--${variant}`" aria-hidden="true">
        <span
            v-for="item in items"
            :key="item"
            class="enpii-skeleton__item block [background-color:var(--skeleton-base)] [background-image:var(--skeleton-pulse)] [background-size:200%_100%] animate-skeleton-shimmer motion-reduce:animate-none"
            :class="itemVariantClasses[variant]"
        />
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    size: { type: String, default: 'md', validator: (value) => ['sm', 'md', 'lg'].includes(value) },
    variant: { type: String, default: 'primary', validator: (value) => ['primary', 'neutral', 'inverse'].includes(value) },
});

const sizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-4 h-4 border-2';
        case 'lg': return 'w-9 h-9 border-3';
        case 'md':
        default: return 'w-6 h-6 border-3';
    }
});

const variantClass = computed(() => {
    switch (props.variant) {
        case 'neutral': return 'border-spinner-track-neutral border-t-on-surface';
        case 'inverse': return 'border-spinner-track-inverse border-t-inverse';
        case 'primary':
        default: return 'border-spinner-track-primary border-t-primary';
    }
});
</script>

<template>
    <span
        class="enpii-spinner inline-flex rounded-full border-solid animate-spin motion-reduce:animate-[spin_2.4s_linear_infinite]"
        :class="[
            `enpii-spinner--${size}`,
            `enpii-spinner--${variant}`,
            sizeClass,
            variantClass,
        ]"
        role="status"
        aria-live="polite"
    >
        <span class="enpii-sr-only sr-only">Loading</span>
    </span>
</template>

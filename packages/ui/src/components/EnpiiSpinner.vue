<script setup>
defineProps({
    size: { type: String, default: 'md', validator: (value) => ['sm', 'md', 'lg'].includes(value) },
    variant: { type: String, default: 'primary', validator: (value) => ['primary', 'neutral', 'inverse'].includes(value) },
});
</script>

<template>
    <span class="enpii-spinner" :class="[`enpii-spinner--${size}`, `enpii-spinner--${variant}`]" role="status" aria-live="polite">
        <span class="enpii-sr-only">Loading</span>
    </span>
</template>

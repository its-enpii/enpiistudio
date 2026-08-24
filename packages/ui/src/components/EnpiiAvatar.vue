<script setup>
import { computed } from 'vue';

const props = defineProps({
    name: { type: String, default: '' },
    src: { type: String, default: null },
    size: { type: String, default: 'md', validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value) },
    shape: { type: String, default: 'circle', validator: (value) => ['circle', 'rounded'].includes(value) },
    status: { type: String, default: null, validator: (value) => [null, 'online', 'offline', 'busy'].includes(value) },
});

const initials = computed(() => props.name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() || '').join(''));
</script>

<template>
    <span class="enpii-avatar" :class="[`enpii-avatar--${size}`, shape === 'rounded' && 'enpii-avatar--rounded']">
        <img v-if="src" class="enpii-avatar__image" :src="src" :alt="name">
        <span v-else-if="initials" class="enpii-avatar__initials">{{ initials }}</span>
        <i v-else class="material-symbols-outlined enpii-avatar__icon" aria-hidden="true">person</i>
        <span v-if="status" class="enpii-avatar__status" :class="`enpii-avatar__status--${status}`"><span class="enpii-sr-only">{{ status }}</span></span>
    </span>
</template>

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

const avatarSizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-[.8125rem]',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-[4.5rem] h-[4.5rem] text-[1.75rem]',
};

const statusClasses = {
  online: 'bg-success-text',
  offline: 'bg-outline',
  busy: 'bg-error',
};
</script>

<template>
    <span
      class="enpii-avatar relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[50%] bg-primary-soft text-primary-text font-semibold"
      :class="[
        `enpii-avatar--${size}`,
        avatarSizeClasses[size],
        shape === 'rounded' && 'enpii-avatar--rounded rounded-control',
      ]"
    >
        <img v-if="src" class="enpii-avatar__image h-full w-full flex items-center justify-center object-cover" :src="src" :alt="name">
        <span v-else-if="initials" class="enpii-avatar__initials flex h-full w-full items-center justify-center">{{ initials }}</span>
        <i v-else class="material-symbols-outlined enpii-avatar__icon flex h-full w-full items-center justify-center" aria-hidden="true">person</i>
        <span v-if="status" class="enpii-avatar__status absolute -right-px -bottom-px h-[.75em] w-[.75em] rounded-[50%] border-2 border-solid border-surface-container-lowest" :class="[`enpii-avatar__status--${status}`, statusClasses[status]]"><span class="enpii-sr-only">{{ status }}</span></span>
    </span>
</template>

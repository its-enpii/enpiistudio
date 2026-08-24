<script setup>
defineProps({ items: { type: Array, required: true } });
defineEmits(['navigate']);
</script>

<template>
    <nav class="enpii-breadcrumb" aria-label="Breadcrumb">
        <ol class="enpii-breadcrumb__list">
            <li v-for="(item, index) in items" :key="item.key" class="enpii-breadcrumb__item" :class="index > 0 && index < items.length - 1 && 'enpii-breadcrumb__item--middle'">
                <a v-if="index < items.length - 1" href="#" class="enpii-breadcrumb__link" @click.prevent="$emit('navigate', item)">{{ item.label }}</a>
                <span v-else class="enpii-breadcrumb__current" aria-current="page">{{ item.label }}</span>
                <i v-if="index < items.length - 1" class="material-symbols-outlined enpii-breadcrumb__separator" aria-hidden="true">chevron_right</i>
            </li>
        </ol>
    </nav>
</template>

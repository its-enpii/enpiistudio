<script setup>
defineProps({ items: { type: Array, required: true } });
defineEmits(['navigate']);
</script>

<template>
    <nav class="enpii-breadcrumb" aria-label="Breadcrumb">
        <ol class="enpii-breadcrumb__list flex items-center overflow-hidden m-0 p-0 list-none">
            <li
                v-for="(item, index) in items"
                :key="item.key"
                class="enpii-breadcrumb__item flex items-center min-w-0"
                :class="index > 0 && index < items.length - 1 && 'enpii-breadcrumb__item--middle min-w-12 max-w-36'"
            >
                <a
                    v-if="index < items.length - 1"
                    href="#"
                    class="enpii-breadcrumb__link [color:var(--nav-fg)] no-underline hover:[color:var(--nav-active-fg)]"
                    :class="index > 0 && index < items.length - 1 && 'overflow-hidden text-ellipsis whitespace-nowrap'"
                    @click.prevent="$emit('navigate', item)"
                >{{ item.label }}</a>
                <span v-else class="enpii-breadcrumb__current [color:var(--nav-active-fg)]" aria-current="page">{{ item.label }}</span>
                <i v-if="index < items.length - 1" class="material-symbols-outlined enpii-breadcrumb__separator w-4 [color:var(--tone-neutral-fg)]" aria-hidden="true">chevron_right</i>
            </li>
        </ol>
    </nav>
</template>

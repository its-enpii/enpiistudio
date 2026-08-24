<script setup>
import { ref } from 'vue';

const props = defineProps({
    brand: { type: String, default: '' },
    links: { type: Array, default: () => [] },
    sticky: { type: Boolean, default: false },
    variant: {
        type: String,
        default: 'default',
        validator: (value) => ['default', 'transparent'].includes(value),
    },
});

defineEmits(['navigate']);

const isOpen = ref(false);

function linkKey(link) {
    return link.key ?? link.href;
}

function toggleMenu() {
    props.links.forEach((link) => {
        if (link.active) isOpen.value = false;
    });
    isOpen.value = !isOpen.value;
}
</script>

<template>
    <nav class="enpii-navbar" :class="[`enpii-navbar--${variant}`, sticky && 'enpii-navbar--sticky']" aria-label="Main">
        <div class="enpii-navbar__inner">
            <a v-if="brand || $slots.brand" href="/" class="enpii-navbar__brand"><slot name="brand">{{ brand }}</slot></a>
            <slot v-else name="brand" />
            <ul class="enpii-navbar__links" :class="isOpen && 'enpii-navbar__links--open'">
                <li v-for="link in links" :key="linkKey(link)">
                    <a :href="link.href ?? '#'" class="enpii-navbar__link" :aria-current="link.active ? 'page' : undefined" @click.prevent="$emit('navigate', link)">{{ link.label }}</a>
                </li>
            </ul>
            <div class="enpii-navbar__actions"><slot name="actions" /></div>
            <button type="button" class="enpii-navbar__toggle" :aria-expanded="isOpen" aria-controls="enpii-navbar-menu" @click="toggleMenu">
                <i class="material-symbols-outlined" aria-hidden="true">{{ isOpen ? 'close' : 'menu' }}</i>
                <span class="enpii-sr-only">Toggle navigation</span>
            </button>
        </div>
    </nav>
</template>

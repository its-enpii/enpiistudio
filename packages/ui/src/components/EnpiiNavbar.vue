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
    <nav
        class="enpii-navbar relative z-raised border-b border-solid [border-width:var(--control-border-width)] border-outline-variant bg-surface-container-lowest text-on-surface"
        :class="[
            `enpii-navbar--${variant}`,
            variant === 'transparent' && 'border-transparent bg-transparent',
            sticky && 'enpii-navbar--sticky sticky top-0',
        ]"
        aria-label="Main"
    >
        <div class="enpii-navbar__inner flex min-h-control items-center gap-3 mx-auto px-4 max-w-[80rem] md:px-6">
            <a v-if="brand || $slots.brand" href="/" class="enpii-navbar__brand inline-flex items-center overflow-hidden text-primary-text font-semibold no-underline text-ellipsis whitespace-nowrap focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"><slot name="brand">{{ brand }}</slot></a>
            <slot v-else name="brand" />
            <ul
                class="enpii-navbar__links hidden m-0 p-0 list-none"
                :class="isOpen && 'enpii-navbar__links--open absolute top-full inset-x-0 z-dropdown flex flex-col border-b border-solid border-outline-variant bg-surface-container-lowest py-2 px-4 shadow-overlay md:static md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none'"
            >
                <li v-for="link in links" :key="linkKey(link)">
                    <a
                        :href="link.href ?? '#'"
                        class="enpii-navbar__link flex w-full items-center py-2 text-on-surface-variant text-base font-semibold no-underline [transition-property:color,background] duration-fast ease-emphasized hover:text-primary-text focus-visible:text-primary-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus aria-current:text-primary-text md:w-auto md:py-2 md:px-3 md:rounded-full md:hover:bg-primary-soft md:aria-current:bg-primary-soft"
                        :aria-current="link.active ? 'page' : undefined"
                        @click.prevent="$emit('navigate', link)"
                    >{{ link.label }}</a>
                </li>
            </ul>
            <div class="enpii-navbar__actions hidden ml-auto items-center gap-2 md:flex"><slot name="actions" /></div>
            <button
                type="button"
                class="enpii-navbar__toggle inline-flex w-10 h-10 items-center justify-center ml-auto rounded-full border-0 bg-none text-on-surface cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus md:hidden"
                :aria-expanded="isOpen"
                aria-controls="enpii-navbar-menu"
                @click="toggleMenu"
            >
                <i class="material-symbols-outlined" aria-hidden="true">{{ isOpen ? 'close' : 'menu' }}</i>
                <span class="enpii-sr-only">Toggle navigation</span>
            </button>
        </div>
    </nav>
</template>

<script setup>
defineProps({
    brand: { type: String, default: '' },
    copyright: { type: String, default: '' },
    columns: { type: Array, default: () => [] },
    variant: {
        type: String,
        default: 'default',
        validator: (value) => ['default', 'dark'].includes(value),
    },
});

defineEmits(['navigate']);
</script>

<template>
    <footer class="enpii-footer bg-surface-container-lowest text-on-surface" :class="variant === 'dark' ? 'enpii-footer--dark bg-primary-deep text-on-primary' : ''">
        <div class="enpii-footer__inner grid gap-6 py-8 px-[max(1rem,calc((100%-80rem)/2))]">
            <slot name="brand">
                <p class="enpii-footer__brand m-0 text-lg font-semibold">{{ brand }}</p>
            </slot>
            <div class="enpii-footer__columns grid gap-6 md:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
                <section v-for="column in columns" :key="column.title" class="enpii-footer__group">
                    <h3 class="enpii-footer__title m-0 mb-2 text-inherit opacity-80 text-sm font-semibold">{{ column.title }}</h3>
                    <ul class="enpii-footer__links grid gap-1 m-0 p-0 list-none">
                        <li v-for="link in column.links" :key="link.key ?? link.href">
                            <a :href="link.href ?? '#'" class="enpii-footer__link text-inherit no-underline opacity-78 hover:opacity-100 hover:underline focus-visible:opacity-100 focus-visible:underline focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-offset:var(--focus-offset)] focus-visible:outline-focus" @click="$emit('navigate', link)">{{ link.label }}</a>
                        </li>
                    </ul>
                </section>
            </div>
            <p class="enpii-footer__copyright m-0 pt-4 border-t border-solid border-current/18 text-sm opacity-70"><slot name="copyright">{{ copyright }}</slot></p>
        </div>
    </footer>
</template>

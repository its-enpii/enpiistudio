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
    <footer class="enpii-footer" :class="`enpii-footer--${variant}`">
        <div class="enpii-footer__inner">
            <slot name="brand">
                <p class="enpii-footer__brand">{{ brand }}</p>
            </slot>
            <div class="enpii-footer__columns">
                <section v-for="column in columns" :key="column.title" class="enpii-footer__group">
                    <h3 class="enpii-footer__title">{{ column.title }}</h3>
                    <ul class="enpii-footer__links">
                        <li v-for="link in column.links" :key="link.key ?? link.href">
                            <a :href="link.href ?? '#'" class="enpii-footer__link" @click="$emit('navigate', link)">{{ link.label }}</a>
                        </li>
                    </ul>
                </section>
            </div>
            <p class="enpii-footer__copyright"><slot name="copyright">{{ copyright }}</slot></p>
        </div>
    </footer>
</template>

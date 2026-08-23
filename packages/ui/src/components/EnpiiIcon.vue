<script setup>
defineProps({
    name: { type: String, required: true },
    filled: { type: Boolean, default: false },
    label: { type: String, default: null },
    /**
     * Semantic color tone. When set (not 'neutral'), the icon is rendered inside
     * a rounded container with MD3 token classes. Useful for stat tiles, status
     * badges, and inline alerts. Backwards-compatible: omit to keep raw icon.
     */
    tone: {
        type: String,
        default: 'neutral',
        validator: (value) => ['neutral', 'success', 'warning', 'danger', 'error', 'info', 'primary', 'secondary', 'tertiary'].includes(value),
    },
    /**
     * Optional container size when tone is set. Maps to a BEM size modifier.
     * Default: 9 (36px). Used in stat tiles / status pills.
     */
    containerSize: { type: [Number, String], default: 9 },
    /**
     * Optional container shape. 'rounded' uses a medium radius; 'pill' is fully rounded.
     */
    containerShape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill'].includes(value),
    },
});


</script>

<template>
    <!-- Raw icon (tone === 'neutral') — preserves existing call sites -->
    <span
        v-if="tone === 'neutral'"
        class="material-symbols-outlined enpii-icon"
        :class="{ 'is-filled': filled }"
        :aria-hidden="label ? undefined : 'true'"
        :aria-label="label || undefined"
        :role="label ? 'img' : undefined"
    >{{ name }}</span>

    <!-- Toned icon: render inside a colored container -->
    <span
        v-else
        class="enpii-icon__container"
        :class="[
            `enpii-icon__container--${containerSize}`,
            `enpii-icon__container--${containerShape}`,
            `enpii-icon__container--${tone}`,
        ]"
        :aria-hidden="label ? undefined : 'true'"
        :aria-label="label || undefined"
        :role="label ? 'img' : undefined"
    >
        <span
            class="material-symbols-outlined"
            :class="{ 'is-filled': filled }"
        >{{ name }}</span>
    </span>
</template>

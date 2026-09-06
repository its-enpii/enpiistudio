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
        class="material-symbols-outlined enpii-icon shrink-0"
        :class="{ 'is-filled': filled }"
        :aria-hidden="label ? undefined : 'true'"
        :aria-label="label || undefined"
        :role="label ? 'img' : undefined"
    >{{ name }}</span>

    <!-- Toned icon: render inside a colored container -->
    <span
        v-else
        class="enpii-icon__container grid shrink-0 place-items-center"
        :class="[
            containerSize === 8 && 'h-8 w-8',
            containerSize === 9 && 'h-9 w-9',
            containerSize === 10 && 'h-10 w-10',
            containerSize === 12 && 'h-12 w-12',
            containerShape === 'pill' ? 'rounded-full' : 'rounded-lg',
            ['success', 'secondary'].includes(tone) && 'bg-secondary-container text-on-secondary',
            ['warning', 'tertiary'].includes(tone) && 'bg-tertiary-fixed text-on-tertiary',
            ['danger', 'error'].includes(tone) && 'bg-error-container text-on-error-container',
            ['info', 'primary'].includes(tone) && 'bg-primary-container text-on-primary-container',
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

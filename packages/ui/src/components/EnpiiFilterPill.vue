<script setup>
import AppIcon from "./EnpiiIcon.vue";
import { useShape } from "../composables/useShape";

defineOptions({ inheritAttrs: false });

/**
 * Pill/filter chip yang bisa toggle aktif/non-aktif.
 * Pakai untuk: filter status, segment control, document stage filter, dll.
 *
 * Item shape: { value, label, icon?, count?, disabled? }
 * `count` = angka di sebelah label dalam kurung, mis. "Semua (12)"
 * `icon` = nama Material icon di kiri label
 */
const props = defineProps({
    items: { type: Array, required: true },
    modelValue: { type: [String, Number, Boolean], default: null },
    /**
     * Layout:
     * - "outline" (default): rounded control outline, active primary background
     * - "solid": fully rounded neutral surface, active primary background
     * - "segment": medium radius, active primary background
     */
    variant: {
        type: String,
        default: "outline",
        validator: (value) => ["outline", "solid", "segment"].includes(value),
    },
    size: {
        type: String,
        default: "default",
        validator: (value) => ["default", "compact"].includes(value),
    },
    ariaLabel: { type: String, default: "Filter" },
    shape: {
        type: String,
        default: "rounded",
        validator: (value) => ["rounded", "pill", "sharp"].includes(value),
    },
});

const shapeClass = useShape(props);

defineEmits(["update:modelValue"]);

const variantClasses = {
    outline: "py-2 px-3 border border-solid [border-width:var(--control-border-width)] border-outline-variant rounded-control bg-surface-container-lowest text-primary-text",
    solid: "py-2 px-3 border-0 rounded-full bg-surface-container-high text-on-surface-variant",
    segment: "py-2 px-3 border-0 rounded-lg bg-surface-container-low text-on-surface-variant",
};

function pillClass(item) {
    const active = props.modelValue === item.value;
    const isCompact = props.size === "compact";
    return [
        "enpii-filter-pill__button enpii-filter-pill__button--structural inline-flex items-center gap-1 text-sm font-semibold cursor-pointer [transition-property:all] duration-fast ease-emphasized focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-style:solid] focus-visible:outline-focus focus-visible:[outline-offset:var(--focus-offset)] active:enabled:[transform:var(--press-transform)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        `enpii-filter-pill__button--${props.variant}`,
        variantClasses[props.variant] || variantClasses.outline,
        isCompact ? "enpii-filter-pill__button--compact !py-1 !px-3 !text-xs" : "",
        shapeClass.value,
        active ? "enpii-filter-pill__button--active !bg-primary !border-primary !text-on-primary shadow-control" : "",
        item.disabled ? "enpii-filter-pill__button--disabled" : "",
    ];
}
</script>

<template>
    <div class="enpii-filter-pill flex flex-wrap gap-2" :class="shapeClass" role="group" :aria-label="ariaLabel">
        <button
            v-for="item in items"
            :key="item.value"
            type="button"
            :disabled="item.disabled"
            :class="pillClass(item)"
            @click="!item.disabled && $emit('update:modelValue', item.value)"
        >
            <AppIcon v-if="item.icon" :name="item.icon" class="enpii-filter-pill__icon text-base leading-none" />
            <span>{{ item.label }}<span v-if="item.count !== undefined && item.count !== null"> ({{ item.count }})</span></span>
        </button>
    </div>
</template>

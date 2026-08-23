<script setup>
import { computed } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';

/**
 * Tab navigation dengan 3 varian layout:
 * - 'underline' (default): tab border-b-2 ala Material 3 navigation bar (top tabs)
 * - 'pill': tab dalam container bersudut halus (sidebar nav, segmented control)
 * - 'pills-bar': tab di dalam rounded container dengan pill aktif (gateway/payment tab)
 *
 * Item shape: { key, label, icon?, badge?, disabled? }
 * `icon` = string nama Material icon
 * `badge` = number/string di sebelah kanan label (mis. counter)
 * `disabled` = disable tab tertentu
 */
const props = defineProps({
    items: { type: Array, required: true },
    modelValue: { type: [String, Number], required: true },
    variant: {
        type: String,
        default: 'underline',
        validator: (value) => ['underline', 'pill', 'pills', 'pills-bar', 'pill-bar'].includes(value),
    },
    vertical: { type: Boolean, default: false },
    ariaLabel: { type: String, default: 'Tab' },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

defineEmits(['update:modelValue']);

const shapeClass = useShape(props);

const normalizedVariant = computed(() => {
    if (props.vertical || props.variant === 'pill' || props.variant === 'pills') return 'pill';
    if (props.variant === 'pills-bar' || props.variant === 'pill-bar') return 'pills-bar';
    return 'underline';
});

function tabClass(item) {
    const active = props.modelValue === item.key;
    return [
        'enpii-tabs__tab',
        `enpii-tabs__tab--${normalizedVariant.value}`,
        shapeClass.value,
        active ? 'enpii-tabs__tab--active' : '',
        item.disabled ? 'enpii-tabs__tab--disabled' : ''
    ];
}
</script>

<template>
    <nav class="enpii-tabs" :class="[`enpii-tabs--${normalizedVariant.value}`, shapeClass]" :aria-label="ariaLabel">
        <button
            v-for="item in items"
            :key="item.key"
            type="button"
            role="tab"
            :aria-selected="modelValue === item.key"
            :aria-current="modelValue === item.key ? 'page' : undefined"
            :disabled="item.disabled"
            :class="tabClass(item)"
            @click="!item.disabled && $emit('update:modelValue', item.key)"
        >
            <AppIcon v-if="item.icon" :name="item.icon" class="enpii-tabs__icon" />
            <span class="enpii-tabs__label">{{ item.label }}</span>
            <span
                v-if="item.badge !== undefined && item.badge !== null"
                class="enpii-tabs__badge"
            >{{ item.badge }}</span>
        </button>
    </nav>
</template>

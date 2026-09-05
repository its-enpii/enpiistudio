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

const navVariantClasses = {
    'underline': 'flex flex-wrap gap-x-6 gap-y-1',
    'pill': 'flex flex-col gap-1 w-full',
    'pills-bar': 'flex flex-wrap gap-1 p-1 border border-solid border-outline-variant rounded-control bg-surface-container-lowest',
};

function tabClass(item) {
    const active = props.modelValue === item.key;
    const variant = normalizedVariant.value;
    const classes = [
        'enpii-tabs__tab flex items-center gap-2 border-0 bg-transparent cursor-pointer [transition-property:all] duration-fast ease-emphasized focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus',
        `enpii-tabs__tab--${variant}`,
        shapeClass.value,
    ];

    if (active) {
        classes.push('enpii-tabs__tab--active');
    }

    if (item.disabled) {
        classes.push('enpii-tabs__tab--disabled opacity-50 cursor-not-allowed !bg-transparent');
    }

    if (variant === 'underline') {
        classes.push('pt-2 px-1 pb-3 border-b-2 text-sm');
        if (active) {
            classes.push('border-b-primary text-primary-text font-semibold');
        } else {
            classes.push('border-transparent text-on-surface-variant font-medium hover:border-b-outline hover:text-on-surface');
        }
    } else if (variant === 'pill') {
        classes.push('w-full justify-start py-2 px-3 rounded-lg text-sm text-left');
        if (active) {
            classes.push('bg-primary-container text-on-primary-container font-semibold');
        } else {
            classes.push('text-on-surface-variant font-medium hover:bg-surface-container hover:text-on-surface');
        }
    } else if (variant === 'pills-bar') {
        classes.push('py-2 px-4 rounded-lg text-sm');
        if (active) {
            classes.push('bg-primary text-on-primary shadow-control font-semibold');
        } else {
            classes.push('text-on-surface-variant font-semibold hover:bg-surface-container-low hover:text-primary-text');
        }
    }

    return classes;
}
</script>

<template>
    <nav class="enpii-tabs" :class="[`enpii-tabs--${normalizedVariant}`, navVariantClasses[normalizedVariant], shapeClass]" :aria-label="ariaLabel">
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
            <AppIcon v-if="item.icon" :name="item.icon" class="enpii-tabs__icon shrink-0 text-[1.125rem]" />
            <span class="enpii-tabs__label overflow-hidden text-ellipsis whitespace-nowrap">{{ item.label }}</span>
            <span
                v-if="item.badge !== undefined && item.badge !== null"
                class="enpii-tabs__badge inline-flex items-center justify-center min-w-4 ml-auto px-1 rounded-[9999px] bg-badge-error-soft text-danger-text text-[0.625rem] font-semibold leading-4"
            >{{ item.badge }}</span>
        </button>
    </nav>
</template>

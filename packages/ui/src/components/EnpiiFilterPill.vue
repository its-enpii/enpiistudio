<script setup>
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';

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
     * - 'outline' (default): rounded control outline, active primary background
     * - 'solid': fully rounded neutral surface, active primary background
     * - 'segment': medium radius, active primary background
     */
    variant: {
        type: String,
        default: 'outline',
        validator: (value) => ['outline', 'solid', 'segment'].includes(value),
    },
    size: {
        type: String,
        default: 'default',
        validator: (value) => ['default', 'compact'].includes(value),
    },
    ariaLabel: { type: String, default: 'Filter' },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

defineEmits(['update:modelValue']);

function pillClass(item) {
    const active = props.modelValue === item.value;
    return [
        'enpii-filter-pill__button',
        `enpii-filter-pill__button--${props.variant}`,
        props.size === 'compact' ? 'enpii-filter-pill__button--compact' : '',
        shapeClass.value,
        active ? 'enpii-filter-pill__button--active' : '',
        item.disabled ? 'enpii-filter-pill__button--disabled' : ''
    ];
}
</script>

<template>
    <div class="enpii-filter-pill" :class="shapeClass" role="group" :aria-label="ariaLabel">
        <button
            v-for="item in items"
            :key="item.value"
            type="button"
            :disabled="item.disabled"
            :class="pillClass(item)"
            @click="!item.disabled && $emit('update:modelValue', item.value)"
        >
            <AppIcon v-if="item.icon" :name="item.icon" class="enpii-filter-pill__icon" />
            <span>{{ item.label }}<span v-if="item.count !== undefined && item.count !== null"> ({{ item.count }})</span></span>
        </button>
    </div>
</template>

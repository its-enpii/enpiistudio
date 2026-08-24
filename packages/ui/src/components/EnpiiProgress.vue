<script setup>
import { computed } from 'vue';

const props = defineProps({
    value: { type: Number, default: null },
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value),
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md'].includes(value),
    },
    label: { type: String, default: 'Progress' },
    showLabel: { type: Boolean, default: false },
});

const indeterminate = computed(() => props.value === null);

const percent = computed(() => indeterminate.value ? null : Math.min(100, Math.max(0, props.value)));
</script>

<template>
    <div class="enpii-progress" :class="[`enpii-progress--${variant}`, `enpii-progress--${size}`]">
        <div v-if="showLabel || indeterminate" class="enpii-progress__meta">
            <span>{{ label }}</span>
            <span v-if="!indeterminate">{{ Math.round(percent) }}%</span>
        </div>
        <div class="enpii-progress__track" role="progressbar" :aria-label="label" :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="indeterminate ? undefined : value" :aria-busy="indeterminate">
            <div class="enpii-progress__bar" :class="indeterminate && 'enpii-progress__bar--indeterminate'" :style="{ width: `${percent}%` }" />
        </div>
    </div>
</template>

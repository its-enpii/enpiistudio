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

const variantClasses = {
  primary: '[background-color:var(--tone-primary-bg)]',
  success: '[background-color:var(--tone-success-bg)]',
  warning: '[background-color:var(--tone-warning-bg)]',
  danger: '[background-color:var(--tone-danger-bg)]',
};
</script>

<template>
    <div class="enpii-progress grid gap-1" :class="[`enpii-progress--${variant}`, `enpii-progress--${size}`]">
        <div v-if="showLabel || indeterminate" class="enpii-progress__meta flex justify-between text-sm font-semibold [color:var(--tone-neutral-fg)]">
            <span>{{ label }}</span>
            <span v-if="!indeterminate">{{ Math.round(percent) }}%</span>
        </div>
        <div class="enpii-progress__track overflow-hidden h-2 rounded-[9999px] [background-color:var(--progress-track)]" :class="size === 'sm' && 'h-1'" role="progressbar" :aria-label="label" :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="indeterminate ? undefined : value" :aria-busy="indeterminate">
            <div
              class="enpii-progress__bar h-full rounded-[inherit] [background-color:var(--progress-fill)] [transition-property:width] duration-base ease-emphasized"
              :class="[variantClasses[variant], indeterminate && 'enpii-progress__bar--indeterminate w-[35%] animate-progress-indeterminate motion-reduce:animate-none motion-reduce:translate-x-0']"
              :style="{ width: indeterminate ? undefined : `${percent}%` }"
            />
        </div>
    </div>
</template>

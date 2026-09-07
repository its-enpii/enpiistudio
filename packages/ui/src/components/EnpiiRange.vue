<script setup>
import { useId } from 'vue';
import EnpiiLabel from './EnpiiLabel.vue';

const model = defineModel({ type: Number, default: 0 });

defineProps({
    label: { type: String, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    showValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
});

const inputId = useId();
</script>

<template>
    <div class="enpii-range w-full grid gap-2">
        <EnpiiLabel :for="inputId" size="sm" class="enpii-range__label flex items-center justify-between gap-3">
            {{ label }}
            <output v-if="showValue" class="enpii-range__value [color:var(--label-fg)]">{{ model }}</output>
        </EnpiiLabel>
        <input :id="inputId" v-model.number="model" class="enpii-range__control h-2 m-0 border-0 appearance-none [background-color:var(--progress-track)] rounded-[9999px] [accent-color:var(--progress-fill)] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-style:solid] focus-visible:[outline-offset:var(--focus-offset-wide)] focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-45" type="range" :min="min" :max="max" :step="step" :disabled="disabled">
    </div>
</template>

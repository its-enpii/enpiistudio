<script setup>
import { useId } from 'vue';

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
    <div class="enpii-range grid gap-2">
        <label class="enpii-range__label flex items-center justify-between gap-3 text-on-surface-variant text-[0.8125rem] font-semibold tracking-wide" :for="inputId">
            {{ label }}
            <output v-if="showValue" class="enpii-range__value text-on-surface-variant">{{ model }}</output>
        </label>
        <input :id="inputId" v-model.number="model" class="enpii-range__control h-2 m-0 border-0 appearance-none bg-surface-container-high rounded-[9999px] accent-primary focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-45" type="range" :min="min" :max="max" :step="step" :disabled="disabled">
    </div>
</template>

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
    <div class="enpii-range">
        <label class="enpii-range__label" :for="inputId">
            {{ label }}
            <output v-if="showValue" class="enpii-range__value">{{ model }}</output>
        </label>
        <input :id="inputId" v-model.number="model" class="enpii-range__control" type="range" :min="min" :max="max" :step="step" :disabled="disabled">
    </div>
</template>

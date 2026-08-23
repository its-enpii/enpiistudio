<script setup>
import { useId } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';

const model = defineModel({ default: '' });
const props = defineProps({
    id: { type: String, default: null },
    label: { type: String, required: true },
    options: { type: Array, required: true },
    error: { type: String, default: null },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const inputId = props.id || useId();
</script>

<template>
    <fieldset :disabled="disabled" class="enpii-radio-group">
        <legend class="enpii-radio-group__legend">{{ label }}</legend>
        <div class="enpii-radio-group__options" :class="[shapeClass, { 'enpii-radio-group__options--error': Boolean(error) }]">
            <label v-for="(option, index) in options" :key="option.value" class="enpii-radio-group__option" :class="{ 'enpii-radio-group__option--divider': index > 0 }">
                <input
                    :id="`${inputId}-${option.value}`"
                    v-model="model"
                    type="radio"
                    :name="inputId"
                    :value="option.value"
                    :required="required"
                    :aria-invalid="Boolean(error)"
                    :aria-describedby="error ? `${inputId}-error` : undefined"
                    class="enpii-radio-group__native enpii-sr-only"
                >
                <span
                    class="enpii-radio-group__button"
                    :class="{ 'enpii-radio-group__button--active': model === option.value }"
                >
                    <AppIcon v-if="option.icon" :name="option.icon" class="enpii-radio-group__icon" />
                    {{ option.label }}
                </span>
            </label>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-radio-group__error">{{ error }}</p>
    </fieldset>
</template>

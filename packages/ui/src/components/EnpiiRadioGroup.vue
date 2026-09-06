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
    <fieldset :disabled="disabled" class="enpii-radio-group m-0 border-0 p-0 [&>*+*]:gap-field-gap">
        <legend class="enpii-radio-group__legend ml-1 text-on-surface-variant text-xs font-medium">{{ label }}</legend>
        <div class="enpii-radio-group__options grid auto-cols-fr grid-flow-col overflow-hidden border border-solid border-outline-variant rounded-control bg-surface-container-lowest" :class="[shapeClass, { 'enpii-radio-group__options--error': Boolean(error) }]">
            <label v-for="(option, index) in options" :key="option.value" class="enpii-radio-group__option relative min-w-0" :class="{ 'enpii-radio-group__option--divider border-l border-solid border-outline-variant has-disabled:opacity-60 has-disabled:cursor-not-allowed': index > 0 }">
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
                        class="enpii-radio-group__button flex min-h-9 items-center gap-2 text-on-surface-variant font-inherit text-sm font-medium text-transform-none [transition-property:color,background,border-color] duration-fast ease-emphasized"
                        :class="{ 'enpii-radio-group__button--active text-primary-text': model === option.value }"
                    >
                    <AppIcon v-if="option.icon" :name="option.icon" class="enpii-radio-group__icon text-base leading-none" />
                    {{ option.label }}
                </span>
            </label>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-radio-group__error ml-1 text-danger-text text-[0.8125rem]">{{ error }}</p>
    </fieldset>
</template>

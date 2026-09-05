<script setup>
defineOptions({ inheritAttrs: false });

import { computed } from 'vue';
import { useId } from 'vue';
import { useShape } from '../composables/useShape';
import AppIcon from './EnpiiIcon.vue';
import AppTooltip from './EnpiiTooltip.vue';
import { useT } from '../composables/useT'

const t = useT()

const model = defineModel({ type: [String, Number], default: '' });
const props = defineProps({
    id: { type: String, default: null },
    label: { type: String, required: true },
    type: { type: String, default: 'text' },
    icon: { type: String, default: null },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    placeholder: { type: String, default: null },
    readonly: { type: Boolean, default: false },
    hideLabel: { type: Boolean, default: false },
    tooltip: { type: String, default: null },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const generatedId = useId();
const inputId = props.id || generatedId;

const shapeUtility = computed(() => {
    if (props.shape === 'pill') return 'rounded-full';
    if (props.shape === 'sharp') return 'rounded-none';
    return 'rounded-control';
});

const controlStateClass = computed(() => {
    if (props.readonly) return 'bg-surface-container-low text-on-surface-variant border-outline-variant cursor-default';
    if (props.error) return 'bg-surface-container-lowest text-primary border-danger-border';
    return 'bg-surface-container-lowest text-primary border-outline-variant';
});
</script>

<template>
    <div class="enpii-input w-full [&>*]:mt-[var(--enpii-space-field-gap)]">
        <div v-if="!hideLabel" class="enpii-input__label-row relative flex items-center gap-1 ml-1">
            <label :for="inputId" class="enpii-input__label block text-on-surface-variant text-[0.8125rem] font-semibold tracking-[0.02em]">{{ label }}</label>
            <AppTooltip v-if="tooltip" :id="`${inputId}-tooltip`" :text="tooltip" />
        </div>
        <label v-else :for="inputId" class="enpii-sr-only">{{ label }}</label>
        <div class="enpii-input__control-wrap relative">
            <AppIcon v-if="icon" :name="icon" class="enpii-input__icon absolute top-1/2 left-4 w-5 h-5 -translate-y-1/2 text-outline pointer-events-none text-xl leading-none" />
            <input
                :id="inputId"
                v-model="model"
                :type="type"
                :aria-invalid="Boolean(error)"
                :aria-describedby="[
                    error && `${inputId}-error`,
                    hint && `${inputId}-hint`,
                    tooltip && `${inputId}-tooltip`
                ].filter(Boolean).join(' ') || undefined"
                :readonly="readonly"
                :placeholder="readonly ? undefined : (placeholder ?? t('input.placeholder', { label: label.toLowerCase() }))"
                class="enpii-input__control w-full min-h-control p-px border border-solid font-sans text-control placeholder:text-outline appearance-none [transition-property:border-color,box-shadow,background] duration-fast ease-emphasized hover:enabled:[border-color:color-mix(in_srgb,var(--enpii-color-primary)_40%,transparent)] focus:outline-none focus-visible:outline-none focus:border-primary-container focus-visible:border-primary-container focus:[box-shadow:var(--enpii-focus-ring)] focus-visible:[box-shadow:var(--enpii-focus-ring)]"
                :class="[shapeClass, shapeUtility, controlStateClass, { 'pl-12': icon, 'pr-14': Boolean($slots.trailing), 'enpii-input__control--icon': icon, 'enpii-input__control--trailing': Boolean($slots.trailing), 'enpii-input__control--error': Boolean(error), 'enpii-input__control--readonly': readonly }]"
                v-bind="$attrs"
            >
            <div v-if="$slots.trailing" class="enpii-input__trailing absolute top-1/2 right-2 flex items-center justify-center h-10 -translate-y-1/2">
                <slot name="trailing" />
            </div>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-input__help enpii-input__help--error ml-1 text-danger-text text-[0.8125rem]">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="enpii-input__help ml-1 text-on-surface-variant text-[0.8125rem]">{{ hint }}</p>
    </div>
</template>

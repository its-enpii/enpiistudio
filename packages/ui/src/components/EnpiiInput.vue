<script setup>
defineOptions({ inheritAttrs: false });

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
</script>

<template>
    <div class="enpii-input">
        <div v-if="!hideLabel" class="enpii-input__label-row">
            <label :for="inputId" class="enpii-input__label">{{ label }}</label>
            <AppTooltip v-if="tooltip" :id="`${inputId}-tooltip`" :text="tooltip" />
        </div>
        <label v-else :for="inputId" class="enpii-sr-only">{{ label }}</label>
        <div class="enpii-input__control-wrap">
            <AppIcon v-if="icon" :name="icon" class="enpii-input__icon" />
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
                class="enpii-input__control"
                :class="[shapeClass, { 'enpii-input__control--icon': icon, 'enpii-input__control--trailing': Boolean($slots.trailing), 'enpii-input__control--error': Boolean(error), 'enpii-input__control--readonly': readonly }]"
                v-bind="$attrs"
            >
            <div v-if="$slots.trailing" class="enpii-input__trailing">
                <slot name="trailing" />
            </div>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-input__help enpii-input__help--error">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="enpii-input__help">{{ hint }}</p>
    </div>
</template>

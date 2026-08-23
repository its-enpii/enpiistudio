<script setup>
defineOptions({ inheritAttrs: false });

import { useId } from 'vue';
import { useShape } from '../composables/useShape';
import AppIcon from './EnpiiIcon.vue';

const model = defineModel({ type: String, default: '' });
const props = defineProps({
    id: { type: String, default: null },
    label: { type: String, required: true },
    icon: { type: String, default: null },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    placeholder: { type: String, default: null },
    readonly: { type: Boolean, default: false },
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
    <div class="enpii-textarea">
        <label :for="inputId" class="enpii-textarea__label">{{ label }}</label>
        <div class="enpii-textarea__control-wrap">
            <AppIcon v-if="icon" :name="icon" class="enpii-textarea__icon" />
            <textarea
                :id="inputId"
                v-model="model"
                :aria-invalid="Boolean(error)"
                :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
                :readonly="readonly"
                :placeholder="readonly ? undefined : (placeholder ?? `Masukkan ${label.toLowerCase()}`)"
                class="enpii-textarea__control"
                :class="[shapeClass, { 'enpii-textarea__control--icon': icon, 'enpii-textarea__control--error': Boolean(error), 'enpii-textarea__control--readonly': readonly }]"
                v-bind="$attrs"
            />
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-textarea__help enpii-textarea__help--error">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="enpii-textarea__help">{{ hint }}</p>
    </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false });

import { computed } from 'vue';
import { useId } from 'vue';
import { useShape } from '../composables/useShape';
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT'
import EnpiiLabel from './EnpiiLabel.vue'

const t = useT()

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

const shapeUtility = computed(() => {
    if (props.shape === 'pill') return 'rounded-full';
    if (props.shape === 'sharp') return 'rounded-none';
    return 'rounded-control';
});

const controlStateClass = computed(() => {
    if (props.readonly) return '[background-color:var(--field-bg)] [color:var(--field-fg)] [border-color:var(--control-border-color)] cursor-default';
    if (props.error) return '[background-color:var(--field-bg)] [color:var(--field-fg)] [border-color:var(--field-error-border)]';
    return '[background-color:var(--field-bg)] [color:var(--field-fg)] [border-color:var(--field-border)]';
});
</script>

<template>
    <div class="enpii-textarea w-full [&>*+*]:mt-[0.5rem]">
        <EnpiiLabel :for="inputId" size="sm" class="enpii-textarea__label block ml-1">{{ label }}</EnpiiLabel>
        <div class="enpii-textarea__control-wrap relative">
            <AppIcon v-if="icon" :name="icon" class="enpii-textarea__icon absolute top-4 left-4 [color:var(--field-placeholder-fg)] pointer-events-none text-xl leading-none" />
            <textarea
                :id="inputId"
                v-model="model"
                :aria-invalid="Boolean(error)"
                :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
                :readonly="readonly"
                :placeholder="readonly ? undefined : (placeholder ?? t('textarea.placeholder', { label: label.toLowerCase() }))"
        class="enpii-textarea__control w-full min-h-[6rem] px-4 py-3 border border-solid [border-width:var(--control-border-width)] font-sans text-control resize-y placeholder:[color:var(--field-placeholder-fg)] appearance-none [transition-property:border-color,box-shadow,background] duration-fast ease-emphasized hover:enabled:[border-color:var(--field-border)] focus:outline-none focus-visible:outline-none focus:[border-color:var(--field-border)] focus-visible:[border-color:var(--field-border)] focus:[box-shadow:var(--shadow-focus)] focus-visible:[box-shadow:var(--shadow-focus)]"
                :class="[shapeClass, shapeUtility, controlStateClass, icon && 'pl-12', { 'enpii-textarea__control--icon': icon, 'enpii-textarea__control--error': Boolean(error), 'enpii-textarea__control--readonly': readonly }]"
                v-bind="$attrs"
            />
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-textarea__help enpii-textarea__help--error ml-1 [color:var(--field-error-fg)] text-[0.8125rem]">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="enpii-textarea__help ml-1 [color:var(--field-fg)] text-[0.8125rem]">{{ hint }}</p>
    </div>
</template>

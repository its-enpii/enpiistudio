<script setup>
defineOptions({ inheritAttrs: false });

import { computed } from 'vue';
import { useId } from 'vue';
import { useShape } from '../composables/useShape';
import AppIcon from './EnpiiIcon.vue';
import AppTooltip from './EnpiiTooltip.vue';
import EnpiiLabel from './EnpiiLabel.vue';
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
    if (props.readonly) return '[background-color:var(--field-bg)] [color:var(--field-fg)] [border-color:var(--control-border-color)] cursor-default';
    if (props.error) return '[background-color:var(--field-bg)] [color:var(--field-fg)] [border-color:var(--field-error-border)]';
    return '[background-color:var(--field-bg)] [color:var(--field-fg)] [border-color:var(--field-border)]';
});
</script>

<template>
    <div class="enpii-input w-full [&>*]:mt-[0.5rem]">
        <div v-if="!hideLabel" class="enpii-input__label-row relative flex items-center gap-1 ml-1">
            <EnpiiLabel :for="inputId" size="sm" class="enpii-input__label block">{{ label }}</EnpiiLabel>
            <AppTooltip v-if="tooltip" :id="`${inputId}-tooltip`" :text="tooltip" />
        </div>
        <EnpiiLabel v-else :for="inputId" size="sm" hidden class="enpii-input__label">{{ label }}</EnpiiLabel>
        <div class="enpii-input__control-wrap relative">
            <AppIcon v-if="icon" :name="icon" class="enpii-input__icon absolute top-1/2 left-4 w-5 h-5 -translate-y-1/2 [color:var(--field-placeholder-fg)] pointer-events-none text-xl leading-none" />
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
        class="enpii-input__control w-full min-h-control p-px border border-solid [border-width:var(--control-border-width)] font-sans text-control placeholder:[color:var(--field-placeholder-fg)] appearance-none [transition-property:border-color,box-shadow,background] duration-fast ease-emphasized hover:enabled:[border-color:var(--field-border)] focus:outline-none focus-visible:outline-none focus:[border-color:var(--field-border)] focus-visible:[border-color:var(--field-border)] focus:[box-shadow:var(--shadow-focus)] focus-visible:[box-shadow:var(--shadow-focus)]"
                :class="[shapeClass, shapeUtility, controlStateClass, { 'pl-12': icon, 'pr-14': Boolean($slots.trailing), 'enpii-input__control--icon': icon, 'enpii-input__control--trailing': Boolean($slots.trailing), 'enpii-input__control--error': Boolean(error), 'enpii-input__control--readonly': readonly }]"
                v-bind="$attrs"
            >
            <div v-if="$slots.trailing" class="enpii-input__trailing absolute top-1/2 right-2 flex items-center justify-center h-10 -translate-y-1/2">
                <slot name="trailing" />
            </div>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-input__help enpii-input__help--error ml-1 [color:var(--field-error-fg)] text-[0.8125rem]">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="enpii-input__help ml-1 [color:var(--field-fg)] text-[0.8125rem]">{{ hint }}</p>
    </div>
</template>

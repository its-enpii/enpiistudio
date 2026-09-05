<script setup>
defineOptions({ inheritAttrs: false });

import { computed, ref, useId, watch } from 'vue';
import { useShape } from '../composables/useShape';
import AppIcon from './EnpiiIcon.vue';
import AppTooltip from './EnpiiTooltip.vue';
import { useT } from '../composables/useT'

const t = useT()

const model = defineModel({ type: [String, Number], default: '' });
const props = defineProps({
    id: { type: String, default: null },
    label: { type: String, required: true },
    icon: { type: String, default: 'payments' },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    placeholder: { type: String, default: null },
    readonly: { type: Boolean, default: false },
    hideLabel: { type: Boolean, default: false },
    tooltip: { type: String, default: null },
    min: { type: Number, default: null },
    max: { type: Number, default: null },
    step: { type: Number, default: 1000 },
    allowDecimal: { type: Boolean, default: true },
    maxDecimals: { type: Number, default: 2 },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const generatedId = useId();
const inputId = props.id || generatedId;
const focused = ref(false);
const displayValue = ref('');

const shapeUtility = computed(() => {
    if (props.shape === 'pill') return 'rounded-full';
    if (props.shape === 'sharp') return 'rounded-none';
    return 'rounded-control';
});

const controlStateClass = computed(() => {
    if (props.readonly) return 'bg-surface-container-low text-on-surface-variant cursor-default';
    if (props.error) return 'border-danger-border';
    return 'border-outline-variant';
});

function formatCurrency(val) {
    if (val === null || val === undefined || val === '') return '';
    let str = String(val).trim();
    if (typeof val === 'number' && Number.isFinite(val)) {
        if (props.allowDecimal && !Number.isInteger(val)) {
            str = String(val).replace('.', ',');
        } else {
            str = String(Math.trunc(val));
        }
    }
    const firstComma = str.indexOf(',');
    let intPartRaw;
    let decPartRaw;
    if (firstComma >= 0) {
        intPartRaw = str.substring(0, firstComma);
        decPartRaw = str.substring(firstComma + 1);
    } else {
        intPartRaw = str;
        decPartRaw = '';
    }
    const intDigits = intPartRaw.replace(/\D/g, '');
    const decDigits = decPartRaw.replace(/\D/g, '');
    if (intDigits === '' && decDigits === '') return '';
    const formattedInt = intDigits
        ? Number(intDigits).toLocaleString('id-ID')
        : '0';
    if (props.allowDecimal && decDigits !== '') {
        const slicedDec = decDigits.slice(0, props.maxDecimals);
        return `${formattedInt},${slicedDec}`;
    }
    return formattedInt;
}

function parseToNumber(val) {
    if (val === null || val === undefined || val === '') return null;
    let str = String(val).trim();
    const firstComma = str.indexOf(',');
    let intRaw;
    let decRaw;
    if (firstComma >= 0) {
        intRaw = str.substring(0, firstComma);
        decRaw = str.substring(firstComma + 1);
    } else {
        intRaw = str;
        decRaw = '';
    }
    const intDigits = intRaw.replace(/\D/g, '');
    const decDigits = decRaw.replace(/\D/g, '');
    if (intDigits === '' && decDigits === '') return null;
    const intNum = intDigits === '' ? 0 : parseInt(intDigits, 10);
    if (decDigits === '') return intNum;
    const slicedDec = decDigits.slice(0, props.maxDecimals);
    if (slicedDec === '') return intNum;
    const fractionValue = parseInt(slicedDec, 10);
    const divisor = Math.pow(10, slicedDec.length);
    return intNum + fractionValue / divisor;
}

watch(model, (newVal) => {
    const currentNum = parseToNumber(displayValue.value);
    const modelNum = typeof newVal === 'number' ? newVal : parseToNumber(newVal);
    if (!focused.value || currentNum !== modelNum) {
        displayValue.value = formatCurrency(newVal);
    }
}, { immediate: true });

function onInput(event) {
    let raw = event.target.value;
    if (raw === '') {
        displayValue.value = '';
        model.value = '';
        return;
    }
    const isTypingDecimal = props.allowDecimal && (raw.endsWith(',') || raw.endsWith('.'));
    let formatted = formatCurrency(raw);
    if (isTypingDecimal && !formatted.includes(',')) {
        formatted += ',';
    }
    displayValue.value = formatted;
    const num = parseToNumber(formatted);
    model.value = num ?? '';
}

function onFocus(event) {
    focused.value = true;
    if (!displayValue.value || displayValue.value === '0') {
        event.target.select();
    }
}

function onBlur() {
    focused.value = false;
    const num = parseToNumber(displayValue.value);
    if (num === null) {
        model.value = '';
        displayValue.value = '';
        return;
    }
    let finalNum = num;
    if (props.min !== null && finalNum < props.min) finalNum = props.min;
    if (props.max !== null && finalNum > props.max) finalNum = props.max;
    model.value = finalNum;
    displayValue.value = formatCurrency(finalNum);
}

function adjust(delta) {
    const current = parseToNumber(model.value) ?? 0;
    const next = current + delta;
    if (props.min !== null && next < props.min) return;
    if (props.max !== null && next > props.max) return;
    model.value = next;
    displayValue.value = formatCurrency(next);
}

watch(model, () => {
    const number = parseToNumber(model.value);
    if (number !== null && props.min !== null && number < props.min) model.value = props.min;
});
</script>

<template>
    <div class="enpii-currency-input w-full [&>*+*]:mt-[var(--enpii-space-field-gap)]">
        <div v-if="!hideLabel" class="enpii-currency-input__label-row relative flex items-center gap-1 ml-1">
            <label :for="inputId" class="enpii-currency-input__label block text-on-surface-variant text-[0.8125rem] font-semibold tracking-[0.02em]">{{ label }}</label>
            <AppTooltip v-if="tooltip" :id="`${inputId}-tooltip`" :text="tooltip" />
        </div>
        <label v-else :for="inputId" class="enpii-sr-only">{{ label }}</label>
        <div class="enpii-currency-input__control-wrap relative">
            <AppIcon v-if="icon" :name="icon" class="enpii-currency-input__icon absolute top-1/2 left-4 w-5 h-5 -translate-y-1/2 text-outline pointer-events-none text-xl leading-none" />
            <input
                :id="inputId"
                :value="displayValue"
                inputmode="decimal"
                :aria-invalid="Boolean(error)"
                :aria-describedby="[
                    error && `${inputId}-error`,
                    hint && `${inputId}-hint`,
                    tooltip && `${inputId}-tooltip`
                ].filter(Boolean).join(' ') || undefined"
                :readonly="readonly"
                :placeholder="readonly ? undefined : (placeholder ?? t('currencyInput.placeholder', { label: label.toLowerCase() }))"
                class="enpii-currency-input__control w-full min-h-control pr-20 pl-12 border border-solid bg-surface-container-lowest text-primary font-sans text-control placeholder:text-outline appearance-none [transition-property:border-color,box-shadow,background] duration-fast ease-emphasized hover:enabled:[border-color:color-mix(in_srgb,var(--enpii-color-primary)_40%,transparent)] focus:outline-none focus-visible:outline-none focus:border-primary-container focus-visible:border-primary-container focus:[box-shadow:var(--enpii-focus-ring)] focus-visible:[box-shadow:var(--enpii-focus-ring)]"
                :class="[shapeClass, shapeUtility, controlStateClass, { 'enpii-currency-input__control--error': Boolean(error), 'enpii-currency-input__control--readonly': readonly }]"
                v-bind="$attrs"
                @input="onInput"
                @focus="onFocus"
                @blur="onBlur"
                @keydown.up.prevent="adjust(step)"
                @keydown.down.prevent="adjust(-step)"
            >
            <div class="enpii-currency-input__actions absolute top-1/2 right-2 flex items-center gap-1 h-10 -translate-y-1/2">
                <button v-if="!readonly" type="button" tabindex="-1" class="enpii-currency-input__action flex w-9 h-9 items-center justify-center border-0 rounded-lg bg-transparent text-on-surface-variant cursor-pointer transition-all duration-fast ease-emphasized hover:bg-surface-container-low hover:text-primary-text focus:bg-surface-container-low focus:text-primary-text focus:outline-none focus-visible:outline-none" :aria-label="t('currencyInput.decrease')" @click="adjust(-step)">
                    <AppIcon name="remove" class="enpii-currency-input__action-icon w-[1.125rem] h-[1.125rem] text-[1.125rem]" />
                </button>
                <button v-if="!readonly" type="button" tabindex="-1" class="enpii-currency-input__action flex w-9 h-9 items-center justify-center border-0 rounded-lg bg-transparent text-on-surface-variant cursor-pointer transition-all duration-fast ease-emphasized hover:bg-surface-container-low hover:text-primary-text focus:bg-surface-container-low focus:text-primary-text focus:outline-none focus-visible:outline-none" :aria-label="t('currencyInput.increase')" @click="adjust(step)">
                    <AppIcon name="add" class="enpii-currency-input__action-icon w-[1.125rem] h-[1.125rem] text-[1.125rem]" />
                </button>
            </div>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-currency-input__help enpii-currency-input__help--error ml-1 text-danger-text text-[0.8125rem]">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="enpii-currency-input__help ml-1 text-on-surface-variant text-[0.8125rem]">{{ hint }}</p>
    </div>
</template>

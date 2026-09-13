<script setup>
defineOptions({ inheritAttrs: false });

import { computed, ref, useId, watch } from 'vue';
import AppIcon from './AppIcon.vue';
import AppTooltip from './AppTooltip.vue';

const model = defineModel({ type: [String, Number], default: '' });
const props = defineProps({
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
    },
    id: { type: String, default: null },
    label: { type: String, required: true },
    icon: { type: String, default: null },
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
});

const generatedId = useId();
const inputId = props.id || generatedId;
const focused = ref(false);
const displayValue = ref('');
const sizeClasses = {
    sm: { input: 'h-10 text-sm pl-3 pr-12', icon: 'text-lg', leftIcon: 'left-3', leadingPad: 'pl-10', stepper: 'right-1', stepperButton: 'size-8', stepperIcon: 'text-base' },
    md: { input: 'h-12 text-base pl-4 pr-14', icon: 'text-xl', leftIcon: 'left-4', leadingPad: 'pl-11', stepper: 'right-2', stepperButton: 'size-9', stepperIcon: 'text-lg' },
    lg: { input: 'h-14 text-base pl-5 pr-16', icon: 'text-2xl', leftIcon: 'left-5', leadingPad: 'pl-14', stepper: 'right-2', stepperButton: 'size-11', stepperIcon: 'text-xl' },
    xl: { input: 'h-16 text-lg pl-6 pr-[4.5rem]', icon: 'text-2xl', leftIcon: 'left-6', leadingPad: 'pl-16', stepper: 'right-2', stepperButton: 'size-12', stepperIcon: 'text-2xl' },
};
const activeSize = computed(() => sizeClasses[props.size]);

function formatCurrency(val) {
    if (val === null || val === undefined || val === '') return '';

    let str = String(val).trim();

    // Number primitive dari JS native (mis. backend kirim 100000.5) → "100000.5".
    // Titik di sini = desimal JS, bukan ribuan. Normalisasi: kalau Number, kita
    // eksplisit tentukan format — integer tanpa desimal suffix, desimal dengan
    // koma (preserve digit count as-is, truncate ke maxDecimals kalau overflow).
    if (typeof val === 'number' && Number.isFinite(val)) {
        if (props.allowDecimal && !Number.isInteger(val)) {
            // Preserve digit count original (jangan pad ke maxDecimals). Pakai
            // String(val) untuk dapat representasi natural — mis. 100000.5 →
            // "100000.5", bukan "100000.50".
            str = String(val).replace('.', ',');
        } else {
            str = String(Math.trunc(val));
        }
    }

    // id-ID invariant: koma = desimal, titik = ribuan. Pisah via koma pertama.
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

    // Bersihkan: intPart — hanya digit (titik ribuan auto-strip).
    const intDigits = intPartRaw.replace(/\D/g, '');
    // Bersihkan: decPart — hanya digit (koma tambahan diabaikan — user error).
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

    // id-ID invariant: koma = desimal, titik = ribuan. Pisah via koma pertama.
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

    // Strip semua non-digit. Titik ribuan di intRaw otomatis hilang.
    const intDigits = intRaw.replace(/\D/g, '');
    const decDigits = decRaw.replace(/\D/g, '');

    if (intDigits === '' && decDigits === '') return null;

    const intNum = intDigits === '' ? 0 : parseInt(intDigits, 10);
    if (decDigits === '') return intNum;

    // Truncate ke maxDecimals, preserve nilai desimal via integer division.
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
    <div class="space-y-2">
        <div v-if="!hideLabel" class="ml-1 flex items-center gap-1.5">
            <label :for="inputId" class="block text-sm font-bold uppercase tracking-wider text-primary">{{ label }}</label>
            <AppTooltip v-if="tooltip" :id="`${inputId}-tooltip`" :text="tooltip" />
        </div>
        <label v-else :for="inputId" class="sr-only">{{ label }}</label>
        <div class="relative">
            <AppIcon
                v-if="icon"
                :name="icon"
                class="pointer-events-none absolute top-1/2 -translate-y-1/2 text-outline"
                :class="[activeSize.icon, activeSize.leftIcon]"
            />
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
                :placeholder="readonly ? undefined : (placeholder ?? `Masukkan ${label.toLowerCase()}`)"
                class="w-full rounded-xl border bg-surface-container-lowest text-primary transition placeholder:text-outline focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 focus:outline-none read-only:cursor-default read-only:bg-surface-container-low read-only:text-on-surface-variant"
                :class="[activeSize.input, icon && activeSize.leadingPad, error ? 'border-error' : 'border-outline-variant']"
                v-bind="$attrs"
                @input="onInput"
                @focus="onFocus"
                @blur="onBlur"
                @keydown.up.prevent="adjust(step)"
                @keydown.down.prevent="adjust(-step)"
            >
            <div class="absolute top-1/2 flex -translate-y-1/2 items-center gap-1" :class="activeSize.stepper">
                <button v-if="!readonly" type="button" tabindex="-1" class="flex items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low focus:bg-surface-container-low focus:outline-none" :class="activeSize.stepperButton" aria-label="Kurangi nilai" @click="adjust(-step)">
                    <AppIcon name="remove" :class="activeSize.stepperIcon" />
                </button>
                <button v-if="!readonly" type="button" tabindex="-1" class="flex items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low focus:bg-surface-container-low focus:outline-none" :class="activeSize.stepperButton" aria-label="Tambah nilai" @click="adjust(step)">
                    <AppIcon name="add" :class="activeSize.stepperIcon" />
                </button>
            </div>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="ml-1 text-sm text-error">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="ml-1 text-sm text-on-surface-variant">{{ hint }}</p>
    </div>
</template>

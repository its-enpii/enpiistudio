<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useShape } from '../composables/useShape'

const model = defineModel({ type: [String, Number], default: '' })
const props = defineProps({
    id: { type: String, default: null },
    label: { type: String, required: true },
    mask: { type: String, default: null },
    preset: {
        type: String,
        default: null,
        validator: (value) => [null, 'date', 'phone', 'currency'].includes(value),
    },
    placeholderChar: { type: String, default: '_' },
    showMask: { type: Boolean, default: false },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    autocomplete: { type: String, default: 'off' },
    inputmode: { type: String, default: null },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
})

const emit = defineEmits(['change'])
const shapeClass = useShape(props)
const inputId = props.id || useId()
const input = ref(null)
const activeMask = computed(() => props.mask || ({ date: '9999-99-99', phone: '+62 999 9999', currency: '999999999' })[props.preset] || '')
const draftDisplay = ref(formatMask(String(model.value ?? ''), props.showMask))

const inputPlaceholder = computed(() => activeMask.value.replace(/9|a|\*/g, props.placeholderChar))
const isComplete = computed(() => activeMask.value.length > 0 && draftDisplay.value.length >= activeMask.value.length)

function extractRaw(value) {
    let output = ''
    let valueIndex = 0
    for (let index = 0; index < activeMask.value.length && valueIndex < value.length; index += 1) {
        const pattern = activeMask.value[index]
        const character = value[valueIndex]
        if (!/[9a*]/.test(pattern)) {
            if (character === pattern) valueIndex += 1
            continue
        }
        if (matchesPattern(character, pattern)) {
            output += character
            valueIndex += 1
        } else {
            break
        }
    }
    return output
}

function matchesPattern(character, pattern) {
    if (pattern === '9') return /\d/.test(character)
    if (pattern === 'a') return /[a-zA-Z]/.test(character)
    return Boolean(character)
}

function formatMask(rawValue, fillPlaceholders = false) {
    let output = ''
    let rawIndex = 0
    for (const pattern of activeMask.value) {
        if (!/[9a*]/.test(pattern)) {
            if (rawIndex < rawValue.length || fillPlaceholders) output += pattern
            continue
        }
        const character = rawValue[rawIndex]
        if (character && matchesPattern(character, pattern)) {
            output += character
            rawIndex += 1
        } else if (fillPlaceholders && props.showMask) {
            output += props.placeholderChar
        } else {
            break
        }
    }
    return output
}

function onInput(event) {
    const element = event.target
    const raw = props.preset === 'currency' ? extractRaw(element.value).replace(/\D/g, '') : extractRaw(element.value)
    draftDisplay.value = formatMask(raw)
    model.value = raw
    emit('change', raw)
    nextTick(() => {
        element.value = draftDisplay.value
        element.setSelectionRange(element.value.length, element.value.length)
    })
}

watch(() => model.value, (value) => {
    const raw = String(value ?? '')
    if (raw === extractRaw(draftDisplay.value)) return
    draftDisplay.value = formatMask(raw)
})
</script>

<template>
    <div class="enpii-input-mask" :class="[shapeClass, { 'enpii-input-mask--error': Boolean(error) }]">
        <label :for="inputId" class="enpii-input-mask__label">{{ label }}</label>
        <div class="enpii-input-mask__control-wrap">
            <input
                :id="inputId"
                ref="input"
                :value="draftDisplay"
                type="text"
                :placeholder="inputPlaceholder"
                :required="required"
                :disabled="disabled"
                :autocomplete="autocomplete"
                :inputmode="inputmode ?? (preset === 'currency' ? 'numeric' : undefined)"
                :aria-invalid="Boolean(error)"
                :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
                class="enpii-input-mask__control"
                @input="onInput"
                @change="$emit('change', model)"
            >
            <span v-if="isComplete" class="enpii-input-mask__status" aria-hidden="true">✓</span>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-input-mask__help enpii-input-mask__help--error">{{ error }}</p>
        <p v-else-if="hint || activeMask" class="enpii-input-mask__help">{{ hint || `Format: ${inputPlaceholder}` }}</p>
    </div>
</template>

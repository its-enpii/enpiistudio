<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useT } from '../composables/useT'

const props = withDefaults(defineProps<{
    modelValue?: string
    length?: number
    type?: 'number' | 'text' | 'password'
    autofocus?: boolean
    disabled?: boolean
    separator?: string
}>(), {
    modelValue: '',
    length: 6,
    type: 'number',
    autofocus: false,
    disabled: false,
    separator: '',
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'complete': [value: string]
}>()

const inputs = ref<HTMLInputElement[]>([])
const inputId = `enpii-otp-input-${Math.random().toString(36).slice(2, 11)}`
const t = useT()

const code = computed(() => {
    const digits = Array.from({ length: props.length }, (_, index) => props.modelValue[index] ?? '')
    return digits
})

watch(() => props.modelValue, (value) => {
    if (value.length === props.length) {
        emit('complete', value)
    }
}, { immediate: true })

function updateCode(value: string) {
    const nextValue = value.slice(0, props.length)
    emit('update:modelValue', nextValue)
}

function focusInput(index: number) {
    inputs.value[Math.max(0, Math.min(index, props.length - 1))]?.focus()
}

function onInput(index: number, event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    const normalizedValue = props.type === 'number' ? value.replace(/\D/g, '') : value
    const nextCode = [...code.value]

    if (normalizedValue === '') {
        nextCode[index] = ''
        updateCode(nextCode.join(''))
        return
    }

    const characters = normalizedValue.split('')
    for (let offset = 0; offset < characters.length && index + offset < props.length; offset += 1) {
        nextCode[index + offset] = characters[offset]
    }
    updateCode(nextCode.join(''))
    focusInput(index + characters.length)
    target.value = nextCode[index] ?? ''
}

function onKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
        event.preventDefault()
        focusInput(index - 1)
        return
    }

    if (event.key === 'ArrowRight') {
        event.preventDefault()
        focusInput(index + 1)
        return
    }

    if (event.key === 'Backspace') {
        event.preventDefault()
        const nextCode = [...code.value]
        if (nextCode[index]) {
            nextCode[index] = ''
            updateCode(nextCode.join(''))
            return
        }

        if (index > 0) {
            nextCode[index - 1] = ''
            updateCode(nextCode.join(''))
            focusInput(index - 1)
        }
    }
}

function onPaste(event: ClipboardEvent) {
    event.preventDefault()
    const pastedValue = event.clipboardData?.getData('text') ?? ''
    const normalizedValue = props.type === 'number' ? pastedValue.replace(/\D/g, '') : pastedValue
    if (!normalizedValue) {
        return
    }
    updateCode(normalizedValue.slice(0, props.length))
    focusInput(normalizedValue.length)
}
</script>

<template>
    <div class="enpii-otp-input" :class="{ 'enpii-otp-input--disabled': disabled }">
        <label :for="`${inputId}-0`" class="enpii-otp-input__label">{{ t('otpInput.label') }}</label>
        <div class="enpii-otp-input__fields">
            <template v-for="(digit, index) in code" :key="`${inputId}-${index}`">
                <input
                    :id="`${inputId}-${index}`"
                    :ref="(el: any) => { if (el) inputs[index] = el as HTMLInputElement }"
                    class="enpii-otp-input__field"
                    :value="digit"
                    :type="type === 'number' ? 'text' : type"
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    :aria-label="t('otpInput.digit', { index: index + 1 })"
                    :disabled="disabled"
                    :autofocus="autofocus && index === 0"
                    @input="onInput(index, $event)"
                    @keydown="onKeydown(index, $event)"
                    @paste="onPaste"
                    @focus="($event.target as HTMLInputElement).select()"
                >
                <span v-if="separator && index < length - 1" class="enpii-otp-input__separator" aria-hidden="true">
                    {{ separator }}
                </span>
            </template>
        </div>
    </div>
</template>

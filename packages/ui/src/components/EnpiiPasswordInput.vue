<script setup lang="ts">
import { computed, ref } from 'vue'
import { useT } from '../composables/useT'

type PasswordRules = {
    minLength?: number
    requireMixed?: boolean
    requireNumber?: boolean
    requireSymbol?: boolean
}

const props = withDefaults(defineProps<{
    modelValue?: string
    strengthMeter?: boolean
    showToggle?: boolean
    rules?: PasswordRules
    disabled?: boolean
    readonly?: boolean
    size?: 'sm' | 'md' | 'lg'
    tone?: 'neutral' | 'primary' | 'danger' | 'success'
}>(), {
    modelValue: '',
    strengthMeter: true,
    showToggle: true,
    rules: undefined,
    disabled: false,
    readonly: false,
    size: 'md',
    tone: 'neutral',
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

defineOptions({ inheritAttrs: false })

const t = useT()
const componentId = `enpii-password-input-${Math.random().toString(36).slice(2, 11)}`
const inputId = computed(() => `${componentId}-input`)
const meterId = computed(() => `${componentId}-meter`)
const passwordVisible = ref(false)

const hasLowercase = computed(() => /[a-z]/.test(props.modelValue))
const hasUppercase = computed(() => /[A-Z]/.test(props.modelValue))
const hasNumber = computed(() => /\d/.test(props.modelValue))
const hasSymbol = computed(() => /[^A-Za-z0-9\s]/.test(props.modelValue))
const minLength = computed(() => props.rules?.minLength ?? 8)

const strength = computed(() => {
    if (!props.modelValue) {
        return 0
    }

    let score = props.modelValue.length >= minLength.value ? 1 : 0
    if (props.rules?.requireMixed) {
        score += hasLowercase.value && hasUppercase.value ? 1 : 0
    }
    if (props.rules?.requireNumber) {
        score += hasNumber.value ? 1 : 0
    }
    if (props.rules?.requireSymbol) {
        score += hasSymbol.value ? 1 : 0
    }

    if (score > 0 && props.modelValue.length >= minLength.value + 8) {
        score += 1
    }

    return Math.min(4, score)
})

const strengthLabel = computed(() => t(`passwordInput.strength.${strength.value}`))
const inputType = computed(() => passwordVisible.value ? 'text' : 'password')
const toggleLabel = computed(() => passwordVisible.value
    ? t('passwordInput.hidePassword')
    : t('passwordInput.showPassword'))

function updateValue(event: Event) {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
}
</script>

<template>
    <div
        class="enpii-password-input"
        :class="[
            `enpii-password-input--${size}`,
            `enpii-password-input--${tone}`,
            { 'enpii-password-input--disabled': disabled },
        ]"
    >
        <div class="enpii-password-input__field">
            <input
                :id="inputId"
                class="enpii-password-input__control"
                :type="inputType"
                :value="modelValue"
                :disabled="disabled"
                :readonly="readonly"
                :aria-label="t('passwordInput.fieldLabel')"
                :aria-describedby="strengthMeter ? meterId : undefined"
                autocomplete="current-password"
                v-bind="$attrs"
                @input="updateValue"
            >
            <button
                v-if="showToggle"
                type="button"
                class="enpii-password-input__toggle"
                :aria-pressed="passwordVisible"
                :aria-label="toggleLabel"
                :disabled="disabled"
                @click="passwordVisible = !passwordVisible"
            >
                {{ passwordVisible ? t('passwordInput.hide') : t('passwordInput.show') }}
            </button>
        </div>
        <div
            v-if="strengthMeter"
            :id="meterId"
            class="enpii-password-input__meter"
            role="status"
            aria-live="polite"
        >
            <div class="enpii-password-input__meter-track">
                <div
                    class="enpii-password-input__meter-fill"
                    :class="`enpii-password-input__meter-fill--${strength}`"
                    :style="{ width: `${(strength / 4) * 100}%` }"
                />
            </div>
            <span class="enpii-password-input__strength">{{ strengthLabel }}</span>
        </div>
    </div>
</template>

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
        <div class="enpii-password-input__field relative flex items-center">
            <input
                :id="inputId"
        class="enpii-password-input__control w-full min-h-12 py-3 pr-[5.5rem] pl-4 border border-solid [border-width:var(--control-border-width)] border-outline-variant rounded-control bg-surface-container-lowest text-on-surface font-sans text-control [transition-property:border-color,box-shadow,background] duration-fast ease-emphasized hover:enabled:[border-color:color-mix(in_srgb,var(--color-primary)_40%,transparent)] focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-1 focus-visible:outline-focus read-only:cursor-default read-only:bg-surface-container-low read-only:text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-surface-container-lowest disabled:text-on-surface placeholder:text-outline"
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
                class="enpii-password-input__toggle absolute top-1 right-1 inline-flex min-w-10 min-h-10 items-center justify-center px-2 border-0 rounded-[9999px] bg-transparent text-primary-text text-[0.8125rem] font-medium cursor-pointer [transition-property:background,color] duration-fast ease-emphasized hover:enabled:bg-surface-container-low hover:enabled:text-on-surface focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-60"
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
            class="enpii-password-input__meter grid gap-1"
            role="status"
            aria-live="polite"
        >
            <div class="enpii-password-input__meter-track w-full h-1.5 overflow-hidden rounded-[9999px] bg-surface-container-high">
                <div
                    class="enpii-password-input__meter-fill h-full rounded-[inherit] bg-neutral-border [transition-property:width,background] duration-base ease-emphasized"
                    :class="`enpii-password-input__meter-fill--${strength}`"
                    :style="{ width: `${(strength / 4) * 100}%` }"
                />
            </div>
            <span class="enpii-password-input__strength text-on-surface-variant text-[0.8125rem] font-medium">{{ strengthLabel }}</span>
        </div>
    </div>
</template>

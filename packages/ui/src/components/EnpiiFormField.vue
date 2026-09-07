<script setup lang="ts">
import { computed, useId } from 'vue'
import { useFormContext } from '../composables/useForm'
import { useShape } from '../composables/useShape'
import AppTooltip from './EnpiiTooltip.vue'
import EnpiiLabel from './EnpiiLabel.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    id?: string | null
    name?: string
    label?: string
    hint?: string | null
    error?: string | null
    requiredMark?: boolean
    hideLabel?: boolean
    tooltip?: string | null
    shape?: 'rounded' | 'pill' | 'sharp'
  }>(),
  {
    id: null,
    name: '',
    label: '',
    hint: null,
    error: null,
    requiredMark: false,
    hideLabel: false,
    tooltip: null,
    shape: 'rounded',
  },
)

const shapeClass = useShape(props)
const form = useFormContext()
const fallbackId = useId()

const fieldId = computed(() => {
  if (props.id) return props.id
  if (form && props.name) {
    return form.registerField(props.name, props.id || undefined)
  }
  return fallbackId
})

const displayError = computed(() => {
  if (props.error !== null && props.error !== undefined) {
    return props.error
  }
  if (form && props.name) {
    return form.errors[props.name] || ''
  }
  return ''
})

const isRequired = computed(() => {
  if (props.requiredMark) return true
  if (form && props.name) {
    return form.isFieldRequired(props.name)
  }
  return false
})

const errorId = computed(() => `${fieldId.value}-error`)
const hintId = computed(() => `${fieldId.value}-hint`)
const tooltipId = computed(() => `${fieldId.value}-tooltip`)

const describedBy = computed(() => {
  const ids: string[] = []
  if (displayError.value) ids.push(errorId.value)
  if (props.hint) ids.push(hintId.value)
  if (props.tooltip) ids.push(tooltipId.value)
  return ids.join(' ') || undefined
})
</script>

<template>
  <div
    class="enpii-form-field grid gap-field-gap w-full"
    :class="[
      shapeClass,
      {
        'enpii-form-field--error': Boolean(displayError),
        'enpii-form-field--required': isRequired,
      },
    ]"
    :data-enpii-field-name="name || undefined"
    v-bind="$attrs"
  >
    <div v-if="label && !hideLabel" class="enpii-form-field__label-row relative flex items-center gap-1 ml-1">
      <EnpiiLabel :for="fieldId" size="sm" :required="isRequired" class="enpii-form-field__label flex items-center gap-1">
        <span>{{ label }}</span>
      </EnpiiLabel>
      <AppTooltip v-if="tooltip" :id="tooltipId" :text="tooltip" />
    </div>
    <EnpiiLabel v-else-if="label && hideLabel" :for="fieldId" size="sm" hidden class="enpii-form-field__label">
      {{ label }}
    </EnpiiLabel>

    <div class="enpii-form-field__control w-full">
      <slot
        :id="fieldId"
        :name="name"
        :error="displayError"
        :is-invalid="Boolean(displayError)"
        :described-by="describedBy"
        :aria-describedby="describedBy"
        :aria-invalid="displayError ? 'true' : undefined"
        :is-required="isRequired"
      />
    </div>

    <p
      v-if="displayError"
      :id="errorId"
      class="enpii-form-field__error block ml-1 [color:var(--field-error-color)] text-sm font-normal"
      role="alert"
    >
      {{ displayError }}
    </p>
    <p
      v-else-if="hint"
      :id="hintId"
      class="enpii-form-field__hint block ml-1 [color:var(--tone-neutral-fg)] text-sm font-normal"
    >
      {{ hint }}
    </p>
  </div>
</template>

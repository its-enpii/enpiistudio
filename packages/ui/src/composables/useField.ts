import { computed, type ComputedRef, type WritableComputedRef } from 'vue'
import {
  type EnpiiForm,
  type FieldValue,
  type FormValues,
  type ValidationRule,
  useFormContext,
} from './useForm'

export interface UseFieldReturn<T = FieldValue> {
  id: string
  name: string
  value: WritableComputedRef<T>
  error: ComputedRef<string>
  touched: ComputedRef<boolean>
  isValid: ComputedRef<boolean>
  onBlur: () => void
  onChange: (val?: FieldValue) => void
  validate: () => boolean
  setValue: (val: T) => void
  reset: () => void
}

export function useField<T = FieldValue>(
  formOrName: EnpiiForm<any> | string,
  nameOrRules?: string | ValidationRule | ValidationRule[],
  maybeRules?: ValidationRule | ValidationRule[],
): UseFieldReturn<T> {
  let form: EnpiiForm<any>
  let name: string
  let rules: ValidationRule | ValidationRule[] | undefined

  if (typeof formOrName === 'string') {
    const injected = useFormContext()
    if (!injected) {
      throw new Error('[Enpii UI] useField requires a form instance or must be called within a useForm context')
    }
    form = injected
    name = formOrName
    rules = nameOrRules as ValidationRule | ValidationRule[] | undefined
  } else {
    form = formOrName
    name = nameOrRules as string
    rules = maybeRules
  }

  if (rules) {
    form.registerRules(name, rules)
  }

  const id = form.registerField(name)

  const value = computed<T>({
    get: () => form.values[name] as T,
    set: (val: T) => {
      form.values[name] = val as FieldValue
      if (form.touched[name]) {
        form.validateField(name)
      }
    },
  })

  const error = computed(() => form.errors[name] || '')
  const touched = computed(() => Boolean(form.touched[name]))
  const isValid = computed(() => !form.errors[name])

  const onBlur = () => {
    form.touch(name)
  }

  const onChange = (val?: FieldValue) => {
    if (val !== undefined) {
      form.values[name] = val
    }
    if (form.touched[name]) {
      form.validateField(name)
    }
  }

  const reset = () => {
    form.resetField(name)
  }

  return {
    id,
    name,
    value,
    error,
    touched,
    isValid,
    onBlur,
    onChange,
    validate: () => form.validateField(name),
    setValue: (val: T) => {
      form.values[name] = val as FieldValue
    },
    reset,
  }
}

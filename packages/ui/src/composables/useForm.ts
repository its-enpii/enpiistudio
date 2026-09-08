import {
  computed,
  getCurrentInstance,
  inject,
  provide,
  reactive,
  ref,
  toRaw,
  toValue,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import { useT } from './useT'
import { FORM_SUBMIT_KEY } from './useFormSubmit'

export type PrimitiveFieldValue = string | number | boolean | null | undefined
export type FieldValue = PrimitiveFieldValue | PrimitiveFieldValue[] | File | File[] | Record<string, unknown>
export type FormValues = Record<string, FieldValue>

export type ValidationParams = Record<string, string | number>
export type ValidationIssue = {
  key: string
  params?: ValidationParams
}
export type ValidationResult = boolean | string | ValidationIssue | null | undefined

export type RuleValidator = (value: FieldValue, values: FormValues) => ValidationResult
export type RuleFactory = (...args: any[]) => RuleValidator

export type ValidationRule =
  | 'required'
  | 'email'
  | RuleValidator
  | RuleFactory

export type ValidationSchema<TValues extends FormValues = FormValues> = {
  [TField in keyof TValues & string]?: ValidationRule | ValidationRule[]
}

export interface FormSubmitHandler<TValues extends FormValues, TResult = unknown> {
  (event?: Event): Promise<TResult | boolean>
  then<TResult1 = TResult | boolean, TResult2 = never>(
    onfulfilled?: ((value: TResult | boolean) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): Promise<TResult1 | TResult2>
}

export interface UseFormOptions<TValues extends FormValues> {
  initialValues: MaybeRefOrGetter<TValues>
  validationSchema?: ValidationSchema<TValues> | MaybeRefOrGetter<ValidationSchema<TValues>>
}

export interface EnpiiForm<TValues extends FormValues = FormValues> {
  values: TValues
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: ComputedRef<boolean>
  isSubmitting: Ref<boolean>
  validationSchema: ValidationSchema<TValues>
  handleSubmit: <TResult = unknown>(
    onValid: (values: TValues) => TResult | Promise<TResult>,
    onInvalid?: (errors: Record<string, string>) => void,
  ) => FormSubmitHandler<TValues, TResult>
  validate: () => boolean
  validateField: (name: string) => boolean
  setFieldError: (name: string, msg: string | null | undefined) => void
  setFieldValue: (name: string, value: FieldValue) => void
  setFieldTouched: (name: string, isTouched?: boolean) => void
  touch: (name: string) => void
  reset: (values?: MaybeRefOrGetter<TValues>) => void
  resetField: (name: string) => void
  registerField: (name: string, id?: string) => string
  registerRules: (name: string, rules: ValidationRule | ValidationRule[]) => void
  isFieldRequired: (name: string) => boolean
  getFieldId: (name: string) => string | undefined
}

export const enpiiFormKey: InjectionKey<EnpiiForm<any>> = Symbol('enpii:form')

export function useFormContext<TValues extends FormValues = FormValues>(): EnpiiForm<TValues> | null {
  return inject(enpiiFormKey, null) as EnpiiForm<TValues> | null
}

/* ===== Built-in Validation Rules ===== */

export function required(messageKey = 'validation.required'): RuleValidator {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined) {
      return { key: messageKey }
    }
    if (typeof value === 'string' && value.trim() === '') {
      return { key: messageKey }
    }
    if (Array.isArray(value) && value.length === 0) {
      return { key: messageKey }
    }
    return true
  }
}

export function email(messageKey = 'validation.email'): RuleValidator {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') return true
    const str = String(value).trim()
    if (str === '') return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
      ? true
      : { key: messageKey }
  }
}

export function minLength(length: number, messageKey = 'validation.minLength'): RuleValidator {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') return true
    const str = String(value)
    return str.length >= length
      ? true
      : { key: messageKey, params: { count: length, min: length } }
  }
}

export function maxLength(length: number, messageKey = 'validation.maxLength'): RuleValidator {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') return true
    const str = String(value)
    return str.length <= length
      ? true
      : { key: messageKey, params: { count: length, max: length } }
  }
}

export function min(limit: number, messageKey = 'validation.min'): RuleValidator {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') return true
    const num = typeof value === 'number' ? value : Number(value)
    if (Number.isNaN(num)) return { key: 'validation.invalid' }
    return num >= limit
      ? true
      : { key: messageKey, params: { value: limit, min: limit } }
  }
}

export function max(limit: number, messageKey = 'validation.max'): RuleValidator {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') return true
    const num = typeof value === 'number' ? value : Number(value)
    if (Number.isNaN(num)) return { key: 'validation.invalid' }
    return num <= limit
      ? true
      : { key: messageKey, params: { value: limit, max: limit } }
  }
}

export function pattern(regex: RegExp, messageKey = 'validation.pattern'): RuleValidator {
  return (value: FieldValue): ValidationResult => {
    if (value === null || value === undefined || value === '') return true
    return regex.test(String(value))
      ? true
      : { key: messageKey }
  }
}

export function sameAs(targetField: string, targetLabel?: string, messageKey = 'validation.sameAs'): RuleValidator {
  return (value: FieldValue, values: FormValues): ValidationResult => {
    return value === values[targetField]
      ? true
      : { key: messageKey, params: { field: targetLabel || targetField } }
  }
}

export function custom(validator: RuleValidator): RuleValidator {
  return validator
}

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  return JSON.parse(JSON.stringify(toRaw(obj)))
}

export function useForm<TValues extends FormValues>(
  options: UseFormOptions<TValues>,
): EnpiiForm<TValues> {
  const t = useT()
  const initialSnapshot = deepClone(toValue(options.initialValues))
  const values = reactive(deepClone(initialSnapshot)) as TValues
  const errors = reactive<Record<string, string>>({})
  const touched = reactive<Record<string, boolean>>({})
  const fieldIds = reactive<Record<string, string>>({})
  const rawSchema = (toValue(options.validationSchema) ?? {}) as ValidationSchema<TValues>
  const validationSchema = reactive({
    ...rawSchema,
  }) as ValidationSchema<TValues>
  const isSubmitting = ref(false)

  function runRule(rule: ValidationRule, val: FieldValue, currentValues: FormValues): ValidationResult {
    if (rule === 'required' || rule === required) {
      return required()(val, currentValues)
    }
    if (rule === 'email' || rule === email) {
      return email()(val, currentValues)
    }
    if (typeof rule === 'function') {
      const res = (rule as RuleValidator)(val, currentValues)
      if (typeof res === 'function') {
        return (res as RuleValidator)(val, currentValues)
      }
      return res
    }
    return true
  }

  function getFieldRules(name: string): ValidationRule[] {
    const raw = validationSchema[name as keyof TValues & string]
    if (!raw) return []
    return Array.isArray(raw) ? raw : [raw]
  }

  function validateField(name: string): boolean {
    const rules = getFieldRules(name)
    const val = values[name]

    for (const r of rules) {
      const result = runRule(r, val, values)
      if (result === true || result === null || result === undefined) {
        continue
      }

      let message = ''
      if (typeof result === 'object' && 'key' in result) {
        message = t(result.key, result.params)
      } else if (typeof result === 'string') {
        message = t(result)
      } else if (result === false) {
        message = t('validation.invalid')
      }

      errors[name] = message
      return false
    }

    delete errors[name]
    return true
  }

  function validate(): boolean {
    let isAllValid = true
    const schemaKeys = new Set(Object.keys(validationSchema))
    for (const key of Object.keys(values)) {
      if (validationSchema[key as keyof TValues & string]) {
        schemaKeys.add(key)
      }
    }

    for (const name of schemaKeys) {
      touched[name] = true
      const valid = validateField(name)
      if (!valid) {
        isAllValid = false
      }
    }

    if (!isAllValid) {
      focusFirstError()
    }

    return isAllValid
  }

  function checkIsValid(): boolean {
    if (Object.keys(errors).length > 0) return false
    const schemaKeys = Object.keys(validationSchema)
    for (const name of schemaKeys) {
      const rules = getFieldRules(name)
      const val = values[name]
      for (const r of rules) {
        const result = runRule(r, val, values)
        if (result !== true && result !== null && result !== undefined) {
          return false
        }
      }
    }
    return true
  }

  const isValid = computed(() => checkIsValid())

  function focusFirstError() {
    if (typeof document === 'undefined') return
    const firstFailedName = Object.keys(errors)[0]
    if (!firstFailedName) return

    const registeredId = fieldIds[firstFailedName]
    if (registeredId) {
      const direct = document.getElementById(registeredId)
      if (direct && typeof direct.focus === 'function') {
        direct.focus({ preventScroll: false })
        return
      }
    }

    const escapedName = firstFailedName.replace(/"/g, '\\"')
    const formField = document.querySelector<HTMLElement>(`[data-enpii-field-name="${escapedName}"]`)
    if (formField) {
      const control = formField.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (control && typeof control.focus === 'function') {
        control.focus({ preventScroll: false })
        return
      }
    }

    const byName = document.querySelector<HTMLElement>(`[name="${escapedName}"], [id="${escapedName}"]`)
    if (byName && typeof byName.focus === 'function') {
      byName.focus({ preventScroll: false })
    }
  }

  function handleSubmit<TResult = unknown>(
    onValid: (values: TValues) => TResult | Promise<TResult>,
    onInvalid?: (errors: Record<string, string>) => void,
  ): FormSubmitHandler<TValues, TResult> {
    const handler = async (event?: Event): Promise<TResult | boolean> => {
      if (event && typeof (event as Event).preventDefault === 'function') {
        (event as Event).preventDefault()
      }

      const valid = validate()
      if (!valid) {
        if (onInvalid) {
          onInvalid({ ...errors })
        }
        return false
      }

      isSubmitting.value = true
      try {
        return await onValid(values)
      } finally {
        isSubmitting.value = false
      }
    }

    const callablePromise = ((event?: Event) => handler(event)) as FormSubmitHandler<TValues, TResult>
    callablePromise.then = (onfulfilled, onrejected) => {
      return handler().then(onfulfilled, onrejected)
    }

    return callablePromise
  }

  function setFieldError(name: string, msg: string | null | undefined) {
    if (msg) {
      errors[name] = msg
    } else {
      delete errors[name]
    }
  }

  function setFieldValue(name: string, value: FieldValue) {
    values[name as keyof TValues] = value as any
    if (touched[name]) {
      validateField(name)
    }
  }

  function setFieldTouched(name: string, isTouched = true) {
    touched[name] = isTouched
    if (isTouched) {
      validateField(name)
    }
  }

  function touch(name: string) {
    setFieldTouched(name, true)
  }

  function reset(newValues?: MaybeRefOrGetter<TValues>) {
    const target = deepClone(toValue(newValues ?? initialSnapshot))
    for (const k of Object.keys(values)) {
      delete values[k]
    }
    Object.assign(values, target)
    for (const k of Object.keys(errors)) {
      delete errors[k]
    }
    for (const k of Object.keys(touched)) {
      delete touched[k]
    }
    isSubmitting.value = false
  }

  function resetField(name: string) {
    values[name as keyof TValues] = deepClone(initialSnapshot[name as keyof TValues])
    delete errors[name]
    delete touched[name]
  }

  function registerField(name: string, customId?: string): string {
    if (customId) {
      fieldIds[name] = customId
    } else if (!fieldIds[name]) {
      fieldIds[name] = `enpii-field-${name}`
    }
    return fieldIds[name]
  }

  function registerRules(name: string, rules: ValidationRule | ValidationRule[]) {
    validationSchema[name as keyof TValues & string] = rules
  }

  function isFieldRequired(name: string): boolean {
    const rules = getFieldRules(name)
    return rules.some((r) => {
      if (r === 'required' || r === required) return true
      if (typeof r === 'function') {
        const test = runRule(r, '', values)
        if (typeof test === 'object' && test && test.key === 'validation.required') return true
      }
      return false
    })
  }

  function getFieldId(name: string): string | undefined {
    return fieldIds[name]
  }

  const form: EnpiiForm<TValues> = {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    validationSchema,
    handleSubmit,
    validate,
    validateField,
    setFieldError,
    setFieldValue,
    setFieldTouched,
    touch,
    reset,
    resetField,
    registerField,
    registerRules,
    isFieldRequired,
    getFieldId,
  }

  if (getCurrentInstance()) {
    provide(enpiiFormKey, form)
    provide(FORM_SUBMIT_KEY, {
      get submitting() {
        return isSubmitting.value
      },
      get disabled() {
        return isSubmitting.value
      },
    })
  }

  return form
}

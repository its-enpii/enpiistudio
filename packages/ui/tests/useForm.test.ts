import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import EnpiiFormField from '../src/components/EnpiiFormField.vue'
import { createT, enpiiI18nKey } from '../src/i18n'
import {
  email,
  minLength,
  required,
  useForm,
  type EnpiiForm,
} from '../src/composables/useForm'
import { useField, type UseFieldReturn } from '../src/composables/useField'

function mountWithEnglish(component: ReturnType<typeof defineComponent>) {
  return mount(component, {
    global: {
      provide: {
        [enpiiI18nKey as symbol]: createT('en'),
      },
    },
  })
}

describe('useForm', () => {
  it('validates required / email / minLength rules with EN locale', async () => {
    let form!: EnpiiForm<any>

    const Host = defineComponent({
      setup() {
        form = useForm({
          initialValues: { email: '', name: 'ab' },
          validationSchema: {
            email: [required(), email()],
            name: minLength(3),
          },
        })
        return () => h('div')
      },
    })

    mountWithEnglish(Host)

    expect(form.isValid.value).toBe(false)

    expect(form.validateField('email')).toBe(false)
    expect(form.errors.email).toBe('This field is required')

    expect(form.validateField('name')).toBe(false)
    expect(form.errors.name).toBe('Must be at least 3 characters')

    form.values.email = 'jane@example.com'
    form.values.name = 'Jane'
    expect(form.validateField('email')).toBe(true)
    expect(form.validateField('name')).toBe(true)
    expect(form.errors.email).toBeUndefined()
    expect(form.errors.name).toBeUndefined()
    expect(form.isValid.value).toBe(true)
  })

  it('handleSubmit calls onValid when valid, onInvalid when invalid', async () => {
    const onValid = vi.fn()
    const onInvalid = vi.fn()
    let form!: EnpiiForm<any>

    const Host = defineComponent({
      setup() {
        form = useForm({
          initialValues: { email: '' },
          validationSchema: { email: [required(), email()] },
        })
        return () => h('div')
      },
    })

    mountWithEnglish(Host)

    const submitHandler = form.handleSubmit(onValid, onInvalid)
    await submitHandler()

    expect(onValid).not.toHaveBeenCalled()
    expect(onInvalid).toHaveBeenCalledWith({ email: 'This field is required' })

    form.values.email = 'jane@example.com'
    onInvalid.mockClear()

    const submitHandler2 = form.handleSubmit(onValid, onInvalid)
    await submitHandler2()

    expect(onValid).toHaveBeenCalledOnce()
    expect(onInvalid).not.toHaveBeenCalled()
  })

  it('reset clears values, errors, and touched', async () => {
    let form!: EnpiiForm<any>
    let field!: UseFieldReturn<string>

    const Host = defineComponent({
      setup() {
        form = useForm({
          initialValues: { email: '' },
          validationSchema: { email: required() },
        })
        field = useField<string>(form, 'email')
        return () => h('div')
      },
    })

    mountWithEnglish(Host)

    field.value.value = 'jane@example.com'
    field.onBlur()
    expect(field.touched.value).toBe(true)

    field.value.value = ''
    form.validateField('email')
    expect(form.errors.email).toBe('This field is required')

    form.reset()
    expect(form.values.email).toBe('')
    expect(form.errors.email).toBeUndefined()
    expect(field.touched.value).toBe(false)
  })

  it('useField onBlur marks touched and triggers validation', async () => {
    let form!: EnpiiForm<any>
    let field!: UseFieldReturn<string>

    const Host = defineComponent({
      setup() {
        form = useForm({
          initialValues: { name: '' },
          validationSchema: { name: required() },
        })
        field = useField<string>(form, 'name')
        return () => h('div')
      },
    })

    mountWithEnglish(Host)

    expect(field.touched.value).toBe(false)
    expect(field.error.value).toBe('')

    field.onBlur()
    expect(field.touched.value).toBe(true)
    expect(field.error.value).toBe('This field is required')

    field.value.value = 'Alice'
    expect(field.error.value).toBe('')
    expect(field.isValid.value).toBe(true)
  })

  it('EnpiiFormField renders error with role=alert', async () => {
    let form!: EnpiiForm<any>

    const Host = defineComponent({
      setup() {
        form = useForm({
          initialValues: { email: '' },
          validationSchema: { email: required() },
        })
        return () => h(EnpiiFormField, { label: 'Email', name: 'email' }, {
          default: (props: any) => h('input', {
            id: props.id,
            'aria-describedby': props['aria-describedby'],
            'aria-invalid': props['aria-invalid'],
          }),
        })
      },
    })

    const wrapper = mountWithEnglish(Host)

    form.validate()
    await nextTick()

    const errorEl = wrapper.find('.enpii-form-field__error')
    expect(errorEl.exists()).toBe(true)
    expect(errorEl.attributes('role')).toBe('alert')
    expect(errorEl.text()).toBe('This field is required')
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EnpiiFileUpload } from '../src'

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => `blob:mock-${Math.random().toString(36)}`
  URL.revokeObjectURL = () => {}
}

function makeFile(name: string, size: number, type: string) {
  return new File([new Uint8Array(size)], name, { type })
}

function setInputFiles(wrapper: ReturnType<typeof mount>, files: File[]) {
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: files, writable: false })
  input.trigger('change')
  return input
}

describe('EnpiiFileUpload', () => {
  it('renders dropzone with label and browse affordance', () => {
    const wrapper = mount(EnpiiFileUpload, { props: { label: 'Unggah dokumen' } })

    expect(wrapper.get('.enpii-file-upload__label').text()).toBe('Unggah dokumen')
    expect(wrapper.get('.enpii-file-upload__dropzone').attributes('role')).toBe('button')
    expect(wrapper.get('.enpii-file-upload__dropzone').attributes('tabindex')).toBe('0')
  })

  it('adds valid file via input and emits v-model update', async () => {
    const wrapper = mount(EnpiiFileUpload, { props: { multiple: true, modelValue: [] } })
    const file = makeFile('report.pdf', 1024, 'application/pdf')

    setInputFiles(wrapper, [file])
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[file]])

    await wrapper.setProps({ modelValue: [file] })
    await wrapper.vm.$nextTick()
    expect(wrapper.get('.enpii-file-upload__name').text()).toBe('report.pdf')
    expect(wrapper.get('.enpii-file-upload__size').text()).toBe('1.0 KB')
  })

  it('rejects file exceeding maxSize and emits error', async () => {
    const wrapper = mount(EnpiiFileUpload, { props: { maxSize: 1024 } })
    const file = makeFile('large.pdf', 2048, 'application/pdf')

    setInputFiles(wrapper, [file])
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('error')?.[0]?.[0]).toEqual(
      expect.objectContaining({ message: expect.stringContaining('melebihi batas') }),
    )
    expect(wrapper.find('.enpii-file-upload__list').exists()).toBe(false)
    expect(wrapper.get('.enpii-file-upload__error').text()).toContain('melebihi batas')
  })

  it('rejects invalid type based on accept and emits error', async () => {
    const wrapper = mount(EnpiiFileUpload, { props: { accept: 'image/png,image/jpeg' } })
    const file = makeFile('doc.txt', 100, 'text/plain')

    setInputFiles(wrapper, [file])
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.get('.enpii-file-upload__error').text()).toContain('tidak diizinkan')
    expect(wrapper.find('.enpii-file-upload__list').exists()).toBe(false)
  })

  it('removes a file and updates v-model', async () => {
    const file1 = makeFile('a.png', 100, 'image/png')
    const file2 = makeFile('b.pdf', 200, 'application/pdf')
    const wrapper = mount(EnpiiFileUpload, { props: { modelValue: [file1, file2] } })
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.enpii-file-upload__item')).toHaveLength(2)
    await wrapper.findAll('.enpii-file-upload__remove')[0].trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[file2]])
    await wrapper.setProps({ modelValue: [file2] })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.enpii-file-upload__item')).toHaveLength(1)
  })

  it('supports multiple file selection with drag and drop', async () => {
    const wrapper = mount(EnpiiFileUpload, { props: { multiple: true, modelValue: [] } })
    const file1 = makeFile('img.png', 512, 'image/png')
    const file2 = makeFile('doc.pdf', 512, 'application/pdf')

    const dropzone = wrapper.get('.enpii-file-upload__dropzone')
    const dropEvent = new Event('drop', { bubbles: true, cancelable: true })
    Object.defineProperty(dropEvent, 'dataTransfer', { value: { files: [file1, file2] } })
    dropzone.element.dispatchEvent(dropEvent)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[file1, file2]])
    await wrapper.setProps({ modelValue: [file1, file2] })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.enpii-file-upload__item')).toHaveLength(2)
  })

  it('is disabled when disabled prop is set', () => {
    const wrapper = mount(EnpiiFileUpload, { props: { disabled: true } })

    expect(wrapper.get('.enpii-file-upload__dropzone').attributes('tabindex')).toBe('-1')
    expect(wrapper.get('.enpii-file-upload__dropzone').classes()).toContain('enpii-file-upload__dropzone--disabled')
    expect(wrapper.get('input[type="file"]').attributes('disabled')).toBeDefined()
  })

  it('enforces maxFiles limit', async () => {
    const wrapper = mount(EnpiiFileUpload, { props: { multiple: true, maxFiles: 1, modelValue: [] } })
    const file1 = makeFile('first.pdf', 100, 'application/pdf')
    const file2 = makeFile('second.pdf', 100, 'application/pdf')

    setInputFiles(wrapper, [file1, file2])
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('error')).toBeTruthy()
    await wrapper.setProps({ modelValue: [file1] })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.enpii-file-upload__item')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[file1]])
  })
})

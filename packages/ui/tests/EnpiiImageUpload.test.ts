import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { builtinDictionaries, createT, enpiiI18nKey, EnpiiImageUpload } from '../src'

type ImageUploadItem = { file: File; dataUrl?: string }

const t = createT('en', { en: builtinDictionaries.en })

function makeFile(name: string, size: number, type: string) {
  return new File([new Uint8Array(Math.max(size, 1))], name, { type })
}

async function setInputFiles(
  wrapper: ReturnType<typeof mount>,
  files: File[],
) {
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', {
    value: files,
    writable: false,
    configurable: true,
  })
  await input.trigger('change')
  await flushPromises()
  await nextTick()
}

function mountImageUpload(props: Record<string, unknown> = {}) {
  return mount(EnpiiImageUpload, {
    props,
    global: {
      provide: { [enpiiI18nKey as symbol]: t },
    },
  })
}

describe('EnpiiImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dropzone and file input', () => {
    const wrapper = mountImageUpload()

    expect(wrapper.get('.enpii-image-upload__dropzone').attributes('role')).toBe('button')
    expect(wrapper.get('.enpii-image-upload__dropzone').attributes('tabindex')).toBe('0')
    expect(wrapper.get('input[type="file"]').attributes('accept')).toBe('image/*')
  })

  it('adds valid image via input and emits update:modelValue', async () => {
    const wrapper = mountImageUpload({ multiple: true, modelValue: [] })
    const file = makeFile('avatar.png', 1024, 'image/png')

    await setInputFiles(wrapper, [file])

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    const emitted = wrapper.emitted('update:modelValue') as Array<[ImageUploadItem[]]>
    expect(emitted.at(-1)?.[0]).toHaveLength(1)
    expect(emitted.at(-1)?.[0][0].file).toBe(file)
    expect(emitted.at(-1)?.[0][0].dataUrl).toContain('data:')
  })

  it('rejects non-images and oversized files', async () => {
    const wrapper = mountImageUpload({ maxSize: 1024, modelValue: [] })

    await setInputFiles(wrapper, [
      makeFile('document.pdf', 100, 'application/pdf'),
      makeFile('large.png', 2048, 'image/png'),
    ])

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('error')).toHaveLength(2)
    expect(wrapper.findAll('.enpii-image-upload__error')).toHaveLength(2)
  })

  it('respects maxFiles', async () => {
    const existing = makeFile('existing.png', 100, 'image/png')
    const wrapper = mountImageUpload({
        maxFiles: 1,
        modelValue: [{ file: existing, dataUrl: 'data:image/png;base64,existing' }],
    })

    await setInputFiles(wrapper, [makeFile('extra.png', 100, 'image/png')])

    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('removes an item via exposed method', async () => {
    const file = makeFile('avatar.png', 100, 'image/png')
    const wrapper = mountImageUpload({
        modelValue: [{ file, dataUrl: 'data:image/png;base64,avatar' }],
    })
    await flushPromises()
    await nextTick()

    const vm = wrapper.vm as InstanceType<typeof EnpiiImageUpload> & { removeItem: (i: number) => void }
    vm.removeItem(0)
    await flushPromises()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
  })

  it('opens the crop modal via exposed method', async () => {
    const file = makeFile('avatar.png', 100, 'image/png')
    const wrapper = mountImageUpload({
        modelValue: [{ file, dataUrl: 'data:image/png;base64,avatar' }],
    })
    await flushPromises()
    await nextTick()

    const vm = wrapper.vm as InstanceType<typeof EnpiiImageUpload> & { openCrop: (i: number) => void }
    vm.openCrop(0)
    await flushPromises()
    await nextTick()

    expect(document.querySelector('.enpii-image-upload__crop-overlay')).not.toBeNull()
  })

  it('supports adding multiple files', async () => {
    const wrapper = mountImageUpload({ multiple: true, modelValue: [] })

    await setInputFiles(wrapper, [makeFile('first.png', 100, 'image/png')])
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()

    const emitted = wrapper.emitted('update:modelValue') as Array<[ImageUploadItem[]]>
    expect(emitted.at(-1)?.[0]).toHaveLength(1)
  })

  it('disables interactions and suppresses drops', async () => {
    const wrapper = mountImageUpload({ disabled: true })

    await wrapper.get('.enpii-image-upload__dropzone').trigger('click')
    await wrapper.get('.enpii-image-upload__dropzone').trigger('drop', { dataTransfer: { files: [makeFile('image.png', 100, 'image/png')] } })

    expect(wrapper.find('input[type="file"]').attributes('disabled')).toBeDefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.get('.enpii-image-upload__dropzone').classes()).toContain('enpii-image-upload__dropzone--disabled')
  })
})

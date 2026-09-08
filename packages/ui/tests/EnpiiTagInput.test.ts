import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EnpiiTagInput from '../src/components/EnpiiTagInput.vue'

describe('EnpiiTagInput', () => {
  it('renders initial tags from v-model', () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: ['Vue', 'React'] },
    })

    const tags = wrapper.findAll('.enpii-tag-input__tag')
    expect(tags).toHaveLength(2)
    expect(tags[0].text()).toContain('Vue')
    expect(tags[1].text()).toContain('React')
  })

  it('adds a tag on Enter key', async () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: [] },
    })

    const input = wrapper.get('.enpii-tag-input__field')
    await input.setValue('Svelte')
    await input.trigger('keydown', { key: 'Enter' })

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]).toEqual([['Svelte']])
  })

  it('adds a tag on comma key', async () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: [] },
    })

    const input = wrapper.get('.enpii-tag-input__field')
    await input.setValue('Angular')
    await input.trigger('keydown', { key: ',' })

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]).toEqual([['Angular']])
  })

  it('removes last tag on Backspace when input is empty', async () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: ['Vue', 'React'] },
    })

    const input = wrapper.get('.enpii-tag-input__field')
    await input.setValue('')
    await input.trigger('keydown', { key: 'Backspace' })

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]).toEqual([['Vue']])
  })

  it('removes a specific tag when clicking the remove button', async () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: ['A', 'B', 'C'] },
    })

    const removeButtons = wrapper.findAll('.enpii-tag-input__remove')
    await removeButtons[1].trigger('click')

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]).toEqual([['A', 'C']])
  })

  it('rejects duplicate tags by default', async () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: ['Vue'] },
    })

    const input = wrapper.get('.enpii-tag-input__field')
    await input.setValue('Vue')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('allows duplicates when allowDuplicates is true', async () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: ['Vue'], allowDuplicates: true },
    })

    const input = wrapper.get('.enpii-tag-input__field')
    await input.setValue('Vue')
    await input.trigger('keydown', { key: 'Enter' })

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]).toEqual([['Vue', 'Vue']])
  })

  it('respects maxTags limit', async () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: ['A', 'B'], maxTags: 2 },
    })

    const input = wrapper.get('.enpii-tag-input__field')
    await input.setValue('C')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('emits update:modelValue correctly for v-model binding', async () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: [] },
    })

    const input = wrapper.get('.enpii-tag-input__field')
    await input.setValue('First')
    await input.trigger('keydown', { key: 'Enter' })

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]).toEqual([['First']])
  })

  it('shows filtered suggestions', async () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: [], suggestions: ['Vue', 'React', 'Angular'] },
    })

    const input = wrapper.get('.enpii-tag-input__field')
    await input.setValue('rea')

    const suggestions = wrapper.findAll('.enpii-tag-input__suggestion')
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0].text()).toBe('React')
  })

  it('has correct ARIA roles', () => {
    const wrapper = mount(EnpiiTagInput, {
      props: { modelValue: ['Tag1'] },
    })

    expect(wrapper.find('[role="list"]').exists()).toBe(true)
    expect(wrapper.find('[role="listitem"]').exists()).toBe(true)
    expect(wrapper.find('[role="combobox"]').exists()).toBe(true)
  })
})

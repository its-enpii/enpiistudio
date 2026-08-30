import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EnpiiTransferList from '../src/components/EnpiiTransferList.vue'

const options = [
  { id: 'a', label: 'Alpha', description: 'First option' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma', disabled: true },
  { id: 'd', label: 'Delta' },
]

describe('EnpiiTransferList', () => {
  it('renders available options on the left', () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: [] } })
    const leftOptions = wrapper.findAll('[data-testid^="transfer-left-"]')
    expect(leftOptions).toHaveLength(4)
    expect(leftOptions[0].text()).toContain('Alpha')
  })

  it('renders chosen options on the right', () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: ['b'] } })
    const rightOptions = wrapper.findAll('[data-testid^="transfer-right-"]')
    expect(rightOptions).toHaveLength(1)
    expect(rightOptions[0].text()).toContain('Beta')
  })

  it('moves a single option right on button click', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: [] } })
    const item = wrapper.get('[data-testid="transfer-left-a"]')
    await item.trigger('click')
    const moveRight = wrapper.findAll('.enpii-transfer-list__button')[0]
    await moveRight.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted[0]).toEqual([['a']])
  })

  it('moves a single option right on double-click', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: [] } })
    await wrapper.get('[data-testid="transfer-left-a"]').trigger('dblclick')
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted[0]).toEqual([['a']])
  })

  it('moves a single option left on double-click', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: ['a'] } })
    await wrapper.get('[data-testid="transfer-right-a"]').trigger('dblclick')
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted[0]).toEqual([[]])
  })

  it('moves a single option left on Enter key', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: ['a'] } })
    await wrapper.get('[data-testid="transfer-right-a"]').trigger('keydown', { key: 'Enter' })
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted[0]).toEqual([[]])
  })

  it('moves all options right', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: [] } })
    const moveAllRight = wrapper.findAll('.enpii-transfer-list__button')[1]
    await moveAllRight.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted[0]).toEqual([['a', 'b', 'd']])
  })

  it('moves all options left', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: ['a', 'b', 'd'] } })
    const moveAllLeft = wrapper.findAll('.enpii-transfer-list__button')[2]
    await moveAllLeft.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted[0]).toEqual([[]])
  })

  it('filters the left list by search query', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: [] } })
    const searchInput = wrapper.findAll('.enpii-transfer-list__search')[0]
    await searchInput.setValue('alp')
    const leftOptions = wrapper.findAll('[data-testid^="transfer-left-"]')
    expect(leftOptions).toHaveLength(1)
    expect(leftOptions[0].text()).toContain('Alpha')
  })

  it('filters the right list by search query', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: ['a', 'b'] } })
    const searchInput = wrapper.findAll('.enpii-transfer-list__search')[1]
    await searchInput.setValue('bet')
    const rightOptions = wrapper.findAll('[data-testid^="transfer-right-"]')
    expect(rightOptions).toHaveLength(1)
    expect(rightOptions[0].text()).toContain('Beta')
  })

  it('does not move a disabled option', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: [] } })
    await wrapper.get('[data-testid="transfer-left-c"]').trigger('dblclick')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('excludes disabled options from move-all', async () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: [] } })
    const moveAllRight = wrapper.findAll('.enpii-transfer-list__button')[1]
    await moveAllRight.trigger('click')
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted[0]).toEqual([['a', 'b', 'd']])
    expect(emitted[0]).not.toContain('c')
  })

  it('has multiselectable listboxes', () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: [] } })
    const listboxes = wrapper.findAll('[role="listbox"]')
    expect(listboxes).toHaveLength(2)
    expect(listboxes[0].attributes('aria-multiselectable')).toBe('true')
    expect(listboxes[1].attributes('aria-multiselectable')).toBe('true')
  })

  it('renders custom titles when provided', () => {
    const wrapper = mount(EnpiiTransferList, {
      props: { options, modelValue: [], titles: ['Left Title', 'Right Title'] },
    })
    const titles = wrapper.findAll('.enpii-transfer-list__title')
    expect(titles[0].text()).toBe('Left Title')
    expect(titles[1].text()).toBe('Right Title')
  })

  it('hides search inputs when searchable is false', () => {
    const wrapper = mount(EnpiiTransferList, { props: { options, modelValue: [], searchable: false } })
    expect(wrapper.findAll('.enpii-transfer-list__search')).toHaveLength(0)
  })
})

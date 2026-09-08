import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import EnpiiCommandPalette from '../src/components/EnpiiCommandPalette.vue'

const commands = [
  { id: 'home', label: 'Go home', group: 'Navigation', icon: 'home' },
  { id: 'profile', label: 'Open profile', hint: 'P', group: 'Navigation' },
  { id: 'create', label: 'Create invoice', group: 'Actions' },
]

describe('EnpiiCommandPalette', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('opens with mod+k and focuses search', async () => {
    const wrapper = mount(EnpiiCommandPalette, {
      attachTo: document.body,
      props: { commands },
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('.enpii-command-palette__dialog')).toBeTruthy()
    expect(document.activeElement).toBe(document.body.querySelector('.enpii-command-palette__input'))
    wrapper.unmount()
  })

  it('filters commands by substring across words', async () => {
    const wrapper = mount(EnpiiCommandPalette, {
      attachTo: document.body,
      props: { commands },
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))
    await wrapper.vm.$nextTick()

    const input = document.body.querySelector<HTMLInputElement>('.enpii-command-palette__input')!
    input.value = 'op nav'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(document.body.querySelectorAll('.enpii-command-palette__command')).toHaveLength(1)
    expect(document.body.querySelector('.enpii-command-palette__label')?.textContent).toContain('Open profile')
    wrapper.unmount()
  })

  it('selects active command with arrow and enter', async () => {
    const wrapper = mount(EnpiiCommandPalette, {
      attachTo: document.body,
      props: { commands },
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    await wrapper.vm.$nextTick()

    const dialog = document.body.querySelector('.enpii-command-palette__dialog')!
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('select')![0]).toEqual([commands[1]])
    expect(document.body.querySelector('.enpii-command-palette__dialog')).toBeFalsy()
    wrapper.unmount()
  })

  it('closes on Escape', async () => {
    const wrapper = mount(EnpiiCommandPalette, {
      attachTo: document.body,
      props: { commands },
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    await wrapper.vm.$nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('.enpii-command-palette__dialog')).toBeFalsy()
    wrapper.unmount()
  })
})

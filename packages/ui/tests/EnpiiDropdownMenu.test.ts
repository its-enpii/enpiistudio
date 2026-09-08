import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import EnpiiDropdownMenu from '../src/components/EnpiiDropdownMenu.vue'

const items = [
  { label: 'Edit', icon: 'edit' },
  { label: 'Duplicate', icon: 'content_copy' },
  { divider: true },
  { label: 'Delete', icon: 'delete', danger: true },
]

const disabledItems = [
  { label: 'Enabled' },
  { label: 'Locked', disabled: true },
  { label: 'Other' },
]

describe('EnpiiDropdownMenu', () => {
  it('renders trigger button with ARIA attributes', () => {
    const wrapper = mount(EnpiiDropdownMenu, {
      props: { items },
      attachTo: document.body,
    })

    const trigger = wrapper.get('.enpii-dropdown-menu__trigger')
    expect(trigger.attributes('type')).toBe('button')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    wrapper.unmount()
  })

  it('opens menu on trigger click and expands ARIA', async () => {
    document.body.innerHTML = ''
    const wrapper = mount(EnpiiDropdownMenu, {
      props: { items },
      attachTo: document.body,
    })

    await wrapper.get('.enpii-dropdown-menu__trigger').trigger('click')
    const panel = document.body.querySelector('[role="menu"]')
    expect(panel).toBeTruthy()
    expect(wrapper.get('.enpii-dropdown-menu__trigger').attributes('aria-expanded')).toBe('true')

    const menuItems = panel!.querySelectorAll('[role="menuitem"]')
    expect(menuItems).toHaveLength(3)
    wrapper.unmount()
  })

  it('closes menu on Escape and returns focus to trigger', async () => {
    document.body.innerHTML = ''
    const wrapper = mount(EnpiiDropdownMenu, {
      props: { items },
      attachTo: document.body,
    })

    await wrapper.get('.enpii-dropdown-menu__trigger').trigger('click')
    const panel = document.body.querySelector('[role="menu"]')
    expect(panel).toBeTruthy()

    await panel!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('[role="menu"]')).toBeFalsy()
    wrapper.unmount()
  })

  it('emits select with item payload on click', async () => {
    document.body.innerHTML = ''
    const wrapper = mount(EnpiiDropdownMenu, {
      props: { items },
      attachTo: document.body,
    })

    await wrapper.get('.enpii-dropdown-menu__trigger').trigger('click')
    const menuItems = document.body.querySelectorAll('[role="menuitem"]')
    await menuItems[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([items[0]])
    wrapper.unmount()
  })

  it('navigates items with ArrowDown/ArrowUp', async () => {
    document.body.innerHTML = ''
    const wrapper = mount(EnpiiDropdownMenu, {
      props: { items },
      attachTo: document.body,
    })

    await wrapper.get('.enpii-dropdown-menu__trigger').trigger('click')
    const panel = document.body.querySelector('[role="menu"]')!
    const menuItems = panel.querySelectorAll('[role="menuitem"]')

    await panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement).toBe(menuItems[1])

    await panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }))
    expect(document.activeElement).toBe(menuItems[0])
    wrapper.unmount()
  })

  it('does not emit select for disabled items', async () => {
    document.body.innerHTML = ''
    const wrapper = mount(EnpiiDropdownMenu, {
      props: { items: disabledItems },
      attachTo: document.body,
    })

    await wrapper.get('.enpii-dropdown-menu__trigger').trigger('click')
    const menuItems = document.body.querySelectorAll('[role="menuitem"]')
    await menuItems[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('select')).toBeUndefined()
    wrapper.unmount()
  })

  it('renders divider separators', async () => {
    document.body.innerHTML = ''
    const wrapper = mount(EnpiiDropdownMenu, {
      props: { items },
      attachTo: document.body,
    })

    await wrapper.get('.enpii-dropdown-menu__trigger').trigger('click')
    const dividers = document.body.querySelectorAll('[role="separator"]')
    expect(dividers.length).toBeGreaterThanOrEqual(1)
    wrapper.unmount()
  })
})

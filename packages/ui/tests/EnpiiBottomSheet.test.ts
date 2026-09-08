import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import EnpiiBottomSheet from '../src/components/EnpiiBottomSheet.vue'

function pointerEvent(type: string, options: { pointerId: number; clientY: number }) {
  const event = new MouseEvent(type, { bubbles: true, clientY: options.clientY })
  Object.defineProperty(event, 'pointerId', { value: options.pointerId })
  return event
}

describe('EnpiiBottomSheet', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('renders the dialog through teleport and focuses it when open', async () => {
    const wrapper = mount(EnpiiBottomSheet, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Actions' },
      slots: { default: '<button type="button">Action</button>' },
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))
    const panel = document.body.querySelector<HTMLElement>('.enpii-bottom-sheet__panel')
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(panel?.getAttribute('aria-modal')).toBe('true')
    // Component focuses the last focusable element (first content control) for a11y
    const action = document.body.querySelector<HTMLElement>('.enpii-bottom-sheet__body button')
    expect(document.activeElement).toBe(action)
    wrapper.unmount()
  })

  it('closes from Escape and overlay clicks', async () => {
    const wrapper = mount(EnpiiBottomSheet, {
      attachTo: document.body,
      props: { modelValue: true },
    })

    await wrapper.vm.$nextTick()
    document.body.querySelector('.enpii-bottom-sheet__panel')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])

    const reopened = wrapper.setProps({ modelValue: true })
    await reopened
    await wrapper.vm.$nextTick()
    document.body.querySelector('.enpii-bottom-sheet__overlay')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('closes after a pointer drag of at least 100 pixels', async () => {
    const wrapper = mount(EnpiiBottomSheet, {
      attachTo: document.body,
      props: { modelValue: true },
    })

    await wrapper.vm.$nextTick()
    const handle = document.body.querySelector('.enpii-bottom-sheet__handle')!
    handle.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1, clientY: 100 }))
    await window.dispatchEvent(pointerEvent('pointermove', { pointerId: 1, clientY: 210 }))
    await window.dispatchEvent(pointerEvent('pointerup', { pointerId: 1, clientY: 210 }))

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('traps focus between the close button and the first content control', async () => {
    const wrapper = mount(EnpiiBottomSheet, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Actions' },
      slots: { default: '<button type="button">Action</button>' },
    })

    await wrapper.vm.$nextTick()
    // shift-Tab from the FIRST focusable (handle) wraps around to the LAST (Action button)
    const handle = document.body.querySelector<HTMLElement>('.enpii-bottom-sheet__handle')
    handle?.focus()
    handle?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(document.activeElement?.textContent).toContain('Action')
    wrapper.unmount()
  })

  it('does not close when non-dismissible', async () => {
    const wrapper = mount(EnpiiBottomSheet, {
      attachTo: document.body,
      props: { modelValue: true, dismissible: false },
    })

    await wrapper.vm.$nextTick()
    document.body.querySelector('.enpii-bottom-sheet__panel')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    document.body.querySelector('.enpii-bottom-sheet__overlay')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})

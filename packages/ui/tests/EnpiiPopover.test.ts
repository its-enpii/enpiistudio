import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import EnpiiPopover from '../src/components/EnpiiPopover.vue'

describe('EnpiiPopover', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('opens and closes on trigger click', async () => {
    const wrapper = mount(EnpiiPopover, {
      attachTo: document.body,
      slots: {
        trigger: '<button type="button">Open</button>',
        content: '<p>Popover body</p>',
      },
    })

    await wrapper.get('.enpii-popover__trigger').trigger('click')
    expect(document.body.querySelector('.enpii-popover__panel')).toBeTruthy()
    await wrapper.get('.enpii-popover__trigger').trigger('click')
    expect(document.body.querySelector('.enpii-popover__panel')).toBeFalsy()
    wrapper.unmount()
  })

  it('closes on Escape and returns focus to trigger', async () => {
    const wrapper = mount(EnpiiPopover, {
      attachTo: document.body,
      slots: { trigger: '<button type="button">Open</button>', content: 'Content' },
    })

    const trigger = wrapper.get('.enpii-popover__trigger')
    await trigger.trigger('click')
    await document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(document.body.querySelector('.enpii-popover__panel')).toBeFalsy()
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('closes on outside click', async () => {
    const wrapper = mount(EnpiiPopover, {
      attachTo: document.body,
      slots: { trigger: '<button type="button">Open</button>', content: 'Content' },
    })

    await wrapper.get('.enpii-popover__trigger').trigger('click')
    expect(document.body.querySelector('.enpii-popover__panel')).toBeTruthy()

    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('.enpii-popover__panel')).toBeFalsy()
    wrapper.unmount()
  })

  it('applies placement classes after positioning', async () => {
    const wrapper = mount(EnpiiPopover, {
      attachTo: document.body,
      props: { placement: 'bottom', alignment: 'start', arrow: true },
      slots: { trigger: '<button type="button">Open</button>', content: 'Content' },
    })

    await wrapper.get('.enpii-popover__trigger').trigger('click')
    expect(document.body.querySelector('.enpii-popover__panel')?.className).toContain('enpii-popover__panel--bottom')
    expect(document.body.querySelector('.enpii-popover__panel')?.className).toContain('enpii-popover__panel--align-start')
    expect(document.body.querySelector('.enpii-popover__arrow')).toBeTruthy()
    wrapper.unmount()
  })
})

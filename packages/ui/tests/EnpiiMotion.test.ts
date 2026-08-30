import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EnpiiAccordion from '../src/components/EnpiiAccordion.vue'
import EnpiiPopover from '../src/components/EnpiiPopover.vue'

describe('EnpiiAccordion motion', () => {
  it('toggles the grid-rows class when opened and closed', async () => {
    const wrapper = mount(EnpiiAccordion, {
      props: { title: 'Details', defaultOpen: false },
    })

    const panelWrap = wrapper.find('.enpii-accordion__panel-wrap')
    expect(panelWrap.classes()).not.toContain('enpii-accordion__panel-wrap--open')

    await wrapper.get('.enpii-accordion__trigger').trigger('click')
    expect(panelWrap.classes()).toContain('enpii-accordion__panel-wrap--open')

    await wrapper.get('.enpii-accordion__trigger').trigger('click')
    expect(panelWrap.classes()).not.toContain('enpii-accordion__panel-wrap--open')
  })
})

describe('EnpiiPopover motion', () => {
  it('wraps the panel in a transition for fade+scale', async () => {
    const wrapper = mount(EnpiiPopover, {
      props: { placement: 'bottom', trigger: 'click' },
      slots: { trigger: '<span>Open</span>', content: '<p>Panel content</p>' },
      attachTo: document.body,
    })

    expect(document.body.querySelector('.enpii-popover__panel')).toBeNull()

    await wrapper.get('.enpii-popover__trigger').trigger('click')
    await wrapper.vm.$nextTick()

    const panel = document.body.querySelector('.enpii-popover__panel')
    expect(panel).not.toBeNull()

    wrapper.unmount()
    document.body.innerHTML = ''
  })
})

describe('Motion tokens', () => {
  it('exposes standardized duration and easing tokens in tokens.css', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')
    expect(css).toContain('--enpii-duration-fast: 150ms')
    expect(css).toContain('--enpii-duration-normal: 240ms')
    expect(css).toContain('--enpii-duration-slow: 360ms')
    expect(css).toContain('--enpii-ease-standard: cubic-bezier(.2, 0, 0, 1)')
    expect(css).toContain('--enpii-ease-decelerate: cubic-bezier(0, 0, 0, 1)')
    expect(css).toContain('--enpii-ease-accelerate: cubic-bezier(.3, 0, 1, 1)')
    expect(css).toContain('--enpii-ease-emphasized: cubic-bezier(.16, 1, .3, 1)')
  })

  it('reduced-motion sets transition duration to 0 instead of hiding transitions', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles/components.css'), 'utf8')
    expect(css).toContain('transition-duration:0s!important')
    expect(css).not.toContain('transition:none!important;animation-duration:.01ms!important')
  })
})

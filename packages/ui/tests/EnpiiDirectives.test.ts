import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { vPermission } from '../src/directives/permission'
import { vTooltip } from '../src/directives/tooltip'

describe('v-permission', () => {
  it('removes element when permission not matched', () => {
    const Comp = defineComponent({
      directives: { permission: vPermission },
      template: '<div><span v-permission="\'admin.edit\'" id="target">Secret</span></div>',
    })
    const wrapper = mount(Comp, {
      attachTo: document.body,
      global: {
        config: {
          globalProperties: { $enpiiPermissions: ['posts.view'] },
        },
      },
    })
    expect(document.getElementById('target')).toBeNull()
    wrapper.unmount()
  })

  it('keeps element when permission matched', () => {
    const Comp = defineComponent({
      directives: { permission: vPermission },
      template: '<div><span v-permission="\'posts.view\'" id="target">Visible</span></div>',
    })
    const wrapper = mount(Comp, {
      attachTo: document.body,
      global: {
        config: {
          globalProperties: { $enpiiPermissions: ['posts.view'] },
        },
      },
    })
    expect(document.getElementById('target')).toBeTruthy()
    wrapper.unmount()
  })

  it('hides element with .hide modifier instead of removing', () => {
    const Comp = defineComponent({
      directives: { permission: vPermission },
      template: '<div><span v-permission.hide="\'admin.edit\'" id="target">Hidden</span></div>',
    })
    const wrapper = mount(Comp, {
      attachTo: document.body,
      global: {
        config: {
          globalProperties: { $enpiiPermissions: ['posts.view'] },
        },
      },
    })
    const el = document.getElementById('target')
    expect(el).toBeTruthy()
    expect(el!.style.visibility).toBe('hidden')
    wrapper.unmount()
  })

  it('supports .any modifier (default) with array', () => {
    const Comp = defineComponent({
      directives: { permission: vPermission },
      template: '<div><span v-permission.any="[\'a\', \'b\']" id="target">OK</span></div>',
    })
    const wrapper = mount(Comp, {
      attachTo: document.body,
      global: {
        config: {
          globalProperties: { $enpiiPermissions: ['b', 'c'] },
        },
      },
    })
    expect(document.getElementById('target')).toBeTruthy()
    wrapper.unmount()
  })

  it('supports .all modifier requiring all permissions', () => {
    const Comp = defineComponent({
      directives: { permission: vPermission },
      template: '<div><span v-permission.all="[\'a\', \'b\']" id="target">OK</span></div>',
    })
    const wrapper = mount(Comp, {
      attachTo: document.body,
      global: {
        config: {
          globalProperties: { $enpiiPermissions: ['a'] },
        },
      },
    })
    expect(document.getElementById('target')).toBeNull()
    wrapper.unmount()
  })

  it('allows all when permissions include wildcard *', () => {
    const Comp = defineComponent({
      directives: { permission: vPermission },
      template: '<div><span v-permission.all="[\'x\', \'y\']" id="target">OK</span></div>',
    })
    const wrapper = mount(Comp, {
      attachTo: document.body,
      global: {
        config: {
          globalProperties: { $enpiiPermissions: ['*'] },
        },
      },
    })
    expect(document.getElementById('target')).toBeTruthy()
    wrapper.unmount()
  })

  it('warns in dev when permissions not provided', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Comp = defineComponent({
      directives: { permission: vPermission },
      template: '<div><span v-permission="\'x\'" id="target">OK</span></div>',
    })
    mount(Comp, { attachTo: document.body })
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('v-permission'))
    warnSpy.mockRestore()
  })
})

describe('v-tooltip', () => {
  afterEach(() => {
    const tip = document.querySelector('.enpii-tooltip__bubble')
    if (tip) tip.remove()
    document.body.innerHTML = ''
  })

  it('shows tooltip on mouseenter and hides on mouseleave', async () => {
    const Comp = defineComponent({
      directives: { tooltip: vTooltip },
      template: '<button v-tooltip="\'Hello\'" id="trigger">Hover</button>',
    })
    const wrapper = mount(Comp, { attachTo: document.body })
    const trigger = wrapper.get('#trigger')

    await trigger.trigger('mouseenter')
    const tip = document.querySelector('.enpii-tooltip__bubble') as HTMLElement
    expect(tip).toBeTruthy()
    expect(tip.textContent).toBe('Hello')
    expect(tip.style.visibility).toBe('visible')

    await trigger.trigger('mouseleave')
    expect(tip.style.visibility).toBe('hidden')
    wrapper.unmount()
  })

  it('shows tooltip on focus and hides on blur', async () => {
    const Comp = defineComponent({
      directives: { tooltip: vTooltip },
      template: '<button v-tooltip="\'Focus tip\'" id="trigger">Focus</button>',
    })
    const wrapper = mount(Comp, { attachTo: document.body })
    const trigger = wrapper.get('#trigger')

    await trigger.trigger('focusin')
    const tip = document.querySelector('.enpii-tooltip__bubble') as HTMLElement
    expect(tip).toBeTruthy()
    expect(tip.textContent).toBe('Focus tip')
    expect(tip.style.visibility).toBe('visible')

    await trigger.trigger('focusout')
    expect(tip.style.visibility).toBe('hidden')
    wrapper.unmount()
  })

  it('sets aria-describedby on trigger when visible', async () => {
    const Comp = defineComponent({
      directives: { tooltip: vTooltip },
      template: '<button v-tooltip="\'Aria test\'" id="trigger">A</button>',
    })
    const wrapper = mount(Comp, { attachTo: document.body })
    const trigger = wrapper.get('#trigger')

    await trigger.trigger('mouseenter')
    const tip = document.querySelector('.enpii-tooltip__bubble') as HTMLElement
    expect(tip.id).toBeTruthy()
    expect(trigger.element.getAttribute('aria-describedby')).toBe(tip.id)

    await trigger.trigger('mouseleave')
    expect(trigger.element.getAttribute('aria-describedby')).toBeNull()
    wrapper.unmount()
  })

  it('supports object value with content and placement', async () => {
    const Comp = defineComponent({
      directives: { tooltip: vTooltip },
      template: '<button v-tooltip="{ content: \'Bottom\', placement: \'bottom\' }" id="trigger">B</button>',
    })
    const wrapper = mount(Comp, { attachTo: document.body })
    const trigger = wrapper.get('#trigger')

    await trigger.trigger('mouseenter')
    const tip = document.querySelector('.enpii-tooltip__bubble') as HTMLElement
    expect(tip.textContent).toBe('Bottom')
    wrapper.unmount()
  })

  it('delays show when delay option is set', async () => {
    vi.useFakeTimers()
    const Comp = defineComponent({
      directives: { tooltip: vTooltip },
      template: '<button v-tooltip="{ content: \'Delayed\', delay: 500 }" id="trigger">D</button>',
    })
    const wrapper = mount(Comp, { attachTo: document.body })
    const trigger = wrapper.get('#trigger')

    await trigger.trigger('mouseenter')
    const tip = document.querySelector('.enpii-tooltip__bubble') as HTMLElement
    expect(tip.style.visibility).not.toBe('visible')

    vi.advanceTimersByTime(500)
    expect(tip.style.visibility).toBe('visible')

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('has role=tooltip on the tooltip element', async () => {
    const Comp = defineComponent({
      directives: { tooltip: vTooltip },
      template: '<button v-tooltip="\'Role test\'" id="trigger">R</button>',
    })
    const wrapper = mount(Comp, { attachTo: document.body })
    const trigger = wrapper.get('#trigger')

    await trigger.trigger('mouseenter')
    const tip = document.querySelector('.enpii-tooltip__bubble') as HTMLElement
    expect(tip.getAttribute('role')).toBe('tooltip')
    wrapper.unmount()
  })
})

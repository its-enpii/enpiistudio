import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeAll } from 'vitest'
import { EnpiiSignaturePad } from '../src'

beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = function () {
    return {
      scale: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: '',
      lineWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      fillStyle: '',
    } as any
  } as any

  HTMLCanvasElement.prototype.toDataURL = function () {
    return 'data:image/png;base64,mock'
  }

  // Mock getBoundingClientRect for canvas operations
  Element.prototype.getBoundingClientRect = function () {
    return { left: 0, top: 0, right: 300, bottom: 150, width: 300, height: 150, x: 0, y: 0, toJSON() {} }
  }

  // Mock ResizeObserver
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as any
})

function createPointerEvent(type: string, x: number, y: number): PointerEvent {
  return new MouseEvent(type, {
    clientX: x,
    clientY: y,
    bubbles: true,
    cancelable: true,
  }) as unknown as PointerEvent
}

describe('EnpiiSignaturePad', () => {
  it('renders canvas and action buttons', () => {
    const wrapper = mount(EnpiiSignaturePad)

    expect(wrapper.find('.enpii-signature-pad__canvas').exists()).toBe(true)
    const actions = wrapper.findAll('.enpii-signature-pad__action')
    expect(actions).toHaveLength(2)
  })

  it('exposes isEmpty as true initially', () => {
    const wrapper = mount(EnpiiSignaturePad)

    expect(wrapper.vm.isEmpty).toBe(true)
  })

  it('toDataURL returns a data string', () => {
    const wrapper = mount(EnpiiSignaturePad)

    const url = wrapper.vm.toDataURL()
    expect(url).toMatch(/^data:image/)
  })

  it('drawing via pointer events creates a non-empty state', async () => {
    const wrapper = mount(EnpiiSignaturePad, { attachTo: document.body })
    const canvas = wrapper.get('.enpii-signature-pad__canvas')

    // Stub setPointerCapture which jsdom does not have
    canvas.element.setPointerCapture = vi.fn()

    await canvas.trigger('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 })
    await canvas.trigger('pointermove', { clientX: 50, clientY: 50, pointerId: 1 })
    await canvas.trigger('pointermove', { clientX: 100, clientY: 80, pointerId: 1 })
    await canvas.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.vm.isEmpty).toBe(false)

    wrapper.unmount()
  })

  it('clear() resets to empty', async () => {
    const wrapper = mount(EnpiiSignaturePad, { attachTo: document.body })
    const canvas = wrapper.get('.enpii-signature-pad__canvas')

    canvas.element.setPointerCapture = vi.fn()

    await canvas.trigger('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 })
    await canvas.trigger('pointermove', { clientX: 50, clientY: 50, pointerId: 1 })
    await canvas.trigger('pointermove', { clientX: 100, clientY: 80, pointerId: 1 })
    await canvas.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.vm.isEmpty).toBe(false)

    wrapper.vm.clear()
    expect(wrapper.vm.isEmpty).toBe(true)

    wrapper.unmount()
  })

  it('undo removes last stroke', async () => {
    const wrapper = mount(EnpiiSignaturePad, { attachTo: document.body })
    const canvas = wrapper.get('.enpii-signature-pad__canvas')

    canvas.element.setPointerCapture = vi.fn()

    // Draw a stroke
    await canvas.trigger('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 })
    await canvas.trigger('pointermove', { clientX: 50, clientY: 50, pointerId: 1 })
    await canvas.trigger('pointermove', { clientX: 100, clientY: 80, pointerId: 1 })
    await canvas.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.vm.isEmpty).toBe(false)

    wrapper.vm.undo()
    expect(wrapper.vm.isEmpty).toBe(true)

    wrapper.unmount()
  })

  it('does not draw when disabled', async () => {
    const wrapper = mount(EnpiiSignaturePad, {
      props: { disabled: true },
      attachTo: document.body,
    })
    const canvas = wrapper.get('.enpii-signature-pad__canvas')

    canvas.element.setPointerCapture = vi.fn()

    expect(wrapper.find('.enpii-signature-pad--disabled').exists()).toBe(true)

    await canvas.trigger('pointerdown', { clientX: 10, clientY: 10, pointerId: 1 })
    await canvas.trigger('pointermove', { clientX: 50, clientY: 50, pointerId: 1 })
    await canvas.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.vm.isEmpty).toBe(true)

    wrapper.unmount()
  })

  it('undo and clear buttons are disabled when empty', () => {
    const wrapper = mount(EnpiiSignaturePad)
    const actions = wrapper.findAll('.enpii-signature-pad__action')

    expect(actions[0].attributes('disabled')).toBeDefined()
    expect(actions[1].attributes('disabled')).toBeDefined()
  })

  it('respects penColor and penWidth props', () => {
    const wrapper = mount(EnpiiSignaturePad, {
      props: { penColor: '#ff0000', penWidth: 5 },
    })

    expect(wrapper.props('penColor')).toBe('#ff0000')
    expect(wrapper.props('penWidth')).toBe(5)
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn(),
  },
}))

import EnpiiQrCode from '../src/components/EnpiiQrCode.vue'
import QRCode from 'qrcode'

describe('EnpiiQrCode', () => {
  it('renders canvas element', () => {
    const wrapper = mount(EnpiiQrCode, {
      props: { value: 'https://example.com' },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('has correct size attribute', () => {
    const wrapper = mount(EnpiiQrCode, {
      props: { value: 'test', size: 256 },
    })
    expect(wrapper.find('canvas').attributes('width')).toBe('256')
    expect(wrapper.find('canvas').attributes('height')).toBe('256')
  })

  it('calls toCanvas with correct options', async () => {
    vi.mocked(QRCode.toCanvas).mockClear()
    const wrapper = mount(EnpiiQrCode, {
      props: { value: 'https://test.com', size: 200, level: 'H', includeMargin: true },
    })
    await wrapper.vm.$nextTick()
    expect(QRCode.toCanvas).toHaveBeenCalled()
    const call = vi.mocked(QRCode.toCanvas).mock.calls[0]
    expect(call[1]).toBe('https://test.com')
    expect(call[2]).toMatchObject({ width: 200, margin: 4, errorCorrectionLevel: 'H' })
  })

  it('exposes download function', () => {
    const wrapper = mount(EnpiiQrCode, {
      props: { value: 'test' },
    })
    expect(typeof (wrapper.vm as any).download).toBe('function')
  })

  it('download creates a link and clicks it', () => {
    const wrapper = mount(EnpiiQrCode, {
      props: { value: 'test' },
    })
    const mockClick = vi.fn()
    const mockToDataURL = vi.fn(() => 'data:image/png;base64,mock')
    const canvas = wrapper.find('canvas').element as HTMLCanvasElement
    Object.defineProperty(canvas, 'toDataURL', { value: mockToDataURL })

    const link = document.createElement('a')
    link.click = mockClick
    vi.spyOn(document, 'createElement').mockReturnValueOnce(link)

    ;(wrapper.vm as any).download()
    expect(mockToDataURL).toHaveBeenCalledWith('image/png')
    expect(mockClick).toHaveBeenCalled()
  })
})

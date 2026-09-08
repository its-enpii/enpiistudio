import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import EnpiiWhatsAppPreview from '../src/components/EnpiiWhatsAppPreview.vue'

const messages = [
  { id: 1, direction: 'in', body: 'Hello', timestamp: '2026-08-30T08:00:00.000Z', mediaUrl: '/image.png' },
  { id: 2, direction: 'out', body: 'Reminder', timestamp: '2026-08-30T08:05:00.000Z', status: 'read' },
  { id: 3, direction: 'out', body: 'Payment link', status: 'failed' },
] as const

describe('EnpiiWhatsAppPreview', () => {
  it('renders messages and directional classes', () => {
    const wrapper = mount(EnpiiWhatsAppPreview, { props: { messages } })

    expect(wrapper.findAll('.enpii-whatsapp-preview__item')).toHaveLength(3)
    expect(wrapper.find('.enpii-whatsapp-preview__item--in').exists()).toBe(true)
    expect(wrapper.find('.enpii-whatsapp-preview__item--out').exists()).toBe(true)
    expect(wrapper.findAll('.enpii-whatsapp-preview__body').map((bubble) => bubble.text()))
      .toEqual(['Hello', 'Reminder', 'Payment link'])
  })

  it('renders message status classes', () => {
    const wrapper = mount(EnpiiWhatsAppPreview, { props: { messages } })

    expect(wrapper.find('.enpii-whatsapp-preview__status--read').exists()).toBe(true)
    expect(wrapper.find('.enpii-whatsapp-preview__status--failed').exists()).toBe(true)
    expect(wrapper.find('.enpii-whatsapp-preview__bubble--failed').exists()).toBe(true)
  })

  it('renders media and contact header', () => {
    const wrapper = mount(EnpiiWhatsAppPreview, {
      props: { messages, contactName: 'Rina Putri', readOnly: true },
    })

    expect(wrapper.find('.enpii-whatsapp-preview__contact').text()).toBe('Rina Putri')
    expect(wrapper.find('.enpii-whatsapp-preview__avatar').text()).toBe('RP')
    expect(wrapper.find('.enpii-whatsapp-preview__media').attributes('src')).toBe('/image.png')
    expect(wrapper.find('.enpii-whatsapp-preview--readonly').exists()).toBe(true)
  })

  it('keeps the message log accessible', () => {
    const wrapper = mount(EnpiiWhatsAppPreview, { props: { messages } })

    expect(wrapper.get('[role="log"]').classes()).toContain('enpii-whatsapp-preview__log')
    expect(wrapper.attributes('aria-label')).toBe('Log pratinjau chat WhatsApp')
  })
})

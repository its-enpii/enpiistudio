import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EnpiiButton, EnpiiCard } from '../src'

describe('shape variants', () => {
  it.each(['rounded', 'pill', 'sharp'])('applies the %s shape to buttons', (shape) => {
    const wrapper = mount(EnpiiButton, {
      props: { shape },
      slots: { default: 'Simpan' },
    })

    expect(wrapper.get('button').classes()).toContain(`enpii-shape--${shape}`)
  })

  it('applies the pill shape to the card container', () => {
    const wrapper = mount(EnpiiCard, {
      props: { shape: 'pill' },
      slots: { default: 'Card content' },
    })

    expect(wrapper.get('section').classes()).toContain('enpii-shape--pill')
  })
})

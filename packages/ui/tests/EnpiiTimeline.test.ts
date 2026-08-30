import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EnpiiTimeline from '../src/components/EnpiiTimeline.vue'

const items = [
  { id: 1, title: 'First step', completed: true },
  { id: 2, title: 'Second step', tone: 'primary' as const },
  { id: 3, title: 'Third step', tone: 'danger' as const },
  { id: 4, title: 'Fourth step', tone: 'success' as const, completed: true },
]

describe('EnpiiTimeline', () => {
  it('renders the correct number of items', () => {
    const wrapper = mount(EnpiiTimeline, { props: { items } })
    const timelineItems = wrapper.findAll('.enpii-timeline__item')
    expect(timelineItems).toHaveLength(4)
  })

  it('renders item titles', () => {
    const wrapper = mount(EnpiiTimeline, { props: { items } })
    const titles = wrapper.findAll('.enpii-timeline__title')
    expect(titles[0].text()).toBe('First step')
    expect(titles[3].text()).toBe('Fourth step')
  })

  it('renders tone classes', () => {
    const wrapper = mount(EnpiiTimeline, { props: { items } })
    const timelineItems = wrapper.findAll('.enpii-timeline__item')
    expect(timelineItems[0].classes()).toContain('enpii-timeline__item--neutral')
    expect(timelineItems[1].classes()).toContain('enpii-timeline__item--primary')
    expect(timelineItems[2].classes()).toContain('enpii-timeline__item--danger')
    expect(timelineItems[3].classes()).toContain('enpii-timeline__item--success')
  })

  it('renders completed and pending classes', () => {
    const wrapper = mount(EnpiiTimeline, { props: { items } })
    const timelineItems = wrapper.findAll('.enpii-timeline__item')
    expect(timelineItems[0].classes()).toContain('enpii-timeline__item--completed')
    expect(timelineItems[1].classes()).toContain('enpii-timeline__item--pending')
    expect(timelineItems[2].classes()).toContain('enpii-timeline__item--pending')
    expect(timelineItems[3].classes()).toContain('enpii-timeline__item--completed')
  })

  it('renders alternate class on the root', () => {
    const wrapper = mount(EnpiiTimeline, { props: { items, alternate: true } })
    expect(wrapper.find('ol').classes()).toContain('enpii-timeline--alternate')
  })

  it('does not render alternate class by default', () => {
    const wrapper = mount(EnpiiTimeline, { props: { items } })
    expect(wrapper.find('ol').classes()).not.toContain('enpii-timeline--alternate')
  })

  it('renders density class', () => {
    const wrapper = mount(EnpiiTimeline, { props: { items, density: 'compact' } })
    expect(wrapper.find('ol').classes()).toContain('enpii-timeline--compact')
  })

  it('renders descriptions when provided', () => {
    const wrapper = mount(EnpiiTimeline, {
      props: { items: [{ id: 1, title: 'Step', description: 'Details here' }] },
    })
    const descriptions = wrapper.findAll('.enpii-timeline__description')
    expect(descriptions).toHaveLength(1)
    expect(descriptions[0].text()).toBe('Details here')
  })

  it('renders timestamps when provided', () => {
    const wrapper = mount(EnpiiTimeline, {
      props: { items: [{ id: 1, title: 'Step', timestamp: '2024-01-01' }] },
    })
    const timestamps = wrapper.findAll('time')
    expect(timestamps).toHaveLength(1)
    expect(timestamps[0].text()).toBe('2024-01-01')
  })

  it('renders icons when provided', () => {
    const wrapper = mount(EnpiiTimeline, {
      props: { items: [{ id: 1, title: 'Step', icon: 'check' }] },
    })
    expect(wrapper.find('.enpii-timeline__icon').exists()).toBe(true)
  })
})

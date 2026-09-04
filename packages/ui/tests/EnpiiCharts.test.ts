import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import {
  EnpiiLineChart,
  EnpiiBarChart,
  EnpiiAreaChart,
  EnpiiDonutChart,
  EnpiiSparkline,
} from '../src'

const multiSeriesData = [
  { key: 'revenue', label: 'Revenue', data: [100, 200, 150, 300, 250] },
  { key: 'cost', label: 'Cost', data: [80, 120, 100, 180, 160] },
]

const multiSeriesLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May']

const donutData = [
  { key: 'a', label: 'Category A', value: 40 },
  { key: 'b', label: 'Category B', value: 30 },
  { key: 'c', label: 'Category C', value: 30 },
]

const sparklineData = [10, 20, 15, 25, 18, 30]

describe('EnpiiLineChart', () => {
  it('renders one path per series', () => {
    const wrapper = mount(EnpiiLineChart, {
      props: { data: multiSeriesData, labels: multiSeriesLabels },
    })

    expect(wrapper.findAll('.enpii-line-chart__line')).toHaveLength(2)
  })

  it('renders data points equal to series data length', () => {
    const wrapper = mount(EnpiiLineChart, {
      props: { data: multiSeriesData, labels: multiSeriesLabels },
    })

    const points = wrapper.findAll('.enpii-line-chart__point')
    expect(points).toHaveLength(10)
  })

  it('renders gridlines', () => {
    const wrapper = mount(EnpiiLineChart, {
      props: { data: multiSeriesData },
    })

    expect(wrapper.findAll('.enpii-line-chart__grid').length).toBeGreaterThanOrEqual(4)
  })

  it('renders x-axis labels', () => {
    const wrapper = mount(EnpiiLineChart, {
      props: { data: multiSeriesData, labels: multiSeriesLabels },
    })

    const axisTexts = wrapper.findAll('.enpii-line-chart__axis-text')
    expect(axisTexts.length).toBeGreaterThan(0)
  })

  it('has accessible aria-label on svg', () => {
    const wrapper = mount(EnpiiLineChart, {
      props: { data: multiSeriesData },
    })

    const svg = wrapper.find('.enpii-line-chart__svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toContain('Line chart')
  })
})

describe('EnpiiAreaChart', () => {
  it('renders one area path and one line path per series', () => {
    const wrapper = mount(EnpiiAreaChart, {
      props: { data: multiSeriesData, labels: multiSeriesLabels },
    })

    expect(wrapper.findAll('.enpii-area-chart__area')).toHaveLength(2)
    expect(wrapper.findAll('.enpii-area-chart__line')).toHaveLength(2)
  })

  it('renders data points equal to series data length', () => {
    const wrapper = mount(EnpiiAreaChart, {
      props: { data: multiSeriesData },
    })

    const points = wrapper.findAll('.enpii-area-chart__point')
    expect(points).toHaveLength(10)
  })

  it('renders gridlines', () => {
    const wrapper = mount(EnpiiAreaChart, {
      props: { data: multiSeriesData },
    })

    expect(wrapper.findAll('.enpii-area-chart__grid').length).toBeGreaterThanOrEqual(4)
  })

  it('has accessible aria-label on svg', () => {
    const wrapper = mount(EnpiiAreaChart, {
      props: { data: multiSeriesData },
    })

    const svg = wrapper.find('.enpii-area-chart__svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toContain('Area chart')
  })
})

describe('EnpiiDonutChart', () => {
  it('renders one circle segment per data item', () => {
    const wrapper = mount(EnpiiDonutChart, {
      props: { data: donutData },
    })

    expect(wrapper.findAll('.enpii-donut-chart__segment')).toHaveLength(3)
  })

  it('renders a legend with all items', () => {
    const wrapper = mount(EnpiiDonutChart, {
      props: { data: donutData },
    })

    const items = wrapper.findAll('.enpii-donut-chart__legend-item')
    expect(items).toHaveLength(3)
    expect(items[0].text()).toContain('Category A')
    expect(items[1].text()).toContain('Category B')
  })

  it('shows percentages in legend', () => {
    const wrapper = mount(EnpiiDonutChart, {
      props: { data: donutData },
    })

    const values = wrapper.findAll('.enpii-donut-chart__legend-value')
    expect(values).toHaveLength(3)
    expect(values[0].text()).toBe('40%')
    expect(values[1].text()).toBe('30%')
  })

  it('renders swatches matching segment colors', () => {
    const wrapper = mount(EnpiiDonutChart, {
      props: { data: donutData },
    })

    const swatches = wrapper.findAll('.enpii-donut-chart__swatch')
    expect(swatches).toHaveLength(3)
  })

  it('has accessible aria-label on svg', () => {
    const wrapper = mount(EnpiiDonutChart, {
      props: { data: donutData },
    })

    const svg = wrapper.find('.enpii-donut-chart__svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toContain('Donut chart')
  })
})

describe('EnpiiSparkline', () => {
  it('renders a single line path', () => {
    const wrapper = mount(EnpiiSparkline, {
      props: { data: sparklineData },
    })

    expect(wrapper.findAll('.enpii-sparkline__line')).toHaveLength(1)
  })

  it('renders an area path', () => {
    const wrapper = mount(EnpiiSparkline, {
      props: { data: sparklineData },
    })

    expect(wrapper.findAll('.enpii-sparkline__area')).toHaveLength(1)
  })

  it('has no axis labels', () => {
    const wrapper = mount(EnpiiSparkline, {
      props: { data: sparklineData },
    })

    expect(wrapper.findAll('text')).toHaveLength(0)
  })

  it('renders inline with max-width', () => {
    const wrapper = mount(EnpiiSparkline, {
      props: { data: sparklineData },
    })

    expect(wrapper.classes()).toContain('enpii-sparkline')
  })

  it('accepts custom color prop', () => {
    const wrapper = mount(EnpiiSparkline, {
      props: { data: sparklineData, color: 'var(--enpii-color-secondary)' },
    })

    const line = wrapper.find('.enpii-sparkline__line')
    expect(line.attributes('style')).toContain('var(--enpii-color-secondary)')
  })
})

describe('EnpiiBarChart', () => {
  it('renders rect bars matching data count', () => {
    const wrapper = mount(EnpiiBarChart, {
      props: { data: multiSeriesData, labels: multiSeriesLabels },
    })

    expect(wrapper.findAll('.enpii-bar-chart__bar')).toHaveLength(10)
  })

  it('renders gridlines and accessible svg', () => {
    const wrapper = mount(EnpiiBarChart, {
      props: { data: multiSeriesData, labels: multiSeriesLabels },
    })

    expect(wrapper.findAll('.enpii-bar-chart__grid').length).toBeGreaterThanOrEqual(4)
    const svg = wrapper.find('.enpii-bar-chart__svg')
    expect(svg.attributes('role')).toBe('img')
    expect(svg.attributes('aria-label')).toContain('Bar chart')
  })
})

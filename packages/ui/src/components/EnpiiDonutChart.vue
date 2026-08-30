<script setup>
import { computed } from 'vue'

const FALLBACK_COLORS = [
  'var(--enpii-color-primary)',
  'var(--enpii-color-secondary)',
  'var(--enpii-color-warning-text)',
  'var(--enpii-color-danger-text)',
]

const props = defineProps({
  data: { type: Array, required: true },
  labels: { type: Array, default: () => [] },
  height: { type: Number, default: 200 },
})

const size = computed(() => Math.max(props.height || 200, 100))
const STROKE_WIDTH = 28
const radius = computed(() => Math.max((size.value - STROKE_WIDTH) / 2 - 4, 0))
const circumference = computed(() => 2 * Math.PI * radius.value)

const total = computed(() => {
  return (props.data || []).reduce((sum, item) => sum + (Number(item.value) || 0), 0)
})

const segments = computed(() => {
  if (!props.data?.length || total.value <= 0) return []
  let cumulative = 0
  return props.data.map((item, index) => {
    const value = Number(item.value) || 0
    const fraction = value / total.value
    const arc = fraction * circumference.value
    const result = {
      key: item.key || item.label || `segment-${index}`,
      label: item.label || props.labels?.[index] || `Item ${index + 1}`,
      color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      value,
      dasharray: `${arc} ${circumference.value - arc}`,
      dashoffset: -cumulative,
      percentage: Math.round(fraction * 100),
    }
    cumulative += arc
    return result
  })
})

const ariaLabel = computed(() => {
  const names = segments.value.map((item) => item.label).join(', ')
  return `Donut chart: ${names || 'no data'}`
})
</script>

<template>
  <div class="enpii-donut-chart">
    <svg :viewBox="`0 0 ${size} ${size}`" class="enpii-donut-chart__svg" role="img" :aria-label="ariaLabel">
      <g :transform="`rotate(-90 ${size / 2} ${size / 2})`">
        <circle
          v-for="segment in segments"
          :key="segment.key"
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          :stroke-width="STROKE_WIDTH"
          :stroke-dasharray="segment.dasharray"
          :stroke-dashoffset="segment.dashoffset"
          class="enpii-donut-chart__segment"
          :style="{ stroke: segment.color }"
        >
          <title>{{ segment.label }}: {{ segment.value }} ({{ segment.percentage }}%)</title>
        </circle>
      </g>
    </svg>
    <ul class="enpii-donut-chart__legend">
      <li v-for="segment in segments" :key="segment.key" class="enpii-donut-chart__legend-item">
        <span class="enpii-donut-chart__swatch" :style="{ background: segment.color }" />
        <span>{{ segment.label }}</span>
        <span class="enpii-donut-chart__legend-value">{{ segment.percentage }}%</span>
      </li>
    </ul>
  </div>
</template>

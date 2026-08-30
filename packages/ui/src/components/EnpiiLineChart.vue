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
  height: { type: Number, default: 240 },
})

const W = 720
const PAD = { top: 16, right: 16, bottom: 36, left: 48 }
const H = computed(() => Math.max(props.height || 240, 160))
const plotW = W - PAD.left - PAD.right
const plotH = computed(() => H.value - PAD.top - PAD.bottom)

const maxDataLength = computed(() => {
  if (!props.data?.length) return 1
  return Math.max(...props.data.map((item) => item.data?.length || 0), 1)
})

const allValues = computed(() => {
  if (!props.data?.length) return [0]
  return props.data.flatMap((item) => (item.data || []).map(Number))
})

const yMax = computed(() => niceCeiling(Math.max(...allValues.value, 1)))

function xAt(index) {
  const n = maxDataLength.value
  if (n <= 1) return PAD.left + plotW / 2
  return PAD.left + (index / (n - 1)) * plotW
}

function yAt(value) {
  return PAD.top + plotH.value - (value / yMax.value) * plotH.value
}

function niceCeiling(value) {
  if (value <= 0) return 1
  const exp = 10 ** Math.floor(Math.log10(value))
  const n = value / exp
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return nice * exp
}

function formatValue(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
  return String(Math.round(value))
}

const series = computed(() => {
  if (!props.data?.length) return []
  return props.data.map((item, index) => ({
    key: item.key || item.label || `series-${index}`,
    label: item.label || `Series ${index + 1}`,
    color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    points: (item.data || []).map((value, i) => ({
      value: Number(value) || 0,
      x: xAt(i),
      y: yAt(Number(value) || 0),
    })),
  }))
})

function toLinePath(points) {
  return points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
}

const gridTicks = computed(() => {
  return Array.from({ length: 5 }, (_, i) => (yMax.value * i) / 4)
})

const xLabelStep = computed(() => {
  const n = props.labels.length
  if (n <= 8) return 1
  return Math.ceil(n / 8)
})

const xLabels = computed(() => {
  return props.labels.map((label, i) => ({
    label,
    x: xAt(i),
    show: i % xLabelStep.value === 0,
  }))
})

const ariaLabel = computed(() => {
  const names = series.value.map((item) => item.label).join(', ')
  return `Line chart: ${names || 'no data'}`
})
</script>

<template>
  <div class="enpii-line-chart">
    <svg :viewBox="`0 0 ${W} ${H}`" class="enpii-line-chart__svg" role="img" :aria-label="ariaLabel">
      <line
        v-for="(tick, i) in gridTicks"
        :key="`grid-${i}`"
        :x1="PAD.left"
        :x2="W - PAD.right"
        :y1="yAt(tick)"
        :y2="yAt(tick)"
        class="enpii-line-chart__grid"
      />
      <text
        v-for="(tick, i) in gridTicks"
        :key="`y-${i}`"
        :x="PAD.left - 8"
        :y="yAt(tick)"
        text-anchor="end"
        dominant-baseline="middle"
        class="enpii-line-chart__axis-text"
      >{{ formatValue(tick) }}</text>
      <template v-for="(item, i) in xLabels" :key="`x-${i}`">
        <text
          v-if="item.show"
          :x="item.x"
          :y="H - 8"
          text-anchor="middle"
          class="enpii-line-chart__axis-text"
        >{{ item.label }}</text>
      </template>
      <g v-for="item in series" :key="item.key">
        <path :d="toLinePath(item.points)" class="enpii-line-chart__line" :style="{ stroke: item.color }" />
        <circle
          v-for="(point, i) in item.points"
          :key="`point-${i}`"
          :cx="point.x"
          :cy="point.y"
          r="4"
          class="enpii-line-chart__point"
          :style="{ fill: item.color }"
        >
          <title>{{ item.label }}: {{ labels[i] || i }} — {{ point.value }}</title>
        </circle>
      </g>
    </svg>
  </div>
</template>

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

function niceCeiling(value) {
  if (value <= 0) return 1
  const exp = 10 ** Math.floor(Math.log10(value))
  const n = value / exp
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
  return nice * exp
}

function yAt(value) {
  return PAD.top + plotH.value - (value / yMax.value) * plotH.value
}

function formatValue(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
  return String(Math.round(value))
}

const seriesCount = computed(() => Math.max(props.data?.length || 1, 1))

const groups = computed(() => {
  const n = maxDataLength.value
  const band = plotW / n
  const groupPad = Math.max(1, band * 0.1)
  const groupW = band - groupPad * 2
  const barW = Math.max(2, (groupW - (seriesCount.value - 1) * 2) / seriesCount.value)

  return Array.from({ length: n }, (_, i) => {
    const groupX = PAD.left + i * band + groupPad
    const bars = (props.data || []).map((s, sIdx) => {
      const val = Number(s.data?.[i] || 0)
      const barH = (val / yMax.value) * plotH.value
      const barX = groupX + sIdx * (barW + 2)
      const barY = PAD.top + plotH.value - barH
      return {
        seriesLabel: s.label || `Series ${sIdx + 1}`,
        color: s.color || FALLBACK_COLORS[sIdx % FALLBACK_COLORS.length],
        value: val,
        x: barX,
        y: barY,
        w: barW,
        h: Math.max(0, barH),
      }
    })
    return {
      index: i,
      label: props.labels[i] || `${i + 1}`,
      x: PAD.left + i * band + band / 2,
      bars,
    }
  })
})

const gridTicks = computed(() => {
  return Array.from({ length: 5 }, (_, i) => (yMax.value * i) / 4)
})

const xLabelStep = computed(() => {
  const n = props.labels.length
  if (n <= 8) return 1
  return Math.ceil(n / 8)
})

const ariaLabel = computed(() => {
  const names = (props.data || []).map((item) => item.label).join(', ')
  return `Bar chart: ${names || 'no data'}`
})
</script>

<template>
  <div class="enpii-bar-chart">
    <svg :viewBox="`0 0 ${W} ${H}`" class="enpii-bar-chart__svg" role="img" :aria-label="ariaLabel">
      <line
        v-for="(tick, i) in gridTicks"
        :key="`grid-${i}`"
        :x1="PAD.left"
        :x2="W - PAD.right"
        :y1="yAt(tick)"
        :y2="yAt(tick)"
        class="enpii-bar-chart__grid"
      />
      <text
        v-for="(tick, i) in gridTicks"
        :key="`y-${i}`"
        :x="PAD.left - 8"
        :y="yAt(tick)"
        text-anchor="end"
        dominant-baseline="middle"
        class="enpii-bar-chart__axis-text"
      >{{ formatValue(tick) }}</text>
      <template v-for="(g, i) in groups" :key="`x-${i}`">
        <text
          v-if="i % xLabelStep === 0"
          :x="g.x"
          :y="H - 8"
          text-anchor="middle"
          class="enpii-bar-chart__axis-text"
        >{{ g.label }}</text>
      </template>
      <g v-for="g in groups" :key="`group-${g.index}`">
        <rect
          v-for="(b, bIdx) in g.bars"
          :key="`bar-${g.index}-${bIdx}`"
          :x="b.x"
          :y="b.y"
          :width="b.w"
          :height="b.h"
          class="enpii-bar-chart__bar"
          :style="{ fill: b.color }"
          rx="2"
        >
          <title>{{ b.seriesLabel }}: {{ g.label }} — {{ b.value }}</title>
        </rect>
      </g>
    </svg>
  </div>
</template>

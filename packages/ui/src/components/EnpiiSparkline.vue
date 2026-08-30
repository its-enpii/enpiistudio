<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true },
  labels: { type: Array, default: () => [] },
  height: { type: Number, default: 48 },
  color: { type: String, default: '' },
})

const W = 100
const PAD = 4
const H = computed(() => Math.max(props.height || 48, 24))
const resolvedColor = computed(() => props.color || 'var(--enpii-color-primary)')

const points = computed(() => {
  if (!props.data?.length) return []
  const values = props.data.map(Number)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const n = values.length
  return values.map((value, i) => ({
    value,
    x: n <= 1 ? W / 2 : PAD + (i / (n - 1)) * (W - 2 * PAD),
    y: PAD + (1 - (value - min) / range) * (H.value - 2 * PAD),
  }))
})

const linePath = computed(() => {
  return points.value.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
})

const areaPath = computed(() => {
  if (!points.value.length) return ''
  const baseline = H.value - PAD
  return `${linePath.value} L ${points.value[points.value.length - 1].x} ${baseline} L ${points.value[0].x} ${baseline} Z`
})
</script>

<template>
  <div class="enpii-sparkline">
    <svg :viewBox="`0 0 ${W} ${H}`" class="enpii-sparkline__svg" role="img" aria-label="Sparkline">
      <path :d="areaPath" class="enpii-sparkline__area" :style="{ fill: resolvedColor }" />
      <path :d="linePath" class="enpii-sparkline__line" :style="{ stroke: resolvedColor }" />
    </svg>
  </div>
</template>

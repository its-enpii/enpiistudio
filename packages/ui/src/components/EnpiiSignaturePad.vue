<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useT } from '../composables/useT'

const t = useT()

const props = withDefaults(defineProps<{
  penColor?: string
  penWidth?: number
  disabled?: boolean
  backgroundColor?: string
}>(), {
  penColor: '#191c1e',
  penWidth: 2,
  disabled: false,
  backgroundColor: undefined,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const isEmpty = ref(true)

const strokes = ref<{ points: Array<{ x: number; y: number }>; color: string; width: number }[]>([])
const currentStroke = ref<{ x: number; y: number }[]>([])
const isDrawing = ref(false)
const lastPoint = ref<{ x: number; y: number } | null>(null)

function getContext(): CanvasRenderingContext2D | null {
  return canvasRef.value?.getContext('2d') ?? null
}

function resizeCanvas() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return
  const rect = container.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
  const ctx = getContext()
  if (!ctx) return
  ctx.scale(dpr, dpr)
  redraw()
}

function getPoint(event: PointerEvent): { x: number; y: number } | null {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

function drawStroke(stroke: { points: Array<{ x: number; y: number }>; color: string; width: number }) {
  const ctx = getContext()
  if (!ctx || stroke.points.length < 2) return
  ctx.strokeStyle = stroke.color
  ctx.lineWidth = stroke.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  const first = stroke.points[0]
  ctx.moveTo(first.x, first.y)
  for (let i = 1; i < stroke.points.length - 1; i++) {
    const midX = (stroke.points[i].x + stroke.points[i + 1].x) / 2
    const midY = (stroke.points[i].y + stroke.points[i + 1].y) / 2
    ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, midX, midY)
  }
  const last = stroke.points[stroke.points.length - 1]
  ctx.lineTo(last.x, last.y)
  ctx.stroke()
}

function drawBackground() {
  const ctx = getContext()
  if (!ctx || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  ctx.fillStyle = props.backgroundColor
    ?? getComputedStyle(document.documentElement).getPropertyValue('--enpii-color-surface-container-lowest').trim()
    ?? 'rgb(255 255 255)'
  ctx.fillRect(0, 0, rect.width, rect.height)
}

function redraw() {
  const ctx = getContext()
  if (!ctx) return
  ctx.clearRect(0, 0, canvasRef.value?.width ?? 0, canvasRef.value?.height ?? 0)
  drawBackground()
  for (const stroke of strokes.value) {
    drawStroke(stroke)
  }
  if (isDrawing.value && currentStroke.value.length > 1) {
    drawStroke({ points: currentStroke.value, color: props.penColor, width: props.penWidth })
  }
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) return
  event.preventDefault()
  isDrawing.value = true
  const point = getPoint(event)
  if (point) {
    currentStroke.value = [point]
    lastPoint.value = point
  }
  canvasRef.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!isDrawing.value || props.disabled) return
  const point = getPoint(event)
  if (!point || !lastPoint.value) return
  const dist = Math.hypot(point.x - lastPoint.value.x, point.y - lastPoint.value.y)
  if (dist < 1) return
  currentStroke.value.push(point)
  lastPoint.value = point
  const ctx = getContext()
  if (!ctx || currentStroke.value.length < 3) return
  const n = currentStroke.value.length
  const p0 = currentStroke.value[n - 3]
  const p1 = currentStroke.value[n - 2]
  const p2 = currentStroke.value[n - 1]
  const midX = (p1.x + p2.x) / 2
  const midY = (p1.y + p2.y) / 2
  ctx.strokeStyle = props.penColor
  ctx.lineWidth = props.penWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2)
  ctx.quadraticCurveTo(p1.x, p1.y, midX, midY)
  ctx.stroke()
  isEmpty.value = false
}

function onPointerUp() {
  if (!isDrawing.value) return
  isDrawing.value = false
  if (currentStroke.value.length > 1) {
    strokes.value.push({ points: [...currentStroke.value], color: props.penColor, width: props.penWidth })
    isEmpty.value = false
  }
  currentStroke.value = []
  lastPoint.value = null
}

function clear() {
  strokes.value = []
  currentStroke.value = []
  isEmpty.value = true
  redraw()
}

function undo() {
  strokes.value.pop()
  isEmpty.value = strokes.value.length === 0
  redraw()
}

function toDataURL(type = 'image/png', quality?: number): string {
  return canvasRef.value?.toDataURL(type, quality) ?? ''
}

defineExpose({ clear, isEmpty, toDataURL, undo })

const resizeObserver = new ResizeObserver(() => {
  resizeCanvas()
})

onMounted(() => {
  resizeCanvas()
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
})
</script>

<template>
  <div
    ref="containerRef"
    class="enpii-signature-pad"
    :class="{ 'enpii-signature-pad--disabled': disabled }"
  >
    <canvas
      ref="canvasRef"
      class="enpii-signature-pad__canvas"
      :aria-label="t('signaturePad.canvasLabel')"
      :aria-disabled="disabled || undefined"
      :tabindex="disabled ? -1 : 0"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    />
    <div class="enpii-signature-pad__actions">
      <button
        type="button"
        class="enpii-signature-pad__action"
        :disabled="disabled || isEmpty"
        :aria-label="t('signaturePad.undo')"
        @click="undo"
      >
        {{ t('signaturePad.undo') }}
      </button>
      <button
        type="button"
        class="enpii-signature-pad__action"
        :disabled="disabled || isEmpty"
        :aria-label="t('signaturePad.clear')"
        @click="clear"
      >
        {{ t('signaturePad.clear') }}
      </button>
    </div>
  </div>
</template>

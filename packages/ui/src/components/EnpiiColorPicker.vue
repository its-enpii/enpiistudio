<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useT } from '../composables/useT'
import { useId } from 'vue'
import EnpiiLabel from './EnpiiLabel.vue'

const t = useT()
const hexInputId = useId()

const model = defineModel<string>({ default: '#4f46e5' })

const props = withDefaults(defineProps<{
  showAlpha?: boolean
  swatches?: string[]
  disabled?: boolean
}>(), {
  showAlpha: false,
  swatches: () => [
    '#4f46e5', '#4338ca', '#006d3d', '#ba1a1a',
    '#b45309', '#334155', 'rgb(253 253 252)', '#191c1e',
  ],
  disabled: false,
})

const swatchTokens = {
  '#4f46e5': '--color-picker-swatch-indigo-600',
  '#4338ca': '--color-picker-swatch-indigo-700',
  '#006d3d': '--color-picker-swatch-green-700',
  '#ba1a1a': '--color-picker-swatch-red-600',
  '#b45309': '--color-picker-swatch-amber-700',
  '#334155': '--color-picker-swatch-slate-700',
  'rgb(253 253 252)': '--color-picker-swatch-light',
  '#191c1e': '--color-picker-swatch-ink',
} as const

function swatchToken(color: string): string {
  const token = swatchTokens[color as keyof typeof swatchTokens]
  if (!token) {
    throw new Error(`Color picker swatches must map to a semantic token: ${color}`)
  }
  return token
}

const emit = defineEmits<{
  change: [value: string]
}>()

const hexInput = ref('')
const hue = ref(0)
const saturation = ref(100)
const brightness = ref(100)
const alpha = ref(1)

const areaRef = ref<HTMLDivElement | null>(null)
const hueRef = ref<HTMLDivElement | null>(null)
const alphaRef = ref<HTMLDivElement | null>(null)
const dragging = ref<'area' | 'hue' | 'alpha' | null>(null)

function hexToHsv(hex: string): { h: number; s: number; v: number; a: number } {
  let cleaned = hex.replace(/^#/, '')
  let a = 1
  if (cleaned.length === 8) {
    a = parseInt(cleaned.slice(6, 8), 16) / 255
    cleaned = cleaned.slice(0, 6)
  } else if (cleaned.length === 4) {
    a = parseInt(cleaned[3] + cleaned[3], 16) / 255
    cleaned = cleaned.slice(0, 3)
  }
  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2]
  }
  const r = parseInt(cleaned.slice(0, 2), 16) / 255
  const g = parseInt(cleaned.slice(2, 4), 16) / 255
  const b = parseInt(cleaned.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  const s = max === 0 ? 0 : (d / max) * 100
  const v = max * 100
  return { h, s, v, a }
}

function hsvToHex(h: number, s: number, v: number, a: number): string {
  const sv = s / 100
  const vv = v / 100
  const c = vv * sv
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vv - c
  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else { r = c; b = x }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0')
  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  if (a < 1) {
    hex += Math.round(a * 255).toString(16).padStart(2, '0')
  }
  return hex
}

const currentHex = computed(() => hsvToHex(hue.value, saturation.value, brightness.value, alpha.value))
const hueColor = computed(() => hsvToHex(hue.value, 100, 100, 1))

function syncFromModel(val: string) {
  if (!val || !/^#([0-9a-fA-F]{3,8})$/.test(val)) return
  const hsv = hexToHsv(val)
  hue.value = hsv.h
  saturation.value = hsv.s
  brightness.value = hsv.v
  alpha.value = hsv.a
  hexInput.value = val
}

watch(model, (val) => {
  syncFromModel(val)
}, { immediate: true })

watch(currentHex, (val) => {
  hexInput.value = val
})

function onHexInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  const rawValue = target.value.startsWith('#') ? target.value : `#${target.value}`
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8}|[0-9a-fA-F]{3})$/.test(rawValue)) {
    syncFromModel(rawValue)
    model.value = currentHex.value
    emit('change', currentHex.value)
  }
}

function selectSwatch(color: string) {
  if (props.disabled) return
  syncFromModel(color)
  model.value = currentHex.value
  emit('change', currentHex.value)
}

function handleAreaPointer(event: PointerEvent) {
  if (props.disabled || !areaRef.value) return
  const rect = areaRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
  saturation.value = x * 100
  brightness.value = (1 - y) * 100
}

function handleHuePointer(event: PointerEvent) {
  if (props.disabled || !hueRef.value) return
  const rect = hueRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  hue.value = x * 360
}

function handleAlphaPointer(event: PointerEvent) {
  if (props.disabled || !alphaRef.value) return
  const rect = alphaRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  alpha.value = Math.round(x * 100) / 100
}

function onPointerDown(target: 'area' | 'hue' | 'alpha', event: PointerEvent) {
  if (props.disabled) return
  event.preventDefault()
  dragging.value = target
  if (target === 'area') handleAreaPointer(event)
  else if (target === 'hue') handleHuePointer(event)
  else handleAlphaPointer(event)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  if (dragging.value === 'area') handleAreaPointer(event)
  else if (dragging.value === 'hue') handleHuePointer(event)
  else handleAlphaPointer(event)
}

function onPointerUp() {
  dragging.value = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

function onHueKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const step = event.shiftKey ? 10 : 1
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault()
    hue.value = Math.min(360, hue.value + step)
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault()
    hue.value = Math.max(0, hue.value - step)
  }
}

function onAlphaKeydown(event: KeyboardEvent) {
  if (props.disabled) return
  const step = event.shiftKey ? 0.1 : 0.01
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault()
    alpha.value = Math.min(1, Math.round((alpha.value + step) * 100) / 100)
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault()
    alpha.value = Math.max(0, Math.round((alpha.value - step) * 100) / 100)
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<template>
  <div class="enpii-color-picker flex w-full max-w-80 flex-col gap-field-gap p-4 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-control bg-surface-container-lowest text-on-surface shadow-control" :class="{ 'enpii-color-picker--disabled opacity-60 pointer-events-none': disabled }">
    <div
      ref="areaRef"
      class="enpii-color-picker__area relative w-full aspect-[16/9] min-h-32 overflow-hidden rounded-[calc(var(--radius-control)-0.25rem)] cursor-crosshair touch-none"
      :style="{ background: `linear-gradient(to top, rgb(13 13 13), transparent), linear-gradient(to right, rgb(253 253 252), ${hueColor})` }"
      :aria-label="t('colorPicker.areaLabel')"
      @pointerdown="onPointerDown('area', $event)"
    >
      <div
        class="enpii-color-picker__thumb absolute w-[1.125rem] h-[1.125rem] border-2 border-solid border-surface-container-lowest rounded-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_1px_3px_rgb(0_0_0/40%)]"
        :style="{ left: `${saturation}%`, top: `${100 - brightness}%` }"
        :aria-label="t('colorPicker.thumbLabel')"
      />
    </div>

    <div class="enpii-color-picker__sliders flex flex-col gap-1.5">
      <div
        ref="hueRef"
        class="enpii-color-picker__slider enpii-color-picker__slider--hue relative w-full h-8 min-h-10 rounded-control-sm cursor-pointer touch-none bg-[linear-gradient(to_right,rgb(255_0_0),rgb(255_255_0),rgb(0_255_0),rgb(0_255_255),rgb(0_0_255),rgb(255_0_255),rgb(255_0_0))] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-style:solid] focus-visible:[outline-offset:var(--focus-offset)] focus-visible:outline-focus"
        role="slider"
        tabindex="0"
        :aria-label="t('colorPicker.hueLabel')"
        :aria-valuemin="0"
        :aria-valuemax="360"
        :aria-valuenow="Math.round(hue)"
        :aria-disabled="disabled || undefined"
        @pointerdown="onPointerDown('hue', $event)"
        @keydown="onHueKeydown"
      >
        <div
          class="enpii-color-picker__slider-thumb absolute top-1/2 w-[0.875rem] h-[0.875rem] border-2 border-solid border-surface-container-lowest rounded-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_1px_3px_rgb(0_0_0/40%)]"
          :style="{ left: `${(hue / 360) * 100}%` }"
        />
      </div>

      <div
        v-if="showAlpha"
        ref="alphaRef"
        class="enpii-color-picker__slider enpii-color-picker__slider--alpha relative w-full h-8 min-h-10 rounded-control-sm cursor-pointer touch-none bg-[linear-gradient(to_right,var(--cp-alpha-start),var(--cp-alpha-end))] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-style:solid] focus-visible:[outline-offset:var(--focus-offset)] focus-visible:outline-focus"
        role="slider"
        tabindex="0"
        :aria-label="t('colorPicker.alphaLabel')"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="Math.round(alpha * 100)"
        :aria-disabled="disabled || undefined"
        :style="{ '--cp-alpha-start': hsvToHex(hue, saturation, brightness, 0), '--cp-alpha-end': hsvToHex(hue, saturation, brightness, 1) }"
        @pointerdown="onPointerDown('alpha', $event)"
        @keydown="onAlphaKeydown"
      >
        <div
          class="enpii-color-picker__slider-thumb absolute top-1/2 w-[0.875rem] h-[0.875rem] border-2 border-solid border-surface-container-lowest rounded-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_1px_3px_rgb(0_0_0/40%)]"
          :style="{ left: `${alpha * 100}%` }"
        />
      </div>
    </div>

    <div class="enpii-color-picker__inputs flex items-center gap-2">
      <div class="enpii-color-picker__preview w-10 h-10 min-h-10 flex-none border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-[calc(var(--radius-control)-0.25rem)]" :style="{ background: currentHex }" :aria-label="t('colorPicker.previewLabel')" />
      <div class="enpii-color-picker__hex-label flex-1">
        <EnpiiLabel :for="hexInputId" hidden size="sm" class="enpii-color-picker__hex-input-label">{{ t('colorPicker.hexLabel') }}</EnpiiLabel>
        <input
          :id="hexInputId"
          v-model="hexInput"
          type="text"
          class="enpii-color-picker__hex-input w-full min-h-control-sm px-3 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-[calc(var(--radius-control)-0.25rem)] bg-surface-container-lowest text-on-surface font-inherit text-control [transition-property:border-color,box-shadow] duration-fast ease-emphasized focus-visible:outline-none focus-visible:border-primary-container focus-visible:[box-shadow:var(--shadow-focus)] disabled:opacity-60 disabled:cursor-not-allowed"
          maxlength="9"
          :disabled="disabled"
          :placeholder="t('colorPicker.hexPlaceholder')"
          @change="onHexInputChange"
        >
      </div>
    </div>

    <div v-if="swatches.length" class="enpii-color-picker__swatches flex flex-wrap gap-1.5" :aria-label="t('colorPicker.swatchesLabel')">
      <button
        v-for="color in swatches"
        :key="color"
        type="button"
        class="enpii-color-picker__swatch w-10 h-10 min-h-10 p-0 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-[calc(var(--radius-control)-0.25rem)] cursor-pointer [transition-property:box-shadow,transform] duration-fast ease-emphasized motion-reduce:transition-none hover:enabled:[box-shadow:var(--shadow-focus)] active:enabled:[box-shadow:var(--shadow-control-pressed)] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-style:solid] focus-visible:[outline-offset:var(--focus-offset)] focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'enpii-color-picker__swatch--active shadow-[inset_0_0_0_2px_var(--color-surface-container-lowest),0_0_0_2px_var(--color-primary)]': currentHex === color }"
        :style="{ backgroundColor: `var(${swatchToken(color)})` }"
        :aria-label="t('colorPicker.selectSwatch', { color })"
        :disabled="disabled"
        @click="selectSwatch(color)"
      />
    </div>
  </div>
</template>

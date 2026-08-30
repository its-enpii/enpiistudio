<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  includeMargin?: boolean
}>(), {
  size: 128,
  level: 'M',
  includeMargin: false,
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

function render() {
  if (!canvasRef.value || !props.value) return
  QRCode.toCanvas(canvasRef.value, props.value, {
    width: props.size,
    margin: props.includeMargin ? 4 : 0,
    errorCorrectionLevel: props.level,
    color: { dark: '#000000', light: '#ffffff' },
  })
}

watch(() => [props.value, props.size, props.level, props.includeMargin], render, { immediate: true })
onMounted(render)

function download(format: 'png' | 'jpeg' = 'png') {
  if (!canvasRef.value) return
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const link = document.createElement('a')
  link.download = `qr-code.${format}`
  link.href = canvasRef.value.toDataURL(mimeType)
  link.click()
}

defineExpose({ download })
</script>

<template>
  <div class="enpii-qr-code">
    <canvas
      ref="canvasRef"
      class="enpii-qr-code__canvas"
      :width="size"
      :height="size"
      role="img"
      :aria-label="`QR code: ${value}`"
    />
  </div>
</template>

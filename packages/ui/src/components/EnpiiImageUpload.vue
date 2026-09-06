<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useT } from '../composables/useT'

type ImageUploadItem = {
  file: File
  dataUrl?: string
}

const t = useT()

const props = withDefaults(
  defineProps<{
    modelValue?: Array<File | ImageUploadItem>
    accept?: string
    maxFiles?: number
    maxSize?: number
    multiple?: boolean
    aspectRatio?: number
    cropEnabled?: boolean
    disabled?: boolean
  }>(),
  {
    modelValue: () => [],
    accept: 'image/*',
    maxFiles: undefined,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    aspectRatio: undefined,
    cropEnabled: true,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Array<File | ImageUploadItem>]
  error: [payload: { file: File; message: string }]
}>()

const inputId = useId()
const inputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const errors = ref<Array<{ id: string; message: string }>>([])
const normalizedItems = ref<ImageUploadItem[]>([])

const cropOpen = ref(false)
const cropCanvasRef = ref<HTMLCanvasElement | null>(null)
const cropPanelRef = ref<HTMLElement | null>(null)
const cropImage = ref<HTMLImageElement | null>(null)
const cropFileName = ref('')
const zoom = ref(1)
const cropOffset = ref({ x: 0, y: 0 })
const cropIndex = ref(-1)
const isDraggingCrop = ref(false)

let errorSequence = 0
const acceptedTypes = computed(() => props.accept
  .split(',')
  .map((type) => type.trim().toLowerCase())
  .filter(Boolean))

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFile = (item: File | ImageUploadItem) => (item instanceof File ? item : item.file)
const getDataUrl = (item: File | ImageUploadItem) => (item instanceof File ? undefined : item.dataUrl)

function matchesAccept(file: File) {
  const fileType = file.type.toLowerCase()
  return acceptedTypes.value.some((accepted) => {
    if (accepted === 'image/*') return fileType.startsWith('image/')
    if (accepted.endsWith('/*')) return fileType.startsWith(accepted.slice(0, -1))
    if (accepted.startsWith('.')) return file.name.toLowerCase().endsWith(accepted)
    return fileType === accepted
  })
}

function addError(file: File, message: string) {
  errors.value.push({ id: `error-${++errorSequence}`, message })
  emit('error', { file, message })
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    resolve(`data:${file.type || 'application/octet-stream'};base64,mock-${encodeURIComponent(file.name)}`)
  })
}

function normalize(value: Array<File | ImageUploadItem>) {
  return value.map((item) => ({
    file: getFile(item),
    dataUrl: getDataUrl(item),
  }))
}

function watchModelValue() {
  normalizedItems.value = normalize(props.modelValue)
}

watch(
  () => props.modelValue,
  async () => {
    await nextTick()
    watchModelValue()
  },
  { immediate: true, deep: true },
)

watch(normalizedItems, () => {}, { immediate: true })

function syncModel(value: Array<File | ImageUploadItem>) {
  emit('update:modelValue', value)
  watchModelValue()
}

async function addFiles(incomingFiles: File[]) {
  if (props.disabled) return
  const validFiles: File[] = []
  let limitReached = false
  const remaining = props.maxFiles === undefined ? Infinity : props.maxFiles - props.modelValue.length

  for (const file of incomingFiles) {
    if (!matchesAccept(file)) {
      addError(file, t('imageUpload.invalidType', { name: file.name }))
      continue
    }
    if (file.size > props.maxSize) {
      addError(file, t('imageUpload.maxSize', { name: file.name, size: formatSize(props.maxSize) }))
      continue
    }
    if (validFiles.length >= remaining) {
      limitReached = true
      continue
    }
    validFiles.push(file)
  }

  if (limitReached && props.maxFiles !== undefined) {
    addError(incomingFiles[incomingFiles.length - 1], t('imageUpload.maxFiles', { count: props.maxFiles }))
  }

  if (!validFiles.length) return

  const entries = await Promise.all(validFiles.map(async (file) => ({
    file,
    dataUrl: await readAsDataUrl(file),
  })))

  syncModel([...props.modelValue, ...entries])
}

function onInputChange(event: Event) {
  const target = event.target as HTMLInputElement
  void addFiles(Array.from(target.files ?? []))
  target.value = ''
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  void addFiles(Array.from(event.dataTransfer?.files ?? []))
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (!props.disabled) dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function openFilePicker() {
  if (!props.disabled) inputRef.value?.click()
}

function removeItem(index: number) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  syncModel(next)
}

function clearErrors() {
  errors.value = []
}

function openCrop(index: number) {
  const item = normalizedItems.value[index]
  if (!item?.dataUrl || props.disabled) return
  cropIndex.value = index
  cropFileName.value = item.file.name
  cropOpen.value = true
  void nextTick(loadCropImage)
}

function loadCropImage() {
  const item = normalizedItems.value[cropIndex.value]
  if (!item?.dataUrl) return
  const image = new Image()
  image.onload = () => {
    cropImage.value = image
    zoom.value = 1
    cropOffset.value = { x: 0, y: 0 }
    drawCrop()
  }
  image.src = item.dataUrl
}

function drawCrop() {
  const canvas = cropCanvasRef.value
  const image = cropImage.value
  const context = canvas?.getContext('2d')
  if (!canvas || !image || !context) return
  const size = Math.min(canvas.clientWidth || 280, canvas.clientHeight || 280)
  const dpr = window.devicePixelRatio || 1
  canvas.width = size * dpr
  canvas.height = size * dpr
  context.scale(dpr, dpr)
  const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface-container-lowest').trim()
  context.fillStyle = surface || 'rgb(253 253 252)'
  context.fillRect(0, 0, size, size)
  const scaledWidth = image.width * zoom.value
  const scaledHeight = image.height * zoom.value
  const x = (size - scaledWidth) / 2 + cropOffset.value.x
  const y = (size - scaledHeight) / 2 + cropOffset.value.y
  context.drawImage(image, x, y, scaledWidth, scaledHeight)
}

function getPointer(event: PointerEvent) {
  const canvas = cropCanvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function startCropDrag(event: PointerEvent) {
  if (!cropCanvasRef.value || props.disabled) return
  isDraggingCrop.value = true
  cropCanvasRef.value.setPointerCapture(event.pointerId)
}

function dragCrop(event: PointerEvent) {
  if (!isDraggingCrop.value) return
  const point = getPointer(event)
  cropOffset.value = { x: point.x - 140, y: point.y - 140 }
  drawCrop()
}

function stopCropDrag() {
  isDraggingCrop.value = false
}

function closeCrop() {
  cropOpen.value = false
  cropIndex.value = -1
  cropImage.value = null
}

function applyCrop() {
  const canvas = cropCanvasRef.value
  const item = normalizedItems.value[cropIndex.value]
  if (!canvas || !item) return
  const dataUrl = canvas.toDataURL('image/png')
  const next = [...props.modelValue]
  next[cropIndex.value] = item instanceof File
    ? { file: item, dataUrl }
    : { file: item.file, dataUrl }
  syncModel(next)
  closeCrop()
}

watch(zoom, drawCrop)

watch(cropOpen, (open) => {
  if (!open) return
  void nextTick(() => {
    const panel = cropPanelRef.value
    if (panel && typeof panel.focus === 'function') panel.focus()
  })
})

defineExpose({ addFiles, removeItem, openCrop, clearErrors })
</script>

<template>
  <div class="enpii-image-upload flex w-full flex-col gap-field-gap" :class="{ 'enpii-image-upload--disabled opacity-60 pointer-events-none': disabled }">
    <label :for="inputId" class="enpii-image-upload__label text-sm font-medium text-on-surface">{{ t('imageUpload.label') }}</label>
    <div
      class="enpii-image-upload__dropzone flex min-h-24 min-w-10 cursor-pointer flex-col items-center justify-center gap-2 p-4 px-6 border border-dashed border-solid border-outline-variant rounded-control bg-surface-container-lowest text-on-surface [transition-property:border-color,box-shadow,background] duration-fast ease-emphasized motion-reduce:transition-none forced-colors:border-canvas-text hover:not-disabled:border-primary/40 hover:not-disabled:bg-surface-container-low active:not-disabled:bg-surface-container active:not-disabled:scale-[.995] focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus aria-disabled:cursor-not-allowed motion-reduce:scale-none"
      :class="{ 'enpii-image-upload__dropzone--active border-primary [box-shadow:var(--shadow-focus)]': dragOver, 'enpii-image-upload__dropzone--disabled cursor-not-allowed': disabled }"
      role="button"
      :tabindex="disabled ? -1 : 0"
      :aria-disabled="disabled || undefined"
      :aria-label="t('imageUpload.label')"
      @click="openFilePicker"
      @keydown.enter.prevent="openFilePicker"
      @keydown.space.prevent="openFilePicker"
      @drop="onDrop"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
    >
      <span class="material-symbols-outlined enpii-image-upload__icon" aria-hidden="true">add_photo_alternate</span>
      <span class="enpii-image-upload__dropzone-text">{{ t('imageUpload.dropzone') }}</span>
    </div>
    <input
      :id="inputId"
      ref="inputRef"
      type="file"
      class="enpii-sr-only"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="onInputChange"
    />
    <ul v-if="errors.length" class="enpii-image-upload__errors m-0 p-0 list-none" role="alert">
      <li v-for="error in errors" :key="error.id" class="enpii-image-upload__error text-sm text-danger-text">{{ error.message }}</li>
    </ul>
    <ul v-if="normalizedItems.length" class="enpii-image-upload__list m-0 p-0 grid list-none grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2.5 max-sm:grid-cols-[repeat(2,minmax(0,1fr))]">
      <li v-for="(item, index) in normalizedItems" :key="`${item.file.name}-${index}`" class="enpii-image-upload__item relative flex flex-col overflow-hidden border border-solid border-outline-variant rounded-control bg-surface-container-lowest forced-colors:border-canvas-text">
        <img
          v-if="item.dataUrl"
          :src="item.dataUrl"
          :alt="item.file.name"
          class="enpii-image-upload__thumb block w-full aspect-square object-cover border-b border-solid border-outline-variant"
        />
        <span v-else class="material-symbols-outlined enpii-image-upload__icon text-2xl leading-none text-outline" aria-hidden="true">image</span>
        <span class="enpii-image-upload__meta flex min-w-0 flex-col gap-0.5 p-2">
          <span class="enpii-image-upload__name overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-on-surface">{{ item.file.name }}</span>
          <span class="enpii-image-upload__size text-xs text-on-surface-variant">{{ formatSize(item.file.size) }}</span>
        </span>
        <button
          v-if="cropEnabled"
          type="button"
          class="enpii-image-upload__action inline-flex h-10 w-10 shrink-0 items-center justify-center p-0 border-0 rounded-[9999px] bg-surface-container-lowest/90 text-on-surface-variant cursor-pointer [transition-property:background,color,box-shadow,transform] duration-fast ease-emphasized motion-reduce:transition-none forced-colors:bg-button-face forced-colors:text-button-text hover:enabled:bg-surface-container-low hover:enabled:text-primary-text hover:enabled:[box-shadow:var(--shadow-control)] active:enabled:scale-95 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed"
          :aria-label="t('imageUpload.crop', { name: item.file.name })"
          :disabled="disabled"
          @click="openCrop(index)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">crop</span>
        </button>
        <button
          type="button"
          class="enpii-image-upload__action"
          :aria-label="t('imageUpload.remove', { name: item.file.name })"
          :disabled="disabled"
          @click="removeItem(index)"
        >
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </li>
    </ul>
    <Teleport to="body">
      <Transition name="enpii-image-upload-modal">
        <div v-if="cropOpen" class="enpii-image-upload__crop-overlay fixed inset-0 z-modal flex items-center justify-center overflow-hidden p-4 bg-primary/45 backdrop-blur-[4px]">
          <section
            ref="cropPanelRef"
            role="dialog"
            aria-modal="true"
            aria-labelledby="enpii-image-upload-crop-title"
            class="enpii-image-upload__crop-panel flex w-full max-w-96 max-h-[calc(100vh-2rem)] flex-col gap-3 overflow-y-auto p-4 rounded-[1rem] bg-surface-container-lowest shadow-overlay max-sm:p-3"
          >
            <header class="enpii-image-upload__crop-header flex items-center justify-between gap-4">
              <h2 id="enpii-image-upload-crop-title" class="enpii-image-upload__crop-title m-0 text-lg font-medium text-primary-text">{{ t('imageUpload.cropTitle') }}</h2>
              <button type="button" class="enpii-image-upload__action" :aria-label="t('imageUpload.cancel')" @click="closeCrop">
                <span class="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </header>
            <canvas
              ref="cropCanvasRef"
              class="enpii-image-upload__crop-canvas block aspect-square w-[min(100%,17.5rem)] cursor-grab touch-none rounded-[calc(var(--radius-control)-0.25rem)] bg-surface-container forced-colors:border forced-colors:border-solid forced-colors:border-canvas-text active:cursor-grabbing focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus"
              :aria-label="t('imageUpload.cropArea')"
              tabindex="0"
              @pointerdown="startCropDrag"
              @pointermove="dragCrop"
              @pointerup="stopCropDrag"
              @pointercancel="stopCropDrag"
            ></canvas>
            <label class="enpii-image-upload__zoom-label grid gap-1.5 text-sm text-on-surface-variant">
              <span>{{ t('imageUpload.zoom') }}</span>
              <input
                v-model.number="zoom"
                class="enpii-image-upload__zoom inline-size-full min-h-10 m-0 border-0 appearance-none bg-transparent accent-primary disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus"
                type="range"
                min="1"
                max="4"
                step="0.05"
                :aria-label="t('imageUpload.zoom')"
              />
            </label>
            <div class="enpii-image-upload__crop-actions flex flex-wrap justify-end gap-3">
              <button type="button" class="enpii-image-upload__button inline-flex min-h-10 items-center justify-center px-4 border border-solid border-outline-variant rounded-[calc(var(--radius-control)-0.25rem)] bg-surface-container-lowest font-inherit text-sm font-medium text-on-surface cursor-pointer [transition-property:background,box-shadow,transform] duration-fast ease-emphasized motion-reduce:transition-none forced-colors:border-canvas-text hover:enabled:bg-neutral-soft hover:enabled:[box-shadow:var(--shadow-focus)] active:enabled:scale-[.98] focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:scale-none" @click="closeCrop">{{ t('imageUpload.cancel') }}</button>
              <button type="button" class="enpii-image-upload__button enpii-image-upload__button--primary inline-flex min-h-10 items-center justify-center border border-solid border-primary rounded-[calc(var(--radius-control)-0.25rem)] bg-primary font-inherit text-sm font-medium text-on-primary cursor-pointer [transition-property:background,box-shadow,transform] duration-fast ease-emphasized motion-reduce:transition-none forced-colors:bg-button-face forced-colors:text-button-text hover:enabled:bg-primary-container hover:enabled:text-on-primary-container active:enabled:scale-[.98] focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:scale-none" @click="applyCrop">
                {{ t('imageUpload.apply') }}
              </button>
            </div>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

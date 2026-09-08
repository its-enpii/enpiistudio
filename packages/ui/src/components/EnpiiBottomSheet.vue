<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import AppIcon from './EnpiiIcon.vue'
import { useT } from '../composables/useT'

const props = withDefaults(defineProps<{
    modelValue?: boolean
    title?: string
    dismissible?: boolean
    maxWidth?: string | number
}>(), {
    modelValue: false,
    title: undefined,
    dismissible: true,
    maxWidth: '32rem',
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const t = useT()
const model = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
})

const titleId = `enpii-bottom-sheet-title-${Math.random().toString(36).slice(2, 11)}`
const panel = ref<HTMLElement | null>(null)
const dragDistance = ref(0)
const dragFrameId: number | null = null
const panelStyle = computed(() => ({
    maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
    '--bottom-sheet-drag': `${dragDistance.value}px`,
    transition: _isDragging.value ? 'none' : undefined,
}))

let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let activePointerId: number | null = null
let dragStartY = 0
let dragLastY = 0
const _isDragging = ref(false)

function close() {
    if (props.dismissible) {
        model.value = false
    }
}

function focusableElements() {
    const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[contenteditable="true"]',
        '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    return Array.from(panel.value?.querySelectorAll<HTMLElement>(selector) ?? [])
        .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true')
}

function trapFocus(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault()
        close()
        return
    }

    if (event.key !== 'Tab') {
        return
    }

    const elements = focusableElements()
    if (!elements.length) {
        event.preventDefault()
        panel.value?.focus()
        return
    }

    const first = elements[0]
    const last = elements[elements.length - 1]
    const activeElement = document.activeElement
    if (!activeElement || !panel.value?.contains(activeElement)) {
        event.preventDefault()
        first.focus()
        return
    }

    if (event.shiftKey && activeElement === first) {
        event.preventDefault()
        last.focus()
    } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault()
        first.focus()
    }
}

function onPointerDown(event: PointerEvent) {
    if (!props.dismissible || event.button > 0 || activePointerId !== null) {
        return
    }

    activePointerId = event.pointerId
    _isDragging.value = true
    dragStartY = event.clientY
    dragDistance.value = 0
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
}

function onPointerMove(event: PointerEvent) {
    if (activePointerId !== event.pointerId) {
        return
    }

    dragLastY = event.clientY
    event.preventDefault()
    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
            dragDistance.value = Math.max(0, dragLastY - dragStartY)
        })
    }
    dragDistance.value = Math.max(0, dragLastY - dragStartY)
}

function onPointerUp(event: PointerEvent) {
    if (activePointerId !== event.pointerId) {
        return
    }

    removePointerListeners()
    const dragDistancePx = Math.max(0, dragLastY - dragStartY)
    const shouldClose = dragDistancePx >= 100
    activePointerId = null
    _isDragging.value = false
    dragStartY = 0
    dragDistance.value = 0

    if (shouldClose) {
        close()
    }
}

function removePointerListeners() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
}

function cleanupDrag() {
    activePointerId = null
    _isDragging.value = false
    dragStartY = 0
    dragDistance.value = 0
}

watch(model, async (open) => {
    if (open) {
        previousFocus = document.activeElement as HTMLElement | null
        previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        await nextTick()
        const target = focusableElements().at(-1) ?? panel.value
        target?.focus()
        return
    }

    removePointerListeners()
    activePointerId = null
    dragDistance.value = 0
    document.body.style.overflow = previousOverflow
    previousFocus?.focus?.()
    previousFocus = null
}, { immediate: true })

onBeforeUnmount(() => {
    removePointerListeners()
    if (props.modelValue) {
        document.body.style.overflow = previousOverflow
    }
})
</script>

<template>
    <Teleport to="body">
        <Transition name="bottom-sheet">
            <div v-if="model" class="enpii-bottom-sheet__overlay fixed inset-0 z-modal flex items-end justify-center [background-color:var(--overlay-backdrop)]" @click.self="close">
                <section
                    ref="panel"
                    class="enpii-bottom-sheet__panel relative flex w-full flex-col max-h-[min(88dvh,52rem)] border border-solid [border-width:var(--overlay-border-width)] [border-color:var(--overlay-border-color)] rounded-t-[1.25rem] [background-color:var(--overlay-surface-bg)] [color:var(--overlay-surface-fg)] shadow-overlay transition-transform duration-normal ease-decelerate"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="title ? titleId : undefined"
                    :aria-label="title ? undefined : t('bottomSheet.dialog')"
                    :style="panelStyle"
                    tabindex="-1"
                    @keydown="trapFocus"
                >
                    <button
                        type="button"
                        class="enpii-bottom-sheet__handle w-12 h-10 mx-auto rounded-overlay border-0 bg-none cursor-grab touch-none focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
                        :aria-label="t('bottomSheet.dragHandle')"
                        @click="close"
                        @pointerdown="onPointerDown"
                    />
                    <header class="enpii-bottom-sheet__header flex flex-none items-center justify-between gap-4 pt-1 px-4">
                        <h2 v-if="title" :id="titleId" class="enpii-bottom-sheet__title m-0 [color:inherit] font-sans text-lg font-medium leading-[1.35]">{{ title }}</h2>
                        <button
                            v-if="dismissible"
                            type="button"
                            class="enpii-bottom-sheet__close inline-flex w-10 h-10 flex-none items-center justify-center -mt-1 -mr-1 rounded-full border-0 bg-transparent [color:var(--tone-neutral-fg)] cursor-pointer [transition-property:background,color] duration-fast ease-emphasized hover:[background-color:var(--tone-neutral-soft-bg)] hover:[color:var(--tone-neutral-soft-fg)] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-offset:var(--focus-offset)] focus-visible:outline-focus"
                            :aria-label="t('bottomSheet.close')"
                            @click="close"
                        >
                            <AppIcon name="close" />
                        </button>
                    </header>
                    <div class="enpii-bottom-sheet__body flex-1 overflow-auto p-4 [touch-action:pan-y]">
                        <slot />
                    </div>
                    <footer v-if="$slots.footer" class="enpii-bottom-sheet__footer flex-none p-4 border-t border-solid [border-color:var(--overlay-border-color)]">
                        <slot name="footer" />
                    </footer>
                </section>
            </div>
        </Transition>
    </Teleport>
</template>

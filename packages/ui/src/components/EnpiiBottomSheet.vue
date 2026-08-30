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
const panelStyle = computed(() => ({
    maxWidth: typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
    '--enpii-bottom-sheet-drag': `${dragDistance.value}px`,
}))

let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let activePointerId: number | null = null
let dragStartY = 0

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

    dragDistance.value = Math.max(0, event.clientY - dragStartY)
    event.preventDefault()
}

function onPointerUp(event: PointerEvent) {
    if (activePointerId !== event.pointerId) {
        return
    }

    const shouldClose = dragDistance.value >= 100
    removePointerListeners()
    activePointerId = null
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
            <div v-if="model" class="enpii-bottom-sheet__overlay" @click.self="close">
                <section
                    ref="panel"
                    class="enpii-bottom-sheet__panel"
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
                        class="enpii-bottom-sheet__handle"
                        :aria-label="t('bottomSheet.dragHandle')"
                        @click="close"
                        @pointerdown="onPointerDown"
                    />
                    <header class="enpii-bottom-sheet__header">
                        <h2 v-if="title" :id="titleId" class="enpii-bottom-sheet__title">{{ title }}</h2>
                        <button
                            v-if="dismissible"
                            type="button"
                            class="enpii-bottom-sheet__close"
                            :aria-label="t('bottomSheet.close')"
                            @click="close"
                        >
                            <AppIcon name="close" />
                        </button>
                    </header>
                    <div class="enpii-bottom-sheet__body">
                        <slot />
                    </div>
                    <footer v-if="$slots.footer" class="enpii-bottom-sheet__footer">
                        <slot name="footer" />
                    </footer>
                </section>
            </div>
        </Transition>
    </Teleport>
</template>

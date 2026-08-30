<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import { useShape } from '../composables/useShape';
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT'

const t = useT()

const model = defineModel({ type: Boolean, default: false });
const props = defineProps({
    title: { type: String, required: true },
    closeable: { type: Boolean, default: true },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'full'].includes(value),
    },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const titleId = useId();
const panel = ref(null);
let previousFocus = null;
let previousOverflow = '';

function close() {
    if (props.closeable) model.value = false;
}

function focusable() {
    return [...(panel.value?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])];
}

function onKeydown(event) {
    if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
    }
    if (event.key !== 'Tab') return;

    const elements = focusable();
    if (!elements.length) { event.preventDefault(); panel.value?.focus(); return; }
    const first = elements[0];
    const last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

watch(model, async (open) => {
    if (open) {
        previousFocus = document.activeElement;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        await nextTick();
        const target = panel.value?.querySelector('[autofocus]') || focusable()[0] || panel.value;
        target?.focus();
        return;
    }

    document.body.style.overflow = previousOverflow;
    previousFocus?.focus?.();
});

onBeforeUnmount(() => {
    if (model.value) document.body.style.overflow = previousOverflow;
});
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="model" class="enpii-modal__overlay" @click.self="close">
                <section ref="panel" role="dialog" aria-modal="true" :aria-labelledby="titleId" tabindex="-1" :class="['enpii-modal__panel', `enpii-modal__panel--${size}`, shapeClass]" @keydown="onKeydown">
                    <header class="enpii-modal__header">
                        <h2 :id="titleId" class="enpii-modal__title">{{ title }}</h2>
                        <button v-if="closeable" type="button" class="enpii-modal__close" :aria-label="t('modal.close')" @click="close"><AppIcon name="close" /></button>
                    </header>
                    <div class="enpii-modal__body"><slot /></div>
                    <footer v-if="$slots.footer" class="enpii-modal__footer"><slot name="footer" /></footer>
                </section>
            </div>
        </Transition>
    </Teleport>
</template>

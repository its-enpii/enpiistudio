<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';

const model = defineModel({ type: Boolean, default: false });

const props = defineProps({
    title: { type: String, default: '' },
    side: {
        type: String,
        default: 'right',
        validator: (value) => ['left', 'right', 'top', 'bottom'].includes(value),
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
});

const titleId = useId();
const panel = ref(null);
let previousFocus = null;
let previousOverflow = '';

function close() {
    model.value = false;
}

function focusable() {
    return [...(panel.value?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])') || [])];
}

function trapFocus(event) {
    if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
    }
    if (event.key !== 'Tab') return;
    const elements = focusable();
    if (!elements.length) {
        event.preventDefault();
        panel.value?.focus();
        return;
    }
    const first = elements[0];
    const last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

watch(model, async (open) => {
    if (!open) {
        document.body.style.overflow = previousOverflow;
        previousFocus?.focus?.();
        return;
    }
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    await nextTick();
    (focusable()[0] || panel.value)?.focus();
});

onBeforeUnmount(() => {
    if (model.value) document.body.style.overflow = previousOverflow;
});
</script>

<template>
    <Teleport to="body">
        <Transition name="drawer">
            <div v-if="model" class="enpii-drawer" @keydown="trapFocus">
                <div class="enpii-drawer__backdrop" @click="close" />
                <section role="dialog" tabindex="-1" aria-modal="true" :aria-labelledby="titleId" class="enpii-drawer__panel" :class="[`enpii-drawer__panel--${side}`, `enpii-drawer__panel--${size}`]">
                    <header v-if="title || $slots.header" class="enpii-drawer__header">
                        <slot name="header"><h2 :id="titleId" class="enpii-drawer__title">{{ title }}</h2></slot>
                    </header>
                    <div class="enpii-drawer__body"><slot /></div>
                    <footer v-if="$slots.footer" class="enpii-drawer__footer"><slot name="footer" /></footer>
                </section>
            </div>
        </Transition>
    </Teleport>
</template>

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
            <div
                v-if="model"
                class="enpii-modal__overlay fixed inset-0 z-modal flex flex-col items-center justify-center overflow-hidden p-4 bg-primary/45 backdrop-blur-[4px]"
                @click.self="close"
            >
                <section
                    ref="panel"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="titleId"
                    tabindex="-1"
                    class="enpii-modal__panel flex w-full max-h-[calc(100vh-2rem)] flex-col rounded-2xl bg-surface-container-lowest shadow-overlay outline-none"
                    :class="[
                        `enpii-modal__panel--${size}`,
                        shapeClass,
                        { 'max-w-md': size === 'sm' },
                        { 'max-w-[42rem]': size === 'md' },
                        { 'max-w-[56rem]': size === 'lg' },
                        { 'max-w-[min(96rem,calc(100vw-2rem))]': size === 'full' },
                    ]"
                    @keydown="onKeydown"
                >
                    <header class="enpii-modal__header flex shrink-0 items-center justify-between gap-4 py-4 px-4 sm:px-6 border-b border-solid border-outline-variant">
                        <h2 :id="titleId" class="enpii-modal__title m-0 text-primary-text text-[1.125rem] font-semibold">{{ title }}</h2>
                        <button
                            v-if="closeable"
                            type="button"
                            class="enpii-modal__close grid place-items-center w-10 h-10 shrink-0 rounded-[9999px] border-0 bg-transparent text-on-surface-variant cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low hover:text-primary-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-90"
                            :aria-label="t('modal.close')"
                            @click="close"
                        >
                            <AppIcon name="close" />
                        </button>
                    </header>
                    <div class="enpii-modal__body flex-1 overflow-y-auto p-4 sm:px-6"><slot /></div>
                    <footer v-if="$slots.footer" class="enpii-modal__footer flex shrink-0 flex-wrap justify-end gap-3 py-4 px-4 sm:px-6 border-t border-solid border-outline-variant"><slot name="footer" /></footer>
                </section>
            </div>
        </Transition>
    </Teleport>
</template>

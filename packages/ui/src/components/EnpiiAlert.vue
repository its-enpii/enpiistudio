<script setup>
import { useId } from 'vue';
import AppIcon from './EnpiiIcon.vue';

const props = defineProps({
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    tone: { type: String, default: 'info', validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value) },
    icon: { type: String, default: null },
    dismissible: { type: Boolean, default: false },
});

defineEmits(['dismiss']);

const titleId = useId();
const messageId = useId();
const icons = { info: 'info', success: 'check_circle', warning: 'warning', danger: 'error' };

const toneClasses = {
    info: 'border-primary-border bg-primary-soft text-primary-text',
    success: 'border-success-border bg-success-soft text-success-text',
    warning: 'border-warning-border bg-warning-soft text-warning-text',
    danger: 'border-danger-border bg-danger-soft text-danger-text',
};
</script>

<template>
    <section
        class="enpii-alert flex items-center gap-3 py-3 px-4 border border-solid rounded-control"
        :class="[`enpii-alert--${tone}`, toneClasses[tone]]"
        role="alert"
        :aria-labelledby="title ? titleId : undefined"
        :aria-describedby="message ? messageId : undefined"
    >
        <AppIcon class="enpii-alert__icon shrink-0" :name="icon ?? icons[tone]" />
        <div class="enpii-alert__content flex-1 min-w-0">
            <h3 v-if="$slots.title || title" :id="titleId" class="enpii-alert__title m-0 mb-1 text-inherit font-sans text-base font-semibold leading-[1.35]"><slot name="title">{{ title }}</slot></h3>
            <p :id="messageId" class="enpii-alert__message m-0 text-[0.9375rem]"><slot>{{ message }}</slot></p>
        </div>
        <button
            v-if="dismissible"
            type="button"
            class="enpii-alert__close self-start border-0 bg-transparent text-inherit cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current"
            aria-label="Dismiss alert"
            @click="$emit('dismiss')"
        >
            <AppIcon name="close" />
        </button>
    </section>
</template>

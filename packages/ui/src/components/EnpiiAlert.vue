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
</script>

<template>
    <section class="enpii-alert" :class="`enpii-alert--${tone}`" role="alert" :aria-labelledby="title ? titleId : undefined" :aria-describedby="message ? messageId : undefined">
        <AppIcon class="enpii-alert__icon" :name="icon ?? icons[tone]" />
        <div class="enpii-alert__content">
            <h3 v-if="$slots.title || title" :id="titleId" class="enpii-alert__title"><slot name="title">{{ title }}</slot></h3>
            <p :id="messageId" class="enpii-alert__message"><slot>{{ message }}</slot></p>
        </div>
        <button v-if="dismissible" type="button" class="enpii-alert__close" aria-label="Dismiss alert" @click="$emit('dismiss')">
            <AppIcon name="close" />
        </button>
    </section>
</template>

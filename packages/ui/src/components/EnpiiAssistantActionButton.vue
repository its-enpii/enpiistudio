<script setup>
import AppButton from './EnpiiButton.vue';

const props = defineProps({
    assistantBlock: { type: Object, required: true },
});

const emit = defineEmits(['submit']);

function onClick() {
    if (props.assistantBlock.url) {
        window.open(props.assistantBlock.url, props.assistantBlock.target || '_blank', 'noopener,noreferrer');
        return;
    }
    if (props.assistantBlock.value) emit('submit', props.assistantBlock.value);
}
</script>

<template>
    <div class="enpii-assistant-action-button">
        <AppButton
            size="compact"
            :variant="assistantBlock.url ? 'outline' : 'primary'"
            :icon="assistantBlock.icon || (assistantBlock.url ? 'open_in_new' : 'check')"
            class="enpii-assistant-action-button__button"
            @click="onClick"
        >
            {{ assistantBlock.label }}
        </AppButton>
    </div>
</template>
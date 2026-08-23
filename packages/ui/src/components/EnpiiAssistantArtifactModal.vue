<script setup>
import { computed } from 'vue';
import AppModal from './EnpiiModal.vue';
import { renderMarkdownHtml } from '../composables/useMarkdown';

const props = defineProps({
    assistantBlock: { type: Object, default: null },
});

const emit = defineEmits(['close']);

const html = computed(() => (props.assistantBlock ? renderMarkdownHtml(props.assistantBlock.markdown) : ''));
</script>

<template>
    <AppModal
        :open="assistantBlock !== null"
        :title="assistantBlock?.title ?? 'Detail'"
        size="lg"
        @close="emit('close')"
    >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="enpii-assistant-artifact-modal__body" v-html="html" />
    </AppModal>
</template>

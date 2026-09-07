<script setup>
import { computed } from 'vue';
import AppModal from './EnpiiModal.vue';
import { renderMarkdownHtml } from '../composables/useMarkdown';
import { useT } from '../composables/useT'

const t = useT()

const props = defineProps({
    assistantBlock: { type: Object, default: null },
});

const emit = defineEmits(['close']);

const html = computed(() => (props.assistantBlock ? renderMarkdownHtml(props.assistantBlock.markdown) : ''));
</script>

<template>
    <AppModal
        :open="assistantBlock !== null"
        :title="assistantBlock?.title ?? t('detail')"
        size="lg"
        @close="emit('close')"
    >
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="enpii-assistant-artifact-modal__body [color:var(--overlay-surface-fg)] [&_code]:rounded-sm [&_code]:[background-color:var(--tone-neutral-soft-bg)] [&_code]:px-1 [&_code]:py-0.5 [&_h1]:[color:var(--tone-primary-fg)] [&_h2]:[color:var(--tone-primary-fg)] [&_h3]:[color:var(--tone-primary-fg)]" v-html="html" />
    </AppModal>
</template>

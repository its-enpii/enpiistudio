<script setup>
import AppIcon from './EnpiiIcon.vue';

const props = defineProps({
    assistantBlock: { type: Object, required: true },
    opened: { type: Boolean, default: false },
});

const emit = defineEmits(['open']);

const iconMap = {
    table: 'table_chart',
    markdown: 'description',
    json: 'data_object',
    text: 'article',
};

const kind = (props.assistantBlock.kind || 'table').toLowerCase();
const icon = iconMap[kind] ?? 'description';
</script>

<template>
    <button
        type="button"
        class="enpii-assistant-artifact-card"
        :aria-label="`Buka ${assistantBlock.title}`"
        @click="emit('open', assistantBlock)"
    >
        <span class="enpii-assistant-artifact-card__icon">
            <AppIcon :name="icon" />
        </span>
        <div class="enpii-assistant-artifact-card__body">
            <p class="enpii-assistant-artifact-card__title">{{ assistantBlock.title }}</p>
            <p v-if="assistantBlock.summary" class="enpii-assistant-artifact-card__summary">{{ assistantBlock.summary }}</p>
        </div>
        <span class="enpii-assistant-artifact-card__chevron">
            <AppIcon name="chevron_right" class="enpii-assistant-artifact-card__chevron-icon" />
        </span>
    </button>
</template>
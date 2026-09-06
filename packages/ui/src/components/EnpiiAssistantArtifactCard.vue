<script setup>
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT'

const t = useT()

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
        class="enpii-assistant-artifact-card flex w-full cursor-pointer items-start gap-3 rounded-control border border-outline-variant bg-primary-soft/40 px-4 py-3 text-left transition-all duration-fast ease-emphasized hover:border-primary hover:bg-primary-soft/70 active:scale-[.99] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
        :aria-label="t('artifactCard.open', { title: assistantBlock.title })"
        @click="emit('open', assistantBlock)"
    >
        <span class="enpii-assistant-artifact-card__icon grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-on-primary">
            <AppIcon :name="icon" />
        </span>
        <div class="enpii-assistant-artifact-card__body min-w-0 flex-1">
            <p class="enpii-assistant-artifact-card__title m-0 truncate text-primary-text text-sm font-semibold">{{ assistantBlock.title }}</p>
            <p v-if="assistantBlock.summary" class="enpii-assistant-artifact-card__summary mt-1 mb-0 line-clamp-1 overflow-hidden text-on-surface-variant text-xs">{{ assistantBlock.summary }}</p>
        </div>
        <span class="enpii-assistant-artifact-card__chevron shrink-0 text-on-surface-variant transition-transform duration-fast ease-emphasized [.enpii-assistant-artifact-card:hover_&]:translate-x-0.5">
            <AppIcon name="chevron_right" class="enpii-assistant-artifact-card__chevron-icon h-5 w-5 text-base" />
        </span>
    </button>
</template>

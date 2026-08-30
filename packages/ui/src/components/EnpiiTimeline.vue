<script setup lang="ts">
import AppIcon from './EnpiiIcon.vue'

export interface TimelineItem {
  id: string | number
  title: string
  description?: string
  timestamp?: string
  icon?: string
  tone?: 'neutral' | 'primary' | 'danger' | 'success'
  completed?: boolean
}

const props = withDefaults(defineProps<{
  items: TimelineItem[]
  alternate?: boolean
  density?: 'compact' | 'default' | 'comfortable'
}>(), {
  alternate: false,
  density: 'default',
})

const uid = Math.random().toString(36).slice(2, 11)
</script>

<template>
    <ol
        class="enpii-timeline"
        :class="[
            `enpii-timeline--${density}`,
            alternate && 'enpii-timeline--alternate',
        ]"
        :aria-label="`Timeline with ${items.length} items`"
    >
        <li
            v-for="(item, index) in items"
            :key="item.id"
            class="enpii-timeline__item"
            :class="[
                `enpii-timeline__item--${item.tone ?? 'neutral'}`,
                item.completed ? 'enpii-timeline__item--completed' : 'enpii-timeline__item--pending',
                alternate && index % 2 === 1 && 'enpii-timeline__item--right',
            ]"
        >
            <div class="enpii-timeline__marker" aria-hidden="true">
                <AppIcon v-if="item.icon" :name="item.icon" class="enpii-timeline__icon" />
                <span v-else-if="item.completed" class="enpii-timeline__check" aria-hidden="true">✓</span>
                <span v-else class="enpii-timeline__dot" aria-hidden="true" />
            </div>
            <div class="enpii-timeline__content">
                <div class="enpii-timeline__header">
                    <h3 class="enpii-timeline__title">{{ item.title }}</h3>
                    <time v-if="item.timestamp" class="enpii-timeline__timestamp">{{ item.timestamp }}</time>
                </div>
                <p v-if="item.description" class="enpii-timeline__description">{{ item.description }}</p>
            </div>
        </li>
    </ol>
</template>

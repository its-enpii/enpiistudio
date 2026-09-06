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

function toneClasses(tone: TimelineItem['tone'] = 'neutral') {
  if (tone === 'primary') return {
    marker: 'border-primary-border bg-primary-soft text-primary-text',
    dot: 'bg-primary',
  }
  if (tone === 'danger') return {
    marker: 'border-danger-border bg-danger-soft text-danger-text',
    dot: 'bg-danger-text',
  }
  if (tone === 'success') return {
    marker: 'border-success-border bg-success-soft text-success-text',
    dot: 'bg-success-text',
  }
  return { marker: '', dot: '' }
}

function markerClasses(item: TimelineItem) {
  return toneClasses(item.tone).marker
}

function dotClasses(item: TimelineItem) {
  return toneClasses(item.tone).dot
}
</script>

<template>
    <ol
        class="enpii-timeline relative m-0 p-0 list-none"
        :class="[
            `enpii-timeline--${density}`,
            alternate && 'enpii-timeline--alternate',
        ]"
        :aria-label="`Timeline with ${items.length} items`"
    >
        <li
            v-for="(item, index) in items"
            :key="item.id"
            class="enpii-timeline__item relative flex items-center gap-3.5 py-2 pl-0 before:absolute before:bottom-0 before:left-4 before:top-9 before:w-0.5 before:bg-outline-variant before:content-[''] last:before:hidden forced-colors:before:bg-canvas-text"
            :class="[
                `enpii-timeline__item--${item.tone ?? 'neutral'}`,
                item.completed ? 'enpii-timeline__item--completed' : 'enpii-timeline__item--pending',
                alternate && index % 2 === 1 && 'enpii-timeline__item--right',
            ]"
        >
            <div class="enpii-timeline__marker relative z-1 inline-flex h-8 w-8 flex-none items-center justify-center border border-solid rounded-full text-on-surface-variant motion-reduce:transition-none" :class="[markerClasses(item), item.completed ? 'border-success-border bg-success-soft text-success-text' : 'border-outline-variant bg-surface-container-lowest']" aria-hidden="true">
                <AppIcon v-if="item.icon" :name="item.icon" class="enpii-timeline__icon w-4 h-4 text-base leading-none" />
                <span v-else-if="item.completed" class="enpii-timeline__check text-sm font-medium leading-none" aria-hidden="true">✓</span>
                <span v-else class="enpii-timeline__dot w-2 h-2 rounded-full bg-outline" :class="dotClasses(item)" aria-hidden="true" />
            </div>
            <div class="enpii-timeline__content min-w-0 pt-0.5">
                <div class="enpii-timeline__header flex flex-wrap items-baseline gap-y-1 gap-x-2">
                    <h3 class="enpii-timeline__title m-0 text-sm font-medium leading-[1.375]" :class="item.completed ? 'text-success-text' : 'text-on-surface'">{{ item.title }}</h3>
                    <time v-if="item.timestamp" class="enpii-timeline__timestamp text-outline text-[0.6875rem] font-normal tabular-nums">{{ item.timestamp }}</time>
                </div>
                <p v-if="item.description" class="enpii-timeline__description mt-1 mb-0 text-[0.8125rem] font-normal leading-normal text-on-surface-variant">{{ item.description }}</p>
            </div>
        </li>
    </ol>
</template>

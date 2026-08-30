<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useT } from '../composables/useT'

export interface EnpiiKanbanColumn {
  id: string
  title: string
  tone?: 'neutral' | 'primary' | 'danger' | 'success'
}

export interface EnpiiKanbanCard {
  id: string
  columnId: string
  title: string
  label?: string
  tone?: 'neutral' | 'primary' | 'danger' | 'success'
  assignee?: string
}

export interface EnpiiKanbanMoveEvent {
  cardId: string
  fromColumn: string
  toColumn: string
  index: number
}

const props = withDefaults(defineProps<{
  columns: EnpiiKanbanColumn[]
  cards: EnpiiKanbanCard[]
  draggable?: boolean
  modelValue?: EnpiiKanbanCard[]
}>(), {
  draggable: true,
  modelValue: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', cards: EnpiiKanbanCard[]): void
  (e: 'move', event: EnpiiKanbanMoveEvent): void
}>()

const t = useT()
const menuCard = ref<EnpiiKanbanCard | null>(null)
const menuPosition = ref({ top: 0, left: 0 })
const dragCardId = ref<string | null>(null)
const dragOverColumn = ref<string | null>(null)

const menuRef = ref<HTMLElement | null>(null)

const internalCards = computed<EnpiiKanbanCard[]>(() => props.modelValue ?? props.cards)

const columnsWithCards = computed(() => {
  return props.columns.map(column => {
    const cards = internalCards.value.filter(card => card.columnId === column.id)
    return { ...column, cards, count: cards.length }
  })
})

const menuTargets = computed(() => {
  if (!menuCard.value) return []
  return props.columns.map(column => ({
    id: column.id,
    title: column.title,
    isCurrent: column.id === menuCard.value!.columnId,
  }))
})

function getCardIndex(columnId: string, cardId: string) {
  const columnCards = internalCards.value.filter(card => card.columnId === columnId)
  return columnCards.findIndex(card => card.id === cardId)
}

function moveCard(card: EnpiiKanbanCard, toColumn: string, targetIndex?: number) {
  if (card.columnId === toColumn && targetIndex === undefined) return
  const fromColumn = card.columnId
  const others = internalCards.value.filter(c => c.id !== card.id)
  const columnCards = others.filter(c => c.columnId === toColumn)
  const index = targetIndex ?? columnCards.length
  const movedCard: EnpiiKanbanCard = { ...card, columnId: toColumn }
  const updated = [...others]
  updated.splice(index, 0, movedCard)
  emit('update:modelValue', updated)
  emit('move', { cardId: card.id, fromColumn, toColumn, index })
}

function openMenu(card: EnpiiKanbanCard, event: Event) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  menuPosition.value = { top: rect.bottom + 4, left: rect.left }
  menuCard.value = card
}

function openMenuForCard(card: EnpiiKanbanCard, event: KeyboardEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  menuPosition.value = { top: rect.bottom + 4, left: rect.left }
  menuCard.value = card
}

function selectMoveTarget(toColumn: string) {
  if (!menuCard.value) return
  moveCard(menuCard.value, toColumn)
  closeMenu()
}

function closeMenu() {
  menuCard.value = null
}

function onDocumentMousedown(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

function onDragStart(event: DragEvent, card: EnpiiKanbanCard) {
  dragCardId.value = card.id
  event.dataTransfer?.setData('text/plain', card.id)
}

function onDragOver(event: DragEvent, columnId: string) {
  event.preventDefault()
  dragOverColumn.value = columnId
}

function onDragLeave(columnId: string) {
  if (dragOverColumn.value === columnId) dragOverColumn.value = null
}

function onDrop(event: DragEvent, columnId: string) {
  event.preventDefault()
  dragOverColumn.value = null
  const cardId = dragCardId.value ?? event.dataTransfer?.getData('text/plain')
  if (!cardId) return
  const card = internalCards.value.find(c => c.id === cardId)
  if (card) moveCard(card, columnId)
  dragCardId.value = null
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

watch(() => menuCard.value, (value) => {
  if (value) {
    document.addEventListener('mousedown', onDocumentMousedown)
    document.addEventListener('keydown', onMenuKeydown, { capture: true })
  } else {
    document.removeEventListener('mousedown', onDocumentMousedown)
    document.removeEventListener('keydown', onMenuKeydown, { capture: true })
  }
})
</script>

<template>
  <div class="enpii-kanban" role="region" :aria-label="t('kanban.ariaLabel')">
    <div class="enpii-kanban__scroll">
      <div class="enpii-kanban__columns">
        <div
          v-for="column in columnsWithCards"
          :key="column.id"
          class="enpii-kanban__column"
          :class="[`enpii-kanban__column--${column.tone || 'neutral'}`, { 'enpii-kanban__column--drag-over': dragOverColumn === column.id }]"
          :data-column-id="column.id"
          @dragover="onDragOver($event, column.id)"
          @dragleave="onDragLeave(column.id)"
          @drop="onDrop($event, column.id)"
        >
          <header class="enpii-kanban__column-header">
            <h3 class="enpii-kanban__column-title">{{ column.title }}</h3>
            <span class="enpii-kanban__column-count" :aria-label="t('kanban.cardCount', { count: column.count })">{{ column.count }}</span>
          </header>
          <div class="enpii-kanban__cards">
            <article
              v-for="card in column.cards"
              :key="card.id"
              class="enpii-kanban__card"
              :class="`enpii-kanban__card--${card.tone || 'neutral'}`"
              :tabindex="draggable ? 0 : undefined"
              :draggable="draggable"
              :data-card-id="card.id"
              :aria-grabbed="draggable && dragCardId === card.id ? 'true' : undefined"
              role="listitem"
              @dragstart="onDragStart($event, card)"
              @keydown.enter="openMenuForCard(card, $event)"
            >
              <p class="enpii-kanban__card-title">{{ card.title }}</p>
              <p v-if="card.label" class="enpii-kanban__card-label">{{ card.label }}</p>
              <p v-if="card.assignee" class="enpii-kanban__card-assignee">{{ card.assignee }}</p>
              <button
                v-if="draggable"
                type="button"
                class="enpii-kanban__card-menu"
                :aria-label="t('kanban.moveCard', { title: card.title })"
                :aria-haspopup="'menu'"
                :aria-expanded="menuCard?.id === card.id ? 'true' : 'false'"
                @click.stop="openMenu(card, $event)"
              >
                <svg class="enpii-kanban__card-menu-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
            </article>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="menuCard"
      class="enpii-kanban__menu"
      ref="menuRef"
      role="menu"
        :aria-label="t('kanban.moveCard', { title: menuCard.title })"
        :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
        tabindex="-1"
        @keydown="onMenuKeydown"
      >
        <button
          v-for="target in menuTargets"
          :key="target.id"
          type="button"
          class="enpii-kanban__menu-item"
          role="menuitem"
          :disabled="target.isCurrent"
          @click.stop="selectMoveTarget(target.id)"
        >
          {{ target.title }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

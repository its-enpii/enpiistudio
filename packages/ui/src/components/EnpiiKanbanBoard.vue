<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useT } from "../composables/useT";

export interface EnpiiKanbanColumn {
  id: string;
  title: string;
  tone?: "neutral" | "primary" | "danger" | "success";
}

export interface EnpiiKanbanCard {
  id: string;
  columnId: string;
  title: string;
  label?: string;
  tone?: "neutral" | "primary" | "danger" | "success";
  assignee?: string;
}

export interface EnpiiKanbanMoveEvent {
  cardId: string;
  fromColumn: string;
  toColumn: string;
  index: number;
}

export interface EnpiiKanbanInvalidDropEvent {
  cardId: string;
  fromColumn: string;
  toColumn: string;
}

export interface EnpiiKanbanCardSlotProps {
  card: EnpiiKanbanCard;
  column: EnpiiKanbanColumn;
}

const props = withDefaults(defineProps<{
  columns: EnpiiKanbanColumn[];
  cards: EnpiiKanbanCard[];
  draggable?: boolean;
  validateMove?: (event: EnpiiKanbanMoveEvent) => boolean;
  modelValue?: EnpiiKanbanCard[];
}>(), {
  draggable: true,
  validateMove: undefined,
  modelValue: undefined,
});

const emit = defineEmits<{
  (e: "update:modelValue", cards: EnpiiKanbanCard[]): void;
  (e: "move", event: EnpiiKanbanMoveEvent): void;
  (e: "invalid-drop", event: EnpiiKanbanInvalidDropEvent): void;
}>();

const t = useT();
const menuCard = ref<EnpiiKanbanCard | null>(null);
const menuPosition = ref({ top: 0, left: 0 });
const dragCardId = ref<string | null>(null);
const dragOverColumn = ref<string | null>(null);

const menuRef = ref<HTMLElement | null>(null);

const internalCards = computed<EnpiiKanbanCard[]>(() => props.modelValue ?? props.cards);

const columnsWithCards = computed(() => {
  return props.columns.map(column => {
    const cards = internalCards.value.filter(card => card.columnId === column.id);
    return { ...column, cards, count: cards.length };
  });
});

const menuTargets = computed(() => {
  if (!menuCard.value) return [];
  return props.columns.map(column => ({
    id: column.id,
    title: column.title,
    isCurrent: column.id === menuCard.value!.columnId,
  }));
});

const toneBorderClasses: Record<string, string> = {
  neutral: "border-outline-variant",
  primary: "border-primary-border",
  danger: "border-error-border",
  success: "border-success-border",
};

function getCardIndex(columnId: string, cardId: string) {
  const columnCards = internalCards.value.filter(card => card.columnId === columnId);
  return columnCards.findIndex(card => card.id === cardId);
}

function moveCard(card: EnpiiKanbanCard, toColumn: string, targetIndex?: number) {
  if (card.columnId === toColumn && targetIndex === undefined) return;
  const fromColumn = card.columnId;
  const others = internalCards.value.filter(c => c.id !== card.id);
  const columnCards = others.filter(c => c.columnId === toColumn);
  const index = targetIndex ?? columnCards.length;
  const movedCard: EnpiiKanbanCard = { ...card, columnId: toColumn };
  const updated = [...others];
  updated.splice(index, 0, movedCard);
  emit("update:modelValue", updated);
  emit("move", { cardId: card.id, fromColumn, toColumn, index });
}

function openMenu(card: EnpiiKanbanCard, event: Event) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  menuPosition.value = { top: rect.bottom + 4, left: rect.left };
  menuCard.value = card;
}

function openMenuForCard(card: EnpiiKanbanCard, event: KeyboardEvent) {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  menuPosition.value = { top: rect.bottom + 4, left: rect.left };
  menuCard.value = card;
}

function selectMoveTarget(toColumn: string) {
  if (!menuCard.value) return;
  moveCard(menuCard.value, toColumn);
  closeMenu();
}

function isDropValid(toColumn: string) {
  const card = internalCards.value.find(item => item.id === dragCardId.value);
  if (!card) return true;

  return props.validateMove?.({ cardId: card.id, fromColumn: card.columnId, toColumn, index: 0 }) ?? true;
}

function closeMenu() {
  menuCard.value = null;
}

function onDocumentMousedown(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu();
  }
}

function onDragStart(event: DragEvent, card: EnpiiKanbanCard) {
  dragCardId.value = card.id;
  event.dataTransfer?.setData("text/plain", card.id);
}

function onDragOver(event: DragEvent, columnId: string) {
  event.preventDefault();
  dragOverColumn.value = columnId;
}

function onDragLeave(columnId: string) {
  if (dragOverColumn.value === columnId) dragOverColumn.value = null;
}

function onDrop(event: DragEvent, columnId: string) {
  event.preventDefault();
  dragOverColumn.value = null;
  const cardId = dragCardId.value ?? event.dataTransfer?.getData("text/plain");
  if (!cardId) return;
  const card = internalCards.value.find(c => c.id === cardId);
  if (card && !props.validateMove?.({ cardId: card.id, fromColumn: card.columnId, toColumn: columnId, index: 0 })) {
    emit("invalid-drop", { cardId: card.id, fromColumn: card.columnId, toColumn: columnId });
  } else if (card) {
    moveCard(card, columnId);
  }
  dragCardId.value = null;
}

function onMenuKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

watch(() => menuCard.value, (value) => {
  if (value) {
    document.addEventListener("mousedown", onDocumentMousedown);
    document.addEventListener("keydown", onMenuKeydown, { capture: true });
  } else {
    document.removeEventListener("mousedown", onDocumentMousedown);
    document.removeEventListener("keydown", onMenuKeydown, { capture: true });
  }
});
</script>

<template>
  <div class="enpii-kanban w-full text-on-surface" role="region" :aria-label="t('kanban.ariaLabel')">
    <div class="enpii-kanban__scroll overflow-x-auto">
      <div class="enpii-kanban__columns flex gap-4 min-w-max pb-2 md:min-w-0">
        <div
          v-for="column in columnsWithCards"
          :key="column.id"
          class="enpii-kanban__column flex flex-col gap-2 w-64 shrink-0 p-3 border border-solid [border-width:var(--control-border-width)] rounded-control bg-surface-container-low md:w-auto md:flex-1 md:min-w-56"
          :class="[
            `enpii-kanban__column--${column.tone || 'neutral'}`,
            toneBorderClasses[column.tone || 'neutral'],
            {
            'enpii-kanban__column--drag-over !border-primary !border-solid !bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-surface-container-low))]': dragOverColumn === column.id && isDropValid(column.id),
            'enpii-kanban__column--drag-over-invalid !border-2 !border-dashed !border-[color-mix(in_srgb,var(--color-error)_55%,transparent)] !bg-[color-mix(in_srgb,var(--color-error)_6%,var(--color-surface-container-low))]': dragOverColumn === column.id && !isDropValid(column.id),
            },
          ]"
          :data-column-id="column.id"
          @dragover="onDragOver($event, column.id)"
          @dragleave="onDragLeave(column.id)"
          @drop="onDrop($event, column.id)"
        >
          <header class="enpii-kanban__column-header flex items-center justify-between gap-2">
            <h3 class="enpii-kanban__column-title m-0 text-on-surface-variant text-sm font-medium">{{ column.title }}</h3>
            <span class="enpii-kanban__column-count inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-neutral-soft text-on-surface-variant text-xs font-medium" :aria-label="t('kanban.cardCount', { count: column.count })">{{ column.count }}</span>
          </header>
          <div class="enpii-kanban__cards flex flex-col gap-2">
            <article
              v-for="card in column.cards"
              :key="card.id"
              class="enpii-kanban__card relative py-2.5 px-3 border border-solid [border-width:var(--control-border-width)] rounded-[calc(var(--radius-control)-0.25rem)] bg-surface-container-lowest shadow-control transition-[box-shadow,border-color,transform] duration-fast ease-standard hover:not-active:border-outline hover:not-active:shadow-raised hover:not-active:-translate-y-px active:[box-shadow:var(--shadow-control-pressed)] active:[transform:var(--press-transform)] focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-focus focus-visible:outline-offset-2 motion-reduce:transition-none"
              :class="[
                `enpii-kanban__card--${card.tone || 'neutral'}`,
                toneBorderClasses[card.tone || 'neutral'],
              ]"
              :tabindex="draggable ? 0 : undefined"
              :draggable="draggable"
              :data-card-id="card.id"
              :aria-grabbed="draggable && dragCardId === card.id ? 'true' : undefined"
              role="listitem"
              @dragstart="onDragStart($event, card)"
              @keydown.enter="openMenuForCard(card, $event)"
            >
              <slot
                name="card"
                v-bind="{ card, column } as EnpiiKanbanCardSlotProps"
              >
                <p class="enpii-kanban__card-title m-0 text-on-surface text-sm font-medium leading-[1.4]">{{ card.title }}</p>
                <p v-if="card.label" class="enpii-kanban__card-label mt-1 mb-0 text-on-surface-variant text-xs">{{ card.label }}</p>
                <p v-if="card.assignee" class="enpii-kanban__card-assignee mt-1 mb-0 text-primary-text text-xs">{{ card.assignee }}</p>
              </slot>
              <button
                v-if="draggable"
                type="button"
                class="enpii-kanban__card-menu absolute top-1.5 right-1.5 grid place-items-center min-w-10 min-h-10 border-0 rounded-[calc(var(--radius-control)-0.25rem)] bg-transparent text-on-surface-variant cursor-pointer transition-[background,color] duration-fast ease-emphasized hover:bg-neutral-soft hover:text-on-surface active:[transform:var(--press-transform)] focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-focus focus-visible:outline-offset-2 motion-reduce:transition-none"
                :aria-label="t('kanban.moveCard', { title: card.title })"
                :aria-haspopup="'menu'"
                :aria-expanded="menuCard?.id === card.id ? 'true' : 'false'"
                @click.stop="openMenu(card, $event)"
              >
                <svg class="enpii-kanban__card-menu-icon w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
        ref="menuRef"
        class="enpii-kanban__menu fixed z-overlay flex flex-col min-w-40 p-1 border border-solid [border-width:var(--overlay-border-width)] border-outline-variant rounded-[calc(var(--radius-control)-0.25rem)] bg-surface-container-lowest shadow-overlay"
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
          class="enpii-kanban__menu-item block w-full min-h-10 py-2 px-3 border-0 rounded-[calc(var(--radius-control)-0.5rem)] bg-transparent text-on-surface font-inherit text-sm font-medium text-left cursor-pointer transition-[background] duration-fast ease-emphasized hover:enabled:bg-neutral-soft focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-focus focus-visible:-outline-offset-2 disabled:text-outline disabled:cursor-default disabled:opacity-50 aria-disabled:pointer-events-none motion-reduce:transition-none"
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

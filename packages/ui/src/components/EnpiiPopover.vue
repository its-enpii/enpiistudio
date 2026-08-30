<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useT } from '../composables/useT';

const props = withDefaults(defineProps<{
  id?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  alignment?: 'start' | 'center' | 'end';
  trigger?: 'click' | 'hover';
  persistent?: boolean;
  arrow?: boolean;
}>(), {
  placement: 'bottom',
  alignment: 'center',
  trigger: 'click',
  persistent: false,
  arrow: false,
});

const emit = defineEmits(['open', 'close']);
const t = useT();
const generatedId = useId();
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const activePlacement = ref(props.placement);
const panelStyle = ref<Record<string, string>>({});

const popoverId = computed(() => props.id || generatedId);
const ariaLabel = computed(() => (isOpen.value ? t('popover.close') : t('popover.open')));

function updatePlacement(value: 'top' | 'bottom' | 'left' | 'right') {
  activePlacement.value = value;
}

function applyPanelStyle(style: Record<string, string>) {
  panelStyle.value = { ...style, zIndex: 'var(--enpii-z-overlay)' };
}

async function positionPanel() {
  const trigger = triggerRef.value;
  const panel = panelRef.value;
  if (!trigger || !panel) return;

  const margin = 8;
  const triggerRect = trigger.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let nextPlacement = props.placement;

  const overflows = (placement: 'top' | 'bottom' | 'left' | 'right') => {
    switch (placement) {
      case 'top': return triggerRect.top - panelRect.height - margin < 0;
      case 'bottom': return triggerRect.bottom + panelRect.height + margin > viewportHeight;
      case 'left': return triggerRect.left - panelRect.width - margin < 0;
      case 'right': return triggerRect.right + panelRect.width + margin > viewportWidth;
    }
  };

  if (overflows(nextPlacement)) {
    const opposite = ({ top: 'bottom', bottom: 'top', left: 'right', right: 'left' } as const)[nextPlacement];
    if (!overflows(opposite)) nextPlacement = opposite;
    else nextPlacement = viewportWidth > viewportHeight
      ? (nextPlacement === 'top' || nextPlacement === 'bottom' ? nextPlacement : 'bottom')
      : (nextPlacement === 'left' || nextPlacement === 'right' ? nextPlacement : 'right');
  }

  updatePlacement(nextPlacement);

  let left: number;
  let top: number;
  if (nextPlacement === 'top' || nextPlacement === 'bottom') {
    top = nextPlacement === 'top' ? triggerRect.top - panelRect.height : triggerRect.bottom;
    if (props.alignment === 'start') left = triggerRect.left;
    else if (props.alignment === 'end') left = triggerRect.right - panelRect.width;
    else left = triggerRect.left + (triggerRect.width - panelRect.width) / 2;
  } else {
    left = nextPlacement === 'left' ? triggerRect.left - panelRect.width : triggerRect.right;
    if (props.alignment === 'start') top = triggerRect.top;
    else if (props.alignment === 'end') top = triggerRect.bottom - panelRect.height;
    else top = triggerRect.top + (triggerRect.height - panelRect.height) / 2;
  }

  left = Math.max(margin, Math.min(left, viewportWidth - panelRect.width - margin));
  top = Math.max(margin, Math.min(top, viewportHeight - panelRect.height - margin));

  applyPanelStyle({ position: 'fixed', top: `${top}px`, left: `${left}px` });
}

async function openPanel() {
  if (isOpen.value) return;
  isOpen.value = true;
  await nextTick();
  await positionPanel();
  emit('open');
}

function closePanel({ returnFocus = true } = {}) {
  if (!isOpen.value) return;
  isOpen.value = false;
  if (returnFocus) triggerRef.value?.focus?.();
  emit('close');
}

async function togglePanel() {
  if (isOpen.value) closePanel();
  else await openPanel();
}

function onDocumentClick(event: MouseEvent) {
  if (props.persistent || !isOpen.value) return;
  const target = event.target as Node;
  if (rootRef.value?.contains(target) || panelRef.value?.contains(target)) return;
  closePanel();
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (props.persistent || !isOpen.value) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closePanel();
  }
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (props.trigger === 'click' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    togglePanel();
  }
}

function onWindowResize() {
  if (isOpen.value) positionPanel();
}

watch(() => [props.placement, props.alignment], () => {
  if (isOpen.value) positionPanel();
});

watch(() => props.persistent, (value) => {
  if (value && isOpen.value && props.trigger === 'click') closePanel({ returnFocus: false });
});

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onDocumentKeydown);
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('scroll', onWindowResize, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onDocumentKeydown);
  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('scroll', onWindowResize, true);
});
</script>

<template>
  <div
    ref="rootRef"
    class="enpii-popover"
    @mouseenter="props.trigger === 'hover' && openPanel()"
    @mouseleave="props.trigger === 'hover' && closePanel({ returnFocus: false })"
    @focusin="props.trigger === 'hover' && openPanel()"
    @focusout="props.trigger === 'hover' && closePanel({ returnFocus: false })"
  >
    <div
      ref="triggerRef"
      class="enpii-popover__trigger"
      role="button"
      tabindex="0"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-controls="isOpen ? popoverId : undefined"
      :aria-label="ariaLabel"
      @click="props.trigger === 'click' && togglePanel()"
      @keydown="onTriggerKeydown"
    >
      <slot name="trigger" />
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        :id="popoverId"
        ref="panelRef"
        role="dialog"
        :aria-modal="props.persistent"
        :class="[
          'enpii-popover__panel',
          `enpii-popover__panel--${activePlacement}`,
          `enpii-popover__panel--align-${props.alignment}`,
        ]"
        :style="panelStyle"
      >
        <span v-if="props.arrow" class="enpii-popover__arrow" aria-hidden="true" />
        <div class="enpii-popover__content">
          <slot name="content" />
        </div>
      </div>
    </Teleport>
  </div>
</template>

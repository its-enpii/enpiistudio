<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT';

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  group?: string;
  icon?: string;
}

const props = withDefaults(defineProps<{
  commands?: CommandItem[];
  hotkey?: string;
}>(), {
  commands: () => [],
  hotkey: 'mod+k',
});

const emit = defineEmits(['select']);
const open = defineModel<boolean>('open', { default: false });
const t = useT();
const search = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const activeIndex = ref(0);

const hotkeyParts = computed(() => props.hotkey.toLowerCase().split('+').filter(Boolean));
const requiresMod = computed(() => hotkeyParts.value.includes('mod'));
const requiresShift = computed(() => hotkeyParts.value.includes('shift'));
const requiresAlt = computed(() => hotkeyParts.value.includes('alt'));
const hotkeyKey = computed(() => hotkeyParts.value[hotkeyParts.value.length - 1]);

const filteredCommands = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return props.commands;
  const queryWords = query.split(/\s+/);
  return props.commands.filter((command) => {
    const haystack = `${command.label} ${command.hint ?? ''} ${command.group ?? ''}`.toLowerCase();
    return queryWords.every((word) => haystack.includes(word));
  });
});

const groupedCommands = computed(() => {
  const groups = new Map<string, CommandItem[]>();
  filteredCommands.value.forEach((command) => {
    const group = command.group || t('commandPalette.otherGroup');
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(command);
  });
  return Array.from(groups.entries()).map(([name, items]) => ({ name, items }));
});

function closePalette() {
  open.value = false;
}

function selectCommand(command: CommandItem) {
  emit('select', command);
  closePalette();
}

function moveHighlight(direction: 1 | -1) {
  if (!filteredCommands.value.length) return;
  activeIndex.value = (activeIndex.value + direction + filteredCommands.value.length) % filteredCommands.value.length;
}

async function focusSearch() {
  await nextTick();
  inputRef.value?.focus();
}

function resetState() {
  search.value = '';
  activeIndex.value = 0;
}

function onListKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    moveHighlight(1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    moveHighlight(-1);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const command = filteredCommands.value[activeIndex.value];
    if (command) selectCommand(command);
  }
}

function isHotkeyMatch(event: KeyboardEvent) {
  const key = event.key.toLowerCase();
  return key === hotkeyKey.value
    && (!requiresMod.value || event.metaKey || event.ctrlKey)
    && (!requiresShift.value || event.shiftKey)
    && (!requiresAlt.value || event.altKey);
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (isHotkeyMatch(event)) {
    event.preventDefault();
    open.value = !open.value;
    if (open.value) resetState();
  } else if (event.key === 'Escape' && open.value) {
    event.preventDefault();
    closePalette();
  }
}

watch(open, async (value) => {
  if (value) {
    resetState();
    await focusSearch();
  }
});

watch(filteredCommands, () => {
  activeIndex.value = 0;
});

onMounted(() => document.addEventListener('keydown', onGlobalKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onGlobalKeydown));
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="enpii-command-palette-enter-active transition-opacity duration-normal ease-standard motion-reduce:transition-none"
      enter-from-class="enpii-command-palette-enter-from opacity-0"
      leave-active-class="enpii-command-palette-leave-active transition-opacity duration-fast ease-accelerate motion-reduce:transition-none"
      leave-to-class="enpii-command-palette-leave-to opacity-0"
    >
      <div v-if="open" class="enpii-command-palette__backdrop fixed inset-0 flex items-start justify-center p-4 bg-surface-inverse/32 backdrop-blur-sm z-modal max-sm:p-2" @click.self="closePalette">
        <section
          role="dialog"
          aria-modal="true"
          :aria-label="t('commandPalette.title')"
          class="enpii-command-palette__dialog grid w-full max-w-160 max-h-[min(80vh,36rem)] mt-[min(10vh,6rem)] overflow-hidden border border-solid border-outline-variant rounded-card bg-surface-container-lowest shadow-overlay max-sm:mt-4 max-sm:max-h-[calc(100dvh-1rem)]"
          @keydown="onListKeydown"
        >
          <label class="enpii-command-palette__search-label absolute w-px h-px p-0 m-[-1px] overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap border-0" for="enpii-command-palette-search">
            {{ t('commandPalette.searchLabel') }}
          </label>
          <input
            id="enpii-command-palette-search"
            ref="inputRef"
            v-model="search"
            type="search"
            class="enpii-command-palette__input w-full min-h-12 py-3 px-4 border-0 border-b border-solid border-b-outline-variant bg-transparent text-on-surface font-sans text-control leading-[1.4] focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-focus"
            :placeholder="t('commandPalette.searchPlaceholder')"
          >
          <ul class="enpii-command-palette__groups m-0 p-2 overflow-y-auto list-none">
            <template v-for="group in groupedCommands" :key="group.name">
              <li class="enpii-command-palette__group-title py-2 pr-2.5 pb-1 text-on-surface-variant text-xs font-medium tracking-[0.02em] uppercase">
                {{ group.name }}
              </li>
              <li v-for="item in group.items" :key="item.id">
                <button
                  type="button"
                  class="enpii-command-palette__command flex w-full min-h-10 items-center gap-2.5 py-2 px-2.5 border-0 rounded-[calc(var(--radius-control)-0.125rem)] bg-none text-on-surface font-inherit text-left cursor-pointer [transition-property:background] duration-fast ease-emphasized motion-reduce:transition-none hover:bg-neutral-soft focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-focus"
                  :class="{ 'enpii-command-palette__command--active': filteredCommands[activeIndex]?.id === item.id }"
                  :aria-label="t('commandPalette.select', { label: item.label })"
                  @click="selectCommand(item)"
                >
                  <AppIcon v-if="item.icon" :name="item.icon" class="enpii-command-palette__icon shrink-0 text-[1.125rem] text-on-surface-variant" />
                  <span class="enpii-command-palette__label min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{{ item.label }}</span>
                  <span v-if="item.hint" class="enpii-command-palette__hint ml-auto text-on-surface-variant text-xs whitespace-nowrap max-sm:hidden">{{ item.hint }}</span>
                </button>
              </li>
            </template>
            <li v-if="!filteredCommands.length" class="enpii-command-palette__empty py-4 px-2.5 text-on-surface-variant text-sm">
              {{ t('commandPalette.noResults') }}
            </li>
          </ul>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

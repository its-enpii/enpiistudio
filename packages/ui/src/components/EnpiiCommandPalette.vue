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
    <Transition name="enpii-command-palette">
      <div v-if="open" class="enpii-command-palette__backdrop" @click.self="closePalette">
        <section
          role="dialog"
          aria-modal="true"
          :aria-label="t('commandPalette.title')"
          class="enpii-command-palette__dialog"
          @keydown="onListKeydown"
        >
          <label class="enpii-command-palette__search-label" for="enpii-command-palette-search">
            {{ t('commandPalette.searchLabel') }}
          </label>
          <input
            id="enpii-command-palette-search"
            ref="inputRef"
            v-model="search"
            type="search"
            class="enpii-command-palette__input"
            :placeholder="t('commandPalette.searchPlaceholder')"
          >
          <ul class="enpii-command-palette__groups">
            <template v-for="group in groupedCommands" :key="group.name">
              <li class="enpii-command-palette__group-title">
                {{ group.name }}
              </li>
              <li v-for="item in group.items" :key="item.id">
                <button
                  type="button"
                  class="enpii-command-palette__command"
                  :class="{ 'enpii-command-palette__command--active': filteredCommands[activeIndex]?.id === item.id }"
                  :aria-label="t('commandPalette.select', { label: item.label })"
                  @click="selectCommand(item)"
                >
                  <AppIcon v-if="item.icon" :name="item.icon" class="enpii-command-palette__icon" />
                  <span class="enpii-command-palette__label">{{ item.label }}</span>
                  <span v-if="item.hint" class="enpii-command-palette__hint">{{ item.hint }}</span>
                </button>
              </li>
            </template>
            <li v-if="!filteredCommands.length" class="enpii-command-palette__empty">
              {{ t('commandPalette.noResults') }}
            </li>
          </ul>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

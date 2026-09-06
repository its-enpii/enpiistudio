<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useT } from '../composables/useT'

export interface TransferOption {
  id: string | number
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  options: TransferOption[]
  modelValue: (string | number)[]
  titles?: [string, string] | null
  searchable?: boolean
  height?: number
}>(), {
  titles: null,
  searchable: true,
  height: 20,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
}>()

const t = useT()
const leftSearch = ref('')
const rightSearch = ref('')
const leftSelected = ref<(string | number)[]>([])
const rightSelected = ref<(string | number)[]>([])
const uid = Math.random().toString(36).slice(2, 11)

const selectedSet = computed(() => new Set(props.modelValue))
const optionMap = computed(() => new Map(props.options.map(option => [option.id, option])))

const available = computed(() => props.options.filter(option => !selectedSet.value.has(option.id)))
const chosen = computed(() => props.modelValue
  .map(id => optionMap.value.get(id))
  .filter((option): option is TransferOption => option !== undefined))

const filteredLeft = computed(() => {
  const query = leftSearch.value.trim().toLowerCase()
  if (!query) return available.value
  return available.value.filter(option =>
    option.label.toLowerCase().includes(query) ||
    (option.description?.toLowerCase().includes(query) ?? false),
  )
})

const filteredRight = computed(() => {
  const query = rightSearch.value.trim().toLowerCase()
  if (!query) return chosen.value
  return chosen.value.filter(option =>
    option.label.toLowerCase().includes(query) ||
    (option.description?.toLowerCase().includes(query) ?? false),
  )
})

const leftTitles = computed(() => props.titles?.[0] ?? t('transferList.available'))
const rightTitles = computed(() => props.titles?.[1] ?? t('transferList.chosen'))

// Available options that are selected for moving right (not disabled)
const moveRightEnabled = computed(() => leftSelected.value.some(id => {
  const option = optionMap.value.get(id)
  return option && !option.disabled && available.value.some(a => a.id === id)
}))

// Chosen options that are selected for moving left
const moveLeftEnabled = computed(() => rightSelected.value.length > 0)

const moveAllRightEnabled = computed(() => available.value.some(option => !option.disabled))
const moveAllLeftEnabled = computed(() => chosen.value.length > 0)

function moveRight(ids?: (string | number)[]) {
  if (ids === undefined) {
    if (!moveRightEnabled.value) return
    ids = leftSelected.value
  }
  const toMove = new Set(ids)
  const next = [...props.modelValue]
  for (const id of ids) {
    const option = optionMap.value.get(id)
    if (!option || option.disabled || selectedSet.value.has(id) || !toMove.has(id)) continue
    next.push(id)
  }
  emit('update:modelValue', next)
  leftSelected.value = leftSelected.value.filter(id => !toMove.has(id))
  rightSelected.value = [...rightSelected.value, ...ids.filter(id => !chosen.value.some(c => c.id === id))]
}

function moveLeft(ids?: (string | number)[]) {
  if (ids === undefined) {
    if (!moveLeftEnabled.value) return
    ids = rightSelected.value
  }
  const toMove = new Set(ids)
  const next = props.modelValue.filter(id => !toMove.has(id))
  emit('update:modelValue', next)
  rightSelected.value = rightSelected.value.filter(id => !toMove.has(id))
  leftSelected.value = [...leftSelected.value, ...ids.filter(id => available.value.some(a => a.id === id))]
}

function moveAllRight() {
  if (!moveAllRightEnabled.value) return
  const movableIds = available.value.filter(option => !option.disabled).map(option => option.id)
  emit('update:modelValue', [...props.modelValue, ...movableIds])
  leftSelected.value = []
  rightSelected.value = [...rightSelected.value, ...movableIds]
}

function moveAllLeft() {
  if (!moveAllLeftEnabled.value) return
  const allIds = props.modelValue
  emit('update:modelValue', [])
  rightSelected.value = []
  leftSelected.value = [...leftSelected.value, ...allIds.filter(id => {
    const option = optionMap.value.get(id)
    return option && !option.disabled
  })]
}

function toggleLeftSelection(id: string | number, event: Event) {
  if (event instanceof KeyboardEvent && event.key === 'Enter') {
    event.preventDefault()
    moveRight([id])
    return
  }
  const index = leftSelected.value.indexOf(id)
  if (index >= 0) leftSelected.value.splice(index, 1)
  else leftSelected.value.push(id)
}

function toggleRightSelection(id: string | number, event: Event) {
  if (event instanceof KeyboardEvent && event.key === 'Enter') {
    event.preventDefault()
    moveLeft([id])
    return
  }
  const index = rightSelected.value.indexOf(id)
  if (index >= 0) rightSelected.value.splice(index, 1)
  else rightSelected.value.push(id)
}

watch(() => props.modelValue, () => {
  leftSelected.value = leftSelected.value.filter(id => available.value.some(a => a.id === id))
  rightSelected.value = rightSelected.value.filter(id => chosen.value.some(c => c.id === id))
})

const leftListId = `enpii-transfer-list-${uid}-left`
const rightListId = `enpii-transfer-list-${uid}-right`
</script>

<template>
    <div class="enpii-transfer-list grid grid-cols-1 gap-3 items-start w-full md:grid-cols-[1fr_auto_1fr]">
        <div class="enpii-transfer-list__panel enpii-transfer-list__panel--left flex flex-col gap-2 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-control bg-surface-container-lowest overflow-hidden forced-colors:border-canvas-text">
            <div class="enpii-transfer-list__header flex items-center justify-between py-2 px-3 bg-surface-container-low">
                <span :id="`${leftListId}-label`" class="enpii-transfer-list__title text-[0.8125rem] font-medium text-on-surface-variant">{{ leftTitles }}</span>
                <span class="enpii-transfer-list__count inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-primary-soft text-primary-text text-[0.6875rem] font-medium tabular-nums">{{ available.length }}</span>
            </div>
            <input
                v-if="searchable"
                v-model="leftSearch"
                type="text"
                class="enpii-transfer-list__search min-h-10 mx-2 px-2 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-[calc(var(--radius-control)-0.25rem)] bg-surface-container-lowest text-on-surface font-inherit text-[0.8125rem] placeholder:text-outline [transition-property:border-color,box-shadow] duration-fast ease-emphasized motion-reduce:transition-none hover:enabled:[border-color:color-mix(in_srgb,var(--color-primary)_40%,transparent)] focus:outline-none focus:border-primary-container focus:[box-shadow:var(--shadow-focus)]"
                :placeholder="t('transferList.searchPlaceholder')"
                :aria-label="t('transferList.searchLeft')"
            >
            <ul
                :id="leftListId"
                class="enpii-transfer-list__list overflow-y-auto p-1 m-0 list-none"
                role="listbox"
                :aria-labelledby="`${leftListId}-label`"
                :aria-multiselectable="true"
                :aria-activedescendant="leftSelected.length ? `${leftListId}-${leftSelected[0]}` : undefined"
            >
                <li
                    v-for="option in filteredLeft"
                    :key="option.id"
                    :id="`${leftListId}-${option.id}`"
                    class="enpii-transfer-list__option flex flex-col gap-0.5 min-h-10 py-2 px-2.5 border-0 rounded-[calc(var(--radius-control)-0.25rem)] bg-none text-on-surface font-inherit text-[0.8125rem] cursor-pointer [transition-property:background,color] duration-fast ease-emphasized motion-reduce:transition-none hover:not-disabled:bg-neutral-soft focus-visible:outline-3 focus-visible:-outline-offset-1 focus-visible:outline-focus"
                    :class="{
                        'enpii-transfer-list__option--selected': leftSelected.includes(option.id),
                        'enpii-transfer-list__option--disabled': option.disabled,
                    }"
                    role="option"
                    :aria-selected="leftSelected.includes(option.id)"
                    :aria-disabled="option.disabled"
                    :data-testid="`transfer-left-${option.id}`"
                    tabindex="0"
                    @click="toggleLeftSelection(option.id, $event)"
                    @keydown="toggleLeftSelection(option.id, $event)"
                    @dblclick="!option.disabled && moveRight([option.id])"
                >
                    <span class="enpii-transfer-list__option-label font-medium">{{ option.label }}</span>
                    <span v-if="option.description" class="enpii-transfer-list__option-description text-on-surface-variant text-xs font-normal">{{ option.description }}</span>
                </li>
            </ul>
            <p v-if="!filteredLeft.length" class="enpii-transfer-list__empty py-2 px-3 text-outline text-xs italic">{{ t('transferList.noOptions') }}</p>
        </div>

        <div class="enpii-transfer-list__controls flex flex-col gap-1.5 pt-1 max-md:flex-row max-md:justify-center max-md:p-0" role="group" :aria-label="t('transferList.controlsLabel')">
            <button
                type="button"
                class="enpii-transfer-list__button inline-flex items-center justify-center min-w-10 min-h-10 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-[calc(var(--radius-control)-0.25rem)] bg-surface-container-lowest text-primary-text text-lg font-medium leading-none cursor-pointer [transition-property:background,color,transform,box-shadow] duration-fast ease-emphasized motion-reduce:transition-none hover:enabled:bg-primary-soft active:enabled:[transform:scale(.96)] focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-focus disabled:text-outline disabled:cursor-not-allowed disabled:opacity-45"
                :disabled="!moveRightEnabled"
                :aria-label="t('transferList.moveRight')"
                @click="moveRight()"
            >›</button>
            <button
                type="button"
                class="enpii-transfer-list__button"
                :disabled="!moveAllRightEnabled"
                :aria-label="t('transferList.moveAllRight')"
                @click="moveAllRight()"
            >»</button>
            <button
                type="button"
                class="enpii-transfer-list__button"
                :disabled="!moveAllLeftEnabled"
                :aria-label="t('transferList.moveAllLeft')"
                @click="moveAllLeft()"
            >«</button>
            <button
                type="button"
                class="enpii-transfer-list__button"
                :disabled="!moveLeftEnabled"
                :aria-label="t('transferList.moveLeft')"
                @click="moveLeft()"
            >‹</button>
        </div>

        <div class="enpii-transfer-list__panel enpii-transfer-list__panel--right flex flex-col gap-2 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-control bg-surface-container-lowest overflow-hidden forced-colors:border-canvas-text">
            <div class="enpii-transfer-list__header flex items-center justify-between py-2 px-3 bg-surface-container-low">
                <span :id="`${rightListId}-label`" class="enpii-transfer-list__title text-[0.8125rem] font-medium text-on-surface-variant">{{ rightTitles }}</span>
                <span class="enpii-transfer-list__count inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-primary-soft text-primary-text text-[0.6875rem] font-medium tabular-nums">{{ chosen.length }}</span>
            </div>
            <input
                v-if="searchable"
                v-model="rightSearch"
                type="text"
                class="enpii-transfer-list__search min-h-10 mx-2 px-2 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-[calc(var(--radius-control)-0.25rem)] bg-surface-container-lowest text-on-surface font-inherit text-[0.8125rem] placeholder:text-outline [transition-property:border-color,box-shadow] duration-fast ease-emphasized motion-reduce:transition-none hover:enabled:[border-color:color-mix(in_srgb,var(--color-primary)_40%,transparent)] focus:outline-none focus:border-primary-container focus:[box-shadow:var(--shadow-focus)]"
                :placeholder="t('transferList.searchPlaceholder')"
                :aria-label="t('transferList.searchRight')"
            >
            <ul
                :id="rightListId"
                class="enpii-transfer-list__list overflow-y-auto p-1 m-0 list-none"
                role="listbox"
                :aria-labelledby="`${rightListId}-label`"
                :aria-multiselectable="true"
                :aria-activedescendant="rightSelected.length ? `${rightListId}-${rightSelected[0]}` : undefined"
            >
                <li
                    v-for="option in filteredRight"
                    :key="option.id"
                    :id="`${rightListId}-${option.id}`"
                    class="enpii-transfer-list__option flex flex-col gap-0.5 min-h-10 py-2 px-2.5 border-0 rounded-[calc(var(--radius-control)-0.25rem)] bg-none text-on-surface font-inherit text-[0.8125rem] cursor-pointer [transition-property:background,color] duration-fast ease-emphasized motion-reduce:transition-none hover:not-disabled:bg-neutral-soft focus-visible:outline-3 focus-visible:-outline-offset-1 focus-visible:outline-focus"
                    :class="{
                        'enpii-transfer-list__option--selected': rightSelected.includes(option.id),
                    }"
                    role="option"
                    :aria-selected="rightSelected.includes(option.id)"
                    :data-testid="`transfer-right-${option.id}`"
                    tabindex="0"
                    @click="toggleRightSelection(option.id, $event)"
                    @keydown="toggleRightSelection(option.id, $event)"
                    @dblclick="moveLeft([option.id])"
                >
                    <span class="enpii-transfer-list__option-label font-medium">{{ option.label }}</span>
                    <span v-if="option.description" class="enpii-transfer-list__option-description text-on-surface-variant text-xs font-normal">{{ option.description }}</span>
                </li>
            </ul>
            <p v-if="!filteredRight.length" class="enpii-transfer-list__empty py-2 px-3 text-outline text-xs italic">{{ t('transferList.noOptions') }}</p>
        </div>
    </div>
</template>

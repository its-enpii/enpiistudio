<script setup lang="ts">
import { ref, computed, watch, nextTick, useId } from 'vue'
import { useT } from '../composables/useT'
import EnpiiLabel from './EnpiiLabel.vue'

export interface MentionUser {
    id: string | number
    label: string
    avatar?: string
}

export interface ParsedMention {
    id: string | number
    label: string
    index: number
}

interface PreviewSegment {
    text: string
    mention: boolean
}

const props = withDefaults(defineProps<{
    modelValue: string
    users: MentionUser[]
    trigger?: string
    maxMentions?: number
    disabled?: boolean
    readonly?: boolean
    rows?: number
}>(), {
    trigger: '@',
    rows: 3,
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const t = useT()
const inputId = `enpii-mention-input-${useId()}`
const listboxId = `${inputId}-listbox`

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const currentValue = ref(props.modelValue)
const showSuggestions = ref(false)
const query = ref('')
const activeIndex = ref(0)
const triggerStart = ref(-1)

const filteredUsers = computed(() => {
    const normalizedQuery = query.value.toLowerCase()
    let availableUsers = props.users

    if (props.maxMentions != null) {
        const parsedMentions = parseMentions()
        const usedIds = new Set(parsedMentions.map((mention) => mention.id))
        if (parsedMentions.length >= props.maxMentions) {
            return []
        }
        availableUsers = availableUsers.filter((user) => !usedIds.has(user.id))
    }

    return availableUsers.filter((user) => user.label.toLowerCase().includes(normalizedQuery))
})

const previewSegments = computed<PreviewSegment[]>(() => {
    const segments: PreviewSegment[] = []
    const mentions = parseMentions()
    let cursor = 0

    for (const mention of mentions) {
        if (mention.index > cursor) {
            segments.push({ text: props.modelValue.slice(cursor, mention.index), mention: false })
        }
        segments.push({ text: `${props.trigger}${mention.label}`, mention: true })
        cursor = mention.index + props.trigger.length + mention.label.length
    }

    if (cursor < props.modelValue.length) {
        segments.push({ text: props.modelValue.slice(cursor), mention: false })
    }

    return segments
})

watch(() => props.modelValue, (value) => {
    currentValue.value = value
})

watch(filteredUsers, (users) => {
    if (activeIndex.value >= users.length) {
        activeIndex.value = Math.max(0, users.length - 1)
    }
})

function updateValue(event: Event) {
    const textarea = event.target as HTMLTextAreaElement
    const value = textarea.value
    const cursorPosition = textarea.selectionStart ?? value.length
    const textBeforeCursor = value.slice(0, cursorPosition)

    currentValue.value = value
    emit('update:modelValue', value)

    const lastTriggerIndex = textBeforeCursor.lastIndexOf(props.trigger)
    const characterBefore = lastTriggerIndex > 0 ? textBeforeCursor[lastTriggerIndex - 1] : ' '
    const textAfterTrigger = textBeforeCursor.slice(lastTriggerIndex + props.trigger.length)

    if (
        lastTriggerIndex === -1
        || (lastTriggerIndex > 0 && characterBefore !== ' ' && characterBefore !== '\n')
        || /\s/.test(textAfterTrigger)
    ) {
        closeSuggestions()
        return
    }

    query.value = textAfterTrigger
    triggerStart.value = lastTriggerIndex
    showSuggestions.value = true
    activeIndex.value = 0
}

function closeSuggestions() {
    showSuggestions.value = false
    query.value = ''
    triggerStart.value = -1
}

function selectUser(user: MentionUser) {
    const textarea = textareaRef.value
    if (!textarea || props.disabled || props.readonly) {
        return
    }

    const value = textarea.value
    const cursorPosition = textarea.selectionStart ?? value.length
    const textBeforeTrigger = value.slice(0, triggerStart.value)
    const textAfterCursor = value.slice(cursorPosition)
    const insertedText = `${props.trigger}${user.label} `
    const nextValue = textBeforeTrigger + insertedText + textAfterCursor

    currentValue.value = nextValue
    emit('update:modelValue', nextValue)
    closeSuggestions()

    nextTick(() => {
        const selectionIndex = textBeforeTrigger.length + insertedText.length
        textarea.setSelectionRange(selectionIndex, selectionIndex)
        textarea.focus()
    })
}

function handleKeydown(event: KeyboardEvent) {
    if (!showSuggestions.value || filteredUsers.value.length === 0) {
        return
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault()
        activeIndex.value = (activeIndex.value + 1) % filteredUsers.value.length
        return
    }

    if (event.key === 'ArrowUp') {
        event.preventDefault()
        activeIndex.value = (activeIndex.value - 1 + filteredUsers.value.length) % filteredUsers.value.length
        return
    }

    if (event.key === 'Enter') {
        event.preventDefault()
        selectUser(filteredUsers.value[activeIndex.value])
        return
    }

    if (event.key === 'Escape') {
        event.preventDefault()
        closeSuggestions()
    }
}

function parseMentions(): ParsedMention[] {
    const mentions: ParsedMention[] = []
    const value = currentValue.value

    for (const user of props.users) {
        const token = `${props.trigger}${user.label}`
        let searchStart = 0

        while (searchStart <= value.length) {
            const mentionIndex = value.indexOf(token, searchStart)
            if (mentionIndex === -1) {
                break
            }

            const tokenEnd = mentionIndex + token.length
            const nextCharacter = tokenEnd < value.length ? value[tokenEnd] : ' '
            if (nextCharacter === ' ' || nextCharacter === '\n') {
                mentions.push({ id: user.id, label: user.label, index: mentionIndex })
            }
            searchStart = tokenEnd
        }
    }

    return mentions.sort((first, second) => first.index - second.index)
}

function optionId(index: number) {
    return `${listboxId}-option-${index}`
}

defineExpose({ parseMentions })
</script>

<template>
    <div
        class="enpii-mention-input relative grid gap-field-gap w-full"
        :class="{
            'enpii-mention-input--disabled': disabled,
            'enpii-mention-input--readonly': readonly,
        }"
    >
        <EnpiiLabel :for="inputId" size="sm" tone="muted" class="enpii-mention-input__label ml-1">
            {{ t('mentionInput.label') }}
        </EnpiiLabel>

        <div class="enpii-mention-input__wrap relative">
            <textarea
                :id="inputId"
                ref="textareaRef"
                :value="modelValue"
        class="enpii-mention-input__control w-full min-h-24 py-3 px-4 border border-solid [border-width:var(--control-border-width)] [border-color:var(--field-border)] rounded-control [background-color:var(--field-bg)] [color:var(--field-fg)] [font-family:inherit] text-control leading-normal resize-y placeholder:[color:var(--field-placeholder-fg)] appearance-none [transition-property:border-color,box-shadow,background] duration-fast ease-emphasized motion-reduce:transition-none hover:enabled:not-[readonly]:[border-color:var(--field-border)] focus:outline-none focus-visible:outline-none focus:[border-color:var(--field-border)] focus-visible:[border-color:var(--field-border)] focus:[box-shadow:var(--shadow-focus)] focus-visible:[box-shadow:var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-60 disabled:[background-color:var(--field-bg)]"
                :class="{ 'enpii-mention-input__control--readonly': readonly }"
                :rows="rows"
                :disabled="disabled"
                :readonly="readonly"
                :placeholder="readonly ? undefined : t('mentionInput.placeholder')"
                role="combobox"
                :aria-expanded="showSuggestions && filteredUsers.length > 0"
                :aria-controls="showSuggestions && filteredUsers.length > 0 ? listboxId : undefined"
                :aria-activedescendant="showSuggestions && filteredUsers.length > 0 ? optionId(activeIndex) : undefined"
                aria-autocomplete="list"
                :aria-label="t('mentionInput.ariaLabel')"
                @input="updateValue"
                @keydown="handleKeydown"
                @blur="closeSuggestions"
            />

            <ul
                v-if="showSuggestions && filteredUsers.length > 0"
                :id="listboxId"
                class="enpii-mention-input__suggestions absolute top-[calc(100%+0.25rem)] left-0 right-0 max-h-56 m-0 p-1 overflow-y-auto list-none border border-solid [border-color:var(--overlay-border-color)] rounded-control [background-color:var(--overlay-surface-bg)] shadow-overlay z-dropdown forced-colors:border-canvas-text max-xs:text-[0.8125rem]"
                role="listbox"
                :aria-label="t('mentionInput.suggestionsLabel')"
            >
                <li
                    v-for="(user, index) in filteredUsers"
                    :id="optionId(index)"
                    :key="user.id"
                    class="enpii-mention-input__suggestion flex items-center gap-2 min-h-10 py-2 px-2.5 border-0 rounded-[calc(var(--radius-control)-0.25rem)] bg-transparent [color:var(--overlay-surface-fg)] text-sm font-normal text-left cursor-pointer [transition-property:background] duration-fast ease-emphasized motion-reduce:transition-none hover:[background-color:var(--nav-hover-bg)] data-[active=true]:[background-color:var(--nav-active-bg)] data-[active=true]:[color:var(--nav-active-fg)] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-offset:var(--focus-offset-negative)] focus-visible:outline-focus"
                    role="option"
                    :aria-selected="index === activeIndex"
                    :data-active="index === activeIndex"
                    @mousedown.prevent="selectUser(user)"
                >
                    <img
                        v-if="user.avatar"
                        :src="user.avatar"
                        :alt="user.label"
                        class="enpii-mention-input__avatar w-6 h-6 shrink-0 rounded-full object-cover"
                    >
                    <span class="enpii-mention-input__user-label overflow-hidden text-ellipsis whitespace-nowrap">{{ user.label }}</span>
                </li>
            </ul>
        </div>

        <slot name="preview" :segments="previewSegments">
            <p v-if="readonly" class="enpii-mention-input__preview m-0 py-3 px-4 border border-solid [border-color:var(--field-border)] rounded-control [background-color:var(--field-bg)] [color:var(--field-fg)] text-sm font-normal leading-normal whitespace-pre-wrap">
                <template v-for="(segment, index) in previewSegments" :key="`${index}-${segment.text}`">
                    <mark v-if="segment.mention" class="enpii-mention-input__mark py-0.5 px-1 rounded-md [background-color:var(--tone-primary-soft-bg)] [color:var(--tone-primary-soft-fg)] font-medium">{{ segment.text }}</mark>
                    <template v-else>{{ segment.text }}</template>
                </template>
            </p>
        </slot>
    </div>
</template>

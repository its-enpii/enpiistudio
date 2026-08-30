<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useT } from '../composables/useT'

const props = withDefaults(defineProps<{
    modelValue?: string[]
    suggestions?: string[]
    maxTags?: number
    placeholder?: string
    disabled?: boolean
    allowDuplicates?: boolean
}>(), {
    modelValue: () => [],
    suggestions: () => [],
    maxTags: undefined,
    placeholder: undefined,
    disabled: false,
    allowDuplicates: false,
})

const emit = defineEmits<{
    'update:modelValue': [value: string[]]
}>()

const t = useT()
const inputValue = ref('')
const activeSuggestion = ref(-1)
const inputId = `enpii-tag-input-${Math.random().toString(36).slice(2, 11)}`
const listboxId = `${inputId}-listbox`

const tags = computed(() => props.modelValue)
const atLimit = computed(() => props.maxTags !== undefined && tags.value.length >= props.maxTags)
const filteredSuggestions = computed(() => {
    const query = inputValue.value.trim().toLowerCase()
    return props.suggestions.filter((suggestion) => {
        const matchesQuery = query === '' || suggestion.toLowerCase().includes(query)
        const isDuplicate = !props.allowDuplicates && tags.value.some((tag) => tag.toLowerCase() === suggestion.toLowerCase())
        return matchesQuery && !isDuplicate
    })
})

watch(() => [inputValue.value, props.suggestions, props.modelValue], () => {
    activeSuggestion.value = filteredSuggestions.value.length ? 0 : -1
}, { immediate: true })

function emitTags(nextTags: string[]) {
    emit('update:modelValue', nextTags)
}

function addTag(rawTag: string): boolean {
    const tag = rawTag.trim()
    if (!tag || atLimit.value) {
        return false
    }

    const isDuplicate = tags.value.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase())
    if (isDuplicate && !props.allowDuplicates) {
        return false
    }

    emitTags([...tags.value, tag])
    return true
}

function selectSuggestion(suggestion: string) {
    if (addTag(suggestion)) {
        inputValue.value = ''
    }
}

function removeTag(index: number) {
    if (props.disabled) {
        return
    }
    emitTags(tags.value.filter((_, tagIndex) => tagIndex !== index))
}

function removeLastTag() {
    if (tags.value.length) {
        emitTags(tags.value.slice(0, -1))
    }
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault()
        const selectedSuggestion = filteredSuggestions.value[activeSuggestion.value]
        const tagToAdd = selectedSuggestion ?? inputValue.value
        if (addTag(tagToAdd)) {
            inputValue.value = ''
        }
        return
    }

    if (event.key === 'Backspace') {
        if (inputValue.value === '') {
            event.preventDefault()
            removeLastTag()
        }
        return
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (!filteredSuggestions.value.length) {
            return
        }
        activeSuggestion.value = (activeSuggestion.value + 1) % filteredSuggestions.value.length
        return
    }

    if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (!filteredSuggestions.value.length) {
            return
        }
        activeSuggestion.value = (activeSuggestion.value - 1 + filteredSuggestions.value.length) % filteredSuggestions.value.length
    }
}
</script>

<template>
    <div class="enpii-tag-input" :class="{ 'enpii-tag-input--disabled': disabled }">
        <label :for="inputId" class="enpii-tag-input__label">{{ t('tagInput.label') }}</label>
        <div class="enpii-tag-input__control" role="list" :aria-label="t('tagInput.label')">
            <span
                v-for="(tag, index) in tags"
                :key="`${tag}-${index}`"
                class="enpii-tag-input__tag"
                role="listitem"
                :data-testid="`tag-${index}`"
            >
                {{ tag }}
                <button
                    type="button"
                    class="enpii-tag-input__remove"
                    :disabled="disabled"
                    :aria-label="t('tagInput.removeTag', { tag })"
                    @click="removeTag(index)"
                >
                    ×
                </button>
            </span>
            <input
                :id="inputId"
                v-model="inputValue"
                type="text"
                class="enpii-tag-input__field"
                :placeholder="placeholder ?? t('tagInput.placeholder')"
                :disabled="disabled || atLimit"
                :aria-label="t('tagInput.addTagLabel')"
                role="combobox"
                :aria-expanded="filteredSuggestions.length > 0"
                :aria-controls="filteredSuggestions.length ? listboxId : undefined"
                aria-autocomplete="list"
                @keydown="onKeydown"
            >
        </div>
        <ul v-if="filteredSuggestions.length" :id="listboxId" class="enpii-tag-input__suggestions" role="listbox">
            <li
                v-for="(suggestion, index) in filteredSuggestions"
                :key="suggestion"
                class="enpii-tag-input__suggestion"
                role="option"
                :aria-selected="index === activeSuggestion"
                :data-active="index === activeSuggestion"
                @mousedown.prevent="selectSuggestion(suggestion)"
            >
                {{ suggestion }}
            </li>
        </ul>
    </div>
</template>

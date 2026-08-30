<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import AppIcon from './EnpiiIcon.vue'
import { useShape } from '../composables/useShape'
import { WEEKDAYS, clampIso, createMonthGrid, parseIsoDate, shiftMonth, toIsoDate, usePopupPosition } from '../composables/useCalendar'
import { useT } from '../composables/useT'

const t = useT()

const model = defineModel({ type: Object, default: () => ({ start: '', end: '' }) })
const props = defineProps({
    id: { type: String, default: null },
    label: { type: String, required: true },
    icon: { type: String, default: 'date_range' },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    min: { type: String, default: null },
    max: { type: String, default: null },
    presets: { type: Array, default: () => [] },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
})

const emit = defineEmits(['change'])
const shapeClass = useShape(props)
const generatedId = useId()
const inputId = props.id || generatedId
const root = ref(null)
const trigger = ref(null)
const popup = ref(null)
const open = ref(false)
const draft = ref({ start: model.value?.start || '', end: model.value?.end || '' })
const leftView = ref(new Date())
const rightView = ref(shiftMonth(leftView.value, 1))
const today = toIsoDate(new Date())
const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
const { placeAbove, popupStyle, position, attachViewportListeners, detachViewportListeners } = usePopupPosition(trigger, popup, {
    minWidth: 672,
    estimatedHeight: 440,
})

const presetItems = computed(() => props.presets.map((preset) => {
    const definitions = {
        '7d': { label: '7 hari', days: 6 },
        '30d': { label: '30 hari', days: 29 },
        '90d': { label: '90 hari', days: 89 },
    }
    return typeof preset === 'string'
        ? { key: preset, label: definitions[preset]?.label || preset, ...(definitions[preset] || { days: 0 }) }
        : { key: preset.key, label: preset.label, days: preset.days ?? 0 }
}))

const leftDays = computed(() => createMonthGrid(leftView.value, props.min, props.max))
const rightDays = computed(() => createMonthGrid(rightView.value, props.min, props.max))
const leftLabel = computed(() => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(leftView.value))
const rightLabel = computed(() => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(rightView.value))
const displayValue = computed(() => {
    const start = parseIsoDate(draft.value.start)
    const end = parseIsoDate(draft.value.end)
    if (!start) return ''
    return end ? `${dateFormatter.format(start)} – ${dateFormatter.format(end)}` : dateFormatter.format(start)
})
const isInvalidRange = computed(() => Boolean(draft.value.start && draft.value.end && draft.value.end < draft.value.start))

function emitChange(next) {
    const value = { start: next.start || '', end: next.end || '' }
    model.value = value
    emit('change', value)
}

function selectPreset(preset) {
    const end = clampIso(toIsoDate(new Date()), props.min, props.max)
    const startDate = parseIsoDate(end) || new Date()
    const start = toIsoDate(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - preset.days))
    draft.value = { start: clampIso(start, props.min, props.max), end }
    alignViews()
    emitChange(draft.value)
}

function choose(day) {
    if (day.disabled || isInvalidSelection(day.iso)) return
    if (!draft.value.start || draft.value.end || day.iso < draft.value.start) {
        draft.value = { start: day.iso, end: '' }
    } else {
        draft.value = { start: draft.value.start, end: day.iso }
    }
    alignViews()
    if (draft.value.start && draft.value.end) emitChange(draft.value)
}

function isInvalidSelection(iso) {
    return Boolean((props.min && iso < props.min) || (props.max && iso > props.max))
}

function commitInput(field, event) {
    const value = event.target.value
    if (value && isInvalidSelection(value)) return
    draft.value = { ...draft.value, [field]: value }
    alignViews()
    if (draft.value.start && draft.value.end) emitChange(draft.value)
}

function applyRange() {
    if (!draft.value.start || !draft.value.end || isInvalidRange.value) return
    emitChange(draft.value)
    close(true)
}

function clear() {
    draft.value = { start: '', end: '' }
    alignViews()
    emitChange(draft.value)
    close(true)
}

function alignViews() {
    const reference = parseIsoDate(draft.value.start) || new Date()
    leftView.value = new Date(reference.getFullYear(), reference.getMonth(), 1)
    rightView.value = shiftMonth(leftView.value, 1)
}

function openPopup() {
    if (props.disabled) return
    draft.value = { start: model.value?.start || '', end: model.value?.end || '' }
    alignViews()
    open.value = true
    nextTick(() => {
        position()
        requestAnimationFrame(position)
    })
}

function close(restoreFocus = false) {
    open.value = false
    if (restoreFocus) nextTick(() => trigger.value?.focus())
}

function moveViews(amount) {
    leftView.value = shiftMonth(leftView.value, amount)
    rightView.value = shiftMonth(rightView.value, amount)
}

function onDocumentClick(event) {
    if (!root.value?.contains(event.target) && !popup.value?.contains(event.target)) close()
}

function onKeydown(event) {
    if (event.key === 'Escape') close(true)
}

watch(model, (value) => {
    draft.value = { start: value?.start || '', end: value?.end || '' }
}, { deep: true })

onMounted(() => {
    document.addEventListener('click', onDocumentClick)
    attachViewportListeners()
})

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick)
    detachViewportListeners()
})
</script>

<template>
    <div ref="root" class="enpii-date-range">
        <label :for="inputId" class="enpii-date-range__label">{{ label }}</label>
        <button
            :id="inputId"
            ref="trigger"
            type="button"
            class="enpii-date-range__control"
            :class="[shapeClass, { 'enpii-date-range__control--error': Boolean(error || isInvalidRange) }]"
            :disabled="disabled"
            :aria-expanded="open"
            :aria-controls="`${inputId}-calendar`"
            :aria-invalid="Boolean(error || isInvalidRange)"
            :aria-required="required"
            @click="open ? close() : openPopup()"
        >
            <AppIcon :name="icon" class="enpii-date-range__icon" />
            <span class="enpii-date-range__value" :class="{ 'enpii-date-range__value--placeholder': !displayValue }">
                {{ displayValue || t('dateRange.placeholder') }}
            </span>
            <AppIcon name="expand_more" class="enpii-date-range__chevron" />
        </button>

        <Teleport to="body">
            <Transition name="dropdown">
                <div
                    v-if="open"
                    :id="`${inputId}-calendar`"
                    ref="popup"
                    role="dialog"
                    :aria-label="t('dateRange.placeholder')"
                    class="enpii-date-range__popup"
                    :class="[placeAbove ? 'enpii-date-range__popup--above-origin' : 'enpii-date-range__popup--below-origin']"
                    :style="popupStyle"
                    tabindex="-1"
                    @keydown="onKeydown"
                >
                    <div v-if="presetItems.length" class="enpii-date-range__presets">
                        <button v-for="preset in presetItems" :key="preset.key" type="button" class="enpii-date-range__preset" @click="selectPreset(preset)">
                            {{ preset.label }}
                        </button>
                        <button type="button" class="enpii-date-range__preset" @click="draft = { start: '', end: '' }">Custom</button>
                    </div>

                    <div class="enpii-date-range__inputs">
                        <label><span>Mulai</span><input type="date" :min="min" :max="max" :value="draft.start" @change="commitInput('start', $event)"></label>
                        <label><span>Selesai</span><input type="date" :min="min" :max="max" :value="draft.end" @change="commitInput('end', $event)"></label>
                    </div>

                    <div class="enpii-date-range__calendars">
                        <section>
                            <header>
                                <button type="button" :aria-label="t('dateRange.previousMonth')" @click="moveViews(-1)"><AppIcon name="chevron_left" /></button>
                                <strong>{{ leftLabel }}</strong><span />
                            </header>
                            <div class="enpii-date-range__weekdays"><span v-for="weekday in WEEKDAYS" :key="weekday">{{ weekday }}</span></div>
                            <div class="enpii-date-range__days">
                                <button v-for="day in leftDays" :key="`left-${day.iso}`" type="button" :disabled="day.disabled" :aria-pressed="day.iso === draft.start || day.iso === draft.end" class="enpii-date-range__day" :class="{ 'enpii-date-range__day--outside': !day.currentMonth, 'enpii-date-range__day--today': day.iso === today, 'enpii-date-range__day--selected': [draft.start, draft.end].includes(day.iso), 'enpii-date-range__day--between': day.iso > draft.start && day.iso < draft.end }" @click="choose(day)">
                                    {{ day.day }}
                                </button>
                            </div>
                        </section>
                        <section>
                            <header>
                                <span /><strong>{{ rightLabel }}</strong>
                                <button type="button" :aria-label="t('dateRange.nextMonth')" @click="moveViews(1)"><AppIcon name="chevron_right" /></button>
                            </header>
                            <div class="enpii-date-range__weekdays"><span v-for="weekday in WEEKDAYS" :key="weekday">{{ weekday }}</span></div>
                            <div class="enpii-date-range__days">
                                <button v-for="day in rightDays" :key="`right-${day.iso}`" type="button" :disabled="day.disabled" :aria-pressed="day.iso === draft.start || day.iso === draft.end" class="enpii-date-range__day" :class="{ 'enpii-date-range__day--outside': !day.currentMonth, 'enpii-date-range__day--today': day.iso === today, 'enpii-date-range__day--selected': [draft.start, draft.end].includes(day.iso), 'enpii-date-range__day--between': day.iso > draft.start && day.iso < draft.end }" @click="choose(day)">
                                    {{ day.day }}
                                </button>
                            </div>
                        </section>
                    </div>

                    <footer class="enpii-date-range__footer">
                        <button v-if="clearable && (draft.start || draft.end)" type="button" class="enpii-date-range__footer-button enpii-date-range__footer-button--clear" @click="clear">{{ t('dateRange.clear') }}</button>
                        <button type="button" class="enpii-date-range__footer-button" :disabled="!draft.start || !draft.end || isInvalidRange" @click="applyRange">Terapkan</button>
                    </footer>
                </div>
            </Transition>
        </Teleport>
        <p v-if="error || isInvalidRange" class="enpii-date-range__help enpii-date-range__help--error">{{ error || t('dateRange.invalidRange') }}</p>
        <p v-else-if="hint" class="enpii-date-range__help">{{ hint }}</p>
    </div>
</template>

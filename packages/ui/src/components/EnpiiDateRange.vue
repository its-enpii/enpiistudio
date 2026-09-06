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
    <div ref="root" class="enpii-date-range relative w-full grid gap-field-gap">
        <label :for="inputId" class="enpii-date-range__label text-on-surface-variant text-sm font-medium">{{ label }}</label>
        <button
            :id="inputId"
            ref="trigger"
            type="button"
            class="enpii-date-range__control flex w-full min-h-control items-center gap-2 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-control bg-surface-container-lowest text-on-surface font-inherit text-base text-left cursor-pointer [transition-property:border-color,box-shadow] duration-fast ease-emphasized hover:enabled:border-primary-border focus-visible:outline-none focus-visible:border-primary-container focus-visible:[box-shadow:var(--shadow-focus)] disabled:opacity-60 disabled:cursor-not-allowed"
            :class="[shapeClass, { 'enpii-date-range__control--error border-danger-border': Boolean(error || isInvalidRange) }]"
            :disabled="disabled"
            :aria-expanded="open"
            :aria-controls="`${inputId}-calendar`"
            :aria-invalid="Boolean(error || isInvalidRange)"
            :aria-required="required"
            @click="open ? close() : openPopup()"
        >
            <AppIcon :name="icon" class="enpii-date-range__icon w-5 h-5 flex-none text-outline text-xl leading-none" />
            <span class="enpii-date-range__value flex-1 overflow-hidden text-ellipsis whitespace-nowrap" :class="{ 'enpii-date-range__value--placeholder text-outline': !displayValue }">
                {{ displayValue || t('dateRange.placeholder') }}
            </span>
            <AppIcon name="expand_more" class="enpii-date-range__chevron w-5 h-5 flex-none text-outline text-xl leading-none" />
        </button>

        <Teleport to="body">
            <Transition name="dropdown">
                <div
                    v-if="open"
                    :id="`${inputId}-calendar`"
                    ref="popup"
                    role="dialog"
                    :aria-label="t('dateRange.placeholder')"
                    class="enpii-date-range__popup grid gap-3 p-3 border border-solid border-outline-variant [border-width:var(--overlay-border-width)] rounded-control bg-surface-container-lowest shadow-overlay"
                    :class="[placeAbove ? 'enpii-date-range__popup--above-origin' : 'enpii-date-range__popup--below-origin']"
                    :style="popupStyle"
                    tabindex="-1"
                    @keydown="onKeydown"
                >
                    <div v-if="presetItems.length" class="enpii-date-range__presets flex flex-wrap gap-1">
                        <button v-for="preset in presetItems" :key="preset.key" type="button" class="enpii-date-range__preset py-1 px-2 border-0 rounded-[9999px] bg-surface-container-low text-on-surface-variant font-inherit text-sm font-medium cursor-pointer [transition-property:background,color] duration-fast ease-emphasized hover:bg-primary-soft hover:text-primary-text focus-visible:bg-primary-soft focus-visible:text-primary-text" @click="selectPreset(preset)">
                            {{ preset.label }}
                        </button>
                        <button type="button" class="enpii-date-range__preset py-1 px-2 border-0 rounded-[9999px] bg-surface-container-low text-on-surface-variant font-inherit text-sm font-medium cursor-pointer [transition-property:background,color] duration-fast ease-emphasized hover:bg-primary-soft hover:text-primary-text focus-visible:bg-primary-soft focus-visible:text-primary-text" @click="draft = { start: '', end: '' }">Custom</button>
                    </div>

                    <div class="enpii-date-range__inputs grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
                        <label class="grid gap-1 text-on-surface-variant text-sm"><span>Mulai</span><input class="min-h-control-sm appearance-none px-3 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-lg bg-surface-container-lowest text-on-surface font-sans text-control/1.25 focus-visible:outline-none focus-visible:border-primary-container focus-visible:[box-shadow:var(--shadow-focus)]" type="date" :min="min" :max="max" :value="draft.start" @change="commitInput('start', $event)"></label>
                        <label class="grid gap-1 text-on-surface-variant text-sm"><span>Selesai</span><input class="min-h-control-sm appearance-none px-3 border border-solid border-outline-variant [border-width:var(--control-border-width)] rounded-lg bg-surface-container-lowest text-on-surface font-sans text-control/1.25 focus-visible:outline-none focus-visible:border-primary-container focus-visible:[box-shadow:var(--shadow-focus)]" type="date" :min="min" :max="max" :value="draft.end" @change="commitInput('end', $event)"></label>
                    </div>

                    <div class="enpii-date-range__calendars grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
                        <section class="min-w-0">
                            <header>
                                <button type="button" class="grid place-items-center w-8 h-8 border-0 bg-none text-outline cursor-pointer hover:text-primary-text" :aria-label="t('dateRange.previousMonth')" @click="moveViews(-1)"><AppIcon name="chevron_left" /></button>
                                <strong class="text-center font-semibold text-transform-none">{{ leftLabel }}</strong><span />
                            </header>
                            <div class="enpii-date-range__weekdays grid grid-cols-[repeat(7,minmax(0,1fr))] mb-1 text-on-surface-variant text-xs text-center"><span v-for="weekday in WEEKDAYS" :key="weekday">{{ weekday }}</span></div>
                            <div class="enpii-date-range__days grid grid-cols-[repeat(7,minmax(0,1fr))] gap-y-1">
                                <button v-for="day in leftDays" :key="`left-${day.iso}`" type="button" :disabled="day.disabled" :aria-pressed="day.iso === draft.start || day.iso === draft.end" class="enpii-date-range__day h-8 border-0 bg-none text-inherit text-sm cursor-pointer [transition-property:background,color] duration-fast ease-emphasized hover:enabled:bg-surface-container-high focus-visible:bg-surface-container-high focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] disabled:cursor-not-allowed disabled:opacity-35" :class="{ 'enpii-date-range__day--outside opacity-40': !day.currentMonth, 'enpii-date-range__day--today': day.iso === today, 'enpii-date-range__day--selected bg-primary text-on-primary': [draft.start, draft.end].includes(day.iso), 'enpii-date-range__day--between rounded-none bg-primary-soft': day.iso > draft.start && day.iso < draft.end }" @click="choose(day)">
                                    {{ day.day }}
                                </button>
                            </div>
                        </section>
                        <section class="min-w-0">
                            <header>
                                <span /><strong>{{ rightLabel }}</strong>
                                <button type="button" class="grid place-items-center w-8 h-8 border-0 bg-none text-outline cursor-pointer hover:text-primary-text" :aria-label="t('dateRange.nextMonth')" @click="moveViews(1)"><AppIcon name="chevron_right" /></button>
                            </header>
                            <div class="enpii-date-range__weekdays grid grid-cols-[repeat(7,minmax(0,1fr))] mb-1 text-on-surface-variant text-xs text-center"><span v-for="weekday in WEEKDAYS" :key="weekday">{{ weekday }}</span></div>
                            <div class="enpii-date-range__days grid grid-cols-[repeat(7,minmax(0,1fr))] gap-y-1">
                                <button v-for="day in rightDays" :key="`right-${day.iso}`" type="button" :disabled="day.disabled" :aria-pressed="day.iso === draft.start || day.iso === draft.end" class="enpii-date-range__day h-8 border-0 bg-none text-inherit text-sm cursor-pointer [transition-property:background,color] duration-fast ease-emphasized hover:enabled:bg-surface-container-high focus-visible:bg-surface-container-high focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] disabled:cursor-not-allowed disabled:opacity-35" :class="{ 'enpii-date-range__day--outside opacity-40': !day.currentMonth, 'enpii-date-range__day--today': day.iso === today, 'enpii-date-range__day--selected bg-primary text-on-primary': [draft.start, draft.end].includes(day.iso), 'enpii-date-range__day--between rounded-none bg-primary-soft': day.iso > draft.start && day.iso < draft.end }" @click="choose(day)">
                                    {{ day.day }}
                                </button>
                            </div>
                        </section>
                    </div>

                    <footer class="enpii-date-range__footer flex justify-end gap-2 pt-2 border-t border-solid border-outline-variant">
                        <button v-if="clearable && (draft.start || draft.end)" type="button" class="enpii-date-range__footer-button enpii-date-range__footer-button--clear py-2 px-3 border-0 rounded-lg bg-surface-container-low text-danger-text font-inherit font-medium cursor-pointer [transition-property:background,transform] duration-fast ease-emphasized hover:enabled:bg-primary-soft active:enabled:scale-98 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus" @click="clear">{{ t('dateRange.clear') }}</button>
                        <button type="button" class="enpii-date-range__footer-button py-2 px-3 border-0 rounded-lg bg-surface-container-low text-primary-text font-inherit font-medium cursor-pointer [transition-property:background,transform] duration-fast ease-emphasized hover:enabled:bg-primary-soft active:enabled:scale-98 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed" :disabled="!draft.start || !draft.end || isInvalidRange" @click="applyRange">Terapkan</button>
                    </footer>
                </div>
            </Transition>
        </Teleport>
        <p v-if="error || isInvalidRange" class="enpii-date-range__help enpii-date-range__help--error m-0 text-danger-text text-xs">{{ error || t('dateRange.invalidRange') }}</p>
        <p v-else-if="hint" class="enpii-date-range__help m-0 text-on-surface-variant text-xs">{{ hint }}</p>
    </div>
</template>

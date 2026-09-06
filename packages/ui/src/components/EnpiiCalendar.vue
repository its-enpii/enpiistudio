<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from './EnpiiIcon.vue'
import { useT } from '../composables/useT'

export interface EnpiiCalendarEvent {
    date: string
    count?: number
    label?: string
}

const props = withDefaults(defineProps<{
    events?: EnpiiCalendarEvent[]
    minDate?: Date | null
    maxDate?: Date | null
    weekStart?: 0 | 1
    showWeekNumbers?: boolean
}>(), {
    events: () => [],
    minDate: null,
    maxDate: null,
    weekStart: 0,
    showWeekNumbers: false,
})

const model = defineModel<Date | null>({ default: null })
const month = defineModel<Date>('month', { required: true })

const emit = defineEmits(['change'])
const t = useT()

const todayIso = toIso(new Date())
const focusedDate = ref(normalizeDate(model.value ?? month.value))

const weekdayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

const eventMap = computed(() => {
    const map = new Map<string, string>()
    for (const event of props.events) {
        if (!event.label && event.count === undefined) continue
        map.set(event.date, event.label || (event.count ?? 0).toString())
    }
    return map
})

const weekdayOrder = computed(() => Array.from({ length: 7 }, (_, index) => (props.weekStart + index) % 7))

const weekdayLabels = computed(() => {
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
    return weekdayOrder.value.map((weekday) => {
        const translated = t(`calendar.weekday.${weekdayKeys[weekday]}`)
        return translated.startsWith('calendar.') ? formatter.format(new Date(2024, 0, 7 + weekday)) : translated
    })
})

const monthLabel = computed(() => {
    const formatted = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(month.value)
    return formatted
})

const days = computed(() => {
    const firstOfMonth = new Date(month.value.getFullYear(), month.value.getMonth(), 1)
    const leadingDays = (firstOfMonth.getDay() - props.weekStart + 7) % 7
    const start = addDays(firstOfMonth, -leadingDays)

    return Array.from({ length: 42 }, (_, index) => {
        const date = addDays(start, index)
        const iso = toIso(date)
        return {
            date,
            iso,
            day: date.getDate(),
            weekNumber: getIsoWeekNumber(date),
            isWeekend: date.getDay() === 0 || date.getDay() === 6,
            isOutsideMonth: date.getMonth() !== month.value.getMonth(),
            isToday: iso === todayIso,
            isSelected: Boolean(model.value && toIso(model.value) === iso),
            isFocused: toIso(focusedDate.value) === iso,
            disabled: isDisabled(date),
            marker: eventMap.value.get(iso),
        }
    })
})

function normalizeDate(value: Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function toIso(value: Date) {
    const year = value.getFullYear()
    const monthNumber = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${monthNumber}-${day}`
}

function addDays(value: Date, amount: number) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate() + amount)
}

function isDisabled(value: Date) {
    return Boolean(
        (props.minDate && toIso(value) < toIso(normalizeDate(props.minDate))) ||
        (props.maxDate && toIso(value) > toIso(normalizeDate(props.maxDate))),
    )
}

function getIsoWeekNumber(value: Date) {
    const target = new Date(value.getFullYear(), value.getMonth(), value.getDate())
    target.setDate(target.getDate() + 4 - (target.getDay() || 7))
    const firstThursday = new Date(target.getFullYear(), 0, 4)
    return 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86_400_000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7)
}

function select(day: (typeof days.value)[number]) {
    if (day.disabled) return
    model.value = day.date
    focusedDate.value = day.date
    emit('change', day.date)
}

function changeMonth(amount: number) {
    month.value = new Date(month.value.getFullYear(), month.value.getMonth() + amount, 1)
}

function moveFocusedDate(daysToMove: number) {
    focusedDate.value = addDays(focusedDate.value, daysToMove)
    if (focusedDate.value.getMonth() !== month.value.getMonth()) {
        month.value = new Date(focusedDate.value.getFullYear(), focusedDate.value.getMonth(), 1)
    }
}

function moveFocusedMonth(amount: number) {
    focusedDate.value = new Date(focusedDate.value.getFullYear(), focusedDate.value.getMonth() + amount, focusedDate.value.getDate())
    month.value = new Date(focusedDate.value.getFullYear(), focusedDate.value.getMonth(), 1)
}

function onKeydown(event: KeyboardEvent) {
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    if (moves[event.key]) {
        event.preventDefault()
        moveFocusedDate(moves[event.key])
        return
    }
    if (event.key === 'PageUp') {
        event.preventDefault()
        moveFocusedMonth(-1)
    }
    else if (event.key === 'PageDown') {
        event.preventDefault()
        moveFocusedMonth(1)
    }
    else if (event.key === 'Home') {
        event.preventDefault()
        moveFocusedDate(-6)
    }
    else if (event.key === 'End') {
        event.preventDefault()
        moveFocusedDate(6)
    }
    else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const day = days.value.find((item) => item.iso === toIso(focusedDate.value))
        if (day) select(day)
    }
}

function eventTitle(day: (typeof days.value)[number]) {
    return day.marker ? t('calendar.eventCount', { count: day.marker }) : undefined
}

watch(model, (value) => {
    if (value) focusedDate.value = normalizeDate(value)
})

watch(month, () => {
    if (!month.value) return
    if (focusedDate.value.getMonth() !== month.value.getMonth()) {
        focusedDate.value = new Date(month.value.getFullYear(), month.value.getMonth(), 1)
    }
})
</script>

<template>
    <section class="enpii-calendar w-full rounded-control border border-solid [border-width:var(--control-border-width)] border-outline-variant bg-surface-container-lowest text-on-surface shadow-control" :aria-label="monthLabel">
        <header class="enpii-calendar__header grid grid-cols-10 items-center gap-1 px-2 py-2 max-[24rem]:px-1">
            <button type="button" class="enpii-calendar__nav grid h-10 w-10 cursor-pointer place-items-center rounded-full border-0 bg-none text-on-surface-variant transition-[background,color,transform] duration-fast ease-emphasized hover:bg-neutral-soft hover:text-primary-text active:scale-94 focus-visible:focus-visible:[outline-style:solid] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:outline-focus focus-visible:[outline-offset:var(--focus-offset)]" :aria-label="t('calendar.previousMonth')" @click="changeMonth(-1)">
                <AppIcon name="chevron_left" class="enpii-calendar__nav-icon h-5 w-5 text-xl leading-none" />
            </button>
            <p class="enpii-calendar__month m-0 truncate text-center text-primary-text text-sm font-medium capitalize" aria-live="polite">{{ monthLabel }}</p>
            <button type="button" class="enpii-calendar__nav grid h-10 w-10 cursor-pointer place-items-center rounded-full border-0 bg-none text-on-surface-variant transition-[background,color,transform] duration-fast ease-emphasized hover:bg-neutral-soft hover:text-primary-text active:scale-94 focus-visible:focus-visible:[outline-style:solid] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:outline-focus focus-visible:[outline-offset:var(--focus-offset)]" :aria-label="t('calendar.nextMonth')" @click="changeMonth(1)">
                <AppIcon name="chevron_right" class="enpii-calendar__nav-icon h-5 w-5 text-xl leading-none" />
            </button>
        </header>

        <div class="enpii-calendar__grid grid gap-y-1 px-2 pb-3 pt-0 max-[24rem]:gap-y-0.5 max-[24rem]:px-1 max-[24rem]:pb-2" role="grid" @keydown="onKeydown">
            <div class="enpii-calendar__week grid grid-cols-7 items-stretch gap-1 has-[.enpii-calendar__week-number]:grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] max-[24rem]:gap-0.5" role="row">
                <span v-if="showWeekNumbers" class="enpii-calendar__week-number grid max-w-10 place-items-center text-on-surface-variant text-[.625rem] font-medium tabular-nums" aria-hidden="true">#</span>
                <span
                    v-for="(weekday, index) in weekdayLabels"
                    :key="weekday + index"
                    role="columnheader"
                    class="enpii-calendar__weekday grid place-items-center py-1 text-on-surface-variant text-[.6875rem] font-medium uppercase tracking-wide"
                >{{ weekday }}</span>
            </div>

            <div
                v-for="row in 6"
                :key="row"
                class="enpii-calendar__week grid grid-cols-7 items-stretch gap-1 has-[.enpii-calendar__week-number]:grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] max-[24rem]:gap-0.5"
                role="row"
            >
                <span v-if="showWeekNumbers" class="enpii-calendar__week-number grid max-w-10 place-items-center text-outline text-[.625rem] font-medium tabular-nums">{{ days[(row - 1) * 7].weekNumber }}</span>
                <button
                    v-for="day in days.slice((row - 1) * 7, row * 7)"
                    :key="day.iso"
                    type="button"
                    role="gridcell"
                    class="enpii-calendar__day relative mx-auto grid min-h-10 min-w-9 place-items-center rounded-[calc(var(--radius-control)-.25rem)] border-0 bg-none p-0 text-on-surface text-sm font-medium tabular-nums transition-[background,color,box-shadow,transform] duration-fast ease-emphasized hover:bg-neutral-soft focus-visible:focus-visible:[outline-style:solid] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:outline-focus focus-visible:[outline-offset:var(--focus-offset)] disabled:cursor-not-allowed disabled:text-outline disabled:opacity-45 max-[24rem]:min-w-10 max-[24rem]:text-[.8125rem]"
                    :class="{
                        'text-warning-text': day.isWeekend,
                        'text-outline': day.isOutsideMonth,
                        'shadow-[inset_0_0_0_2px_var(--color-primary-border)]': day.isToday && !day.isSelected,
                        'bg-primary text-on-primary shadow-control': day.isSelected,
                        'bg-neutral-soft': day.isFocused && !day.isSelected,
                    }"
                    :data-date="day.iso"
                    :tabindex="day.isFocused ? 0 : -1"
                    :aria-selected="day.isSelected"
                    :aria-current="day.isToday ? 'date' : undefined"
                    :aria-label="eventTitle(day)"
                    :disabled="day.disabled"
                    :title="eventTitle(day)"
                    @click="select(day)"
                >
                    <span class="enpii-calendar__day-number">{{ day.day }}</span>
                    <span v-if="day.marker" class="enpii-calendar__marker absolute bottom-1 h-1.5 w-1.5 rounded-full text-primary-text" :class="day.isSelected ? 'bg-on-primary' : 'bg-primary-text'" aria-hidden="true" />
                </button>
            </div>
        </div>
    </section>
</template>

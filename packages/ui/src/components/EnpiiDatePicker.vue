<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useShape } from '../composables/useShape';
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT'

const t = useT()

const model = defineModel({ type: String, default: '' });
const props = defineProps({
    id: { type: String, default: null },
    label: { type: String, required: true },
    icon: { type: String, default: 'calendar_month' },
    placeholder: { type: String, default: null },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    min: { type: String, default: null },
    max: { type: String, default: null },
    mode: { type: String, default: 'date' },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const root = ref(null);
const trigger = ref(null);
const popup = ref(null);
const open = ref(false);
const placeAbove = ref(false);
const popupStyle = ref({});
const generatedId = useId();
const inputId = props.id || generatedId;
const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function toIso(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseIso(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

function parseMonth(value) {
    if (!/^\d{4}-\d{2}$/.test(value || '')) return null;
    const [year, month] = value.split('-').map(Number);
    if (month < 1 || month > 12) return null;
    return { year, month };
}

function parseYear(value) {
    if (!/^\d{4}$/.test(value || '')) return null;
    const year = Number(value);
    return year >= 1900 && year <= 9999 ? year : null;
}

function startDate() {
    if (props.mode === 'year') return new Date();
    if (props.mode === 'month') return new Date();
    return parseIso(model.value) || new Date();
}

const viewDate = ref(new Date(startDate().getFullYear(), startDate().getMonth(), 1));
const focusedDate = ref(startDate());
const today = toIso(new Date());

const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });

const displayValue = computed(() => {
    if (props.mode === 'year') {
        const year = parseYear(model.value);
        return year ? year.toString() : '';
    }
    if (props.mode === 'month') {
        const parsed = parseMonth(model.value);
        if (!parsed) return '';
        return monthFormatter.format(new Date(parsed.year, parsed.month - 1, 1));
    }
    const date = parseIso(model.value);
    return date ? dateFormatter.format(date) : '';
});

const monthLabel = computed(() => new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(viewDate.value));
const yearLabel = computed(() => viewDate.value.getFullYear().toString());

const days = computed(() => {
    const first = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
        const iso = toIso(date);
        return {
            date,
            iso,
            day: date.getDate(),
            currentMonth: date.getMonth() === viewDate.value.getMonth(),
            disabled: Boolean((props.min && iso < props.min) || (props.max && iso > props.max)),
        };
    });
});

const months = computed(() => Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const value = `${viewDate.value.getFullYear()}-${String(month).padStart(2, '0')}`;
    return {
        value,
        month,
        label: monthShort[index],
        isCurrent: month === new Date().getMonth() + 1 && viewDate.value.getFullYear() === new Date().getFullYear(),
        isSelected: month === parseMonth(model.value)?.month && viewDate.value.getFullYear() === parseMonth(model.value)?.year,
    };
}));

const yearColumn = computed(() => {
    const current = viewDate.value.getFullYear();
    const base = current - (current % 12);
    return Array.from({ length: 12 }, (_, index) => {
        const year = base + index;
        return {
            value: year,
            label: year.toString(),
            isCurrent: year === new Date().getFullYear(),
            isSelected: year === parseYear(model.value),
        };
    });
});

const yearRangeLabel = computed(() => {
    if (yearColumn.value.length === 0) return '';
    const first = yearColumn.value[0].value;
    const last = yearColumn.value[yearColumn.value.length - 1].value;
    return `${first} – ${last}`;
});

function positionPopup() {
    const triggerEl = trigger.value;
    if (!triggerEl) return;

    const margin = 8;
    const rect = triggerEl.getBoundingClientRect();
    const measured = popup.value?.getBoundingClientRect().height;
    const popupHeight = measured || 320;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const above = spaceBelow < popupHeight && spaceAbove > spaceBelow;
    placeAbove.value = above;

    const width = Math.max(rect.width, 288);
    const left = Math.min(Math.max(margin, rect.left), window.innerWidth - width - margin);

    if (above) {
        popupStyle.value = {
            position: 'fixed',
            left: `${left}px`,
            width: `${width}px`,
            bottom: `${window.innerHeight - rect.top + margin}px`,
            top: 'auto',
            zIndex: 80,
        };
    } else {
        popupStyle.value = {
            position: 'fixed',
            left: `${left}px`,
            width: `${width}px`,
            top: `${rect.bottom + margin}px`,
            bottom: 'auto',
            zIndex: 80,
        };
    }
}

function openCalendar() {
    if (props.disabled) return;
    let initial;
    if (props.mode === 'year') {
        initial = parseYear(model.value) ? new Date(Number(model.value), 0, 1) : new Date();
    } else if (props.mode === 'month') {
        const parsed = parseMonth(model.value);
        initial = parsed ? new Date(parsed.year, parsed.month - 1, 1) : new Date();
    } else {
        initial = parseIso(model.value) || new Date();
    }
    focusedDate.value = clamp(initial);
    viewDate.value = new Date(focusedDate.value.getFullYear(), focusedDate.value.getMonth(), 1);
    open.value = true;
    nextTick(() => {
        positionPopup();
        // re-measure after paint (actual height)
        requestAnimationFrame(() => positionPopup());
        if (props.mode === 'date') focusDay();
    });
}

function closeCalendar(restoreFocus = false) {
    open.value = false;
    if (restoreFocus) nextTick(() => trigger.value?.focus());
}

function clamp(date) {
    const iso = toIso(date);
    if (props.min && iso < props.min) return parseIso(props.min) || date;
    if (props.max && iso > props.max) return parseIso(props.max) || date;
    return date;
}

function focusDay() {
    nextTick(() => popup.value?.querySelector(`[data-date="${toIso(focusedDate.value)}"]`)?.focus());
}

function choose(day) {
    if (day.disabled) return;
    model.value = day.iso;
    closeCalendar(true);
}

function chooseMonth(item) {
    model.value = item.value;
    closeCalendar(true);
}

function chooseYear(item) {
    model.value = item.value.toString();
    closeCalendar(true);
}

function clear() {
    model.value = '';
    closeCalendar(true);
}

function selectToday() {
    if (props.mode === 'year') {
        model.value = new Date().getFullYear().toString();
        closeCalendar(true);
        return;
    }
    if (props.mode === 'month') {
        const now = new Date();
        model.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        closeCalendar(true);
        return;
    }
    const date = clamp(new Date());
    choose({ iso: toIso(date), disabled: false });
}

function moveView(months = 0, years = 0) {
    if (props.mode === 'year') {
        viewDate.value = new Date(viewDate.value.getFullYear() + (years * 12), 0, 1);
    } else {
        viewDate.value = new Date(viewDate.value.getFullYear() + years, viewDate.value.getMonth() + months, 1);
    }
}

function moveFocus(daysToMove = 0, monthsToMove = 0) {
    const next = new Date(focusedDate.value);
    if (monthsToMove) next.setMonth(next.getMonth() + monthsToMove);
    if (daysToMove) next.setDate(next.getDate() + daysToMove);
    focusedDate.value = clamp(next);
    viewDate.value = new Date(focusedDate.value.getFullYear(), focusedDate.value.getMonth(), 1);
    focusDay();
}

function onCalendarKeydown(event) {
    if (props.mode !== 'date') return;
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (moves[event.key]) { event.preventDefault(); moveFocus(moves[event.key]); }
    else if (event.key === 'PageUp') { event.preventDefault(); moveFocus(0, -1); }
    else if (event.key === 'PageDown') { event.preventDefault(); moveFocus(0, 1); }
    else if (event.key === 'Escape') { event.preventDefault(); closeCalendar(true); }
    else if (['Enter', ' '].includes(event.key)) {
        event.preventDefault();
        const day = days.value.find((item) => item.iso === toIso(focusedDate.value));
        if (day) choose(day);
    }
}

function onDocumentClick(event) {
    const inRoot = root.value?.contains(event.target);
    const inPopup = popup.value?.contains(event.target);
    if (!inRoot && !inPopup) closeCalendar();
}

watch(model, (value) => {
    if (props.mode === 'year') {
        const year = parseYear(value);
        if (year) viewDate.value = new Date(year, 0, 1);
    } else if (props.mode === 'month') {
        const parsed = parseMonth(value);
        if (parsed) viewDate.value = new Date(parsed.year, parsed.month - 1, 1);
    } else {
        const date = parseIso(value);
        if (date) {
            focusedDate.value = date;
            viewDate.value = new Date(date.getFullYear(), date.getMonth(), 1);
        }
    }
});

function onViewportChange() {
    if (open.value) positionPopup();
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
});
onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick);
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});

const todayActionLabel = computed(() => props.mode === 'year' ? t('datePicker.thisYear') : props.mode === 'month' ? t('datePicker.thisMonth') : t('datePicker.today'));
const triggerIcon = computed(() => props.mode === 'year' ? 'event' : 'calendar_month');
</script>

<template>
    <div ref="root" class="enpii-date-picker w-full [&>*+*]:mt-field-gap">
        <label v-if="!hideLabel" :for="inputId" class="enpii-date-picker__label block ml-1 text-on-surface-variant text-[0.8125rem] font-semibold tracking-[0.02em]">{{ label }}</label>
        <label v-else :for="inputId" class="enpii-sr-only">{{ label }}</label>
        <div class="enpii-date-picker__control-wrap relative">
            <button
                :id="inputId"
                ref="trigger"
                type="button"
                class="enpii-date-picker__control flex w-full h-auto min-h-control items-center px-4 border border-solid border-outline-variant rounded-control bg-surface-container-lowest text-primary font-sans text-control text-left [transition-property:all] duration-fast ease-emphasized hover:enabled:[border-color:color-mix(in_srgb,var(--enpii-color-primary)_40%,transparent)] active:enabled:scale-[0.99] focus:outline-none focus-visible:outline-none focus:border-primary-container focus-visible:border-primary-container focus:[box-shadow:var(--enpii-focus-ring)] focus-visible:[box-shadow:var(--enpii-focus-ring)] disabled:opacity-60 disabled:cursor-not-allowed"
                :class="[shapeClass, { 'enpii-date-picker__control--error': Boolean(error) }]"
                :disabled="disabled"
                :aria-expanded="open"
                :aria-controls="`${inputId}-calendar`"
                :aria-invalid="Boolean(error)"
                :aria-required="required"
                @click="open ? closeCalendar() : openCalendar()"
                @keydown.esc="closeCalendar(true)"
            >
                <AppIcon v-if="icon" :name="icon" class="enpii-date-picker__icon absolute left-4 w-5 h-5 text-outline pointer-events-none text-xl leading-none" />
                <span class="enpii-date-picker__value overflow-hidden text-ellipsis whitespace-nowrap pl-10 flex-1"
                      :class="{ 'enpii-date-picker__value--placeholder': !displayValue }">{{ displayValue || (placeholder ?? t('datePicker.selectPlaceholder', { label: label.toLowerCase() })) }}</span>
                <AppIcon :name="triggerIcon" class="enpii-date-picker__chevron absolute top-1/2 right-4 w-5 h-5 -translate-y-1/2 text-outline text-xl leading-none transition-[transform,color] duration-base ease-emphasized" :class="{ 'enpii-date-picker__chevron--open -translate-y-1/2 scale-110 text-primary-text': open }" />
            </button>

            <Teleport to="body">
                <Transition name="dropdown">
                    <div
                        v-if="open"
                        :id="`${inputId}-calendar`"
                        ref="popup"
                        role="dialog"
                        aria-modal="false"
                        :aria-label="t('datePicker.selectPlaceholder', { label: label.toLowerCase() })"
                        class="enpii-date-picker__popup min-w-[18rem] p-3 border border-solid border-outline-variant rounded-control bg-surface-container-lowest shadow-overlay select-none origin-top"
                        :class="[
                            { 'enpii-date-picker__popup--above': placeAbove },
                            placeAbove ? 'enpii-date-picker__popup--above-origin origin-bottom' : 'enpii-date-picker__popup--below-origin',
                        ]"
                        :style="popupStyle"
                        @keydown="onCalendarKeydown"
                    >
                        <div class="enpii-date-picker__header flex items-center justify-between gap-1 mb-3">
                            <div class="enpii-date-picker__nav-group flex items-center gap-1">
                                <button type="button" class="enpii-date-picker__nav-button grid place-items-center w-8 h-8 p-1 border-0 rounded-lg bg-transparent text-outline cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low hover:text-primary-text active:scale-90 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary-container)_30%,transparent)]" :aria-label="t('datePicker.previousYear')" @click="moveView(0, -1)"><AppIcon name="keyboard_double_arrow_left" class="enpii-date-picker__nav-icon w-5 h-5 text-xl leading-none" /></button>
                                <button type="button" class="enpii-date-picker__nav-button grid place-items-center w-8 h-8 p-1 border-0 rounded-lg bg-transparent text-outline cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low hover:text-primary-text active:scale-90 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary-container)_30%,transparent)]" :aria-label="t('datePicker.previousMonth')" @click="moveView(-1)"><AppIcon name="chevron_left" class="enpii-date-picker__nav-icon w-5 h-5 text-xl leading-none" /></button>
                            </div>
                            <p class="enpii-date-picker__header-title m-0 text-primary-text text-sm font-semibold capitalize" aria-live="polite">{{ mode === 'year' ? yearRangeLabel : monthLabel }}</p>
                            <div class="enpii-date-picker__nav-group flex items-center gap-1">
                                <button type="button" class="enpii-date-picker__nav-button grid place-items-center w-8 h-8 p-1 border-0 rounded-lg bg-transparent text-outline cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low hover:text-primary-text active:scale-90 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary-container)_30%,transparent)]" :aria-label="t('datePicker.nextMonth')" @click="moveView(1)"><AppIcon name="chevron_right" class="enpii-date-picker__nav-icon w-5 h-5 text-xl leading-none" /></button>
                                <button type="button" class="enpii-date-picker__nav-button grid place-items-center w-8 h-8 p-1 border-0 rounded-lg bg-transparent text-outline cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low hover:text-primary-text active:scale-90 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary-container)_30%,transparent)]" :aria-label="t('datePicker.nextYear')" @click="moveView(0, 1)"><AppIcon name="keyboard_double_arrow_right" class="enpii-date-picker__nav-icon w-5 h-5 text-xl leading-none" /></button>
                            </div>
                        </div>

                        <Transition name="calendar-view" mode="out-in">
                            <div v-if="mode === 'date'" key="view-date" role="grid" :aria-label="monthLabel">
                                <div role="row" class="enpii-date-picker__weekdays grid grid-cols-7 mb-1"><span v-for="weekday in weekdays" :key="weekday" role="columnheader" class="enpii-date-picker__weekday py-1 text-on-surface-variant text-xs font-semibold text-center">{{ weekday }}</span></div>
                                <div class="enpii-date-picker__days grid grid-cols-7 row-gap-1">
                                    <button v-for="day in days" :key="day.iso" type="button" role="gridcell" :data-date="day.iso" :tabindex="day.iso === toIso(focusedDate) ? 0 : -1" :aria-selected="day.iso === model" :aria-current="day.iso === today ? 'date' : undefined" :disabled="day.disabled" class="enpii-date-picker__day grid place-items-center w-9 h-9 mx-auto border-0 rounded-[9999px] bg-transparent text-on-surface text-sm cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:enabled:bg-surface-container-low focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary-container)_30%,transparent)] disabled:cursor-not-allowed disabled:opacity-40" :class="{
                                        'enpii-date-picker__day--selected !bg-primary !text-on-primary font-semibold': day.iso === model,
                                        'enpii-date-picker__day--today bg-secondary-container text-secondary font-semibold': day.iso !== model && day.iso === today,
                                        'enpii-date-picker__day--outside text-outline': day.currentMonth === false,
                                    }" @click="choose(day)">{{ day.day }}</button>
                                </div>
                            </div>

                            <div v-else-if="mode === 'month'" key="view-month" role="grid" :aria-label="monthLabel">
                                <div class="enpii-date-picker__cells grid grid-cols-3 gap-2">
                                    <button v-for="item in months" :key="item.value" type="button" role="gridcell" :aria-selected="item.isSelected" class="enpii-date-picker__cell py-3 px-3 border-0 rounded-lg bg-transparent text-on-surface text-sm font-semibold cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary-container)_30%,transparent)] active:scale-95" :class="{ 'enpii-date-picker__cell--selected bg-primary text-on-primary': item.isSelected, 'enpii-date-picker__cell--current bg-secondary-container text-secondary': !item.isSelected && item.isCurrent }" @click="chooseMonth(item)">{{ item.label }}</button>
                                </div>
                            </div>

                            <div v-else key="view-year" role="grid" :aria-label="yearLabel">
                                <div class="enpii-date-picker__cells grid grid-cols-3 gap-2">
                                    <button v-for="year in yearColumn" :key="year.value" type="button" role="gridcell" :aria-selected="year.isSelected" class="enpii-date-picker__cell py-3 px-3 border-0 rounded-lg bg-transparent text-on-surface text-sm font-semibold cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary-container)_30%,transparent)] active:scale-95" :class="{ 'enpii-date-picker__cell--selected bg-primary text-on-primary': year.isSelected, 'enpii-date-picker__cell--current bg-secondary-container text-secondary': !year.isSelected && year.isCurrent }" @click="chooseYear(year)">{{ year.label }}</button>
                                </div>
                            </div>
                        </Transition>

                        <div class="enpii-date-picker__footer flex items-center justify-between mt-3 pt-3 border-t border-solid border-outline-variant text-sm font-semibold">
                            <button v-if="clearable && model" type="button" class="enpii-date-picker__footer-button enpii-date-picker__footer-button--clear py-2 px-3 border-0 rounded-lg bg-transparent text-danger-text cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-error-container active:scale-95" @click="clear">{{ t('datePicker.clear') }}</button>
                            <span v-else class="enpii-date-picker__footer-spacer w-16" />
                            <button type="button" class="enpii-date-picker__footer-button py-2 px-3 border-0 rounded-lg bg-transparent text-primary-text cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low active:scale-95" @click="selectToday">{{ todayActionLabel }}</button>
                        </div>
                    </div>
                </Transition>
            </Teleport>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="enpii-date-picker__help enpii-date-picker__help--error ml-1 text-danger-text text-[0.8125rem]">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="enpii-date-picker__help ml-1 text-on-surface-variant text-[0.8125rem]">{{ hint }}</p>
    </div>
</template>

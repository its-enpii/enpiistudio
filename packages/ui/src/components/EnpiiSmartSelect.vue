<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';
import { useT } from '../composables/useT'

const t = useT()

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: [String, Number], default: '' },
    options: { type: Array, default: () => [] },
    label: { type: String, required: true },
    placeholder: { type: String, default: null },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    valueKey: { type: String, default: 'value' },
    labelKey: { type: String, default: 'label' },
    groupKey: { type: String, default: 'group' },
    id: { type: String, default: null },
    hideLabel: { type: Boolean, default: false },
    emptyActionLabel: { type: String, default: null },
    excludedValues: { type: Array, default: () => [] },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const emit = defineEmits(['update:modelValue', 'search', 'search-change', 'empty-action']);
const generatedId = useId();
const selectId = computed(() => props.id || generatedId);
const trigger = ref(null);
const listbox = ref(null);
const open = ref(false);
const placeAbove = ref(false);
/** Selalu fixed sejak render pertama; kalau tidak, panel ikut alur dokumen di ujung <body> dan fokus memaksa halaman scroll ke bawah. */
const menuStyle = ref({ position: 'fixed', top: '0px', left: '0px', width: '0px', zIndex: 80, visibility: 'hidden' });
const search = ref('');
const highlighted = ref(0);
const searchInput = ref(null);
const selectedCache = ref(null);
let searchTimer;

const selected = computed(() => {
    const current = props.options.find((option) => String(option[props.valueKey]) === String(props.modelValue));

    return current || (selectedCache.value && String(selectedCache.value[props.valueKey]) === String(props.modelValue) ? selectedCache.value : null);
});
const selectedLabel = computed(() => selected.value?.[props.labelKey] || '');
const visibleOptions = computed(() => {
    const excluded = new Set(props.excludedValues.map((value) => String(value)));
    const filtered = excluded.size === 0 ? props.options : props.options.filter((option) => !excluded.has(String(option[props.valueKey])));
    const query = search.value.trim().toLocaleLowerCase();

    if (!query) return filtered;

    return filtered.filter((option) => {
        const label = String(option[props.labelKey] ?? '').toLocaleLowerCase();
        const group = String(option[props.groupKey] ?? '').toLocaleLowerCase();
        const subtitle = String(option.subtitle ?? option.description ?? '').toLocaleLowerCase();
        const value = String(option[props.valueKey] ?? '').toLocaleLowerCase();
        return label.includes(query) || group.includes(query) || subtitle.includes(query) || value.includes(query);
    });
});

/** Flat list for keyboard nav; grouped rows for render (header + options). */
const visibleRows = computed(() => {
    const opts = visibleOptions.value;
    const hasGroup = opts.some((o) => o[props.groupKey]);
    if (!hasGroup) {
        return opts.map((option, index) => ({ kind: 'option', option, index }));
    }

    const rows = [];
    let index = 0;
    let lastGroup = Symbol('start');
    for (const option of opts) {
        const group = option[props.groupKey] || '';
        if (group !== lastGroup) {
            rows.push({ kind: 'header', label: group || t('smartSelect.otherGroup') });
            lastGroup = group;
        }
        rows.push({ kind: 'option', option, index: index++ });
    }
    return rows;
});

function estimatedPopupHeight() {
    const itemHeight = 36;
    const optionHeight = Math.min(visibleRows.value.length, 8) * itemHeight;
    const searchHeight = props.searchable ? 52 : 0;
    return optionHeight + searchHeight + 16;
}

function positionMenu() {
    const triggerEl = trigger.value;
    if (!triggerEl) return;

    const margin = 8;
    const rect = triggerEl.getBoundingClientRect();
    const popupHeight = estimatedPopupHeight();
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const above = spaceBelow < popupHeight && spaceAbove > spaceBelow;
    placeAbove.value = above;

    const left = Math.min(Math.max(margin, rect.left), window.innerWidth - rect.width - margin);
    const maxList = Math.min(224 + (props.searchable ? 52 : 0), above ? spaceAbove : spaceBelow);

    if (above) {
        menuStyle.value = {
            position: 'fixed',
            left: `${left}px`,
            width: `${rect.width}px`,
            bottom: `${window.innerHeight - rect.top + margin}px`,
            top: 'auto',
            zIndex: 80,
            maxHeight: `${maxList}px`,
            visibility: 'visible',
        };
    } else {
        menuStyle.value = {
            position: 'fixed',
            left: `${left}px`,
            width: `${rect.width}px`,
            top: `${rect.bottom + margin}px`,
            bottom: 'auto',
            zIndex: 80,
            maxHeight: `${maxList}px`,
            visibility: 'visible',
        };
    }
}

function rememberSelected(options = props.options) {
    const option = options.find((item) => String(item[props.valueKey]) === String(props.modelValue));
    if (option) selectedCache.value = option;
}

function openMenu() {
    if (props.disabled) return;
    open.value = true;
    highlighted.value = Math.max(0, visibleOptions.value.findIndex((option) => String(option[props.valueKey]) === String(props.modelValue)));
    nextTick(() => {
        positionMenu();
        requestAnimationFrame(() => positionMenu());
        props.searchable && searchInput.value?.focus({ preventScroll: true });
    });
}

function onViewportChange() {
    if (open.value) positionMenu();
}
onMounted(() => {
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
});
onBeforeUnmount(() => {
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
});

function closeMenu() {
    open.value = false;
    menuStyle.value = { ...menuStyle.value, visibility: 'hidden' };
    if (search.value) emit('search-change', '');
    search.value = '';
}

function choose(option) {
    selectedCache.value = option;
    emit('update:modelValue', option[props.valueKey]);
    closeMenu();
}

function clear() {
    selectedCache.value = null;
    emit('update:modelValue', '');
    closeMenu();
}

function runEmptyAction() {
    const query = search.value.trim();
    if (!props.emptyActionLabel || !query || props.loading || visibleOptions.value.length) return;

    closeMenu();
    emit('empty-action', query);
}

function move(delta) {
    if (!visibleOptions.value.length) return;
    highlighted.value = (highlighted.value + delta + visibleOptions.value.length) % visibleOptions.value.length;
}

function onKeydown(event) {
    if (!open.value && ['ArrowDown', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openMenu();
        return;
    }
    if (!open.value) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
    if (event.key === 'Enter') {
        if (visibleOptions.value[highlighted.value]) { event.preventDefault(); choose(visibleOptions.value[highlighted.value]); }
        else if (props.emptyActionLabel && search.value.trim() && !props.loading) { event.preventDefault(); runEmptyAction(); }
    }
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
}

function onSearch() {
    emit('search-change', search.value);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => emit('search', search.value), 300);
}

function onDocumentClick(event) {
    if (!event.target.closest(`[data-smart-select="${selectId.value}"]`)) closeMenu();
}

onMounted(() => document.addEventListener('click', onDocumentClick));
onBeforeUnmount(() => {
    clearTimeout(searchTimer);
    document.removeEventListener('click', onDocumentClick);
});

watch(() => props.options, (options) => {
    rememberSelected(options);
    highlighted.value = Math.min(highlighted.value, Math.max(options.length - 1, 0));
}, { immediate: true });
watch(search, () => {
    highlighted.value = 0;
});
watch(() => props.modelValue, (value) => {
    const match = props.options.find((item) => String(item[props.valueKey]) === String(value));
    selectedCache.value = match ?? null;
});
</script>

<template>
    <div class="enpii-smart-select w-full [&>*+*]:mt-field-gap" :data-smart-select="selectId">
        <label :for="selectId" class="enpii-smart-select__label block ml-1 text-on-surface-variant text-[0.8125rem] font-semibold tracking-[0.02em]"
        :class="{ 'enpii-sr-only': hideLabel }">{{ label }}</label>
        <div class="enpii-smart-select__control-wrap relative">
            <button
                :id="selectId"
                ref="trigger"
                type="button"
                role="combobox"
                :aria-expanded="open"
                :aria-controls="`${selectId}-listbox`"
                :aria-invalid="Boolean(error)"
                :aria-required="required"
                :disabled="disabled"
                class="enpii-smart-select__trigger flex w-full h-auto min-h-control items-center justify-between pr-16 px-4 border border-solid border-outline-variant rounded-control bg-surface-container-lowest text-primary font-sans text-control text-left [transition-property:all] duration-fast ease-emphasized hover:enabled:[border-color:color-mix(in_srgb,var(--enpii-color-primary)_40%,transparent)] active:enabled:scale-[0.99] focus:outline-none focus-visible:outline-none focus:border-primary-container focus-visible:border-primary-container focus:[box-shadow:var(--enpii-focus-ring)] focus-visible:[box-shadow:var(--enpii-focus-ring)] disabled:opacity-60 disabled:cursor-not-allowed"
                :class="[shapeClass, { 'enpii-smart-select__trigger--error': Boolean(error) }]"
                v-bind="$attrs"
                @click="open ? closeMenu() : openMenu()"
                @keydown="onKeydown"
            >
                <span class="enpii-smart-select__value block flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-primary"
                :class="{ 'enpii-smart-select__value--placeholder': !selectedLabel }">{{ selectedLabel || (placeholder ?? t('smartSelect.selectPlaceholder', { label: label.toLowerCase() })) }}</span>
                <AppIcon name="expand_more" class="enpii-smart-select__chevron absolute top-1/2 right-3 w-5 h-5 -translate-y-[calc(50%+1px)] text-outline text-xl leading-none inline-flex items-center justify-center transition-transform duration-normal ease-standard" :class="{ 'enpii-smart-select__chevron--open -translate-y-[calc(50%+1px)] rotate-180': open }" />
            </button>
            <button
                v-if="clearable && selectedLabel"
                type="button"
                class="enpii-smart-select__clear absolute top-1/2 right-9 z-raised w-8 h-8 -translate-y-1/2 border-0 rounded-[9999px] bg-transparent text-outline cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low hover:text-primary-text focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary-container)_20%,transparent)]"
                :aria-label="t('smartSelect.clearSelection')"
                @click="clear"
            >
                <AppIcon name="close" />
            </button>
            <Teleport to="body">
                <Transition
                    name="dropdown"
                >
                    <div
                        v-if="open"
                        :id="`${selectId}-listbox`"
                        ref="listbox"
                        role="listbox"
                        class="enpii-smart-select__menu fixed flex flex-col p-2 border border-solid border-outline-variant rounded-control bg-surface-container-lowest shadow-overlay overflow-hidden origin-top"
                        :class="[shapeClass, { 'enpii-smart-select__menu--above origin-bottom': placeAbove }]"
                        :style="menuStyle"
                        :data-smart-select="selectId"
                    >
                        <div v-if="searchable" class="enpii-smart-select__search-wrap relative mb-2 pb-1 shrink-0 bg-surface-container-lowest">
                            <AppIcon name="search" class="enpii-smart-select__search-icon absolute left-3 w-4 h-4 text-on-surface-variant text-base pointer-events-none" />
                            <input ref="searchInput" v-model="search" type="search" class="enpii-smart-select__search-input w-full h-9 py-1 px-9 border border-solid border-outline-variant rounded-lg bg-transparent text-primary text-sm placeholder:text-on-surface-variant focus:outline-none focus:border-primary-container focus:[box-shadow:var(--enpii-focus-ring)]" :placeholder="t('smartSelect.searchPlaceholder')" @input="onSearch" @keydown="onKeydown">
                            <button v-if="search" type="button" class="enpii-smart-select__search-clear absolute top-2 right-2 w-7 h-7 border-0 rounded-[9999px] bg-transparent text-on-surface-variant cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:text-primary-text" @click="search = ''; onSearch()"><AppIcon name="close" /></button>
                        </div>
                        <div class="enpii-smart-select__options min-h-0 flex-1 overflow-y-auto">
                            <div v-if="loading" class="enpii-smart-select__status py-4 px-3 text-on-surface-variant text-sm text-center">{{ t('smartSelect.loading') }}</div>
                            <template v-else>
                                <template v-for="(row, rowIndex) in visibleRows" :key="row.kind === 'header' ? `h-${row.label}-${rowIndex}` : String(row.option[valueKey])">
                                    <div
                                        v-if="row.kind === 'header'"
                                        class="enpii-smart-select__group-label pt-2 px-3 pb-1 first:pt-1 text-on-surface-variant text-[0.625rem] font-semibold"
                                        role="presentation"
                                    >
                                        {{ row.label }}
                                    </div>
                                    <button
                                        v-else
                                        :id="`${selectId}-option-${row.index}`"
                                        type="button"
                                        role="option"
                                        :aria-selected="String(row.option[valueKey]) === String(modelValue)"
                                        class="enpii-smart-select__option flex w-full items-center justify-between gap-3 py-2 px-3 border-0 rounded-lg bg-transparent text-on-surface text-sm text-left cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low hover:text-primary-text hover:font-medium"
                                        :class="{
                                            'enpii-smart-select__option--highlighted': row.index === highlighted,
                                            'enpii-smart-select__option--selected': String(row.option[valueKey]) === String(modelValue)
                                        }"
                                        @mouseenter="highlighted = row.index"
                                        @click="choose(row.option)"
                                    >
                                        <div class="enpii-smart-select__option-body min-w-0 flex-1">
                                            <div class="enpii-smart-select__option-top flex items-center gap-2">
                                                <span class="enpii-smart-select__option-label font-semibold">
                                                    {{ row.option[labelKey] }}
                                                </span>
                                                <span v-if="row.option.badge" class="enpii-smart-select__option-badge shrink-0 py-1 px-2 rounded-[9999px] bg-primary/10 text-primary text-[0.6875rem] font-medium">
                                                    {{ row.option.badge }}
                                                </span>
                                            </div>
                                            <p v-if="row.option.subtitle || row.option.description" class="enpii-smart-select__option-subtitle mt-1 mb-0 overflow-hidden text-ellipsis whitespace-nowrap text-on-surface-variant text-xs">
                                                {{ row.option.subtitle || row.option.description }}
                                            </p>
                                        </div>
                                        <AppIcon v-if="String(row.option[valueKey]) === String(modelValue)" name="check" class="enpii-smart-select__check shrink-0 w-4 h-4 text-primary text-base" />
                                    </button>
                                </template>
                                <button v-if="!visibleOptions.length && emptyActionLabel && search.trim()" type="button" class="enpii-smart-select__empty-action flex w-full items-center gap-2 py-3 px-3 border-0 rounded-lg bg-transparent text-primary-text text-sm font-semibold text-left cursor-pointer hover:bg-surface-container-low hover:outline-none focus-visible:bg-surface-container-low focus-visible:outline-none" @click="runEmptyAction"><AppIcon name="person_add" class="enpii-smart-select__empty-icon w-5 h-5 text-xl" />{{ emptyActionLabel }}</button>
                                <div v-else-if="!visibleOptions.length" class="enpii-smart-select__status py-4 px-3 text-on-surface-variant text-sm text-center">{{ t('smartSelect.noOptions') }}</div>
                            </template>
                        </div>
                    </div>
                </Transition>
            </Teleport>
        </div>
        <p v-if="error" :id="`${selectId}-error`" class="enpii-smart-select__help enpii-smart-select__help--error ml-1 text-danger-text text-[0.8125rem]">{{ error }}</p>
        <p v-else-if="hint" :id="`${selectId}-hint`" class="enpii-smart-select__help ml-1 text-on-surface-variant text-[0.8125rem]">{{ hint }}</p>
    </div>
</template>

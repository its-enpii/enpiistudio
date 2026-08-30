<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    items: { type: Array, default: () => [] },
    align: {
        type: String,
        default: 'start',
        validator: (value) => ['start', 'end'].includes(value),
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
    ariaLabel: { type: String, default: null },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['select', 'open', 'close']);
const shapeClass = useShape(props);
const generatedId = useId();
const dropdownId = computed(() => props.id || generatedId);

const triggerRef = ref(null);
const menuRef = ref(null);
const open = ref(false);
const highlighted = ref(-1);
const menuStyle = ref({ position: 'fixed', top: '0px', left: '0px', width: '0px', zIndex: 80, visibility: 'hidden' });
const placeAbove = ref(false);
let typeaheadBuffer = '';
let typeaheadTimer;
let previousFocus = null;

const selectItems = computed(() => props.items.filter((item) => !item.divider && item.label));
const menuItems = computed(() => props.items.filter((item) => !item.divider || item.label));

function focusableItems() {
    return [...(menuRef.value?.querySelectorAll('[role="menuitem"]:not([disabled])') || [])];
}

function estimatedPopupHeight() {
    const itemHeight = props.size === 'sm' ? 32 : props.size === 'lg' ? 44 : 38;
    return Math.min(menuItems.value.length, 10) * itemHeight + 16;
}

function positionMenu() {
    const triggerEl = triggerRef.value;
    if (!triggerEl) return;

    const margin = 8;
    const rect = triggerEl.getBoundingClientRect();
    const popupHeight = estimatedPopupHeight();
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const above = spaceBelow < popupHeight && spaceAbove > spaceBelow;
    placeAbove.value = above;

    const menuWidth = Math.max(180, rect.width);
    let left;
    if (props.align === 'end') {
        left = rect.right - menuWidth;
    } else {
        left = rect.left;
    }
    left = Math.min(Math.max(margin, left), window.innerWidth - menuWidth - margin);

    const maxList = Math.min(320, above ? spaceAbove : spaceBelow);

    if (above) {
        menuStyle.value = {
            position: 'fixed',
            left: `${left}px`,
            top: `${rect.top - Math.min(popupHeight, spaceAbove) - margin}px`,
            width: `${menuWidth}px`,
            maxHeight: `${maxList}px`,
            zIndex: 80,
        };
    } else {
        menuStyle.value = {
            position: 'fixed',
            left: `${left}px`,
            top: `${rect.bottom + margin}px`,
            width: `${menuWidth}px`,
            maxHeight: `${maxList}px`,
            zIndex: 80,
        };
    }
}

async function toggle() {
    if (open.value) {
        close();
        return;
    }
    await show();
}

async function show() {
    if (props.disabled) return;
    previousFocus = document.activeElement;
    open.value = true;
    highlighted.value = -1;
    positionMenu();
    await nextTick();
    positionMenu();
    const first = focusableItems()[0];
    if (first) first.focus();
    else menuRef.value?.focus();
}

function close({ returnFocus = true } = {}) {
    if (!open.value) return;
    open.value = false;
    typeaheadBuffer = '';
    if (returnFocus && previousFocus) previousFocus.focus?.();
    previousFocus = null;
}

function choose(item) {
    if (item.disabled) return;
    close();
    emit('select', item);
}

function onItemKeydown(event, item) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        choose(item);
    }
}

function onMenuKeydown(event) {
    const items = focusableItems();
    const currentIndex = items.findIndex((el) => el === document.activeElement);
    switch (event.key) {
        case 'ArrowDown': {
            event.preventDefault();
            if (!items.length) return;
            const next = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
            items[next].focus();
            highlighted.value = next;
            break;
        }
        case 'ArrowUp': {
            event.preventDefault();
            if (!items.length) return;
            const prev = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;
            items[prev].focus();
            highlighted.value = prev;
            break;
        }
        case 'Home': {
            event.preventDefault();
            if (!items.length) return;
            items[0].focus();
            highlighted.value = 0;
            break;
        }
        case 'End': {
            event.preventDefault();
            if (!items.length) return;
            items[items.length - 1].focus();
            highlighted.value = items.length - 1;
            break;
        }
        case 'Escape': {
            event.preventDefault();
            event.stopPropagation();
            close();
            break;
        }
        case 'Tab': {
            event.preventDefault();
            break;
        }
        default:
            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                typeahead(event.key);
            }
    }
}

function typeahead(char) {
    clearTimeout(typeaheadTimer);
    typeaheadBuffer += char.toLocaleLowerCase();
    typeaheadTimer = setTimeout(() => { typeaheadBuffer = ''; }, 500);

    const items = focusableItems();
    if (!items.length) return;
    const current = items.findIndex((el) => el === document.activeElement);
    const labels = selectItems.value.map((item) => item.label.toLocaleLowerCase());

    const from = current + 1;
    let found = labels.findIndex((label, index) => index >= from && label.startsWith(typeaheadBuffer));
    if (found < 0) found = labels.findIndex((label) => label.startsWith(typeaheadBuffer));
    if (found >= 0) {
        items[found].focus();
        highlighted.value = found;
    }
}

function onClickOutside(event) {
    const menuEl = menuRef.value;
    const triggerEl = triggerRef.value;
    if (!open.value) return;
    if (menuEl?.contains(event.target) || triggerEl?.contains(event.target)) return;
    close({ returnFocus: false });
}

function onWindowResize() {
    if (open.value) positionMenu();
}

function onWindowScroll() {
    if (open.value) positionMenu();
}

watch(() => props.items, () => {
    if (open.value) {
        highlighted.value = Math.min(highlighted.value, selectItems.value.length - 1);
        nextTick(() => positionMenu());
    }
}, { deep: true });

onMounted(() => {
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onWindowScroll, { capture: true, passive: true });
});

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onClickOutside);
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('scroll', onWindowScroll, { capture: true });
});
</script>

<template>
    <div class="enpii-dropdown-menu__anchor" :class="shapeClass">
        <button
            :id="`${dropdownId}-trigger`"
            ref="triggerRef"
            type="button"
            class="enpii-dropdown-menu__trigger"
            :class="[`enpii-dropdown-menu__trigger--${size}`]"
            :aria-expanded="String(open)"
            :aria-haspopup="'menu'"
            :aria-controls="open ? `${dropdownId}-menu` : undefined"
            :aria-label="ariaLabel ?? undefined"
            :disabled="disabled"
            @click="toggle"
        >
            <slot name="trigger">
                <AppIcon name="more_vert" class="enpii-dropdown-menu__trigger-icon" />
            </slot>
        </button>
        <Teleport to="body">
            <Transition name="dropdown">
                <div
                    v-if="open"
                    :id="`${dropdownId}-menu`"
                    ref="menuRef"
                    role="menu"
                    class="enpii-dropdown-menu__panel"
                    :class="[
                        `enpii-dropdown-menu__panel--${size}`,
                        `enpii-dropdown-menu__panel--${align}`,
                        shapeClass,
                        { 'enpii-dropdown-menu__panel--above': placeAbove },
                    ]"
                    :style="menuStyle"
                    tabindex="-1"
                    @keydown="onMenuKeydown"
                >
                    <template v-for="(item, index) in items" :key="item.id ?? `item-${index}`">
                        <div v-if="item.divider" class="enpii-dropdown-menu__divider" role="separator" />
                        <button
                            v-if="item.label"
                            type="button"
                            role="menuitem"
                            class="enpii-dropdown-menu__item"
                            :class="{
                                'enpii-dropdown-menu__item--highlighted': index === highlighted,
                                'enpii-dropdown-menu__item--disabled': item.disabled,
                                'enpii-dropdown-menu__item--danger': item.danger,
                            }"
                            :disabled="item.disabled"
                            :aria-disabled="item.disabled ? 'true' : undefined"
                            :tabindex="index === highlighted ? '0' : '-1'"
                            @mouseenter="highlighted = index"
                            @click="choose(item)"
                            @keydown="onItemKeydown($event, item)"
                        >
                            <AppIcon v-if="item.icon" :name="item.icon" class="enpii-dropdown-menu__item-icon" />
                            <span class="enpii-dropdown-menu__item-label">{{ item.label }}</span>
                        </button>
                    </template>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

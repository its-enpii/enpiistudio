<script setup>
import { computed, ref, useId, watch } from 'vue';
import { useShape } from '../composables/useShape';
import AppIcon from './EnpiiIcon.vue';

const props = defineProps({
    /**
     * Optional items array for multi-item accordion:
     * [{ key, title, subtitle?, icon?, badge?, content?, defaultOpen? }]
     */
    items: { type: Array, default: null },
    /**
     * For single collapsible mode:
     */
    title: { type: String, default: '' },
    subtitle: { type: String, default: null },
    icon: { type: String, default: null },
    badge: { type: [String, Number], default: null },
    defaultOpen: { type: Boolean, default: false },
    /**
     * Allow multiple expanded items simultaneously when using items prop
     */
    multiple: { type: Boolean, default: false },
    bordered: { type: Boolean, default: true },
    variant: {
        type: String,
        default: 'surface',
        validator: (val) => ['surface', 'filled', 'ghost'].includes(val),
    },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const model = defineModel({ type: [String, Number, Array, Boolean], default: undefined });
const emit = defineEmits(['toggle']);

const generatedId = useId();

// State for multi-item mode
const internalOpenKeys = ref(new Set());

// State for single collapsible mode
const singleOpen = ref(props.defaultOpen);

// Initialize open keys if items prop is provided
if (props.items && props.items.length) {
    props.items.forEach((item) => {
        if (item.defaultOpen) {
            internalOpenKeys.value.add(item.key ?? item.id ?? item.title);
        }
    });
}

const isSingleMode = computed(() => !props.items || props.items.length === 0);

function isItemOpen(key) {
    if (isSingleMode.value) {
        if (model.value !== undefined && typeof model.value === 'boolean') {
            return model.value;
        }
        return singleOpen.value;
    }

    if (model.value !== undefined) {
        if (Array.isArray(model.value)) {
            return model.value.includes(key);
        }
        return model.value === key;
    }

    return internalOpenKeys.value.has(key);
}

function toggleSingle() {
    const nextState = !isItemOpen('single');
    if (model.value !== undefined && typeof model.value === 'boolean') {
        model.value = nextState;
    } else {
        singleOpen.value = nextState;
    }
    emit('toggle', { open: nextState });
}

function toggleItem(key) {
    if (isSingleMode.value) {
        toggleSingle();
        return;
    }

    const isOpen = isItemOpen(key);
    let nextOpenKeys;

    if (props.multiple) {
        nextOpenKeys = new Set(internalOpenKeys.value);
        if (isOpen) {
            nextOpenKeys.delete(key);
        } else {
            nextOpenKeys.add(key);
        }
    } else {
        nextOpenKeys = new Set();
        if (!isOpen) {
            nextOpenKeys.add(key);
        }
    }

    internalOpenKeys.value = nextOpenKeys;

    if (model.value !== undefined) {
        if (Array.isArray(model.value)) {
            model.value = Array.from(nextOpenKeys);
        } else {
            model.value = isOpen ? null : key;
        }
    }

    emit('toggle', { key, open: !isOpen });
}

const variantClasses = {
    surface: 'bg-surface-container-lowest',
    filled: 'bg-surface-container-low',
    ghost: 'bg-transparent',
};
</script>

<template>
    <!-- Single Collapsible Mode -->
    <div
        v-if="isSingleMode"
        class="enpii-accordion overflow-hidden rounded-control [transition-property:all] duration-base ease-emphasized"
        :class="[
            `enpii-accordion--${variant}`,
            variantClasses[variant],
            bordered ? 'enpii-accordion--bordered border border-solid border-outline-variant' : '',
            shapeClass,
        ]"
    >
        <button
            :id="`accordion-header-${generatedId}`"
            type="button"
            class="enpii-accordion__trigger flex w-full items-center justify-between gap-3 p-4 border-0 bg-transparent text-primary-text font-semibold text-left cursor-pointer transition-[background] duration-fast ease-emphasized hover:[background:color-mix(in_srgb,var(--enpii-color-surface-container-low)_60%,transparent)] focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--enpii-color-primary)]"
            :aria-expanded="isItemOpen('single')"
            :aria-controls="`accordion-panel-${generatedId}`"
            @click="toggleSingle"
        >
            <div class="enpii-accordion__heading flex flex-1 min-w-0 items-center gap-3">
                <AppIcon v-if="icon" :name="icon" class="enpii-accordion__item-icon shrink-0 w-5 h-5 text-primary-text text-[1.25rem] leading-none" />
                <div class="enpii-accordion__heading-text flex-1 min-w-0">
                    <slot name="title">
                        <span class="enpii-accordion__title block overflow-hidden text-ellipsis whitespace-nowrap text-primary-text text-sm sm:text-base font-semibold">{{ title }}</span>
                    </slot>
                    <p v-if="subtitle" class="enpii-accordion__subtitle mt-1 mb-0 overflow-hidden text-ellipsis whitespace-nowrap text-on-surface-variant text-xs font-normal">
                        {{ subtitle }}
                    </p>
                </div>
                <span
                    v-if="badge !== null && badge !== undefined"
                    class="enpii-accordion__badge shrink-0 py-1 px-2 rounded-[9999px] bg-primary-container text-on-primary-container text-xs font-semibold"
                >
                    {{ badge }}
                </span>
            </div>
            <AppIcon
                name="expand_more"
                class="enpii-accordion__chevron shrink-0 w-5 h-5 text-on-surface-variant text-[1.25rem] leading-none transition-transform duration-normal ease-standard"
                :class="{ 'enpii-accordion__chevron--open rotate-180 text-primary-text': isItemOpen('single') }"
            />
        </button>

        <div
            :id="`accordion-panel-${generatedId}`"
            role="region"
            :aria-labelledby="`accordion-header-${generatedId}`"
            class="enpii-accordion__panel-wrap grid grid-rows-[0fr] transition-[grid-template-rows] duration-slow ease-standard"
            :class="{ 'enpii-accordion__panel-wrap--open grid-rows-[1fr]': isItemOpen('single') }"
        >
            <div class="enpii-accordion__panel-clip overflow-hidden">
                <div class="enpii-accordion__panel p-4 pt-3 border-t border-solid border-[color-mix(in_srgb,var(--enpii-color-outline-variant)_60%,transparent)] text-on-surface-variant text-sm leading-[1.55]">
                    <slot />
                </div>
            </div>
        </div>
    </div>

    <!-- Multi-Item List Accordion Mode -->
    <div v-else class="enpii-accordion-list grid gap-2 [&>*+*]:mt-2">
        <div
            v-for="(item, index) in items"
            :key="item.key ?? item.id ?? index"
            class="enpii-accordion overflow-hidden rounded-control [transition-property:all] duration-base ease-emphasized"
            :class="[
                `enpii-accordion--${variant}`,
                variantClasses[variant],
                bordered ? 'enpii-accordion--bordered border border-solid border-outline-variant' : '',
                shapeClass,
            ]"
        >
            <button
                :id="`accordion-header-${generatedId}-${item.key ?? index}`"
                type="button"
                class="enpii-accordion__trigger flex w-full items-center justify-between gap-3 p-4 border-0 bg-transparent text-primary-text font-semibold text-left cursor-pointer transition-[background] duration-fast ease-emphasized hover:[background:color-mix(in_srgb,var(--enpii-color-surface-container-low)_60%,transparent)] focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--enpii-color-primary)]"
                :aria-expanded="isItemOpen(item.key ?? item.id ?? item.title)"
                :aria-controls="`accordion-panel-${generatedId}-${item.key ?? index}`"
                @click="toggleItem(item.key ?? item.id ?? item.title)"
            >
                <div class="enpii-accordion__heading flex flex-1 min-w-0 items-center gap-3">
                    <AppIcon v-if="item.icon" :name="item.icon" class="enpii-accordion__item-icon shrink-0 w-5 h-5 text-primary-text text-[1.25rem] leading-none" />
                    <div class="enpii-accordion__heading-text flex-1 min-w-0">
                        <span class="enpii-accordion__title block overflow-hidden text-ellipsis whitespace-nowrap text-primary-text text-sm sm:text-base font-semibold">{{ item.title }}</span>
                        <p v-if="item.subtitle" class="enpii-accordion__subtitle mt-1 mb-0 overflow-hidden text-ellipsis whitespace-nowrap text-on-surface-variant text-xs font-normal">
                            {{ item.subtitle }}
                        </p>
                    </div>
                    <span
                        v-if="item.badge !== null && item.badge !== undefined"
                        class="enpii-accordion__badge shrink-0 py-1 px-2 rounded-[9999px] bg-primary-container text-on-primary-container text-xs font-semibold"
                    >
                        {{ item.badge }}
                    </span>
                </div>
                <AppIcon
                    name="expand_more"
                    class="enpii-accordion__chevron shrink-0 w-5 h-5 text-on-surface-variant text-[1.25rem] leading-none transition-transform duration-normal ease-standard"
                    :class="{ 'enpii-accordion__chevron--open rotate-180 text-primary-text': isItemOpen(item.key ?? item.id ?? item.title) }"
                />
            </button>

            <div
                :id="`accordion-panel-${generatedId}-${item.key ?? index}`"
                role="region"
                :aria-labelledby="`accordion-header-${generatedId}-${item.key ?? index}`"
                class="enpii-accordion__panel-wrap grid grid-rows-[0fr] transition-[grid-template-rows] duration-slow ease-standard"
                :class="{ 'enpii-accordion__panel-wrap--open grid-rows-[1fr]': isItemOpen(item.key ?? item.id ?? item.title) }"
            >
                <div class="enpii-accordion__panel-clip overflow-hidden">
                    <div class="enpii-accordion__panel p-4 pt-3 border-t border-solid border-[color-mix(in_srgb,var(--enpii-color-outline-variant)_60%,transparent)] text-on-surface-variant text-sm leading-[1.55]">
                        <slot :name="`content-${item.key ?? index}`" :item="item">
                            <div v-if="item.content">{{ item.content }}</div>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

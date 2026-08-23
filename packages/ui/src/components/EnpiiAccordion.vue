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

</script>

<template>
    <!-- Single Collapsible Mode -->
    <div
        v-if="isSingleMode"
        class="enpii-accordion"
        :class="[`enpii-accordion--${variant}`, bordered && 'enpii-accordion--bordered', shapeClass]"
    >
        <button
            :id="`accordion-header-${generatedId}`"
            type="button"
            class="enpii-accordion__trigger"
            :aria-expanded="isItemOpen('single')"
            :aria-controls="`accordion-panel-${generatedId}`"
            @click="toggleSingle"
        >
            <div class="enpii-accordion__heading">
                <AppIcon v-if="icon" :name="icon" class="enpii-accordion__item-icon" />
                <div class="enpii-accordion__heading-text">
                    <slot name="title">
                        <span class="enpii-accordion__title">{{ title }}</span>
                    </slot>
                    <p v-if="subtitle" class="enpii-accordion__subtitle">
                        {{ subtitle }}
                    </p>
                </div>
                <span
                    v-if="badge !== null && badge !== undefined"
                    class="enpii-accordion__badge"
                >
                    {{ badge }}
                </span>
            </div>
            <AppIcon
                name="expand_more"
                class="enpii-accordion__chevron"
                :class="{ 'enpii-accordion__chevron--open': isItemOpen('single') }"
            />
        </button>

        <div
            :id="`accordion-panel-${generatedId}`"
            role="region"
            :aria-labelledby="`accordion-header-${generatedId}`"
            class="enpii-accordion__panel-wrap"
            :class="{ 'enpii-accordion__panel-wrap--open': isItemOpen('single') }"
        >
            <div class="enpii-accordion__panel-clip">
                <div class="enpii-accordion__panel">
                    <slot />
                </div>
            </div>
        </div>
    </div>

    <!-- Multi-Item List Accordion Mode -->
    <div v-else class="enpii-accordion-list">
        <div
            v-for="(item, index) in items"
            :key="item.key ?? item.id ?? index"
            class="enpii-accordion"
            :class="[`enpii-accordion--${variant}`, bordered && 'enpii-accordion--bordered', shapeClass]"
        >
            <button
                :id="`accordion-header-${generatedId}-${item.key ?? index}`"
                type="button"
                class="enpii-accordion__trigger"
                :aria-expanded="isItemOpen(item.key ?? item.id ?? item.title)"
                :aria-controls="`accordion-panel-${generatedId}-${item.key ?? index}`"
                @click="toggleItem(item.key ?? item.id ?? item.title)"
            >
                <div class="enpii-accordion__heading">
                    <AppIcon v-if="item.icon" :name="item.icon" class="enpii-accordion__item-icon" />
                    <div class="enpii-accordion__heading-text">
                        <span class="enpii-accordion__title">{{ item.title }}</span>
                        <p v-if="item.subtitle" class="enpii-accordion__subtitle">
                            {{ item.subtitle }}
                        </p>
                    </div>
                    <span
                        v-if="item.badge !== null && item.badge !== undefined"
                        class="enpii-accordion__badge"
                    >
                        {{ item.badge }}
                    </span>
                </div>
                <AppIcon
                    name="expand_more"
                    class="enpii-accordion__chevron"
                    :class="{ 'enpii-accordion__chevron--open': isItemOpen(item.key ?? item.id ?? item.title) }"
                />
            </button>

            <div
                :id="`accordion-panel-${generatedId}-${item.key ?? index}`"
                role="region"
                :aria-labelledby="`accordion-header-${generatedId}-${item.key ?? index}`"
                class="enpii-accordion__panel-wrap"
                :class="{ 'enpii-accordion__panel-wrap--open': isItemOpen(item.key ?? item.id ?? item.title) }"
            >
                <div class="enpii-accordion__panel-clip">
                    <div class="enpii-accordion__panel">
                        <slot :name="`content-${item.key ?? index}`" :item="item">
                            <div v-if="item.content">{{ item.content }}</div>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

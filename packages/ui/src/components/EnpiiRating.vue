<script setup>
import { computed, ref } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    max: { type: Number, default: 5 },
    readonly: { type: Boolean, default: false },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
    allowClear: { type: Boolean, default: false },
    icon: { type: String, default: 'star' },
});

const model = defineModel({ type: Number, default: 0 });
const t = useT();
const hoverValue = ref(0);

const safeMax = computed(() => Math.max(1, Math.floor(props.max)));
const previewValue = computed(() => (props.readonly ? model.value : hoverValue.value || model.value));
const ratingText = computed(() => t('rating.valueAria', { value: model.value, max: safeMax.value }));

function setValue(value) {
    if (props.readonly) return;
    model.value = Math.min(safeMax.value, Math.max(0, Math.floor(value)));
}

function onKeydown(event) {
    const deltas = {
        ArrowRight: 1,
        ArrowUp: 1,
        ArrowLeft: -1,
        ArrowDown: -1,
    };
    const delta = deltas[event.key];
    if (!delta || props.readonly) return;

    event.preventDefault();
    setValue((model.value || 0) + delta);
}
</script>

<template>
    <div
        v-bind="$attrs"
        class="enpii-rating"
        :class="[`enpii-rating--${size}`, { 'enpii-rating--readonly': readonly }]"
    >
        <div
            class="enpii-rating__control"
            role="slider"
            tabindex="0"
            :aria-label="t('rating.ariaLabel')"
            :aria-valuenow="model"
            :aria-valuemin="0"
            :aria-valuemax="safeMax"
            :aria-valuetext="ratingText"
            @keydown="onKeydown"
            @mouseleave="hoverValue = 0"
        >
            <button
                v-for="value in safeMax"
                :key="value"
                type="button"
                class="enpii-rating__star"
                :class="{ 'enpii-rating__star--active': value <= previewValue }"
                :disabled="readonly"
                :tabindex="-1"
                :aria-label="t('rating.setAria', { value, max: safeMax })"
                @click="setValue(allowClear && model === value ? 0 : value)"
                @mouseenter="hoverValue = value"
            >
                <AppIcon :name="icon" filled class="enpii-rating__icon" />
            </button>
        </div>
    </div>
</template>

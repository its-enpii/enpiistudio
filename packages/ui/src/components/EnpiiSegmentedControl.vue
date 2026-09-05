<script setup>
import { computed, ref } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    options: { type: Array, required: true },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
    block: { type: Boolean, default: false },
    inline: { type: Boolean, default: false },
});

const model = defineModel({ type: [String, Number], default: '' });
const t = useT();
const focusedIndex = ref(0);

const focusableIndex = computed(() => {
    if (!props.options[focusedIndex.value]?.disabled) return focusedIndex.value;
    return enabledOptions.value[0]?.index ?? focusedIndex.value;
});

const enabledOptions = computed(() => props.options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled));

const indicatorStyle = computed(() => {
    const index = props.options.findIndex((option) => option.value === model.value);
    if (index < 0) return { opacity: '0', transform: `translateX(${index * 100}%)` };

    return {
        opacity: '1',
        transform: `translateX(${index * 100}%)`,
        width: `${100 / props.options.length}%`,
    };
});

function select(option) {
    if (option.disabled) return;
    model.value = option.value;
    focusedIndex.value = props.options.findIndex((item) => item.value === option.value);
}

function focusOption(index) {
    focusedIndex.value = index;
    if (props.options[index]?.disabled) return;
    select(props.options[index]);
}

function moveFocus(delta) {
    const enabled = enabledOptions.value;
    if (!enabled.length) return;

    const currentIndex = enabled.findIndex(({ index }) => index === focusedIndex.value);
    const next = currentIndex < 0
        ? 0
        : (currentIndex + delta + enabled.length) % enabled.length;

    focusOption(enabled[next].index);
}

function onKeydown(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        moveFocus(1);
        return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        moveFocus(-1);
    }
}
</script>

<template>
    <div
        v-bind="$attrs"
        class="enpii-segmented-control"
        :class="[`enpii-segmented-control--${size}`, { 'enpii-segmented-control--block': block, 'enpii-segmented-control--inline': inline }]"
        role="radiogroup"
        :aria-label="t('segmentedControl.ariaLabel')"
        @keydown="onKeydown"
    >
        <span class="enpii-segmented-control__indicator" :style="indicatorStyle" />
        <button
            v-for="(option, index) in options"
            :key="option.value"
            type="button"
            role="radio"
            class="enpii-segmented-control__option"
            :class="{ 'enpii-segmented-control__option--active': model === option.value }"
            :aria-checked="model === option.value"
            :aria-disabled="option.disabled || undefined"
            :disabled="option.disabled"
            :tabindex="index === focusableIndex ? 0 : -1"
            @click="select(option)"
        >
            <AppIcon v-if="option.icon" :name="option.icon" class="enpii-segmented-control__icon" />
            <span class="enpii-segmented-control__label">{{ option.label }}</span>
        </button>
    </div>
</template>

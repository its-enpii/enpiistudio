<script setup>
import { computed, ref } from "vue";
import AppIcon from "./EnpiiIcon.vue";
import { useT } from "../composables/useT";

defineOptions({ inheritAttrs: false });

const props = defineProps({
    options: { type: Array, required: true },
    size: {
        type: String,
        default: "md",
        validator: (value) => ["sm", "md", "lg"].includes(value),
    },
    block: { type: Boolean, default: false },
    inline: { type: Boolean, default: false },
});

const model = defineModel({ type: [String, Number], default: "" });
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
    if (index < 0) return { opacity: "0", transform: `translateX(${index * 100}%)` };

    return {
        opacity: "1",
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
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        moveFocus(1);
        return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        moveFocus(-1);
    }
}
</script>

<template>
    <div
        v-bind="$attrs"
        class="enpii-segmented-control relative box-border w-full p-1 border border-solid [border-width:var(--control-border-width)] [border-color:var(--control-border-color)] rounded-control bg-surface-container-lowest isolate max-w-full"
        :class="[
            `enpii-segmented-control--${size}`,
            size === 'sm' ? 'h-control-height-sm' : 'h-control-height',
            inline ? 'enpii-segmented-control--inline inline-flex w-max' : 'flex w-full',
            { 'enpii-segmented-control--block flex w-full': block },
        ]"
        role="radiogroup"
        :aria-label="t('segmentedControl.ariaLabel')"
        @keydown="onKeydown"
    >
        <span class="enpii-segmented-control__indicator absolute z-0 inset-y-1 left-1 rounded-[calc(var(--radius-control)-0.25rem)] bg-primary transition-[opacity,transform] duration-normal ease-standard motion-reduce:transition-none" :style="indicatorStyle" />
        <button
            v-for="(option, index) in options"
            :key="option.value"
            type="button"
            role="radio"
            class="enpii-segmented-control__option relative z-[1] inline-flex items-center justify-center gap-1.5 self-stretch h-auto py-2 px-3 border-0 rounded-[calc(var(--radius-control)-0.25rem)] bg-transparent text-control font-medium leading-none cursor-pointer [transition-property:color] duration-fast ease-emphasized focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-style:solid] focus-visible:outline-focus focus-visible:[outline-offset:var(--focus-offset-negative)] disabled:cursor-not-allowed disabled:opacity-45 max-sm:px-2.5 max-sm:min-w-0"
            :class="[
                inline ? 'flex-none' : 'flex-1',
                size === 'sm' ? 'min-h-9 !text-[0.8125rem]' : '',
                model === option.value
                    ? 'enpii-segmented-control__option--active text-on-primary'
                    : 'text-on-surface-variant hover:enabled:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:enabled:text-primary-text',
            ]"
            :aria-checked="model === option.value"
            :aria-disabled="option.disabled || undefined"
            :disabled="option.disabled"
            :tabindex="index === focusableIndex ? 0 : -1"
            @click="select(option)"
        >
            <AppIcon v-if="option.icon" :name="option.icon" class="enpii-segmented-control__icon w-[1.125rem] h-[1.125rem] text-[1.125rem]" />
            <span class="enpii-segmented-control__label whitespace-nowrap max-sm:overflow-hidden max-sm:text-ellipsis">{{ option.label }}</span>
        </button>
    </div>
</template>

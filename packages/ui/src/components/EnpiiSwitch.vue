<script setup>
import { computed } from 'vue';
import { useId } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { useShape } from '../composables/useShape';

const model = defineModel({ type: Boolean, default: false });
const props = defineProps({
    id: { type: String, default: null },
    label: { type: String, default: '' },
    description: { type: String, default: null },
    icon: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    bare: { type: Boolean, default: false },
    field: { type: Boolean, default: false },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const switchId = props.id || useId();
const shapeClass = useShape(props);

const shapeUtility = computed(() => {
    if (props.shape === 'pill') return 'rounded-[9999px]';
    if (props.shape === 'sharp') return 'rounded-none';
    return 'rounded-control';
});
</script>

<template>
    <label
        v-if="bare || (!label && !description && !icon && !field)"
        :for="switchId"
        class="enpii-switch enpii-switch--bare relative inline-flex items-center shrink-0 cursor-pointer"
        :class="[shapeClass, { 'enpii-switch--disabled opacity-65 cursor-not-allowed': disabled }]"
    >
        <input :id="switchId" v-model="model" type="checkbox" role="switch" class="enpii-switch__native enpii-sr-only peer" :disabled="disabled">
        <span class="enpii-switch__track w-12 h-7 rounded-[9999px] bg-outline-variant peer-checked:bg-primary [transition-property:background] duration-fast ease-emphasized" />
        <span class="enpii-switch__thumb absolute top-1 left-1 w-5 h-5 rounded-[9999px] bg-surface-container-lowest shadow-control transition-transform duration-fast ease-standard pointer-events-none peer-checked:translate-x-5" />
    </label>

    <div v-else-if="field" class="enpii-switch enpii-switch--field">
        <label v-if="label" :for="switchId" class="enpii-switch__label block ml-1 text-on-surface-variant text-[0.8125rem] font-semibold tracking-[0.02em]">{{ label }}</label>
        <label
            :for="switchId"
            class="enpii-switch__box flex w-full min-h-control items-center justify-between gap-4 px-4 border border-solid border-outline-variant rounded-control bg-surface-container-lowest cursor-pointer transition-all duration-fast ease-emphasized focus-within:border-primary-container focus-within:[box-shadow:var(--enpii-focus-ring)]"
            :class="[shapeClass, shapeUtility, { 'opacity-65 cursor-not-allowed': disabled }]"
        >
            <span class="enpii-switch__content flex items-center gap-3 min-w-0">
                <AppIcon v-if="icon" :name="icon" class="enpii-switch__icon w-5 h-5 text-outline text-xl leading-none" />
                <span class="enpii-switch__text truncate text-primary-text text-sm font-medium">{{ model ? (description || 'Aktif') : (description || 'Nonaktif') }}</span>
            </span>
            <span class="enpii-switch__control relative inline-flex shrink-0">
                <input :id="switchId" v-model="model" type="checkbox" role="switch" class="enpii-switch__native enpii-sr-only peer" :disabled="disabled">
                <span class="enpii-switch__track w-12 h-7 rounded-[9999px] bg-outline-variant peer-checked:bg-primary [transition-property:background] duration-fast ease-emphasized" />
                <span class="enpii-switch__thumb absolute top-1 left-1 w-5 h-5 rounded-[9999px] bg-surface-container-lowest shadow-control transition-transform duration-fast ease-standard pointer-events-none peer-checked:translate-x-5" />
            </span>
        </label>
    </div>

    <label
        v-else
        :for="switchId"
        class="enpii-switch enpii-switch--inline flex min-h-control items-center justify-between gap-4 px-4 border border-solid border-outline-variant rounded-control bg-surface-container-lowest cursor-pointer transition-all duration-fast ease-emphasized"
        :class="[shapeClass, shapeUtility, { 'opacity-65 cursor-not-allowed': disabled }]"
    >
        <span class="enpii-switch__content flex items-center gap-3 min-w-0">
            <AppIcon v-if="icon" :name="icon" class="enpii-switch__icon w-5 h-5 text-outline text-xl leading-none" />
            <span class="enpii-switch__inline-text block">
                <span v-if="label" class="enpii-switch__inline-label block text-primary-text text-sm font-semibold">{{ label }}</span>
                <span v-if="description" class="enpii-switch__description block mt-1 text-on-surface-variant text-xs">{{ description }}</span>
            </span>
        </span>
        <span class="enpii-switch__control relative inline-flex shrink-0">
            <input :id="switchId" v-model="model" type="checkbox" role="switch" class="enpii-switch__native enpii-sr-only peer" :disabled="disabled">
            <span class="enpii-switch__track w-12 h-7 rounded-[9999px] bg-outline-variant peer-checked:bg-primary [transition-property:background] duration-fast ease-emphasized" />
            <span class="enpii-switch__thumb absolute top-1 left-1 w-5 h-5 rounded-[9999px] bg-surface-container-lowest shadow-control transition-transform duration-fast ease-standard pointer-events-none peer-checked:translate-x-5" />
        </span>
    </label>
</template>

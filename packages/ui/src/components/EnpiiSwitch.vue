<script setup>
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
    /** When true, renders only the switch toggle pill without the outer field border and padding. */
    bare: { type: Boolean, default: false },
    /** When true, matches form inputs with an uppercase label above a control-height row. */
    field: { type: Boolean, default: false },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const switchId = props.id || useId();
const shapeClass = useShape(props);
</script>

<template>
    <!-- Bare switch only (no container / inline within custom layout) -->
    <label
        v-if="bare || (!label && !description && !icon && !field)"
        :for="switchId"
        class="enpii-switch enpii-switch--bare"
        :class="[shapeClass, { 'enpii-switch--disabled': disabled }]"
    >
        <input :id="switchId" v-model="model" type="checkbox" role="switch" class="enpii-switch__native enpii-sr-only" :disabled="disabled">
        <span class="enpii-switch__track" />
        <span class="enpii-switch__thumb" />
    </label>

    <!-- Form-field layout (grid-aligned with AppInput / SmartSelect) -->
    <div v-else-if="field" class="enpii-switch enpii-switch--field">
        <label v-if="label" :for="switchId" class="enpii-switch__label">{{ label }}</label>
        <label
            :for="switchId"
            class="enpii-switch__box"
            :class="[shapeClass, { 'enpii-switch--disabled': disabled }]"
        >
            <span class="enpii-switch__content">
                <AppIcon v-if="icon" :name="icon" class="enpii-switch__icon" />
                <span class="enpii-switch__text">{{ model ? (description || 'Aktif') : (description || 'Nonaktif') }}</span>
            </span>
            <span class="enpii-switch__control">
                <input :id="switchId" v-model="model" type="checkbox" role="switch" class="enpii-switch__native enpii-sr-only" :disabled="disabled">
                <span class="enpii-switch__track" />
                <span class="enpii-switch__thumb" />
            </span>
        </label>
    </div>

    <!-- Compact inline (settings lists, etc.) -->
    <label
        v-else
        :for="switchId"
        class="enpii-switch enpii-switch--inline"
        :class="[shapeClass, { 'enpii-switch--disabled': disabled }]"
    >
        <span class="enpii-switch__content">
            <AppIcon v-if="icon" :name="icon" class="enpii-switch__icon" />
            <span class="enpii-switch__inline-text">
                <span v-if="label" class="enpii-switch__inline-label">{{ label }}</span>
                <span v-if="description" class="enpii-switch__description">{{ description }}</span>
            </span>
        </span>
        <span class="enpii-switch__control">
                <input :id="switchId" v-model="model" type="checkbox" role="switch" class="enpii-switch__native enpii-sr-only" :disabled="disabled">
            <span class="enpii-switch__track" />
            <span class="enpii-switch__thumb" />
        </span>
    </label>
</template>

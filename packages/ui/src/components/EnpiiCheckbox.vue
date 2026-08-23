<script setup>
import { computed } from 'vue';
import { useId } from 'vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    /**
     * Use as boolean (v-model="bool") or array (v-model="array" + :value="...").
     * Component auto-detects which mode based on model type.
     */
    modelValue: { type: [Boolean, Array], default: false },
    value: { type: [String, Number, Boolean], default: undefined },
    label: { type: String, default: null },
    description: { type: String, default: null },
    icon: { type: String, default: null },
    indeterminate: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /**
     * 'cell' (default) — bare checkbox + optional label next to it (table cells, lists).
     * 'inline' — slightly larger, sits next to inline text (login "remember me").
     * 'field' — full form-field with an uppercase label above (parity with input and switch field modes).
     */
    variant: {
        type: String,
        default: 'cell',
        validator: (value) => ['cell', 'inline', 'field'].includes(value),
    },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const emit = defineEmits(['update:modelValue']);

const uid = useId();
const id = computed(() => `cb-${uid}`);

const isChecked = computed(() => {
    if (Array.isArray(props.modelValue)) {
        return props.modelValue.includes(props.value);
    }
    return Boolean(props.modelValue);
});

function onChange(event) {
    const checked = event.target.checked;
    if (Array.isArray(props.modelValue)) {
        const next = [...props.modelValue];
        const idx = next.indexOf(props.value);
        if (checked && idx === -1) next.push(props.value);
        else if (!checked && idx !== -1) next.splice(idx, 1);
        emit('update:modelValue', next);
    } else {
        emit('update:modelValue', checked);
    }
}
</script>

<template>
    <!-- field variant: parity with AppInput / AppSwitch field mode -->
    <div v-if="variant === 'field'" class="enpii-checkbox enpii-checkbox--field">
        <label :for="id" class="enpii-checkbox__label">
            {{ label }}<span v-if="description" class="enpii-checkbox__label-description">— {{ description }}</span>
        </label>
        <label
            :for="id"
            class="enpii-checkbox__box enpii-checkbox__box--field"
            :class="[shapeClass, { 'enpii-checkbox__box--disabled': disabled }]"
        >
            <input
                :id="id"
                type="checkbox"
                role="checkbox"
                class="enpii-checkbox__native enpii-checkbox__native--field"
                :checked="isChecked"
                :indeterminate.prop="indeterminate"
                :disabled="disabled"
                @change="onChange"
            />
            <span class="enpii-checkbox__text">
                <slot name="label">{{ label }}</slot>
            </span>
        </label>
    </div>

    <!-- inline variant: compact, sits next to text -->
    <label
        v-else-if="variant === 'inline'"
        :for="id"
        class="enpii-checkbox enpii-checkbox--inline"
        :class="[shapeClass, { 'enpii-checkbox--disabled': disabled }]"
    >
        <input
            :id="id"
            type="checkbox"
            role="checkbox"
            class="enpii-checkbox__native"
            :checked="isChecked"
            :indeterminate.prop="indeterminate"
            :disabled="disabled"
            @change="onChange"
        />
        <slot name="label">{{ label }}</slot>
    </label>

    <!-- cell variant: bare checkbox -->
    <input
        v-else
        :id="id"
        type="checkbox"
        role="checkbox"
        class="enpii-checkbox__native enpii-checkbox__native--cell"
        :class="shapeClass"
        :checked="isChecked"
        :indeterminate.prop="indeterminate"
        :disabled="disabled"
        :aria-label="label || undefined"
        @change="onChange"
    />
</template>

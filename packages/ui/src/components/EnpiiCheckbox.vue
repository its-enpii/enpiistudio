<script setup>
import { computed } from 'vue';
import { useId } from 'vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    modelValue: { type: [Boolean, Array], default: false },
    value: { type: [String, Number, Boolean], default: undefined },
    label: { type: String, default: null },
    description: { type: String, default: null },
    icon: { type: String, default: null },
    indeterminate: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
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

const shapeUtility = computed(() => {
    if (props.shape === 'pill') return 'rounded-full';
    if (props.shape === 'sharp') return 'rounded-none';
    return 'rounded-control';
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
    <div v-if="variant === 'field'" class="enpii-checkbox enpii-checkbox--field [&>*+*]:mt-[var(--enpii-space-field-gap)]">
        <label :for="id" class="enpii-checkbox__label block ml-1 text-on-surface-variant text-[0.8125rem] font-semibold tracking-[0.02em]">
            {{ label }}<span v-if="description" class="enpii-checkbox__label-description ml-2 text-on-surface-variant text-xs font-normal normal-case tracking-normal">— {{ description }}</span>
        </label>
        <label
            :for="id"
            class="enpii-checkbox__box enpii-checkbox__box--field flex w-full min-h-control items-center gap-3 px-4 border border-solid border-outline-variant rounded-control bg-surface-container-lowest cursor-pointer transition-all duration-fast ease-emphasized focus-within:border-primary-container focus-within:[box-shadow:var(--enpii-focus-ring)]"
            :class="[shapeClass, shapeUtility, { 'opacity-55 cursor-not-allowed enpii-checkbox__box--disabled': disabled }]"
        >
            <input
                :id="id"
                type="checkbox"
                role="checkbox"
                class="enpii-checkbox__native enpii-checkbox__native--field m-0 appearance-none w-5 h-5 border border-solid border-outline-variant rounded-[4px] bg-surface-container-lowest accent-primary [transition-property:transform] duration-fast ease-emphasized checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary before:content-[''] before:block before:w-full before:h-full before:scale-0 before:bg-on-primary before:transition-transform before:duration-fast before:ease-emphasized checked:before:scale-100 indeterminate:before:scale-[0.8] indeterminate:before:translate-y-[-15%] before:[clip-path:polygon(14%_44%,0_65%,50%_100%,100%_16%,80%_0,43%_62%)] indeterminate:before:[clip-path:inset(40%_10%_40%_10%)]"
                :checked="isChecked"
                :indeterminate.prop="indeterminate"
                :disabled="disabled"
                @change="onChange"
            />
            <span class="enpii-checkbox__text text-primary-text text-sm font-medium">
                <slot name="label">{{ label }}</slot>
            </span>
        </label>
    </div>

    <label
        v-else-if="variant === 'inline'"
        :for="id"
        class="enpii-checkbox enpii-checkbox--inline inline-flex items-center gap-2 text-primary-text font-medium select-none cursor-pointer [transition-property:transform] duration-fast ease-emphasized hover:[&_.enpii-checkbox__native]:border-primary-container"
        :class="[shapeClass, shapeUtility, { 'opacity-55 cursor-not-allowed enpii-checkbox--disabled': disabled }]"
    >
        <input
            :id="id"
            type="checkbox"
            role="checkbox"
            class="enpii-checkbox__native m-0 appearance-none w-4 h-4 border border-solid border-outline-variant rounded-[4px] bg-surface-container-lowest accent-primary [transition-property:transform] duration-fast ease-emphasized checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary before:content-[''] before:block before:w-full before:h-full before:scale-0 before:bg-on-primary before:transition-transform before:duration-fast before:ease-emphasized checked:before:scale-100 indeterminate:before:scale-[0.8] indeterminate:before:translate-y-[-15%] before:[clip-path:polygon(14%_44%,0_65%,50%_100%,100%_16%,80%_0,43%_62%)] indeterminate:before:[clip-path:inset(40%_10%_40%_10%)]"
            :checked="isChecked"
            :indeterminate.prop="indeterminate"
            :disabled="disabled"
            @change="onChange"
        />
        <slot name="label">{{ label }}</slot>
    </label>

    <input
        v-else
        :id="id"
        type="checkbox"
        role="checkbox"
        class="enpii-checkbox__native enpii-checkbox__native--cell m-0 appearance-none w-4 h-4 border border-solid border-outline-variant bg-surface-container-lowest accent-primary [transition-property:transform] duration-fast ease-emphasized checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary before:content-[''] before:block before:w-full before:h-full before:scale-0 before:bg-on-primary before:transition-transform before:duration-fast before:ease-emphasized checked:before:scale-100 indeterminate:before:scale-[0.8] indeterminate:before:translate-y-[-15%] before:[clip-path:polygon(14%_44%,0_65%,50%_100%,100%_16%,80%_0,43%_62%)] indeterminate:before:[clip-path:inset(40%_10%_40%_10%)] cursor-pointer active:scale-90 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        :class="[shapeClass, shapeUtility]"
        :checked="isChecked"
        :indeterminate.prop="indeterminate"
        :disabled="disabled"
        :aria-label="label || undefined"
        @change="onChange"
    />
</template>

<script setup>
defineOptions({ inheritAttrs: false });

import { computed, ref, useId } from 'vue';
import AppIcon from './AppIcon.vue';
import AppTooltip from './AppTooltip.vue';

const model = defineModel({ type: String, default: '' });
const props = defineProps({
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
    },
    id: { type: String, default: null },
    label: { type: String, default: 'Kata Sandi' },
    icon: { type: String, default: 'lock' },
    autocomplete: { type: String, default: 'current-password' },
    placeholder: { type: String, default: '••••••••' },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    readonly: { type: Boolean, default: false },
    hideLabel: { type: Boolean, default: false },
    tooltip: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
});

const generatedId = useId();
const inputId = props.id || generatedId;
const visible = ref(false);
const canShowPasswordToggle = computed(() => !props.readonly);
const sizeClasses = {
    sm: { input: 'h-10 px-3 text-sm', icon: 'text-lg', leftIcon: 'left-3', leadingPad: 'pl-10', trailingPad: 'pr-10', action: 'right-2' },
    md: { input: 'h-12 px-4 text-base', icon: 'text-xl', leftIcon: 'left-4', leadingPad: 'pl-11', trailingPad: 'pr-12', action: 'right-3' },
    lg: { input: 'h-14 px-5 text-base', icon: 'text-2xl', leftIcon: 'left-5', leadingPad: 'pl-14', trailingPad: 'pr-14', action: 'right-3' },
    xl: { input: 'h-16 px-6 text-lg', icon: 'text-2xl', leftIcon: 'left-6', leadingPad: 'pl-16', trailingPad: 'pr-16', action: 'right-4' },
};
const activeSize = computed(() => sizeClasses[props.size]);

function toggleVisibility() {
    visible.value = !visible.value;
}
</script>

<template>
    <div class="space-y-2">
        <div v-if="!hideLabel" class="ml-1 flex items-center gap-1.5">
            <label :for="inputId" class="block text-sm font-bold uppercase tracking-wider text-primary">{{ label }}</label>
            <AppTooltip v-if="tooltip" :id="`${inputId}-tooltip`" :text="tooltip" />
        </div>
        <label v-else :for="inputId" class="sr-only">{{ label }}</label>
        <div class="relative">
            <slot v-if="$slots.leading" name="leading" />
            <AppIcon
                v-else-if="icon"
                :name="icon"
                class="pointer-events-none absolute top-1/2 -translate-y-1/2 text-outline"
                :class="[activeSize.icon, activeSize.leftIcon]"
            />
            <input
                :id="inputId"
                v-model="model"
                :type="visible ? 'text' : 'password'"
                :autocomplete="autocomplete"
                :aria-invalid="Boolean(error)"
                :aria-required="required"
                :aria-describedby="[
                    error && `${inputId}-error`,
                    hint && `${inputId}-hint`,
                    tooltip && `${inputId}-tooltip`
                ].filter(Boolean).join(' ') || undefined"
                :readonly="readonly"
                :disabled="disabled"
                :placeholder="readonly ? undefined : placeholder"
                class="w-full rounded-xl border bg-surface-container-lowest text-primary transition placeholder:text-outline focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 focus:outline-none read-only:cursor-default read-only:bg-surface-container-low read-only:text-on-surface-variant"
                :class="[
                    activeSize.input,
                    ($slots.leading || icon) && activeSize.leadingPad,
                    (canShowTrailing ? ($slots.trailing || !readonly) : false),
                    error ? 'border-error' : 'border-outline-variant',
                ]"
                v-bind="$attrs"
            >
            <div
                v-if="$slots.trailing || (!readonly && canShowPasswordToggle)"
                class="absolute top-1/2 flex -translate-y-1/2 items-center justify-center gap-1"
                :class="activeSize.action"
            >
                <button
                    v-if="!readonly"
                    type="button"
                    class="rounded-full p-1 text-outline transition hover:bg-surface-container-low hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20 active:scale-90"
                    :aria-label="visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                    :aria-pressed="visible"
                    :disabled="disabled"
                    @click="toggleVisibility"
                >
                    <AppIcon :name="visible ? 'visibility_off' : 'visibility'" :class="activeSize.icon" />
                </button>
                <slot name="trailing" />
            </div>
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="ml-1 text-sm text-error">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="ml-1 text-sm text-on-surface-variant">{{ hint }}</p>
    </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false });

import { useId } from 'vue';
import AppIcon from './AppIcon.vue';

const model = defineModel({ type: [File, Array], default: null });
const props = defineProps({
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
    },
    id: { type: String, default: null },
    label: { type: String, required: true },
    icon: { type: String, default: 'attach_file' },
    accept: { type: String, default: null },
    hint: { type: String, default: null },
    error: { type: String, default: null },
});

const inputId = props.id || useId();
const sizeClasses = {
    sm: { input: 'h-10 text-sm pl-10 pr-3', icon: 'text-lg left-3' },
    md: { input: 'h-12 text-base pl-11 pr-4', icon: 'text-xl left-4' },
    lg: { input: 'h-14 text-base pl-14 pr-5', icon: 'text-2xl left-5' },
    xl: { input: 'h-16 text-lg pl-16 pr-6', icon: 'text-2xl left-6' },
};
const activeSize = sizeClasses[props.size];

function clearFile() {
    model.value = null;
}

function onChange(event) {
    model.value = event.target.files?.[0] ?? null;
}
</script>

<template>
    <div class="space-y-2">
        <label :for="inputId" class="ml-1 block text-sm font-bold uppercase tracking-wider text-primary">{{ label }}</label>
        <div class="relative">
            <AppIcon v-if="icon" :name="icon" class="pointer-events-none absolute top-1/2 -translate-y-1/2 text-outline" :class="activeSize.icon" />
            <input
                :id="inputId"
                type="file"
                :accept="accept"
                :aria-invalid="Boolean(error)"
                :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
                :key="String(model)"
                class="block w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-0 text-on-surface transition focus:border-primary-container focus:ring-2 focus:ring-primary-container/10 focus:outline-none file:mr-3 file:rounded-full file:border-0 file:bg-primary-container file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-on-primary-container"
                :class="[activeSize.input, error && 'border-error']"
                v-bind="$attrs"
                @change="onChange"
            >
        </div>
        <p v-if="error" :id="`${inputId}-error`" class="ml-1 text-sm text-error">{{ error }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="ml-1 text-sm text-on-surface-variant">{{ hint }}</p>
        <p v-else-if="model" class="ml-1 flex items-center gap-2 text-sm text-on-surface-variant">
            {{ model.name }}
            <button type="button" class="font-semibold text-primary hover:underline" @click="clearFile">Hapus</button>
        </p>
    </div>
</template>

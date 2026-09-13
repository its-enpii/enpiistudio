<script setup>
defineOptions({ inheritAttrs: false });

import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import AppIcon from './AppIcon.vue';
import AppTooltip from './AppTooltip.vue';

const model = defineModel({ type: [File, String, Object], default: null });
const emit = defineEmits(['validation-error', 'validation-success']);
const props = defineProps({
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
    },
    id: { type: String, default: null },
    label: { type: String, required: true },
    variant: {
        type: String,
        default: 'compact',
        validator: (value) => ['compact', 'card', 'dropzone'].includes(value),
    },
    accept: { type: String, default: 'image/png,image/jpeg,image/webp,image/svg+xml' },
    icon: { type: String, default: 'add_photo_alternate' },
    maxSizeMb: { type: Number, default: 5 },
    error: { type: String, default: null },
    hint: { type: String, default: null },
    hideLabel: { type: Boolean, default: false },
    tooltip: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
});

const generatedId = useId();
const inputId = props.id || generatedId;
const input = ref(null);
const objectUrl = ref(null);
const dragActive = ref(false);
const validationError = ref(null);
const sizeClasses = {
    sm: { control: 'h-10 text-sm', thumb: 'size-8', icon: 'text-lg', action: 'size-8' },
    md: { control: 'h-12 text-base', thumb: 'size-10', icon: 'text-xl', action: 'size-9' },
    lg: { control: 'h-14 text-base', thumb: 'size-12', icon: 'text-2xl', action: 'size-11' },
    xl: { control: 'h-16 text-lg', thumb: 'size-14', icon: 'text-2xl', action: 'size-12' },
};
const activeSize = computed(() => sizeClasses[props.size]);
const currentError = computed(() => validationError.value || props.error);
const displaySource = computed(() => objectUrl.value || sourceUrl(model.value));

function sourceUrl(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof File) return URL.createObjectURL(value);
    if (typeof value.url === 'string') return value.url;
    return null;
}

watch(model, (value) => {
    if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = value instanceof File ? URL.createObjectURL(value) : null;
}, { immediate: true });

onBeforeUnmount(() => {
    if (objectUrl.value) URL.revokeObjectURL(objectUrl.value);
});

function displayName(value) {
    if (!value) return '';
    if (value instanceof File) return value.name;
    if (typeof value === 'string') return value.split('/').pop() || 'Gambar saat ini';
    if (typeof value.name === 'string') return value.name;
    return 'Gambar saat ini';
}

function clearImage() {
    if (props.readonly) return;
    model.value = null;
    validationError.value = null;
    emit('validation-success');
}

function resetInput() {
    if (input.value) input.value.value = '';
}

function openPicker() {
    if (!props.disabled && !props.readonly) input.value?.click();
}

function acceptFile(file) {
    if (!file) return;
    if (props.maxSizeMb && file.size > props.maxSizeMb * 1024 * 1024) {
        validationError.value = `Ukuran gambar maksimal ${props.maxSizeMb} MB.`;
        resetInput();
        emit('validation-error', validationError.value);
        return;
    }

    validationError.value = null;
    model.value = file;
    emit('validation-success', file);
}

function onFileChange(event) {
    acceptFile(event.target.files?.[0]);
    resetInput();
}

function onDrop(event) {
    dragActive.value = false;
    acceptFile(event.dataTransfer?.files?.[0]);
}

const metadata = computed(() => {
    if (!model.value) return 'Belum ada gambar';
    if (model.value instanceof File) {
        const sizeMb = model.value.size / (1024 * 1024);
        return `${displayName(model.value)} · ${sizeMb.toFixed(2)} MB`;
    }
    return displayName(model.value);
});
</script>

<template>
    <div class="space-y-2">
        <div v-if="!hideLabel" class="ml-1 flex items-center gap-1.5">
            <label :for="inputId" class="block text-sm font-bold uppercase tracking-wider text-primary">{{ label }}</label>
            <AppTooltip v-if="tooltip" :id="`${inputId}-tooltip`" :text="tooltip" />
        </div>
        <label v-else :for="inputId" class="sr-only">{{ label }}</label>

        <div
            v-if="variant === 'compact'"
            class="flex w-full items-center gap-3 rounded-xl border bg-surface-container-lowest pl-2 pr-2 transition focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/10"
            :class="[activeSize.control, currentError ? 'border-error' : 'border-outline-variant']"
        >
            <span v-if="displaySource" class="grid shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-container-low" :class="activeSize.thumb">
                <img :src="displaySource" :alt="`${label} preview`" class="size-full object-cover">
            </span>
            <span v-else class="grid shrink-0 place-items-center rounded-lg bg-surface-container-low text-on-surface-variant" :class="activeSize.thumb">
                <AppIcon :name="icon" :class="activeSize.icon" />
            </span>
            <span class="min-w-0 flex-1 truncate text-on-surface-variant">{{ metadata }}</span>
            <button
                type="button"
                class="shrink-0 rounded-lg bg-primary-container px-3 text-sm font-semibold text-on-primary-container transition hover:bg-primary-container/80 focus:outline-none focus:ring-2 focus:ring-primary-container/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                :class="size === 'sm' ? 'gap-1.5' : 'gap-2'"
                :disabled="disabled || readonly"
                @click="openPicker"
            >
                <AppIcon name="upload" class="text-lg" />
                <span>Pilih Gambar</span>
            </button>
            <button
                v-if="clearable && model"
                type="button"
                class="grid shrink-0 place-items-center rounded-lg text-on-surface-variant transition hover:bg-surface-container-low hover:text-error focus:outline-none focus:ring-2 focus:ring-error-container/40 active:scale-95"
                :class="activeSize.action"
                :disabled="disabled || readonly"
                aria-label="Hapus gambar"
                @click="clearImage"
            >
                <AppIcon name="close" :class="activeSize.icon" />
            </button>
        </div>

        <div
            v-else
            class="group relative grid min-h-64 place-items-center overflow-hidden rounded-xl border border-dashed bg-surface-container-lowest p-4 transition focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/10"
            :class="[dragActive ? 'border-primary bg-primary-container/10' : currentError ? 'border-error' : 'border-outline-variant', disabled && 'opacity-60']"
            tabindex="0"
            role="button"
            :aria-label="label"
            :aria-disabled="disabled || readonly"
            @click="openPicker"
            @keydown.enter.prevent="openPicker"
            @keydown.space.prevent="openPicker"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="onDrop"
        >
            <img v-if="displaySource" :src="displaySource" :alt="`${label} preview`" class="absolute inset-0 size-full object-cover">
            <div v-if="displaySource" class="absolute inset-0 bg-surface-container-lowest/70" />
            <div class="relative z-10 flex max-w-full flex-col items-center gap-3 text-center">
                <span class="grid size-14 place-items-center rounded-full bg-primary-container text-on-primary-container">
                    <AppIcon :name="icon" class="text-2xl" />
                </span>
                <div>
                    <p class="font-semibold text-primary">{{ model ? metadata : 'Tarik gambar ke sini' }}</p>
                    <p class="mt-1 text-sm text-on-surface-variant">atau klik untuk memilih gambar (maksimal {{ maxSizeMb }} MB)</p>
                </div>
                <div class="flex flex-wrap items-center justify-center gap-2">
                    <button type="button" class="rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container transition hover:bg-primary-container/80 focus:outline-none focus:ring-2 focus:ring-primary-container/30 active:scale-95" :disabled="disabled || readonly" @click.stop="openPicker">
                        Ubah Gambar
                    </button>
                    <button v-if="clearable && model" type="button" class="rounded-lg px-4 py-2 text-sm font-semibold text-error transition hover:bg-error-container focus:outline-none focus:ring-2 focus:ring-error-container/40 active:scale-95" :disabled="disabled || readonly" @click.stop="clearImage">
                        Hapus
                    </button>
                </div>
            </div>
        </div>

        <input
            :id="inputId"
            ref="input"
            type="file"
            :accept="accept"
            class="sr-only"
            :aria-invalid="Boolean(currentError)"
            :aria-describedby="[
                currentError && `${inputId}-error`,
                hint && `${inputId}-hint`,
                tooltip && `${inputId}-tooltip`
            ].filter(Boolean).join(' ') || undefined"
            :disabled="disabled || readonly"
            tabindex="-1"
            v-bind="$attrs"
            @change="onFileChange"
        >
        <p v-if="currentError" :id="`${inputId}-error`" class="ml-1 text-sm text-error">{{ currentError }}</p>
        <p v-else-if="hint" :id="`${inputId}-hint`" class="ml-1 text-sm text-on-surface-variant">{{ hint }}</p>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useId } from 'vue';
import { useShape } from '../composables/useShape';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    accept: { type: String, default: null },
    maxSize: { type: Number, default: 5 * 1024 * 1024 },
    maxFiles: { type: Number, default: null },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    modelValue: { type: Array, default: () => [] },
    label: { type: String, default: 'Unggah file' },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const emit = defineEmits(['update:modelValue', 'error']);

const shapeClass = useShape(props);
const inputId = useId();
const inputRef = ref(null);
const dragOver = ref(false);

const files = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
});

const fileErrors = ref(new Map());

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file) {
    return file.type.startsWith('image/');
}

function matchesAccept(file) {
    if (!props.accept) return true;
    const acceptParts = props.accept.split(',').map((s) => s.trim().toLowerCase());
    for (const part of acceptParts) {
        if (part.startsWith('.')) {
            if (file.name.toLowerCase().endsWith(part)) return true;
        } else if (part.endsWith('/*')) {
            const prefix = part.slice(0, -1);
            if (file.type.toLowerCase().startsWith(prefix)) return true;
        } else {
            if (file.type.toLowerCase() === part) return true;
        }
    }
    return false;
}

function validateAndAdd(incoming) {
    const newErrors = new Map();
    const accepted = [];

    for (const file of incoming) {
        if (!matchesAccept(file)) {
            const errMsg = `Tipe file "${file.name}" tidak diizinkan`;
            newErrors.set(file.name, errMsg);
            emit('error', { file, message: errMsg });
            continue;
        }
        if (file.size > props.maxSize) {
            const errMsg = `"${file.name}" melebihi batas ${formatSize(props.maxSize)}`;
            newErrors.set(file.name, errMsg);
            emit('error', { file, message: errMsg });
            continue;
        }
        accepted.push(file);
    }

    let combined = [...files.value, ...accepted];

    if (props.maxFiles != null && combined.length > props.maxFiles) {
        const excess = combined.slice(props.maxFiles);
        for (const file of excess) {
            const errMsg = `Melebihi batas maksimal ${props.maxFiles} file`;
            newErrors.set(file.name, errMsg);
            emit('error', { file, message: errMsg });
        }
        combined = combined.slice(0, props.maxFiles);
    }

    fileErrors.value = newErrors;
    files.value = combined;
}

function onInputChange(event) {
    const inputFiles = Array.from(event.target.files || []);
    if (inputFiles.length) {
        validateAndAdd(inputFiles);
    }
    event.target.value = '';
}

function onDrop(event) {
    event.preventDefault();
    dragOver.value = false;
    if (props.disabled) return;
    const dropped = Array.from(event.dataTransfer?.files || []);
    if (dropped.length) {
        validateAndAdd(dropped);
    }
}

function onDragOver(event) {
    event.preventDefault();
    if (!props.disabled) dragOver.value = true;
}

function onDragLeave() {
    dragOver.value = false;
}

function openFilePicker() {
    if (!props.disabled && inputRef.value) {
        inputRef.value.click();
    }
}

function onKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFilePicker();
    }
}

function removeFile(index) {
    const next = [...files.value];
    next.splice(index, 1);
    files.value = next;
}

const thumbnails = ref(new Map());

watch(
    () => props.modelValue,
    (newFiles) => {
        const nextMap = new Map();
        for (const file of newFiles) {
            if (isImageFile(file)) {
                const existing = thumbnails.value.get(file);
                if (existing) {
                    nextMap.set(file, existing);
                } else {
                    nextMap.set(file, URL.createObjectURL(file));
                }
            }
        }
        for (const [file, url] of thumbnails.value) {
            if (!nextMap.has(file)) {
                URL.revokeObjectURL(url);
            }
        }
        thumbnails.value = nextMap;
    },
    { immediate: true },
);
</script>

<template>
    <div
        class="enpii-file-upload [&>*+*]:mt-field-gap"
        :class="[shapeClass, { 'opacity-60 pointer-events-none': disabled }]"
        v-bind="$attrs"
    >
        <label :for="inputId" class="enpii-file-upload__label ml-1 block text-on-surface-variant text-[.8125rem] font-semibold tracking-wide">{{ label }}</label>

        <div
            class="enpii-file-upload__dropzone flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-control border border-dashed border-outline-variant [border-width:var(--control-border-width)] bg-surface-container-lowest px-6 py-4 transition-[border-color,box-shadow,background] duration-fast ease-emphasized hover:border-primary/40 focus-visible:focus-visible:[outline-style:solid] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:outline-focus focus-visible:[outline-offset:var(--focus-offset)]"
            :class="{
                'border-primary [box-shadow:var(--shadow-focus)]': dragOver,
                'enpii-file-upload__dropzone--disabled cursor-not-allowed opacity-60 pointer-events-none': disabled,
            }"
            role="button"
            :tabindex="disabled ? -1 : 0"
            :aria-disabled="disabled || undefined"
            :aria-label="`${label}: klik atau seret file di sini`"
            @click="openFilePicker"
            @keydown="onKeydown"
            @drop="onDrop"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
        >
            <span class="material-symbols-outlined enpii-file-upload__icon text-3xl leading-none text-outline" aria-hidden="true">upload_file</span>
            <span class="enpii-file-upload__dropzone-text text-on-surface-variant text-[.8125rem]">Seret file di sini atau klik untuk memilih</span>
        </div>

        <input
            :id="inputId"
            ref="inputRef"
            type="file"
            class="enpii-sr-only"
            :accept="accept || undefined"
            :multiple="multiple"
            :disabled="disabled"
            @change="onInputChange"
        />

        <ul v-if="fileErrors.size" class="enpii-file-upload__errors m-0 list-none p-0" role="alert">
            <li
                v-for="[name, msg] of fileErrors"
                :key="name"
                class="enpii-file-upload__error text-danger-text text-[.8125rem]"
            >
                {{ msg }}
            </li>
        </ul>

        <ul v-if="files.length" class="enpii-file-upload__list m-0 flex list-none flex-col gap-1.5 p-0">
            <li
                v-for="(file, idx) in files"
                :key="`${file.name}-${idx}`"
                class="enpii-file-upload__item flex items-center gap-2.5 rounded-control border border-outline-variant [border-width:var(--control-border-width)] bg-surface-container-lowest px-2.5 py-2"
            >
                <img
                    v-if="isImageFile(file) && thumbnails.get(file)"
                    :src="thumbnails.get(file)"
                    :alt="file.name"
                    class="enpii-file-upload__thumb h-9 w-9 shrink-0 rounded-md object-cover"
                />
                <span v-else class="material-symbols-outlined enpii-file-upload__file-icon shrink-0 text-xl leading-none text-outline" aria-hidden="true">description</span>

                <span class="enpii-file-upload__meta flex min-w-0 flex-1 flex-col gap-px">
                    <span class="enpii-file-upload__name truncate text-on-surface text-[.8125rem] font-medium">{{ file.name }}</span>
                    <span class="enpii-file-upload__size text-on-surface-variant text-xs">{{ formatSize(file.size) }}</span>
                </span>

                <button
                    type="button"
                    class="enpii-file-upload__remove flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-outline transition-colors duration-fast ease-emphasized hover:bg-danger-soft hover:text-danger-text focus-visible:focus-visible:[outline-style:solid] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:outline-focus focus-visible:[outline-offset:var(--focus-offset)] disabled:cursor-not-allowed"
                    :aria-label="`Hapus ${file.name}`"
                    :disabled="disabled"
                    @click="removeFile(idx)"
                >
                    <span class="material-symbols-outlined text-[1.125rem] leading-none" aria-hidden="true">close</span>
                </button>
            </li>
        </ul>
    </div>
</template>

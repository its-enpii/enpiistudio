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
        class="enpii-file-upload"
        :class="[shapeClass, { 'enpii-file-upload--disabled': disabled }]"
        v-bind="$attrs"
    >
        <label :for="inputId" class="enpii-file-upload__label">{{ label }}</label>

        <div
            class="enpii-file-upload__dropzone"
            :class="{
                'enpii-file-upload__dropzone--active': dragOver,
                'enpii-file-upload__dropzone--disabled': disabled,
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
            <span class="material-symbols-outlined enpii-file-upload__icon" aria-hidden="true">upload_file</span>
            <span class="enpii-file-upload__dropzone-text">Seret file di sini atau klik untuk memilih</span>
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

        <ul v-if="fileErrors.size" class="enpii-file-upload__errors" role="alert">
            <li
                v-for="[name, msg] of fileErrors"
                :key="name"
                class="enpii-file-upload__error"
            >
                {{ msg }}
            </li>
        </ul>

        <ul v-if="files.length" class="enpii-file-upload__list">
            <li
                v-for="(file, idx) in files"
                :key="`${file.name}-${idx}`"
                class="enpii-file-upload__item"
            >
                <img
                    v-if="isImageFile(file) && thumbnails.get(file)"
                    :src="thumbnails.get(file)"
                    :alt="file.name"
                    class="enpii-file-upload__thumb"
                />
                <span v-else class="material-symbols-outlined enpii-file-upload__file-icon" aria-hidden="true">description</span>

                <span class="enpii-file-upload__meta">
                    <span class="enpii-file-upload__name">{{ file.name }}</span>
                    <span class="enpii-file-upload__size">{{ formatSize(file.size) }}</span>
                </span>

                <button
                    type="button"
                    class="enpii-file-upload__remove"
                    :aria-label="`Hapus ${file.name}`"
                    :disabled="disabled"
                    @click="removeFile(idx)"
                >
                    <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
            </li>
        </ul>
    </div>
</template>

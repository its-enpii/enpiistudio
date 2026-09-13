<script setup>
defineOptions({ inheritAttrs: false });

import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';
import AppIcon from './AppIcon.vue';
import AppTooltip from './AppTooltip.vue';

const model = defineModel({ type: Array, default: () => [] });
const props = defineProps({
    label: { type: String, default: 'Upload File' },
    hint: { type: String, default: null },
    error: { type: String, default: null },
    accept: { type: String, default: null },
    multiple: { type: Boolean, default: true },
    maxFiles: { type: Number, default: 10 },
    maxFileSizeMb: { type: Number, default: 10 },
    autoUpload: { type: Boolean, default: false },
    allowModeSwitch: { type: Boolean, default: true },
    uploadHandler: { type: Function, default: null },
    disabled: { type: Boolean, default: false },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
    },
});

const emit = defineEmits([
    'update:modelValue',
    'file-added',
    'file-success',
    'file-error',
    'queue-complete',
]);

const generatedId = useId();
const inputId = `${generatedId}-input`;
const files = ref([...model.value]);
const uploadMode = ref(props.autoUpload ? 'auto' : 'manual');
const isUploading = ref(false);
const isActive = ref(false);
const stopRequested = ref(false);
const validationError = ref(null);
const inputRef = ref(null);
const activeUpload = ref(null);
const sizeClasses = {
    sm: { area: 'p-4 text-sm', icon: 'text-2xl', thumb: 'size-10', action: 'size-9 text-base' },
    md: { area: 'p-6 text-sm', icon: 'text-4xl', thumb: 'size-14', action: 'size-10 text-lg' },
    lg: { area: 'p-8 text-base', icon: 'text-5xl', thumb: 'size-16', action: 'size-12 text-xl' },
    xl: { area: 'p-10 text-lg', icon: 'text-6xl', thumb: 'size-20', action: 'size-14 text-2xl' },
};
const activeSize = computed(() => sizeClasses[props.size]);

watch(model, (value) => {
    if (files.value === value) return;
    files.value = [...value];
});

const totalSize = computed(() => files.value.reduce((total, item) => total + (item.file?.size || item.size || 0), 0));
const totalSizeFormatted = computed(() => formatSize(totalSize.value));
const queuedFiles = computed(() => files.value.filter((item) => item.status === 'queued' || item.status === 'error'));
const hasCompletedFiles = computed(() => files.value.some((item) => item.status === 'success' || item.status === 'cancelled'));

function emitModel() {
    model.value = [...files.value];
}

function formatSize(size) {
    if (!size) return '0 KB';
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isAcceptedType(file) {
    if (!props.accept) return true;
    const accepted = props.accept.split(',').map((type) => type.trim().toLowerCase()).filter(Boolean);
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return accepted.some((acceptedType) => {
        if (acceptedType.startsWith('.')) return name.endsWith(acceptedType);
        if (acceptedType.endsWith('/*')) return type.startsWith(acceptedType.slice(0, -1));
        return type === acceptedType;
    });
}

function fileIcon(item) {
    const type = item.type?.toLowerCase() || '';
    const name = item.name?.toLowerCase() || '';
    if (type.startsWith('image/')) return 'image';
    if (type === 'application/pdf' || name.endsWith('.pdf')) return 'picture_as_pdf';
    if (['.csv', '.xls', '.xlsx', '.ods'].some((extension) => name.endsWith(extension)) || type.startsWith('text/csv')) return 'table_chart';
    if (['.doc', '.docx', '.odt', '.txt', '.md'].some((extension) => name.endsWith(extension)) || type.startsWith('text/')) return 'description';
    if (type.startsWith('video/')) return 'video_file';
    if (type.startsWith('audio/')) return 'audio_file';
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].some((extension) => name.endsWith(extension))) return 'folder_zip';
    return 'draft';
}

function createItem(file) {
    const isImage = file.type?.startsWith('image/') || false;
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        sizeFormatted: formatSize(file.size),
        type: file.type,
        isImage,
        previewUrl: isImage ? URL.createObjectURL(file) : null,
        status: 'queued',
        progress: 0,
        errorMessage: null,
        result: null,
    };
}

function releasePreview(item) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
}

function addFiles(fileList) {
    if (props.disabled) return;
    const incoming = Array.from(fileList || []);
    const acceptedFiles = [];
    const rejectedFiles = [];

    incoming.forEach((file) => {
        if (!isAcceptedType(file)) {
            rejectedFiles.push(`${file.name}: tipe file tidak didukung`);
        } else if (file.size > props.maxFileSizeMb * 1024 * 1024) {
            rejectedFiles.push(`${file.name}: melebihi ${props.maxFileSizeMb} MB`);
        } else {
            acceptedFiles.push(file);
        }
    });

    const availableSlots = props.multiple
        ? Math.max(props.maxFiles - files.value.length, 0)
        : (files.value.length ? 0 : Math.min(props.maxFiles, 1));
    const filesToQueue = acceptedFiles.slice(0, availableSlots);
    filesToQueue.forEach((file) => {
        const item = createItem(file);
        files.value.push(item);
        emit('file-added', item);
    });

    emitModel();
    if (props.autoUpload || uploadMode.value === 'auto') processQueue();
    const rejectedMessages = [...rejectedFiles];
    if (acceptedFiles.length > availableSlots) {
        rejectedMessages.push(`Maksimal ${props.maxFiles} file dalam antrean`);
    }
    validationError.value = rejectedMessages.length ? rejectedMessages.join(' · ') : null;
}

function onChange(event) {
    addFiles(event.target.files);
    event.target.value = '';
}

function openFilePicker() {
    if (props.disabled) return;
    inputRef.value?.click();
}

function onDrop(event) {
    event.preventDefault();
    isActive.value = false;
    addFiles(event.dataTransfer?.files);
}

function onDragOver(event) {
    event.preventDefault();
    if (!props.disabled) isActive.value = true;
}

function onDragLeave() {
    isActive.value = false;
}

function findNextQueuedItem() {
    return files.value.find((item) => item.status === 'queued' || item.status === 'error');
}

async function processQueue(target = findNextQueuedItem(), continueQueue = true) {
    if (isUploading.value || props.disabled || !target) return;
    isUploading.value = true;
    stopRequested.value = false;
    let item = target;
    emitModel();

    while (item && !stopRequested.value) {
        activeUpload.value = item;
        item.status = 'uploading';
        item.progress = 0;
        item.errorMessage = null;
        emitModel();

        const controller = new AbortController();
        item.controller = controller;

        try {
            const result = await (props.uploadHandler || simulateUpload)(
                item.file,
                {
                    signal: controller.signal,
                    onProgress: (progress) => {
                        item.progress = Math.min(Math.max(Math.round(progress), 0), 100);
                    },
                },
            );
            if (controller.signal.aborted) throw new DOMException('Upload dibatalkan', 'AbortError');
            item.progress = 100;
            item.status = 'success';
            item.result = result ?? null;
            emit('file-success', { file: item, result: item.result });
        } catch (uploadError) {
            if (controller.signal.aborted) {
                item.status = 'cancelled';
            } else {
                item.status = 'error';
                item.errorMessage = uploadError?.message || 'Upload gagal';
                emit('file-error', { file: item, error: uploadError });
            }
        } finally {
            delete item.controller;
            emitModel();
        }
        item = continueQueue && !stopRequested.value ? findNextQueuedItem() : null;
    }

    isUploading.value = false;
    activeUpload.value = null;
    if (!stopRequested.value && files.value.some((item) => item.status === 'success')) {
        emit('queue-complete', files.value.filter((item) => item.status === 'success'));
    }
    stopRequested.value = false;
}

function uploadOne(item) {
    if (isUploading.value || props.disabled || item.status === 'uploading' || item.status === 'success') return;
    item.status = 'queued';
    item.progress = 0;
    item.errorMessage = null;
    emitModel();
    processQueue(item, false);
}

function cancelUpload() {
    stopRequested.value = true;
    activeUpload.value?.controller?.abort();
}

function retryUpload(item) {
    uploadOne(item);
}

function removeItem(item) {
    if (isUploading.value && item.id === activeUpload.value?.id) {
        cancelUpload();
    }
    const index = files.value.findIndex((queuedItem) => queuedItem.id === item.id);
    if (index !== -1) {
        releasePreview(item);
        files.value.splice(index, 1);
        emitModel();
    }
}

function clearCompleted() {
    files.value = files.value.filter((item) => {
        if (item.status === 'success' || item.status === 'cancelled') {
            releasePreview(item);
            return false;
        }
        return true;
    });
    emitModel();
}

function clearAll() {
    if (isUploading.value) cancelUpload();
    files.value.forEach(releasePreview);
    files.value = [];
    emitModel();
}

async function simulateUpload(file, { onProgress, signal }) {
    const duration = 1500;
    const startedAt = Date.now();
    await new Promise((resolve, reject) => {
        const interval = window.setInterval(() => {
            if (signal.aborted) {
                window.clearInterval(interval);
                reject(new DOMException('Upload dibatalkan', 'AbortError'));
                return;
            }
            const progress = Math.min(((Date.now() - startedAt) / duration) * 100, 100);
            onProgress(progress);
            if (progress === 100) {
                window.clearInterval(interval);
                resolve({ simulated: true, name: file.name, size: file.size });
            }
        }, 75);
    });
}

function setUploadMode(mode) {
    uploadMode.value = mode;
    if (mode === 'auto') processQueue();
}

const visibleError = computed(() => props.error || validationError.value);

function statusLabel(item) {
    const labels = {
        queued: 'Menunggu',
        uploading: `${item.progress}%`,
        success: 'Berhasil',
        error: 'Gagal',
        cancelled: 'Dibatalkan',
    };
    return labels[item.status] || item.status;
}

function statusClasses(item) {
    const classes = {
        queued: 'bg-surface-container-high text-on-surface-variant',
        uploading: 'bg-primary-container text-on-primary-container',
        success: 'bg-secondary-container text-on-secondary-container',
        error: 'bg-error-container text-on-error-container',
        cancelled: 'bg-tertiary-fixed text-tertiary',
    };
    return classes[item.status] || classes.queued;
}

onBeforeUnmount(() => {
    cancelUpload();
    files.value.forEach(releasePreview);
});
</script>

<template>
    <div class="space-y-3">
        <div class="flex flex-wrap items-end justify-between gap-2">
            <div>
                <label :for="inputId" class="block text-sm font-bold uppercase tracking-wider text-primary">{{ label }}</label>
                <p v-if="hint" :id="`${generatedId}-hint`" class="text-sm text-on-surface-variant">{{ hint }}</p>
            </div>
            <div v-if="allowModeSwitch" class="flex items-center gap-1 rounded-full bg-surface-container-low p-1">
                <button
                    v-for="mode in ['manual', 'auto']"
                    :key="mode"
                    type="button"
                    class="rounded-full px-3 py-1.5 text-xs font-bold transition"
                    :class="uploadMode === mode ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'"
                    :aria-pressed="uploadMode === mode"
                    @click="setUploadMode(mode)"
                >
                    {{ mode === 'auto' ? 'Auto Upload' : 'Manual Upload' }}
                </button>
            </div>
        </div>

        <div
            role="button"
            tabindex="0"
            class="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-surface-container-lowest text-center transition focus:outline-none focus:ring-2 focus:ring-primary-container/20"
            :class="[
                activeSize.area,
                isActive ? 'border-primary bg-primary-container/10' : 'border-outline-variant',
                disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary hover:bg-surface-container-low',
                visibleError ? 'border-error' : '',
            ]"
            :aria-label="label"
            :aria-disabled="disabled"
            :aria-describedby="[hint && `${generatedId}-hint`, visibleError && `${generatedId}-error`].filter(Boolean).join(' ') || undefined"
            @click="openFilePicker"
            @keydown.enter.prevent="openFilePicker"
            @keydown.space.prevent="openFilePicker"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
        >
            <AppIcon name="cloud_upload" :class="activeSize.icon" class="text-primary" />
            <p class="font-semibold text-primary">Tarik & letakkan file di sini</p>
            <p class="text-on-surface-variant">atau gunakan tombol pilih file di bawah area ini</p>
            <p class="text-xs text-on-surface-variant">
                Maksimal {{ maxFiles }} file · {{ maxFileSizeMb }} MB per file
            </p>
        </div>

        <input
            :id="inputId"
            ref="inputRef"
            type="file"
            class="sr-only"
            :accept="accept"
            :multiple="multiple"
            :disabled="disabled"
            @change="onChange"
        >

        <button
            type="button"
            class="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-bold text-on-primary transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface-container-lowest"
            :disabled="disabled"
            @click="openFilePicker"
        >
            Pilih File
        </button>

        <div v-if="files.length" class="space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container-low px-3 py-2">
                <p class="text-sm font-semibold text-primary">
                    {{ files.length }} file · {{ totalSizeFormatted }}
                </p>
                <div class="flex flex-wrap items-center gap-2">
                    <button
                        v-if="isUploading"
                        type="button"
                        class="inline-flex min-h-10 items-center gap-1 rounded-full bg-error-container px-4 text-sm font-bold text-on-error-container transition hover:brightness-95"
                        @click="cancelUpload"
                    >
                        <AppIcon name="cancel" class="text-lg" />
                        Batal
                    </button>
                    <button
                        v-else-if="uploadMode === 'manual' && queuedFiles.length"
                        type="button"
                        class="inline-flex min-h-10 items-center gap-1 rounded-full bg-primary px-4 text-sm font-bold text-on-primary transition hover:brightness-110"
                        :disabled="disabled"
                        @click="processQueue"
                    >
                        <AppIcon name="upload" class="text-lg" />
                        Upload Semua
                    </button>
                    <button
                        v-if="hasCompletedFiles"
                        type="button"
                        class="inline-flex min-h-10 items-center gap-1 rounded-full bg-surface-container px-4 text-sm font-bold text-on-surface transition hover:brightness-95"
                        @click="clearCompleted"
                    >
                        <AppIcon name="cleaning_services" class="text-lg" />
                        Bersihkan Selesai
                    </button>
                    <button
                        type="button"
                        class="inline-flex min-h-10 items-center gap-1 rounded-full bg-error-container px-4 text-sm font-bold text-on-error-container transition hover:brightness-95"
                        @click="clearAll"
                    >
                        <AppIcon name="delete" class="text-lg" />
                        Hapus Semua
                    </button>
                </div>
            </div>

            <ul class="space-y-2">
                <li
                    v-for="item in files"
                    :key="item.id"
                    class="flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3"
                >
                    <div class="relative shrink-0 overflow-hidden rounded-lg bg-surface-container-low" :class="activeSize.thumb">
                        <img v-if="item.isImage && item.previewUrl" :src="item.previewUrl" :alt="`Pratinjau ${item.name}`" class="size-full object-cover">
                        <div v-else class="flex size-full items-center justify-center text-outline">
                            <AppIcon :name="fileIcon(item)" class="text-2xl" />
                        </div>
                    </div>

                    <div class="min-w-40 flex-1">
                        <p class="truncate text-sm font-bold text-primary" :title="item.name">{{ item.name }}</p>
                        <p class="text-xs text-on-surface-variant">{{ item.sizeFormatted }}</p>
                        <div class="mt-2 h-2 overflow-hidden rounded-full bg-surface-container-high">
                            <div
                                class="h-full rounded-full transition-all duration-150"
                                :class="item.status === 'error' ? 'bg-error' : 'bg-primary'"
                                :style="{ width: item.progress + '%' }"
                            />
                        </div>
                        <p v-if="item.status === 'error' && item.errorMessage" class="mt-1 text-xs text-error">
                            {{ item.errorMessage }}
                        </p>
                    </div>

                    <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold" :class="statusClasses(item)">
                        <AppIcon v-if="item.status === 'success'" name="check" class="text-sm" />
                        <AppIcon v-else-if="item.status === 'error'" name="error" class="text-sm" />
                        <AppIcon v-else-if="item.status === 'uploading'" name="progress_activity" class="animate-spin text-sm" />
                        {{ statusLabel(item) }}
                    </span>

                    <div class="flex items-center gap-1">
                        <AppTooltip text="Upload file ini">
                            <button
                                v-if="['queued', 'cancelled'].includes(item.status) && uploadMode === 'manual' && !isUploading"
                                type="button"
                                class="inline-flex items-center justify-center rounded-full text-outline transition hover:bg-surface-container-low hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20 active:scale-90"
                                :class="activeSize.action"
                                :disabled="disabled"
                                @click="uploadOne(item)"
                            >
                                <AppIcon name="upload" />
                            </button>
                        </AppTooltip>
                        <AppTooltip text="Coba lagi">
                            <button
                                v-if="item.status === 'error' && !isUploading"
                                type="button"
                                class="inline-flex items-center justify-center rounded-full text-outline transition hover:bg-surface-container-low hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary-container/20 active:scale-90"
                                :class="activeSize.action"
                                :disabled="disabled"
                                @click="retryUpload(item)"
                            >
                                <AppIcon name="refresh" />
                            </button>
                        </AppTooltip>
                        <AppTooltip :text="item.status === 'uploading' ? 'Batalkan upload' : 'Hapus file'">
                            <button
                                v-if="item.status !== 'success' || hasCompletedFiles"
                                type="button"
                                class="inline-flex items-center justify-center rounded-full text-outline transition hover:bg-surface-container-low hover:text-error focus:outline-none focus:ring-2 focus:ring-primary-container/20 active:scale-90"
                                :class="activeSize.action"
                                :disabled="disabled && item.status !== 'uploading'"
                                @click="item.status === 'uploading' ? cancelUpload() : removeItem(item)"
                            >
                                <AppIcon :name="item.status === 'uploading' ? 'cancel' : 'close'" />
                            </button>
                        </AppTooltip>
                    </div>
                </li>
            </ul>
        </div>

        <p v-if="visibleError" :id="`${generatedId}-error`" class="ml-1 text-sm text-error">{{ visibleError }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useShape } from '../composables/useShape';
import AppButton from './EnpiiButton.vue';
import AppModal from './EnpiiModal.vue';

const props = defineProps({
    exportUrl: { type: String, required: true },
    importUrl: { type: String, required: true },
    columns: { type: Array, required: true },
    importFile: { type: Function, required: true },
    title: { type: String, default: 'Impor CSV' },
    hint: { type: String, default: 'Unggah file CSV (Excel-compatible). Baris pertama harus header.' },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const open = ref(false);
const fileInput = ref(null);
const file = ref(null);
const error = ref('');
const processing = ref(false);

function exportCsv() {
    window.location.assign(props.exportUrl);
}

function openImport() {
    file.value = null;
    error.value = '';
    open.value = true;
}

function onFileChange(event) {
    const file = event.target.files?.[0] ?? null;
    file.value = selectedFile;
    error.value = '';
}

function submitImport() {
    processing.value = true;
    Promise.resolve(props.importFile(new FormData()))
        .then(() => {
            open.value = false;
            file.value = null;
            if (fileInput.value) fileInput.value.value = '';
        })
        .catch((requestError) => {
            error.value = requestError?.message || 'Impor gagal.';
        })
        .finally(() => {
            processing.value = false;
        });
}
</script>

<template>
    <div class="enpii-csv-import-export" :class="shapeClass">
        <AppButton type="button" variant="secondary" icon="download" size="compact" @click="exportCsv">Export CSV</AppButton>
        <AppButton type="button" variant="secondary" icon="upload" size="compact" @click="openImport">Import CSV</AppButton>
    </div>

    <AppModal v-model="open" :title="title" size="md">
        <p class="enpii-csv-import-export__hint">{{ hint }}</p>
        <div class="enpii-csv-import-export__columns">
            <p class="enpii-csv-import-export__columns-label">Kolom header</p>
            <p class="enpii-csv-import-export__columns-value">{{ columns.join(';') }}</p>
        </div>
        <label class="enpii-csv-import-export__field">
            <span class="enpii-csv-import-export__label">File CSV</span>
            <input
                ref="fileInput"
                type="file"
                accept=".csv,text/csv,application/vnd.ms-excel"
                class="enpii-csv-import-export__input"
                :class="shapeClass"
                @change="onFileChange"
            />
            <p v-if="error" class="enpii-csv-import-export__error">{{ error }}</p>
        </label>
        <template #footer>
            <AppButton variant="secondary" :disabled="processing" @click="open = false">Batal</AppButton>
            <AppButton :loading="processing" :disabled="!file" icon="upload" @click="submitImport">Impor</AppButton>
        </template>
    </AppModal>
</template>

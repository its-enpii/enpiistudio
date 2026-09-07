<script setup>
import { ref } from 'vue';
import { useShape } from '../composables/useShape';
import AppButton from './EnpiiButton.vue';
import AppModal from './EnpiiModal.vue';
import { useT } from '../composables/useT'
import EnpiiLabel from './EnpiiLabel.vue'

const t = useT()

const props = defineProps({
    exportUrl: { type: String, required: true },
    importUrl: { type: String, required: true },
    columns: { type: Array, required: true },
    importFile: { type: Function, required: true },
    title: { type: String, default: undefined },
    hint: { type: String, default: undefined },
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
            error.value = requestError?.message || t('csvImportExport.importFailed');
        })
        .finally(() => {
            processing.value = false;
        });
}
</script>

<template>
    <div class="enpii-csv-import-export flex flex-wrap items-center gap-2" :class="shapeClass">
        <AppButton type="button" variant="secondary" icon="download" size="compact" @click="exportCsv">{{ t('csvImportExport.exportButton') }}</AppButton>
        <AppButton type="button" variant="secondary" icon="upload" size="compact" @click="openImport">{{ t('csvImportExport.importButton') }}</AppButton>
    </div>

    <AppModal v-model="open" :title="title ?? t('csvImportExport.importTitle')" size="md">
        <p class="enpii-csv-import-export__hint mb-4 [color:var(--tone-neutral-fg)] text-sm">{{ hint ?? t('csvImportExport.importHint') }}</p>
        <div class="enpii-csv-import-export__columns mb-4 rounded-control border [border-color:var(--control-border-color)] [border-width:var(--control-border-width)] [background-color:var(--card-bg)] p-4">
            <p class="enpii-csv-import-export__columns-label m-0 [color:var(--tone-neutral-fg)] text-xs font-semibold">{{ t('csvImportExport.columnsLabel') }}</p>
            <p class="enpii-csv-import-export__columns-value mt-2 font-mono [color:var(--card-fg)] text-sm">{{ columns.join(';') }}</p>
        </div>
        <div class="enpii-csv-import-export__field mt-2 block">
            <EnpiiLabel for="enpii-csv-import-export-file" size="sm" class="enpii-csv-import-export__label mb-1 ml-1 block">{{ t('csvImportExport.fileLabel') }}</EnpiiLabel>
            <input
                ref="fileInput"
                type="file"
                accept=".csv,text/csv,application/vnd.ms-excel"
                id="enpii-csv-import-export-file"
                class="enpii-csv-import-export__input w-full rounded-control border [border-color:var(--field-border-color)] [border-width:var(--control-border-width)] [background-color:var(--field-bg)] px-4 py-3 [color:var(--field-fg)] text-sm outline-none focus-visible:focus-visible:[outline-style:solid] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:outline-focus focus-visible:[outline-offset:var(--focus-offset)] file:mr-3 file:rounded-md file:border-0 file:[background-color:var(--tone-primary-bg)] file:px-3 file:py-2 file:font-semibold file:[color:var(--tone-primary-fg)]"
                :class="shapeClass"
                @change="onFileChange"
            />
            <p v-if="error" class="enpii-csv-import-export__error mb-1 ml-1 block [color:var(--field-error-color)] text-sm">{{ error }}</p>
        </div>
        <template #footer>
            <AppButton variant="secondary" :disabled="processing" @click="open = false">{{ t('csvImportExport.cancel') }}</AppButton>
            <AppButton :loading="processing" :disabled="!file" icon="upload" @click="submitImport">{{ t('csvImportExport.import') }}</AppButton>
        </template>
    </AppModal>
</template>

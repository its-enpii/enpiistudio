<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: 'Tulis konten…' },
    disabled: { type: Boolean, default: false },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const emit = defineEmits(['update:modelValue']);

const editor = ref(null);
const isEmpty = ref(true);

const commands = [
    { key: 'bold', label: 'Tebal', command: 'bold', icon: 'M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z' },
    { key: 'italic', label: 'Miring', command: 'italic', icon: 'M10 4h8l-.75 2H14l-4.25 12H12L11.25 20H3l.75-2H6l4.25-12H9.25z' },
    { key: 'underline', label: 'Garis bawah', command: 'underline', icon: 'M7 4v7a5 5 0 0 0 10 0V4h-2v7a3 3 0 0 1-6 0V4zM6 19h12v2H6z' },
    { key: 'strikeThrough', label: 'Dicoret', command: 'strikeThrough', icon: 'M5 11h14v2h-3.28c.49.62.78 1.35.78 2.17 0 2.42-2.18 3.83-5.06 3.83-2.72 0-4.85-1.24-5.44-3.31h2.16c.41 1.03 1.55 1.64 3.28 1.64 1.71 0 2.94-.65 2.94-1.66 0-.87-.77-1.45-2.32-1.67l-1.34-.17C8.05 13.56 6.36 12.51 6.36 11zM8 4.83C8.59 3.24 10.72 2 13.44 2c2.88 0 5.06 1.41 5.06 3.83 0 .82-.29 1.55-.78 2.17H15.5c-.38-.99-1.47-1.58-2.98-1.58-1.73 0-2.87.61-3.28 1.64H7.08c.22-.76.63-1.39 1.21-1.86z' },
];

const listCommands = [
    { key: 'insertUnorderedList', label: 'Daftar', command: 'insertUnorderedList', icon: 'M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zM8 6h12v2H8zm0 5h12v2H8zm0 5h12v2H8z' },
    { key: 'insertOrderedList', label: 'Daftar bernomor', command: 'insertOrderedList', icon: 'M4 5h2v2H5v5H4zm0 8h2v1H5v1h1v1H4zm2-4h12v2H6zm0 5h12v2H6zM4 5h2v2H4z' },
];

const historyCommands = [
    { key: 'undo', label: 'Undo', command: 'undo', icon: 'M12 6V3L7 8l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8z' },
    { key: 'redo', label: 'Redo', command: 'redo', icon: 'M12 6V3l5 5-5 5V9a5 5 0 1 0 5 5h2a7 7 0 1 1-7-8z' },
];

const linkHref = ref('');
const showLinkForm = ref(false);

function syncFromEditor() {
    if (!editor.value) return;
    const html = editor.value.innerHTML.trim();
    const next = html === '<br>' ? '' : editor.value.innerHTML;
    emit('update:modelValue', next);
    updateEmpty();
}

function updateEmpty() {
    isEmpty.value = !editor.value || editor.value.textContent.trim() === '' && !editor.value.querySelector('img,ul,ol,table,a');
}

function focusEditor() {
    if (!props.disabled) editor.value?.focus();
}

function execute(command, value = null) {
    if (props.disabled) return;
    editor.value.focus();
    document.execCommand(command, false, value);
    syncFromEditor();
}

function openLink() {
    if (props.disabled) return;
    const selection = window.getSelection();
    linkHref.value = selection.anchorNode?.parentElement?.closest('a')?.getAttribute('href') || '';
    showLinkForm.value = true;
}

function applyLink() {
    const href = /^https?:\/\//i.test(linkHref.value) || linkHref.value.startsWith('/') || linkHref.value.startsWith('mailto:')
        ? linkHref.value
        : `https://${linkHref.value}`;
    execute(document.queryCommandState('link') ? 'unlink' : 'createLink', href);
    if (document.queryCommandState('link')) execute('createLink', href);
    showLinkForm.value = false;
}

function removeLink() {
    execute('unlink');
    showLinkForm.value = false;
}

watch(() => props.modelValue, (value) => {
    if (!editor.value || value === editor.value.innerHTML) return;
    editor.value.innerHTML = value || '';
    updateEmpty();
});

watch(() => props.disabled, (disabled) => {
    if (editor.value) editor.value.contentEditable = String(!disabled);
});

onMounted(() => {
    editor.value.innerHTML = props.modelValue || '';
    editor.value.contentEditable = String(!props.disabled);
    updateEmpty();
});

onBeforeUnmount(() => {
    editor.value = null;
});
</script>

<template>
    <div class="enpii-rich-editor" :class="[shapeClass, { 'enpii-rich-editor--disabled': disabled }]">
        <div class="enpii-rich-editor__toolbar" role="toolbar" aria-label="Format teks">
            <button v-for="item in commands" :key="item.key" type="button" class="enpii-rich-editor__btn" :title="item.label" :aria-label="item.label" :disabled="disabled" @mousedown.prevent @click="execute(item.command)">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="item.icon" /></svg>
            </button>
            <span class="enpii-rich-editor__sep" />
            <button v-for="item in listCommands" :key="item.key" type="button" class="enpii-rich-editor__btn" :title="item.label" :aria-label="item.label" :disabled="disabled" @mousedown.prevent @click="execute(item.command)">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="item.icon" /></svg>
            </button>
            <button type="button" class="enpii-rich-editor__btn" title="Tautan" aria-label="Tautan" :disabled="disabled" @click="openLink">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10.6 13.4a1 1 0 0 0 1.4 0l4-4a3 3 0 1 0-4.2-4.2l-1.4 1.4 1.4 1.4L13.2 6.6A1 1 0 1 1 14.6 8l-4 4a1 1 0 0 0 0 1.4m2.8-2.8a1 1 0 0 0-1.4 0l-4 4a3 3 0 1 0 4.2 4.2l1.4-1.4-1.4-1.4-1.4 1.4A1 1 0 1 1 9.4 16l4-4a1 1 0 0 0 0-1.4" /></svg>
            </button>
            <span class="enpii-rich-editor__sep" />
            <button v-for="item in historyCommands" :key="item.key" type="button" class="enpii-rich-editor__btn" :title="item.label" :aria-label="item.label" :disabled="disabled" @mousedown.prevent @click="execute(item.command)">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="item.icon" /></svg>
            </button>
        </div>

        <form v-if="showLinkForm" class="enpii-rich-editor__link-form" @submit.prevent="applyLink">
            <input v-model="linkHref" type="url" placeholder="https://contoh.com" required>
            <button type="submit">Simpan</button>
            <button type="button" @click="removeLink">Hapus tautan</button>
            <button type="button" @click="showLinkForm = false">Batal</button>
        </form>

        <div class="enpii-rich-editor__surface" @click="focusEditor">
            <div
                ref="editor"
                class="enpii-rich-editor__content"
                contenteditable="true"
                role="textbox"
                aria-multiline="true"
                :aria-placeholder="placeholder"
                :aria-disabled="disabled || undefined"
                @input="syncFromEditor"
                @blur="syncFromEditor"
                @keydown.meta.z.prevent="execute('redo')"
            />
            <p v-if="isEmpty" class="enpii-rich-editor__placeholder">{{ placeholder }}</p>
        </div>

        <slot name="toolbar" />
    </div>
</template>

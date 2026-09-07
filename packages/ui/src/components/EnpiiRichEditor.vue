<script setup>
import { computed, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { useShape } from '../composables/useShape'
import { useT } from '../composables/useT'

const t = useT()

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    error: { type: String, default: null },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
})

const emit = defineEmits(['update:modelValue'])
const shapeClass = useShape(props)
const editorElement = useEditor(() => ({
    editable: !props.disabled,
    content: props.modelValue || '',
    extensions: [StarterKit.configure()],
    onUpdate: syncFromEditor,
}))

const editor = computed(() => editorElement.value)

const commands = [
    { key: 'bold', label: t('richEditor.bold'), command: 'toggleBold', icon: 'M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z' },
    { key: 'italic', label: t('richEditor.italic'), command: 'toggleItalic', icon: 'M10 4h8l-.75 2H14l-4.25 12H12L11.25 20H3l.75-2H6l4.25-12H9.25z' },
    { key: 'underline', label: t('richEditor.underline'), command: 'toggleUnderline', icon: 'M7 4v7a5 5 0 0 0 10 0V4h-2v7a3 3 0 0 1-6 0V4zM6 19h12v2H6z' },
    { key: 'strike', label: t('richEditor.strike'), command: 'toggleStrike', icon: 'M5 11h14v2h-3.28c.49.62.78 1.35.78 2.17 0 2.42-2.18 3.83-5.06 3.83-2.72 0-4.85-1.24-5.44-3.31h2.16c.41 1.03 1.55 1.64 3.28 1.64 1.71 0 2.94-.65 2.94-1.66 0-.87-.77-1.45-2.32-1.67l-1.34-.17C8.05 13.56 6.36 12.51 6.36 11zM8 4.83C8.59 3.24 10.72 2 13.44 2c2.88 0 5.06 1.41 5.06 3.83 0 .82-.29 1.55-.78 2.17H15.5c-.38-.99-1.47-1.58-2.98-1.58-1.73 0-2.87.61-3.28 1.64H7.08c.22-.76.63-1.39 1.21-1.86z' },
]

const listCommands = [
    { key: 'bulletList', label: 'Daftar', command: 'toggleBulletList', icon: 'M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zM8 6h12v2H8zm0 5h12v2H8zm0 5h12v2H8z' },
    { key: 'orderedList', label: t('richEditor.orderedList'), command: 'toggleOrderedList', icon: 'M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zM8 6h12v2H8zm0 5h12v2H8zm0 5h12v2H8z' },
]

const historyCommands = [
    { key: 'undo', label: 'Undo', command: 'undo', icon: 'M12 6V3L7 8l5 5V9a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8z' },
    { key: 'redo', label: 'Redo', command: 'redo', icon: 'M12 6V3l5 5-5 5V9a5 5 0 1 0 5 5h2a7 7 0 1 1-7-8z' },
]

function syncFromEditor() {
    if (!editor.value) return
    emit('update:modelValue', editor.value.isEmpty ? '' : editor.value.getHTML())
}

function execute(command) {
    if (props.disabled || !editor.value) return
    const chain = editor.value.chain().focus()
    chain[command]?.().run()
}

function focusEditor() {
    if (!props.disabled) editor.value?.commands.focus()
}

watch(() => props.modelValue, (value) => {
    if (!editor.value || value === editor.value.getHTML()) return
    editor.value.commands.setContent(value || '', false)
})

watch(() => props.disabled, (disabled) => {
    editor.value?.setEditable(!disabled)
})
</script>

<template>
    <div class="enpii-rich-editor overflow-hidden border border-solid [border-color:var(--editor-toolbar-border)] [border-width:var(--control-border-width)] rounded-control [background-color:var(--editor-content-bg)] focus-within:[border-color:var(--control-primary-border)] focus-within:[box-shadow:var(--shadow-focus)]" :class="[shapeClass, { 'enpii-rich-editor--disabled opacity-65': disabled }]">
        <div class="enpii-rich-editor__toolbar flex flex-wrap items-center gap-1 p-1 border-b border-solid [border-color:var(--editor-toolbar-border)] [border-bottom-width:var(--control-border-width)] [background-color:var(--editor-toolbar-bg)]" role="toolbar" :aria-label="t('richEditor.toolbarLabel')">
            <button v-for="item in commands" :key="item.key" type="button" class="enpii-rich-editor__btn enpii-rich-editor__btn--ghost-sm grid place-items-center w-8 h-8 border border-transparent rounded-lg bg-transparent [color:var(--label-fg)] cursor-pointer [transition-property:background,color,border-color,transform] duration-fast ease-emphasized motion-reduce:transition-none hover:enabled:[background-color:var(--picker-cell-hover-bg)] hover:enabled:[color:var(--editor-content-fg)] active:enabled:[transform:scale(.96)] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-offset:var(--focus-offset)] focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:w-[1.125rem] [&_svg]:h-[1.125rem]" :title="item.label" :aria-label="item.label" :disabled="disabled" @mousedown.prevent @click="execute(item.command)">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="item.icon" /></svg>
            </button>
            <span class="enpii-rich-editor__sep w-px h-5 mx-1 [background-color:var(--editor-toolbar-border)]" />
            <button v-for="item in listCommands" :key="item.key" type="button" class="enpii-rich-editor__btn enpii-rich-editor__btn--ghost-sm grid place-items-center w-8 h-8 border border-transparent rounded-lg bg-transparent [color:var(--label-fg)] cursor-pointer [transition-property:background,color,border-color,transform] duration-fast ease-emphasized motion-reduce:transition-none hover:enabled:[background-color:var(--picker-cell-hover-bg)] hover:enabled:[color:var(--editor-content-fg)] active:enabled:[transform:scale(.96)] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-offset:var(--focus-offset)] focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:w-[1.125rem] [&_svg]:h-[1.125rem]" :title="item.label" :aria-label="item.label" :disabled="disabled" @mousedown.prevent @click="execute(item.command)">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="item.icon" /></svg>
            </button>
            <span class="enpii-rich-editor__sep w-px h-5 mx-1 [background-color:var(--editor-toolbar-border)]" />
            <button v-for="item in historyCommands" :key="item.key" type="button" class="enpii-rich-editor__btn enpii-rich-editor__btn--ghost-sm grid place-items-center w-8 h-8 border border-transparent rounded-lg bg-transparent [color:var(--label-fg)] cursor-pointer [transition-property:background,color,border-color,transform] duration-fast ease-emphasized motion-reduce:transition-none hover:enabled:[background-color:var(--picker-cell-hover-bg)] hover:enabled:[color:var(--editor-content-fg)] active:enabled:[transform:scale(.96)] focus-visible:[outline-style:var(--tw-outline-style)] focus-visible:[outline-width:var(--focus-width-overlay)] focus-visible:[outline-offset:var(--focus-offset)] focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:w-[1.125rem] [&_svg]:h-[1.125rem]" :title="item.label" :aria-label="item.label" :disabled="disabled" @mousedown.prevent @click="execute(item.command)">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path :d="item.icon" /></svg>
            </button>
        </div>

        <div class="enpii-rich-editor__surface relative cursor-text" :class="{ 'cursor-not-allowed': disabled }" @click="focusEditor">
            <EditorContent :editor="editor" class="enpii-rich-editor__content-wrapper min-h-36 p-4 [color:var(--editor-content-fg)] text-sm leading-[1.6] outline-none [&_.ProseMirror]:outline-none [&_h1]:m-0 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:leading-[1.5] [&_h2]:m-0 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:leading-[1.5] [&_h3]:m-0 [&_h3]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:leading-[1.5] [&_h4]:m-0 [&_h4]:mb-3 [&_h4]:text-[0.9375rem] [&_h4]:font-semibold [&_h4]:leading-[1.5] [&_h5]:m-0 [&_h5]:mb-3 [&_h5]:text-[0.9375rem] [&_h5]:font-semibold [&_h5]:leading-[1.5] [&_h6]:m-0 [&_h6]:mb-3 [&_h6]:text-[0.9375rem] [&_h6]:font-semibold [&_h6]:leading-[1.5] [&_p]:m-0 [&_p]:mb-3 [&_p]:font-normal [&_p]:text-control [&_p]:leading-[1.5] [&_ul]:m-2 [&_ul]:mb-3 [&_ul]:pl-6 [&_ol]:m-2 [&_ol]:mb-3 [&_ol]:pl-6 [&_blockquote]:pl-4 [&_blockquote]:border-l-[3px] [&_blockquote]:[border-color:var(--editor-toolbar-border)] [&_blockquote]:font-normal [&_blockquote]:not-italic [&_hr]:h-px [&_hr]:my-4 [&_hr]:border-0 [&_hr]:[background-color:var(--editor-toolbar-border)] [&_pre]:overflow-x-auto [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:[background-color:var(--editor-toolbar-bg)] [&_code]:font-mono [&_code]:font-normal [&_code]:whitespace-pre-wrap [&_a]:underline [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:absolute [&_.is-editor-empty:first-child]:before:top-4 [&_.is-editor-empty:first-child]:before:left-4 [&_.is-editor-empty:first-child]:before:[color:var(--field-placeholder-fg)] [&_.is-editor-empty:first-child]:before:opacity-75" />
        </div>
        <slot name="toolbar" />
    </div>
</template>

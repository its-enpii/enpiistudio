<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { parseMarkdownTree } from '../composables/useMarkdown';
import ArtifactCard from './EnpiiAssistantArtifactCard.vue';
import ArtifactModal from './EnpiiAssistantArtifactModal.vue';
import ActionButton from './EnpiiAssistantActionButton.vue';
import PollCard from './EnpiiAssistantPollCard.vue';
import { useT } from '../composables/useT'

const t = useT()

const FALLBACK_NAME = 'Ariel';

// Global singleton survives module reloads (Vite HMR + Inertia page swaps).
// Vite dev mode may re-evaluate this module on every navigation, so module-level
// `reactive()` would reset. Stashing in `window` keeps the same instance.
if (!window.__assistantState__) {
    window.__assistantState__ = reactive({
        open: false,
        loading: false,
        sending: false,
        typing: false,
        typingLabel: t('assistant.typing'),
        error: null,
        input: '',
        messages: [],
        pendingConfirmation: null,
        persona: null,
        conversationId: null,
        msgSeq: 0,
    });
} else {
    // Migration: drop legacy session-token fields if a stale shape exists
    // from previous orchestrator-microservice versions of this widget.
    delete window.__assistantState__.sessionToken;
    delete window.__assistantState__.endpoint;
    delete window.__assistantState__.expiresAt;
}
const shared = window.__assistantState__;

const rootEl = ref(null);
const listEl = ref(null);
const inputEl = ref(null);
const fileInputEl = ref(null);
const attachedImages = ref([]);

const open = ref(shared.open);
const loading = ref(shared.loading);
const sending = ref(shared.sending);
const typing = ref(shared.typing);
const typingLabel = ref(shared.typingLabel);
const error = ref(shared.error);
const input = ref(shared.input);
const messages = ref(shared.messages);
const pendingConfirmation = ref(shared.pendingConfirmation);
const persona = ref(shared.persona);

// Watch wrapper so all `xxx.value = ...` calls round-trip into shared module state,
// otherwise Inertia layout remounts would lose chat history.
watch(open, (v) => (shared.open = v));
watch(loading, (v) => (shared.loading = v));
watch(sending, (v) => (shared.sending = v));
watch(typing, (v) => (shared.typing = v));
watch(typingLabel, (v) => (shared.typingLabel = v));
watch(error, (v) => (shared.error = v));
watch(input, (v) => (shared.input = v));
watch(messages, (v) => (shared.messages = v), { deep: true });
watch(pendingConfirmation, (v) => (shared.pendingConfirmation = v), { deep: true });
watch(persona, (v) => (shared.persona = v), { deep: true });

let conversationId = shared.conversationId || null;
let msgSeq = shared.msgSeq;

watch(() => shared.conversationId, (v) => (conversationId = v));

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

function displayName() {
    return persona.value?.name || FALLBACK_NAME;
}

function pushMessage(msg) {
    messages.value.push({ id: ++msgSeq, ...msg });
    shared.msgSeq = msgSeq;
    scrollBottom();
    return messages.value[messages.value.length - 1];
}

function onDocumentPointerDown(event) {
    if (!open.value || !rootEl.value) return;
    const target = event.target;
    if (target instanceof Node && rootEl.value.contains(target)) return;
    open.value = false;
}

document.addEventListener('pointerdown', onDocumentPointerDown, true);
onMounted(() => {
    ensureSession();
    window.addEventListener('assistant:toggle', toggle);
});

function pickGreeting() {
    const name = displayName();
    const hour = new Date().getHours();
    const salam = hour < 11 ? t('assistant.greetingMorning') : hour < 15 ? t('assistant.greetingSiang') : hour < 18 ? t('assistant.greetingSore') : t('assistant.greetingNight');
    const pool = [
        t('assistant.greetingHelp', { greeting: salam, name }),
        t('assistant.greetingReady', { name }),
        t('assistant.greetingTransaction', { name }),
        t('assistant.greetingSearch', { name }),
        t('assistant.greetingCheckData', { greeting: salam, name }),
    ];
    return pool[Math.floor(Math.random() * pool.length)];
}

// In-process mode: backend resolves tenant + user from the authenticated
// session. No separate session token dance.
let personaPromise = null;

function ensureSession() {
    if (persona.value?.name) return Promise.resolve();
    if (!personaPromise) {
        personaPromise = fetch('/assistant/persona', {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data?.persona) {
                    persona.value = {
                        id: data.persona.id || null,
                        slug: data.persona.slug || null,
                        name: data.persona.name || FALLBACK_NAME,
                    };
                }
            })
            .catch(() => {})
            .finally(() => {
                personaPromise = null;
            });
    }
    return personaPromise;
}

async function scrollBottom() {
    await nextTick();
    if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight;
}

function resizeInput() {
    const el = inputEl.value;
    if (!el) return;
    el.style.height = 'auto';
    const max = 7.5 * 16; // ~7.5rem ≈ 5 lines
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
}

async function afterInputChange() {
    await nextTick();
    resizeInput();
}

function parseSseChunk(buffer, onEvent) {
    const parts = buffer.split('\n\n');
    const rest = parts.pop() ?? '';
    for (const assistantBlock of parts) {
        let event = 'message';
        const dataLines = [];
        for (const line of assistantBlock.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim();
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
        }
        if (!dataLines.length) continue;
        let data = dataLines.join('\n');
        try {
            data = JSON.parse(data);
        } catch {
            // keep raw string
        }
        onEvent(event, data);
    }
    return rest;
}

async function readSse(response, onEvent) {
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error(t('assistant.streamUnavailable'));
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseChunk(buffer, onEvent);
    }
    if (buffer.trim()) parseSseChunk(buffer + '\n\n', onEvent);
}

function handleEvent(event, data, assistantMsg) {
    if (event === 'conversation' && data?.id) {
        conversationId = data.id;
        shared.conversationId = conversationId;
        return;
    }
    if (event === 'text') {
        const delta = typeof data === 'string' ? data : (data?.delta ?? '');
        if (delta) {
            // Push bubble only on the first non-empty delta so it never
            // appears blank, then immediately hide the typing chip in the
            // same reactive batch — Vue commits one render, no flicker.
            if (!assistantMsg._pushed) {
                assistantMsg._pushed = true;
                assistantMsg.content = delta;
                typing.value = false;
                assistantMsg._ref = pushMessage({
                    role: 'assistant',
                    content: assistantMsg.content,
                });
            } else {
                assistantMsg.content += delta;
                if (assistantMsg._ref) assistantMsg._ref.content = assistantMsg.content;
            }
            scrollBottom();
        }
        return;
    }
    // Tools stay internal — only status on typing chip (not chat bubbles).
    if (event === 'tool_use') {
        typing.value = true;
        typingLabel.value = t('assistant.searchingData');
        scrollBottom();
        return;
    }
    if (event === 'tool_result') {
        typing.value = true;
        typingLabel.value = data?.ok === false ? t('assistant.dataIncomplete') : t('assistant.composingAnswer');
        scrollBottom();
        return;
    }
    if (event === 'confirmation_required') {
        typing.value = false;
        pendingConfirmation.value = {
            execution_id: data?.execution_id,
            summary: data?.summary || t('assistant.confirmAction'),
            plan: data?.plan || null,
            warnings: data?.warnings || [],
            options: data?.options || [],
            proposed_params: data?.proposed_params || {},
        };
        pushMessage({
            role: 'system',
            content: data?.summary || t('assistant.actionNeedsConfirm'),
        });
        return;
    }
    if (event === 'error') {
        typing.value = false;
        const msg = data?.message || t('assistant.errorAssistant');
        error.value = msg;
        pushMessage({ role: 'error', content: msg });
        return;
    }
    if (event === 'result') {
        if (data?.conversation_id) {
            conversationId = data.conversation_id;
            shared.conversationId = conversationId;
        }
        // Keep typing until text arrived; clear if run ended without text
        if (data?.status && data.status !== 'needs_confirmation' && !assistantMsg.content) {
            typing.value = false;
        }
    }
}

function triggerAttach() {
    fileInputEl.value?.click();
}

function processFiles(files) {
    const validImages = Array.from(files).filter((f) => f.type.startsWith('image/'));
    for (const file of validImages) {
        if (file.size > 10 * 1024 * 1024) {
            error.value = t('assistant.maxImageSize');
            continue;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            attachedImages.value.push({
                dataUrl: e.target.result,
                name: file.name,
                type: file.type,
                size: file.size,
            });
            nextTick(scrollBottom);
        };
        reader.readAsDataURL(file);
    }
}

function onFilesSelected(event) {
    const files = event.target.files;
    if (files && files.length) {
        processFiles(files);
    }
    event.target.value = '';
}

function onPaste(event) {
    const items = Array.from(event.clipboardData?.items || []);
    const imageFiles = items
        .filter((it) => it.type.startsWith('image/'))
        .map((it) => it.getAsFile())
        .filter(Boolean);
    if (imageFiles.length) {
        processFiles(imageFiles);
    }
}

function removeAttachedImage(index) {
    attachedImages.value.splice(index, 1);
}

async function sendMessage() {
    const content = input.value.trim();
    if (!content && !attachedImages.value.length) return;
    const attachments = attachedImages.value.map((img) => ({
        type: 'image',
        url: img.dataUrl,
        name: img.name,
        mime: img.type,
    }));
    input.value = '';
    attachedImages.value = [];
    nextTick(resizeInput);
    await sendContent(content, attachments);
}

// --- Interactive component blocks (artifact / button / poll) ---

// Track submitted components per (msgId, blockId) so we can disable + show checkmark.
//   key: `${msgId}__${blockId}` → value: the user's selected text (or '__skip__' / '__other__')
const submittedComponents = reactive(new Map());

function blockKey(msg, assistantBlock) {
    return `${msg?.id ?? '_'}__${assistantBlock.id}`;
}

function onComponentSubmit(msg, assistantBlock, payload) {
    const key = blockKey(msg, assistantBlock);
    if (submittedComponents.has(key)) return;
    submittedComponents.set(key, payload);

    let text;
    if (payload === '__skip__') text = '(lewati)';
    else if (payload === '__other__') text = assistantBlock.value || '';
    else text = String(payload);

    // Show user message bubble first; then trigger the SSE flow.
// sendContent handles pushMessage
    nextTick(scrollBottom);
    sendContent(text);
}

// Artifact modal state (only one artifact open at a time).
const activeArtifact = ref(null);
function openArtifact(assistantBlock) {
    activeArtifact.value = assistantBlock;
}
function closeArtifact() {
    activeArtifact.value = null;
}

// Markdown tree per message. Parsed each call — cheap for chat-sized text,
// and avoids stale-cache issues when content streams incrementally under the
// same proxy identity.
function blocksFor(msg) {
    if (!msg || !msg.content) return [];
    return parseMarkdownTree(msg.content);
}

async function sendContent(content, attachments = []) {
    if ((!content && !attachments.length) || sending.value) return;
    error.value = null;
    pendingConfirmation.value = null;
    pushMessage({
        role: 'user',
        content: content || '(Lampiran Gambar)',
        attachments: attachments.length ? [...attachments] : undefined,
    });
    const assistantMsg = { role: 'assistant', content: '', _pushed: false };
    sending.value = true;
    typing.value = true;
    typingLabel.value = t('assistant.typing');
    scrollBottom();
    try {
        await ensureSession();
        const payload = {
            conversation_id: conversationId,
            message: content || t('assistant.imageAttachment'),
        };
        if (attachments && attachments.length) {
            payload.attachments = attachments;
        }
        const res = await fetch('/assistant/chat', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'text/event-stream',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
            body: JSON.stringify(payload),
        });
        await readSse(res, (event, data) => handleEvent(event, data, assistantMsg));
        if (!assistantMsg._pushed && !assistantMsg.content) {
            pushMessage({
                role: 'assistant',
                content: t('assistant.failedMessage'),
            });
        }
    } catch (e) {
        error.value = e?.message || t('assistant.failedSend');
        pushMessage({ role: 'error', content: error.value });
    } finally {
        typing.value = false;
        typingLabel.value = t('assistant.typing');
        sending.value = false;
        scrollBottom();
    }
}

async function decideConfirmation(decision) {
    const conf = pendingConfirmation.value;
    if (!conf?.execution_id || sending.value) return;
    sending.value = true;
    typing.value = true;
    typingLabel.value = decision === 'approve' ? t('assistant.executingAction') : t('assistant.cancellingAction');
    error.value = null;
    const assistantMsg = { role: 'assistant', content: '', _pushed: false };
    scrollBottom();
    try {
        await ensureSession();
        const res = await fetch(`/assistant/confirmations/${conf.execution_id}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'text/event-stream',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
            body: JSON.stringify({ decision }),
        });
        pendingConfirmation.value = null;
        await readSse(res, (event, data) => handleEvent(event, data, assistantMsg));
        if (!assistantMsg._pushed) {
            pushMessage({
                role: 'assistant',
                content: decision === 'approve' ? t('assistant.actionExecuted') : t('assistant.actionCancelled'),
            });
        }
    } catch (e) {
        error.value = e?.message || t('assistant.failedConfirm');
        pushMessage({ role: 'error', content: error.value });
    } finally {
        typing.value = false;
        typingLabel.value = t('assistant.typing');
        sending.value = false;
        scrollBottom();
    }
}

function toggle() {
    open.value = !open.value;
    if (open.value) {
        if (!messages.value.length) {
            pushMessage({ role: 'assistant', content: pickGreeting() });
        }
        ensureSession();
        nextTick(scrollBottom);
    }
}

function onKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        nextTick(resizeInput);
    }
}

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPointerDown, true);
    window.removeEventListener('assistant:toggle', toggle);
});
</script>

<template>
    <div ref="rootEl" class="enpii-assistant-widget fixed bottom-4 right-4 z-modal flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        <Transition name="assistant-panel">
            <div
                v-if="open"
                class="enpii-assistant-widget__panel flex h-[min(36rem,75vh)] w-[min(24rem,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-overlay"
                role="dialog"
                :aria-label="displayName()"
            >
                <div class="enpii-assistant-widget__header flex shrink-0 items-center justify-between gap-2 border-b border-outline-variant bg-primary px-4 py-3 text-on-primary">
                    <div class="enpii-assistant-widget__identity flex min-w-0 items-center gap-2">
                        <AppIcon name="smart_toy" class="enpii-assistant-widget__logo h-5 w-5 shrink-0 text-xl" />
                        <div class="enpii-assistant-widget__identity-text min-w-0">
                            <span class="enpii-assistant-widget__name block truncate text-sm font-semibold">{{ displayName() }}</span>
                            <span v-if="persona?.slug" class="enpii-assistant-widget__persona block truncate text-on-primary/70 text-[.625rem] font-medium">{{ persona.slug }}</span>
                        </div>
                    </div>
                    <button type="button" class="enpii-assistant-widget__close grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-none transition-colors duration-fast ease-emphasized hover:bg-white/10" :aria-label="t('assistant.close')" @click="open = false">
                        <AppIcon name="close" />
                    </button>
                </div>

                <p v-if="loading && !messages.length" class="enpii-assistant-widget__status p-4 text-on-surface-variant text-sm">Menghubungkan…</p>
                <p v-else-if="error && !messages.length" class="enpii-assistant-widget__status p-4 text-danger-text text-sm">{{ error }}</p>

                <div ref="listEl" class="enpii-assistant-widget__messages flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface p-4">
                    <TransitionGroup name="assistant-msg" tag="div" class="enpii-assistant-widget__message-list flex flex-col gap-3">
                        <div
                            v-for="msg in messages"
                            :key="msg.id"
                            class="enpii-assistant-widget__bubble max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                            :class="{
                                'self-end rounded-br-sm bg-primary text-on-primary whitespace-pre-wrap': msg.role === 'user',
                                'self-start rounded-bl-sm border border-outline-variant bg-surface-container-lowest text-on-surface': msg.role === 'assistant' || msg.role === 'system',
                                'self-start rounded-bl-sm bg-error-container text-on-error-container whitespace-pre-wrap': msg.role === 'error',
                                'self-start rounded-bl-sm border border-dashed border-outline-variant bg-surface-container-low text-on-surface-variant text-xs': msg.role === 'tool',
                            }"
                        >
                            <template v-if="msg.role === 'tool'">
                                <span class="enpii-assistant-widget__tool-name font-semibold"><strong>{{ msg.kind === 'use' ? 'Tool' : 'Hasil' }}:</strong> {{ msg.name }}</span>
                                <span v-if="msg.ok === false" class="enpii-assistant-widget__tool-error text-danger-text"> (gagal)</span>
                            </template>
                            <template v-else-if="msg.role === 'user' || msg.role === 'error'">
                                <div v-if="msg.attachments && msg.attachments.length" class="enpii-assistant-widget__attachments mb-2 flex flex-wrap gap-1">
                                    <img
                                        v-for="(att, i) in msg.attachments"
                                        :key="i"
                                        :src="att.url"
                                        :alt="att.name || t('assistant.imageAlt')"
                                        class="enpii-assistant-widget__attachment max-h-36 max-w-full rounded-control border border-white/20 object-cover shadow-control"
                                    />
                                </div>
                                <span v-if="msg.content && msg.content !== '(Lampiran Gambar)'">{{ msg.content }}</span>
                            </template>
                            <div v-else class="enpii-assistant-widget__blocks flex flex-col gap-2">
                                <template v-for="assistantBlock in blocksFor(msg)" :key="assistantBlock.id">
                                    <h1 v-if="assistantBlock.type === 'heading' && assistantBlock.level === 1" class="enpii-assistant-widget__heading my-1 text-base font-semibold">{{ assistantBlock.text }}</h1>
                                    <h2 v-else-if="assistantBlock.type === 'heading' && assistantBlock.level === 2" class="enpii-assistant-widget__heading my-1 text-sm font-semibold">{{ assistantBlock.text }}</h2>
                                    <h3 v-else-if="assistantBlock.type === 'heading' && assistantBlock.level === 3" class="enpii-assistant-widget__heading my-1 text-sm font-semibold">{{ assistantBlock.text }}</h3>
                                    <!-- eslint-disable-next-line vue/no-v-html -->
                                    <div
                                        v-else-if="assistantBlock.type === 'paragraph' || assistantBlock.type === 'code'"
                                        class="enpii-assistant-widget__markdown text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-[.2em] [&_code]:rounded-md [&_code]:bg-neutral-soft/70 [&_code]:font-mono [&_code]:text-[.8125em] [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-neutral-soft/70 [&_pre]:p-2"
                                        v-html="assistantBlock.html"
                                    />
                                    <ArtifactCard
                                        v-else-if="assistantBlock.type === 'artifact'"
                                        :assistantBlock="assistantBlock"
                                        @open="openArtifact"
                                    />
                                    <ActionButton
                                        v-else-if="assistantBlock.type === 'button'"
                                        :assistantBlock="assistantBlock"
                                        @submit="(payload) => onComponentSubmit(msg, assistantBlock, payload)"
                                    />
                                    <PollCard
                                        v-else-if="assistantBlock.type === 'poll'"
                                        :assistantBlock="assistantBlock"
                                        :submitted="submittedComponents.get(`${msg.id}__${assistantBlock.id}`) ?? null"
                                        @submit="(payload) => onComponentSubmit(msg, assistantBlock, payload)"
                                    />
                                </template>
                            </div>
                        </div>
                    </TransitionGroup>

                    <div
                        v-if="typing"
                        class="enpii-assistant-widget__typing flex max-w-[85%] items-center gap-2 self-start rounded-2xl rounded-bl-sm border border-outline-variant bg-surface-container-lowest px-3 py-2"
                        :aria-label="typingLabel"
                    >
                        <span class="enpii-assistant-widget__typing-dots flex items-center gap-1">
                            <span class="enpii-assistant-widget__typing-dot h-2 w-2 rounded-full bg-outline motion-safe:animate-[assistant-pulse_1.2s_infinite]" />
                            <span class="enpii-assistant-widget__typing-dot h-2 w-2 rounded-full bg-outline motion-safe:animate-[assistant-pulse_1.2s_infinite] motion-safe:[animation-delay:.15s]" />
                            <span class="enpii-assistant-widget__typing-dot h-2 w-2 rounded-full bg-outline motion-safe:animate-[assistant-pulse_1.2s_infinite] motion-safe:[animation-delay:.3s]" />
                        </span>
                        <span class="enpii-assistant-widget__typing-label text-on-surface-variant text-xs">{{ typingLabel }}</span>
                    </div>

                    <div
                        v-if="pendingConfirmation"
                        class="enpii-assistant-widget__confirmation self-stretch rounded-control border border-outline-variant bg-surface-container-lowest p-3 text-sm"
                    >
                        <p class="enpii-assistant-widget__confirmation-title m-0 text-primary-text font-semibold">{{ pendingConfirmation.summary }}</p>
                        <ul v-if="pendingConfirmation.warnings?.length" class="enpii-assistant-widget__warnings mt-2 list-disc pl-4 text-on-surface-variant">
                            <li v-for="(w, i) in pendingConfirmation.warnings" :key="i">{{ w }}</li>
                        </ul>
                        <div class="enpii-assistant-widget__confirm-actions mt-3 flex gap-2">
                            <button
                                type="button"
                                class="enpii-assistant-widget__confirm-button cursor-pointer rounded-md border-0 bg-primary px-3 py-1 text-on-primary text-xs font-semibold hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                                :disabled="sending"
                                @click="decideConfirmation('approve')"
                            >Setuju</button>
                            <button
                                type="button"
                                class="enpii-assistant-widget__reject-button cursor-pointer rounded-md border border-outline-variant bg-none px-3 py-1 text-on-surface text-xs font-semibold hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                                :disabled="sending"
                                @click="decideConfirmation('reject')"
                            >Tolak</button>
                        </div>
                    </div>
                </div>

                <div class="enpii-assistant-widget__composer-wrap border-t border-outline-variant bg-surface-container-lowest">
                    <!-- Attached Images Preview -->
                    <div v-if="attachedImages.length" class="enpii-assistant-widget__attachments-bar flex flex-wrap gap-2 border-b border-outline-variant/50 px-3 pb-2 pt-2">
                        <div
                            v-for="(img, idx) in attachedImages"
                            :key="idx"
                            class="enpii-assistant-widget__thumbnail group relative h-14 w-14 shrink-0 overflow-hidden rounded-control border border-outline-variant bg-surface-container"
                        >
                            <img :src="img.dataUrl" class="enpii-assistant-widget__thumbnail-image h-full w-full object-cover" :alt="img.name" />
                            <button
                                type="button"
                                class="enpii-assistant-widget__thumbnail-remove absolute inset-0 grid cursor-pointer place-items-center border-0 bg-black/60 text-surface-inverse opacity-0 transition-opacity duration-fast ease-emphasized group-hover:opacity-100 focus-visible:opacity-100"
                                :aria-label="t('assistant.removeImage')"
                                @click="removeAttachedImage(idx)"
                            >
                                <AppIcon name="close" class="enpii-assistant-widget__thumbnail-icon h-4 w-4 text-base" />
                            </button>
                        </div>
                    </div>

                    <div class="enpii-assistant-widget__composer flex gap-2 p-3">
                        <input
                            ref="fileInputEl"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            multiple
                            class="enpii-sr-only"
                            @change="onFilesSelected"
                        />
                        <button
                            type="button"
                            class="enpii-assistant-widget__composer-button grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-control border border-outline-variant bg-none text-on-surface-variant transition-all duration-fast ease-emphasized hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary)_30%,transparent)] disabled:cursor-not-allowed"
                            :disabled="sending || loading"
                            :aria-label="t('assistant.attachImage')"
                            :title="t('assistant.attachImage')"
                            @click="triggerAttach"
                        >
                            <AppIcon name="add_photo_alternate" class="h-5 w-5 text-xl" />
                        </button>
                        <textarea
                            ref="inputEl"
                            v-model="input"
                            rows="2"
                            class="enpii-assistant-widget__input max-h-12 min-h-11 flex-1 rounded-control border border-outline-variant bg-surface px-3 py-2 text-on-surface text-sm leading-tight resize-none focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary)_20%,transparent)]"
                            :placeholder="t('assistant.inputPlaceholder', { name: displayName() })"
                            :disabled="sending || loading"
                            @input="afterInputChange"
                            @keydown="onKeydown"
                            @paste="onPaste"
                        />
                        <button
                            type="button"
                            class="enpii-assistant-widget__composer-button grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-control border border-transparent bg-primary text-on-primary transition-all duration-fast ease-emphasized hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--enpii-color-primary)_30%,transparent)] disabled:cursor-not-allowed"
                            :disabled="sending || loading || (!input.trim() && !attachedImages.length)"
                            :aria-label="t('assistant.send')"
                            @click="sendMessage"
                        >
                            <AppIcon name="send" class="h-5 w-5 text-xl" />
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <ArtifactModal :assistantBlock="activeArtifact" @close="closeArtifact" />

        <button
            type="button"
            class="enpii-assistant-widget__toggle grid h-14 w-14 cursor-pointer place-items-center rounded-full border-0 bg-primary text-on-primary shadow-lg transition-all duration-base ease-emphasized hover:scale-105 hover:bg-primary-hover focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--enpii-color-focus)_60%,transparent),var(--enpii-shadow-lg)]"
            :aria-expanded="open"
            :aria-label="t('assistant.openToggle', { name: displayName() })"
            @click="toggle"
        >
            <AppIcon class="enpii-assistant-widget__toggle-icon h-6 w-6 text-2xl transition-transform duration-base ease-emphasized [.enpii-assistant-widget__panel+&]:scale-100"
                     :name="open ? 'close' : 'smart_toy'" />
        </button>
    </div>
</template>

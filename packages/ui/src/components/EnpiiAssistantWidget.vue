<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import { parseMarkdownTree } from '../composables/useMarkdown';
import ArtifactCard from './EnpiiAssistantArtifactCard.vue';
import ArtifactModal from './EnpiiAssistantArtifactModal.vue';
import ActionButton from './EnpiiAssistantActionButton.vue';
import PollCard from './EnpiiAssistantPollCard.vue';

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
        typingLabel: 'Sedang mengetik',
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
    const salam = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
    const pool = [
        `${salam}, apa yang bisa ${name} bantu hari ini?`,
        `Butuh bantuan? ${name} siap membantu.`,
        `Perlu bantuan mencatat transaksi? Mungkin ${name} bisa bantu.`,
        `Halo! ${name} di sini. Ada data yang ingin dicari?`,
        `${salam}. ${name} siap bantu cek angsuran, jurnal, atau data anggota.`,
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
    if (!reader) throw new Error('Stream tidak tersedia.');
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
        typingLabel.value = 'Mencari data…';
        scrollBottom();
        return;
    }
    if (event === 'tool_result') {
        typing.value = true;
        typingLabel.value = data?.ok === false ? 'Data tidak lengkap, menyusun jawaban…' : 'Menyusun jawaban…';
        scrollBottom();
        return;
    }
    if (event === 'confirmation_required') {
        typing.value = false;
        pendingConfirmation.value = {
            execution_id: data?.execution_id,
            summary: data?.summary || 'Konfirmasi aksi',
            plan: data?.plan || null,
            warnings: data?.warnings || [],
            options: data?.options || [],
            proposed_params: data?.proposed_params || {},
        };
        pushMessage({
            role: 'system',
            content: data?.summary || 'Aksi membutuhkan konfirmasi.',
        });
        return;
    }
    if (event === 'error') {
        typing.value = false;
        const msg = data?.message || 'Terjadi kesalahan asisten.';
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
            error.value = 'Ukuran gambar maksimal 10MB.';
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
    typingLabel.value = 'Sedang mengetik';
    scrollBottom();
    try {
        await ensureSession();
        const payload = {
            conversation_id: conversationId,
            message: content || 'Berikut lampiran gambar untuk dianalisis.',
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
                content: 'Maaf, saya belum bisa merangkai jawaban. Coba ulangi pertanyaan atau sebutkan lebih spesifik.',
            });
        }
    } catch (e) {
        error.value = e?.message || 'Gagal mengirim pesan.';
        pushMessage({ role: 'error', content: error.value });
    } finally {
        typing.value = false;
        typingLabel.value = 'Sedang mengetik';
        sending.value = false;
        scrollBottom();
    }
}

async function decideConfirmation(decision) {
    const conf = pendingConfirmation.value;
    if (!conf?.execution_id || sending.value) return;
    sending.value = true;
    typing.value = true;
    typingLabel.value = decision === 'approve' ? 'Menjalankan aksi…' : 'Membatalkan…';
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
                content: decision === 'approve' ? 'Aksi dijalankan.' : 'Aksi dibatalkan.',
            });
        }
    } catch (e) {
        error.value = e?.message || 'Gagal konfirmasi.';
        pushMessage({ role: 'error', content: error.value });
    } finally {
        typing.value = false;
        typingLabel.value = 'Sedang mengetik';
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
    <div ref="rootEl" class="enpii-assistant-widget">
        <Transition name="assistant-panel">
            <div
                v-if="open"
                class="enpii-assistant-widget__panel"
                role="dialog"
                :aria-label="displayName()"
            >
                <div class="enpii-assistant-widget__header">
                    <div class="enpii-assistant-widget__identity">
                        <AppIcon name="smart_toy" class="enpii-assistant-widget__logo" />
                        <div class="enpii-assistant-widget__identity-text">
                            <span class="enpii-assistant-widget__name">{{ displayName() }}</span>
                            <span v-if="persona?.slug" class="enpii-assistant-widget__persona">{{ persona.slug }}</span>
                        </div>
                    </div>
                    <button type="button" class="enpii-assistant-widget__close" aria-label="Tutup asisten" @click="open = false">
                        <AppIcon name="close" />
                    </button>
                </div>

                <p v-if="loading && !messages.length" class="enpii-assistant-widget__status">Menghubungkan…</p>
                <p v-else-if="error && !messages.length" class="enpii-assistant-widget__status enpii-assistant-widget__status--error">{{ error }}</p>

                <div ref="listEl" class="enpii-assistant-widget__messages">
                    <TransitionGroup name="assistant-msg" tag="div" class="enpii-assistant-widget__message-list">
                        <div
                            v-for="msg in messages"
                            :key="msg.id"
                            class="enpii-assistant-widget__bubble"
                            :class="{
                                'enpii-assistant-widget__bubble--user': msg.role === 'user',
                                'enpii-assistant-widget__bubble--assistant': msg.role === 'assistant' || msg.role === 'system',
                                'enpii-assistant-widget__bubble--error': msg.role === 'error',
                                'enpii-assistant-widget__bubble--tool': msg.role === 'tool',
                            }"
                        >
                            <template v-if="msg.role === 'tool'">
                                <span class="enpii-assistant-widget__tool-name"><strong>{{ msg.kind === 'use' ? 'Tool' : 'Hasil' }}:</strong> {{ msg.name }}</span>
                                <span v-if="msg.ok === false" class="enpii-assistant-widget__tool-error"> (gagal)</span>
                            </template>
                            <template v-else-if="msg.role === 'user' || msg.role === 'error'">
                                <div v-if="msg.attachments && msg.attachments.length" class="enpii-assistant-widget__attachments">
                                    <img
                                        v-for="(att, i) in msg.attachments"
                                        :key="i"
                                        :src="att.url"
                                        :alt="att.name || 'Gambar terlampir'"
                                        class="enpii-assistant-widget__attachment"
                                    />
                                </div>
                                <span v-if="msg.content && msg.content !== '(Lampiran Gambar)'">{{ msg.content }}</span>
                            </template>
                            <div v-else class="enpii-assistant-widget__blocks">
                                <template v-for="assistantBlock in blocksFor(msg)" :key="assistantBlock.id">
                                    <h1 v-if="assistantBlock.type === 'heading' && assistantBlock.level === 1" class="enpii-assistant-widget__heading enpii-assistant-widget__heading--h1">{{ assistantBlock.text }}</h1>
                                    <h2 v-else-if="assistantBlock.type === 'heading' && assistantBlock.level === 2" class="enpii-assistant-widget__heading enpii-assistant-widget__heading--h2">{{ assistantBlock.text }}</h2>
                                    <h3 v-else-if="assistantBlock.type === 'heading' && assistantBlock.level === 3" class="enpii-assistant-widget__heading enpii-assistant-widget__heading--h3">{{ assistantBlock.text }}</h3>
                                    <!-- eslint-disable-next-line vue/no-v-html -->
                                    <div
                                        v-else-if="assistantBlock.type === 'paragraph' || assistantBlock.type === 'code'"
                                        class="enpii-assistant-widget__markdown"
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
                        class="enpii-assistant-widget__typing"
                        :aria-label="typingLabel"
                    >
                        <span class="enpii-assistant-widget__typing-dots">
                            <span class="enpii-assistant-widget__typing-dot" />
                            <span class="enpii-assistant-widget__typing-dot" />
                            <span class="enpii-assistant-widget__typing-dot" />
                        </span>
                        <span class="enpii-assistant-widget__typing-label">{{ typingLabel }}</span>
                    </div>

                    <div
                        v-if="pendingConfirmation"
                        class="enpii-assistant-widget__confirmation"
                    >
                        <p class="enpii-assistant-widget__confirmation-title">{{ pendingConfirmation.summary }}</p>
                        <ul v-if="pendingConfirmation.warnings?.length" class="enpii-assistant-widget__warnings">
                            <li v-for="(w, i) in pendingConfirmation.warnings" :key="i">{{ w }}</li>
                        </ul>
                        <div class="enpii-assistant-widget__confirm-actions">
                            <button
                                type="button"
                                class="enpii-assistant-widget__confirm-button"
                                :disabled="sending"
                                @click="decideConfirmation('approve')"
                            >Setuju</button>
                            <button
                                type="button"
                                class="enpii-assistant-widget__reject-button"
                                :disabled="sending"
                                @click="decideConfirmation('reject')"
                            >Tolak</button>
                        </div>
                    </div>
                </div>

                <div class="enpii-assistant-widget__composer-wrap">
                    <!-- Attached Images Preview -->
                    <div v-if="attachedImages.length" class="enpii-assistant-widget__attachments-bar">
                        <div
                            v-for="(img, idx) in attachedImages"
                            :key="idx"
                            class="enpii-assistant-widget__thumbnail"
                        >
                            <img :src="img.dataUrl" class="enpii-assistant-widget__thumbnail-image" :alt="img.name" />
                            <button
                                type="button"
                                class="enpii-assistant-widget__thumbnail-remove"
                                aria-label="Hapus gambar"
                                @click="removeAttachedImage(idx)"
                            >
                                <AppIcon name="close" class="enpii-assistant-widget__thumbnail-icon" />
                            </button>
                        </div>
                    </div>

                    <div class="enpii-assistant-widget__composer">
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
                            class="enpii-assistant-widget__composer-button"
                            :disabled="sending || loading"
                            aria-label="Lampirkan Gambar"
                            title="Lampirkan Gambar"
                            @click="triggerAttach"
                        >
                            <AppIcon name="add_photo_alternate" />
                        </button>
                        <textarea
                            ref="inputEl"
                            v-model="input"
                            rows="2"
                            class="enpii-assistant-widget__input"
                            :placeholder="`Tulis ke ${displayName()}...`"
                            :disabled="sending || loading"
                            @input="afterInputChange"
                            @keydown="onKeydown"
                            @paste="onPaste"
                        />
                        <button
                            type="button"
                            class="enpii-assistant-widget__composer-button enpii-assistant-widget__send-button"
                            :disabled="sending || loading || (!input.trim() && !attachedImages.length)"
                            aria-label="Kirim"
                            @click="sendMessage"
                        >
                            <AppIcon name="send" />
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <ArtifactModal :assistantBlock="activeArtifact" @close="closeArtifact" />

        <button
            type="button"
            class="enpii-assistant-widget__toggle"
            :aria-expanded="open"
            :aria-label="`Buka ${displayName()}`"
            @click="toggle"
        >
            <AppIcon class="enpii-assistant-widget__toggle-icon"
                     :name="open ? 'close' : 'smart_toy'" />
        </button>
    </div>
</template>

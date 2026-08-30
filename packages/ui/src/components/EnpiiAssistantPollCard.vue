<script setup>
import { computed, nextTick, ref } from 'vue';
import AppButton from './EnpiiButton.vue';
import AppIcon from './EnpiiIcon.vue';
import { useT } from '../composables/useT'

const t = useT()

const props = defineProps({
    assistantBlock: { type: Object, required: true },
    submitted: { type: [String, null], default: null }, // label of selected option, '__skip__', or '__other__'
});

const emit = defineEmits(['submit']);

const showOther = ref(false);
const otherText = ref('');
const otherInput = ref(null);

const isSubmitted = computed(() => props.submitted !== null);
const isSkipped = computed(() => props.submitted === '__skip__');
const isOther = computed(() => props.submitted === '__other__');
const submittedLabel = computed(() => {
    if (typeof props.submitted === 'string' && !props.submitted.startsWith('__')) {
        return props.submitted;
    }
    return null;
});

function onPick(value) {
    if (isSubmitted.value) return;
    emit('submit', value);
}

function onSkip() {
    if (isSubmitted.value) return;
    emit('submit', '__skip__');
}

async function onOpenOther() {
    showOther.value = true;
    await nextTick();
    otherInput.value?.focus();
}

function onSubmitOther() {
    const v = otherText.value.trim();
    if (!v) return;
    emit('submit', v);
}
</script>

<template>
    <section
        class="enpii-assistant-poll-card"
        :aria-label="t('pollCard.pollingLabel', { question: assistantBlock.question })"
    >
        <!-- Header: question + arrow -->
        <header class="enpii-assistant-poll-card__header">
            <h3 class="enpii-assistant-poll-card__question">{{ assistantBlock.question }}</h3>
            <span
                v-if="!isSubmitted"
                class="enpii-assistant-poll-card__arrow"
                aria-hidden="true"
            >
                <AppIcon name="chevron_right" />
            </span>
        </header>

        <!-- Options -->
        <ol class="enpii-assistant-poll-card__options">
            <li
                v-for="(opt, i) in assistantBlock.options"
                :key="opt.value"
                class="enpii-assistant-poll-card__option"
                :class="{
                    'enpii-assistant-poll-card__option--interactive': !isSubmitted,
                    'enpii-assistant-poll-card__option--selected': submittedLabel === opt.label,
                }"
                :aria-disabled="isSubmitted"
                :role="isSubmitted ? undefined : 'button'"
                :tabindex="isSubmitted ? -1 : 0"
                @click="onPick(opt.label)"
                @keydown.enter.prevent="onPick(opt.label)"
                @keydown.space.prevent="onPick(opt.label)"
            >
                <span
                    class="enpii-assistant-poll-card__marker"
                    :class="{ 'enpii-assistant-poll-card__marker--selected': submittedLabel === opt.label }"
                >
                    <template v-if="submittedLabel === opt.label">
                        <AppIcon name="check" class="enpii-assistant-poll-card__check" />
                    </template>
                    <template v-else>{{ i + 1 }}</template>
                </span>
                <span class="enpii-assistant-poll-card__label">{{ opt.label }}</span>
            </li>
        </ol>

        <!-- Bottom: Lainnya / Lewati -->
        <div class="enpii-assistant-poll-card__footer">
            <button
                v-if="assistantBlock.allowOther && !isSubmitted && !showOther"
                type="button"
                class="enpii-assistant-poll-card__other-button"
                @click="onOpenOther"
            >
                <AppIcon name="edit" class="enpii-assistant-poll-card__other-icon" />
                <span>Lainnya</span>
            </button>
            <span v-else />

            <button
                v-if="!isSubmitted"
                type="button"
                class="enpii-assistant-poll-card__skip-button"
                @click="onSkip"
            >
                Lewati
            </button>
            <span v-else-if="isSkipped" class="enpii-assistant-poll-card__state">— dilewati</span>
            <span v-else-if="isOther" class="enpii-assistant-poll-card__state">✓ “{{ props.submitted }}”</span>
            <span v-else class="enpii-assistant-poll-card__state">✓ dipilih</span>
        </div>

        <!-- Lainnya inline input -->
        <div v-if="showOther && !isSubmitted" class="enpii-assistant-poll-card__other-form">
            <input
                ref="otherInput"
                v-model="otherText"
                type="text"
                :placeholder="t('pollCard.placeholder')"
                class="enpii-assistant-poll-card__other-input"
                @keydown.enter.prevent="onSubmitOther"
            />
            <AppButton size="compact" variant="primary" :disabled="!otherText.trim()" @click="onSubmitOther">
                Kirim
            </AppButton>
        </div>

        <!-- Free-form fallback -->
        <p v-if="!isSubmitted" class="enpii-assistant-poll-card__fallback">
            Atau balas langsung…
        </p>
    </section>
</template>
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
        class="enpii-assistant-poll-card overflow-hidden rounded-overlay border border-solid [border-color:var(--assistant-card-border)] [border-width:var(--overlay-border-width)] [background-color:var(--assistant-card-bg)] [color:var(--assistant-card-fg)]"
        :aria-label="t('pollCard.pollingLabel', { question: assistantBlock.question })"
    >
        <!-- Header: question + arrow -->
        <header class="enpii-assistant-poll-card__header flex items-center justify-between gap-2 px-4 pb-3 pt-4">
            <h3 class="enpii-assistant-poll-card__question m-0 [color:var(--assistant-card-fg)] text-sm font-semibold leading-tight">{{ assistantBlock.question }}</h3>
            <span
                v-if="!isSubmitted"
                class="enpii-assistant-poll-card__arrow [color:var(--tone-neutral-fg)]"
                aria-hidden="true"
            >
                <AppIcon name="chevron_right" />
            </span>
        </header>

        <!-- Options -->
        <ol class="enpii-assistant-poll-card__options m-0 flex list-none flex-col border-y border-solid [border-block-color:var(--assistant-card-border)] [border-block-width:var(--overlay-border-width)] p-0">
            <li
                v-for="(opt, i) in assistantBlock.options"
                :key="opt.value"
                class="enpii-assistant-poll-card__option flex items-center gap-3 px-4 py-3 text-sm transition-all duration-fast ease-emphasized [&+&]:border-t [&+&]:border-solid [&+&]:[border-top-color:var(--assistant-card-border)] [&+&]:[border-top-width:var(--overlay-border-width)]"
                :class="{
                    'cursor-pointer hover:[background-color:var(--control-bg-hover)] focus-visible:[background-color:var(--control-bg-hover)] focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_2px_var(--color-focus)]': !isSubmitted,
                    '[background-color:var(--control-bg-hover)] focus-visible:outline-none': submittedLabel === opt.label,
                }"
                :aria-disabled="isSubmitted"
                :role="isSubmitted ? undefined : 'button'"
                :tabindex="isSubmitted ? -1 : 0"
                @click="onPick(opt.label)"
                @keydown.enter.prevent="onPick(opt.label)"
                @keydown.space.prevent="onPick(opt.label)"
            >
                <span
                    class="enpii-assistant-poll-card__marker grid h-7 w-7 shrink-0 place-items-center rounded-control [background-color:var(--control-bg)] [color:var(--tone-neutral-fg)] text-xs font-semibold"
                    :class="{ '[background-color:var(--assistant-user-msg-bg)] [color:var(--assistant-user-msg-fg)]': submittedLabel === opt.label }"
                >
                    <template v-if="submittedLabel === opt.label">
                            <AppIcon name="check" class="enpii-assistant-poll-card__check h-4 w-4 text-base" />
                    </template>
                    <template v-else>{{ i + 1 }}</template>
                </span>
                <span class="enpii-assistant-poll-card__label min-w-0 flex-1 truncate">{{ opt.label }}</span>
            </li>
        </ol>

        <!-- Bottom: Lainnya / Lewati -->
        <div class="enpii-assistant-poll-card__footer flex items-center justify-between gap-3 px-4 py-3">
            <button
                v-if="assistantBlock.allowOther && !isSubmitted && !showOther"
                type="button"
                class="enpii-assistant-poll-card__other-button inline-flex cursor-pointer items-center gap-1 rounded-control border-0 bg-none px-3 py-1 [color:var(--assistant-card-fg)] text-xs font-semibold transition-all duration-fast ease-emphasized hover:[background-color:var(--control-bg-hover)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
                @click="onOpenOther"
            >
                <AppIcon name="edit" class="enpii-assistant-poll-card__other-icon [color:var(--tone-neutral-fg)] text-[1.125rem] leading-none" />
                <span>Lainnya</span>
            </button>
            <span v-else />

            <button
                v-if="!isSubmitted"
                type="button"
                class="enpii-assistant-poll-card__skip-button cursor-pointer border-0 bg-none py-1 [color:var(--tone-neutral-fg)] text-xs font-semibold transition-colors duration-fast ease-emphasized hover:[color:var(--assistant-card-fg)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
                @click="onSkip"
            >
                Lewati
            </button>
            <span v-else-if="isSkipped" class="enpii-assistant-poll-card__state [color:var(--tone-neutral-fg)] text-xs italic">— dilewati</span>
            <span v-else-if="isOther" class="enpii-assistant-poll-card__state [color:var(--tone-neutral-fg)] text-xs italic">✓ “{{ props.submitted }}”</span>
            <span v-else class="enpii-assistant-poll-card__state [color:var(--tone-neutral-fg)] text-xs italic">✓ dipilih</span>
        </div>

        <!-- Lainnya inline input -->
        <div v-if="showOther && !isSubmitted" class="enpii-assistant-poll-card__other-form flex items-center gap-2 border-t [border-color:var(--control-border-color)] [border-top-width:var(--overlay-border-width)] [background-color:var(--control-bg)] px-3 py-2">
            <input
                ref="otherInput"
                v-model="otherText"
                type="text"
                :placeholder="t('pollCard.placeholder')"
                class="enpii-assistant-poll-card__other-input min-h-9 min-w-0 flex-1 rounded-control border border-solid [border-color:var(--field-border-color)] [border-width:var(--control-border-width)] [background-color:var(--field-bg)] px-2 py-1 [color:var(--field-fg)] text-sm focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_30%,transparent)]"
                @keydown.enter.prevent="onSubmitOther"
            />
            <AppButton size="compact" variant="primary" :disabled="!otherText.trim()" @click="onSubmitOther">
                Kirim
            </AppButton>
        </div>

        <!-- Free-form fallback -->
        <p v-if="!isSubmitted" class="enpii-assistant-poll-card__fallback m-0 border-t border-solid [border-top-color:var(--assistant-card-border)] [border-top-width:var(--overlay-border-width)] [background-color:var(--control-bg)] px-4 py-2 [color:var(--tone-neutral-fg)] text-xs">
            Atau balas langsung…
        </p>
    </section>
</template>

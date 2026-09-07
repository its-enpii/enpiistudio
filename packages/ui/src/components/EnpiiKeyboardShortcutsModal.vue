<script setup>
import { computed } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import AppModal from './EnpiiModal.vue';
import { useT } from '../composables/useT'

const t = useT()

const model = defineModel({ type: Boolean, default: false });
defineProps({
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const isMac = computed(() => {
    return typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/.test(navigator.platform);
});

const modifierKey = computed(() => (isMac.value ? '⌥ Option' : 'Alt'));
const cmdKey = computed(() => (isMac.value ? '⌘ Cmd' : 'Ctrl'));

const shortcutGroups = computed(() => [
    {
        title: t('shortcuts.groupSearch'),
        icon: 'search',
        items: [
            { keys: [cmdKey.value, 'K'], description: t('shortcuts.openSearch') },
            { keys: [modifierKey.value, 'A'], description: t('shortcuts.toggleAssistant') },
            { keys: ['Shift', '?'], description: t('shortcuts.openHelp') },
            { keys: ['Esc'], description: t('shortcuts.closeDialog') },
        ],
    },
    {
        title: t('shortcuts.groupNav'),
        icon: 'navigation',
        items: [
            { keys: [modifierKey.value, 'D'], description: t('shortcuts.gotoDashboard') },
            { keys: [modifierKey.value, 'J'], description: t('shortcuts.gotoJournal') },
            { keys: [modifierKey.value, 'L'], description: t('shortcuts.gotoLoans') },
            { keys: [modifierKey.value, 'M'], description: t('shortcuts.gotoMembers') },
            { keys: [modifierKey.value, 'G'], description: t('shortcuts.gotoGroups') },
            { keys: [modifierKey.value, 'R'], description: t('shortcuts.gotoReports') },
            { keys: [modifierKey.value, 'B'], description: t('shortcuts.gotoBudget') },
            { keys: [modifierKey.value, 'T'], description: t('shortcuts.gotoClosing') },
        ],
    },
    {
        title: t('shortcuts.groupActions'),
        icon: 'bolt',
        items: [
            { keys: [modifierKey.value, 'S'], description: t('shortcuts.syncData') },
            { keys: [modifierKey.value, 'N'], description: t('shortcuts.toggleNotification') },
            { keys: [modifierKey.value, 'P'], description: t('shortcuts.printReport') },
        ],
    },
]);
</script>

<template>
    <AppModal v-model="model" :title="t('shortcuts.title')" size="lg" :shape="shape">
        <div class="enpii-keyboard-shortcuts [&>*+*]:mt-6">
            <p class="enpii-keyboard-shortcuts__intro m-0 [color:var(--tone-neutral-fg)] text-xs leading-[1.55]">
                Gunakan kombinasi tombol berikut untuk mempercepat navigasi dan pengoperasian aplikasi di <strong>Desktop</strong> maupun <strong>Website</strong>.
            </p>

            <div class="enpii-keyboard-shortcuts__groups grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                    v-for="group in shortcutGroups"
                    :key="group.title"
                    class="enpii-keyboard-shortcuts__group p-4 border border-solid [border-color:var(--overlay-border-color)] [border-width:var(--control-border-width)] rounded-control [background-color:var(--card-bg)]"
                >
                    <div class="enpii-keyboard-shortcuts__group-header flex items-center gap-2 pb-2 border-b border-solid [border-color:var(--overlay-border-color)] [border-bottom-width:var(--control-border-width)]/60">
                        <AppIcon :name="group.icon" class="enpii-keyboard-shortcuts__group-icon w-4 h-4 [color:var(--card-fg)] text-base" />
                        <h4 class="enpii-keyboard-shortcuts__group-title m-0 [color:var(--card-fg)] text-xs font-semibold">
                            {{ group.title }}
                        </h4>
                    </div>

                    <ul class="enpii-keyboard-shortcuts__list grid gap-2 mt-3 mb-0 p-0 list-none">
                        <li v-for="(item, idx) in group.items" :key="idx" class="enpii-keyboard-shortcuts__item flex items-center justify-between gap-3 text-xs">
                            <span class="enpii-keyboard-shortcuts__description overflow-hidden text-ellipsis whitespace-nowrap [color:var(--tone-neutral-fg)] leading-[1.25]">
                                {{ item.description }}
                            </span>
                            <div class="enpii-keyboard-shortcuts__keys flex shrink-0 items-center gap-1">
                                <template v-for="(k, kIdx) in item.keys" :key="kIdx">
                                    <kbd class="enpii-keyboard-shortcuts__key inline-flex min-w-[22px] items-center justify-center p-1 border border-solid [border-color:var(--control-border-color)] [border-width:var(--control-border-width)]/80 rounded [background-color:var(--control-bg)] [color:var(--control-fg)] font-mono text-[0.6875rem] font-semibold shadow-control">
                                        {{ k }}
                                    </kbd>
                                    <span v-if="kIdx < item.keys.length - 1" class="enpii-keyboard-shortcuts__plus [color:var(--tone-neutral-fg)] text-[0.625rem] font-semibold">+</span>
                                </template>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="enpii-keyboard-shortcuts__tip flex items-center gap-2 py-2 px-3 rounded-lg [background-color:var(--card-bg)] [color:var(--tone-neutral-fg)] text-[0.6875rem]">
                <AppIcon name="info" class="enpii-keyboard-shortcuts__tip-icon w-3.5 h-3.5 shrink-0 [color:var(--card-fg)] text-sm" />
                <span>
                    <strong>Tips:</strong> Pintasan kombinasi <code>{{ modifierKey }}</code> dapat ditekan kapan saja tanpa mengganggu pengetikan formulir.
                </span>
            </div>
        </div>
    </AppModal>
</template>

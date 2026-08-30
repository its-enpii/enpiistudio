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
        <div class="enpii-keyboard-shortcuts">
            <p class="enpii-keyboard-shortcuts__intro">
                Gunakan kombinasi tombol berikut untuk mempercepat navigasi dan pengoperasian aplikasi di <strong>Desktop</strong> maupun <strong>Website</strong>.
            </p>

            <div class="enpii-keyboard-shortcuts__groups">
                <div
                    v-for="group in shortcutGroups"
                    :key="group.title"
                    class="enpii-keyboard-shortcuts__group"
                >
                    <div class="enpii-keyboard-shortcuts__group-header">
                        <AppIcon :name="group.icon" class="enpii-keyboard-shortcuts__group-icon" />
                        <h4 class="enpii-keyboard-shortcuts__group-title">
                            {{ group.title }}
                        </h4>
                    </div>

                    <ul class="enpii-keyboard-shortcuts__list">
                        <li v-for="(item, idx) in group.items" :key="idx" class="enpii-keyboard-shortcuts__item">
                            <span class="enpii-keyboard-shortcuts__description">
                                {{ item.description }}
                            </span>
                            <div class="enpii-keyboard-shortcuts__keys">
                                <template v-for="(k, kIdx) in item.keys" :key="kIdx">
                                    <kbd class="enpii-keyboard-shortcuts__key">
                                        {{ k }}
                                    </kbd>
                                    <span v-if="kIdx < item.keys.length - 1" class="enpii-keyboard-shortcuts__plus">+</span>
                                </template>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="enpii-keyboard-shortcuts__tip">
                <AppIcon name="info" class="enpii-keyboard-shortcuts__tip-icon" />
                <span>
                    <strong>Tips:</strong> Pintasan kombinasi <code>{{ modifierKey }}</code> dapat ditekan kapan saja tanpa mengganggu pengetikan formulir.
                </span>
            </div>
        </div>
    </AppModal>
</template>

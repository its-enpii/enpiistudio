<script setup>
import { computed } from 'vue';
import AppIcon from './EnpiiIcon.vue';
import AppModal from './EnpiiModal.vue';

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
        title: 'Pencarian & Bantuan',
        icon: 'search',
        items: [
            { keys: [cmdKey.value, 'K'], description: 'Buka Pencarian Cepat / Command Palette' },
            { keys: [modifierKey.value, 'A'], description: 'Buka / Tutup Ariel AI Assistant' },
            { keys: ['Shift', '?'], description: 'Buka Bantuan Pintasan Keyboard' },
            { keys: ['Esc'], description: 'Tutup Dialog / Modal / Menu Terbuka' },
        ],
    },
    {
        title: 'Navigasi Menu Utama',
        icon: 'navigation',
        items: [
            { keys: [modifierKey.value, 'D'], description: 'Ke Halaman Dashboard' },
            { keys: [modifierKey.value, 'J'], description: 'Ke Halaman Jurnal Umum' },
            { keys: [modifierKey.value, 'L'], description: 'Ke Halaman Pinjaman & Pembiayaan' },
            { keys: [modifierKey.value, 'M'], description: 'Ke Halaman Data Nasabah / Anggota' },
            { keys: [modifierKey.value, 'G'], description: 'Ke Halaman Data Kelompok' },
            { keys: [modifierKey.value, 'R'], description: 'Ke Halaman Laporan Keuangan' },
            { keys: [modifierKey.value, 'B'], description: 'Ke Halaman E-Budgeting' },
            { keys: [modifierKey.value, 'T'], description: 'Ke Halaman Tutup Buku' },
        ],
    },
    {
        title: 'Aksi Cepat & Sistem',
        icon: 'bolt',
        items: [
            { keys: [modifierKey.value, 'S'], description: 'Sinkronisasi Data Lokal (Desktop / Cloud)' },
            { keys: [modifierKey.value, 'N'], description: 'Buka / Tutup Notifikasi' },
            { keys: [modifierKey.value, 'P'], description: 'Cetak Laporan / Halaman Aktif' },
        ],
    },
]);
</script>

<template>
    <AppModal v-model="model" title="Pintasan Keyboard (Shortcuts)" size="lg" :shape="shape">
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

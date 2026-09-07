<script setup lang="ts">
import { ref } from 'vue'
import {
  EnpiiAccordion, EnpiiAlert, EnpiiAreaChart, EnpiiAssistantActionButton,
  EnpiiAssistantArtifactCard, EnpiiAssistantArtifactModal, EnpiiAssistantPollCard,
  EnpiiAssistantWidget, EnpiiAvatar, EnpiiBadge, EnpiiBarChart, EnpiiBottomSheet,
  EnpiiBreadcrumb, EnpiiButton, EnpiiCalendar, EnpiiCard, EnpiiCheckbox,
  EnpiiColorPicker, EnpiiCommandPalette, EnpiiConfirmDialog, EnpiiCsvImportExport,
  EnpiiCurrencyInput, EnpiiDatePicker, EnpiiDateRange, EnpiiDesktopSplashScreen,
  EnpiiDesktopTitleBar, EnpiiDonutChart, EnpiiDrawer, EnpiiDropdownMenu,
  EnpiiEmptyState, EnpiiFileUpload, EnpiiFilterPill, EnpiiFooter, EnpiiFormActions,
  EnpiiFormField, EnpiiFormRow, EnpiiIcon, EnpiiIconButton, EnpiiImageUpload,
  EnpiiInlineEmptyState, EnpiiInput, EnpiiInputMask, EnpiiKanbanBoard,
  EnpiiKeyboardShortcutsModal, EnpiiLabel, EnpiiLineChart, EnpiiLoanHistoryTable,
  EnpiiMentionInput, EnpiiModal, EnpiiNavbar, EnpiiNotificationDropdown,
  EnpiiOfflineBanner, EnpiiOtpInput, EnpiiPageHeader, EnpiiPagination,
  EnpiiPasswordInput, EnpiiPopover, EnpiiProgress, EnpiiQrCode, EnpiiRadioGroup,
  EnpiiRange, EnpiiRating, EnpiiReportPeriodFilter, EnpiiRichEditor,
  EnpiiSegmentedControl, EnpiiSidebar, EnpiiSignaturePad, EnpiiSkeleton,
  EnpiiSmartSelect, EnpiiSmartTable, EnpiiSparkline, EnpiiSpinner, EnpiiStatTile,
  EnpiiStepper, EnpiiSwitch, EnpiiTabs, EnpiiTagInput, EnpiiTextarea,
  EnpiiThemeMenu, EnpiiTimePicker, EnpiiTimeline, EnpiiToast, EnpiiTooltip,
  EnpiiTransferList, EnpiiTreeView, EnpiiTrendBarChart, EnpiiWhatsAppPreview
} from '../src/index'

const activeLayer = ref('neobrutalism')
const textVal = ref('Input Value')
const numVal = ref(150000)
const dateVal = ref('2026-09-07')
const checkVal = ref(true)
const switchVal = ref(true)
const radioVal = ref('opt1')
const ratingVal = ref(4)
const rangeVal = ref(50)
const selectVal = ref('apple')
const tagsVal = ref(['Design', 'System', 'Vue3'])
const timeVal = ref('14:30')
const colorVal = ref('#261a74')
const pillVal = ref('all')
const activeTab = ref('t1')
const activeStep = ref('s1')
const currentPage = ref(1)

const filterPillItems = [
  { value: 'all', label: 'Semua (12)', icon: 'list' },
  { value: 'food', label: 'Makanan (8)', icon: 'restaurant' },
  { value: 'drink', label: 'Minuman (4)', icon: 'local_cafe' }
]

const assistantActionBlock = {
  label: 'Buka Spesifikasi',
  url: 'https://its-enpii.com',
  icon: 'open_in_new'
}

const assistantPollBlock = {
  question: 'Pilih opsi terbaik untuk arsitektur UI:',
  options: ['Base-Raw + Style Layers', 'Tailwind Config Wrapper', 'Hardcoded BEM Styles']
}

const assistantArtifactBlock = {
  kind: 'document',
  title: 'Architecture Spec',
  description: 'Spesifikasi arsitektur package @its-enpii/ui v1.4.0'
}

const tableColumns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'name', label: 'Nama Produk' },
  { key: 'category', label: 'Kategori' },
  { key: 'price', label: 'Harga', align: 'right' as const },
]
const tableData = [
  { id: 1, name: 'Kopi Susu Gula Aren', category: 'Minuman', price: 'Rp 18.000' },
  { id: 2, name: 'Croissant Butter', category: 'Pastry', price: 'Rp 24.000' },
  { id: 3, name: 'Nasi Goreng Spesial', category: 'Makanan', price: 'Rp 32.000' },
]

const kanbanColumns = [
  { id: 'todo', title: 'Antrean' },
  { id: 'in_progress', title: 'Dimasak' },
  { id: 'done', title: 'Siap Saji' },
]

const kanbanCards = [
  { id: '1', columnId: 'todo', title: 'Pesanan #101', label: 'Meja 01' },
  { id: '2', columnId: 'in_progress', title: 'Pesanan #102', label: 'Meja 04' },
  { id: '3', columnId: 'done', title: 'Pesanan #103', label: 'Takeaway' },
]

const transferOptions = [
  { id: '1', label: 'Hak Akses POS' },
  { id: '2', label: 'Hak Akses KDS' },
  { id: '3', label: 'Hak Akses Laporan' }
]
const transferVal = ref(['1'])
const treeNodes = [
  { id: '1', label: 'Root Folder', children: [{ id: '1-1', label: 'File A.vue' }, { id: '1-2', label: 'File B.ts' }] }
]

const timelineItems = [
  { title: 'Pesanan Masuk', time: '10:00', status: 'success' },
  { title: 'Proses Pembayaran', time: '10:02', status: 'success' },
  { title: 'Dapur Menyiapkan', time: '10:05', status: 'pending' },
]

const chartData = [
  { label: 'Sen', value: 30 },
  { label: 'Sel', value: 45 },
  { label: 'Rab', value: 60 },
  { label: 'Kam', value: 40 },
  { label: 'Jum', value: 85 },
]
</script>

<template>
  <div class="p-8 max-w-[1500px] mx-auto min-h-screen" :data-enpii-layer="activeLayer">
    <!-- Header -->
    <header class="mb-8 pb-6 border-b-2 border-ink flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tight">@its-enpii/ui Exhaustive 87-Component Verification Gallery</h1>
        <p class="text-on-surface-variant text-sm mt-1">Mounted Verification of All 87 Vue Components in @its-enpii/ui</p>
      </div>
      <div class="flex gap-2 items-center">
        <span class="text-xs font-bold uppercase">Pilih Layer:</span>
        <select v-model="activeLayer" class="border-2 border-ink px-3 py-1 font-bold rounded-none bg-surface">
          <option value="neobrutalism">Neobrutalism (Enmarket Raw 4px/6px)</option>
          <option value="neobrutalism-tamed">Neobrutalism (Tamed 2px)</option>
          <option value="material">Material</option>
          <option value="glassmorphism">Glassmorphism</option>
          <option value="neumorphism">Neumorphism</option>
          <option value="minimalism">Minimalism</option>
      </select>
      </div>
    </header>

    <main class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 1. Buttons & Actions -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">1. Buttons & Actions (6 Components)</h2>
        <div class="flex flex-wrap gap-2 items-center">
          <EnpiiButton variant="primary">Primary</EnpiiButton>
          <EnpiiButton variant="secondary">Secondary</EnpiiButton>
          <EnpiiButton variant="danger">Danger</EnpiiButton>
          <EnpiiButton variant="ghost">Ghost</EnpiiButton>
          <EnpiiIconButton icon="settings" aria-label="Settings" />
          <EnpiiIcon name="home" />
        </div>
        <div class="flex flex-col gap-2">
          <EnpiiFilterPill :items="filterPillItems" v-model="pillVal" />
          <div class="flex gap-2 items-center">
            <EnpiiSegmentedControl :options="[{ key: 'a', label: 'Pagi' }, { key: 'b', label: 'Malam' }]" value="a" />
            <EnpiiAssistantActionButton :assistant-block="assistantActionBlock" />
          </div>
          <EnpiiFormActions submit-label="Simpan Data" cancel-label="Batal" />
        </div>
      </section>

      <!-- 2. Form Inputs (Text & Specialized) -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">2. Form Fields & Inputs (6 Components)</h2>
        <EnpiiFormField label="Standard Input" hint="Petunjuk pengisian">
          <EnpiiInput v-model="textVal" placeholder="Placeholder..." />
        </EnpiiFormField>
        <EnpiiFormField label="Currency & Password">
          <div class="grid grid-cols-2 gap-2">
            <EnpiiCurrencyInput v-model="numVal" />
            <EnpiiPasswordInput value="Secret123" />
          </div>
        </EnpiiFormField>
        <EnpiiFormField label="Mask & OTP & Tag">
          <div class="flex flex-col gap-2">
            <EnpiiInputMask mask="999.999.999" placeholder="000.000.000" />
            <EnpiiOtpInput :length="4" />
            <EnpiiTagInput v-model="tagsVal" />
          </div>
        </EnpiiFormField>
      </section>

      <!-- 3. Advanced Inputs & Textarea -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">3. Advanced Inputs & Textarea (5 Components)</h2>
        <EnpiiFormField label="Textarea & Mention">
          <EnpiiTextarea placeholder="Tulis deskripsi lengkap..." rows="2" />
          <EnpiiMentionInput placeholder="Mention @user..." class="mt-2" />
        </EnpiiFormField>
        <EnpiiFormField label="Smart Select & Form Row">
          <EnpiiSmartSelect v-model="selectVal" :options="[{ label: 'Apple', value: 'apple' }, { label: 'Banana', value: 'banana' }]" />
          <EnpiiFormRow class="mt-2">
            <EnpiiLabel>Form Label Component</EnpiiLabel>
          </EnpiiFormRow>
        </EnpiiFormField>
      </section>

      <!-- 4. Toggles & Selectors -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">4. Toggles & Selectors (5 Components)</h2>
        <div class="flex flex-col gap-3">
          <div class="flex gap-4 items-center">
            <EnpiiCheckbox v-model="checkVal" label="Aktifkan Notifikasi" />
            <EnpiiSwitch v-model="switchVal" label="Dark Mode" />
          </div>
          <EnpiiRadioGroup label="Pilihan Metode" v-model="radioVal" :options="[{ label: 'Opsi Satu', value: 'opt1' }, { label: 'Opsi Dua', value: 'opt2' }]" />
          <div class="flex items-center gap-4">
            <EnpiiRating v-model="ratingVal" />
            <EnpiiRange label="Rentang Nilai" v-model="rangeVal" :min="0" :max="100" class="flex-1" />
          </div>
        </div>
      </section>

      <!-- 5. Pickers & Calendar -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">5. Pickers & Calendar (5 Components)</h2>
        <div class="grid grid-cols-2 gap-2">
          <EnpiiDatePicker v-model="dateVal" label="Pilih Tanggal" />
          <EnpiiTimePicker v-model="timeVal" label="Pilih Waktu" />
        </div>
        <EnpiiDateRange label="Rentang Waktu" />
        <div class="flex gap-2 items-center">
          <EnpiiColorPicker v-model="colorVal" label="Warna Tema" />
          <EnpiiReportPeriodFilter year="2026" base-url="/reports" />
        </div>
      </section>

      <!-- 6. Media & Upload & Tools -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">6. Media & Upload & Tools (5 Components)</h2>
        <EnpiiFileUpload />
        <div class="grid grid-cols-2 gap-2 items-center">
          <EnpiiImageUpload />
          <div class="flex flex-col items-center gap-1">
            <EnpiiQrCode value="https://its-enpii.com" :size="80" />
            <EnpiiCsvImportExport export-url="/export" import-url="/import" :columns="['id', 'name']" :import-file="() => {}" />
          </div>
        </div>
        <EnpiiSignaturePad />
      </section>

      <!-- 7. Feedback & Status -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">7. Feedback & Status (9 Components)</h2>
        <div class="flex flex-wrap gap-2">
          <EnpiiBadge tone="primary">Primary</EnpiiBadge>
          <EnpiiBadge tone="success">Success</EnpiiBadge>
          <EnpiiBadge tone="warning">Warning</EnpiiBadge>
          <EnpiiBadge tone="error">Error</EnpiiBadge>
          <EnpiiBadge tone="error-soft">Error Soft</EnpiiBadge>
          <EnpiiBadge tone="neutral">Neutral</EnpiiBadge>
        </div>
        <EnpiiAlert tone="warning" title="Pemberitahuan Sistem">Layanan berjalan normal.</EnpiiAlert>
        <div class="flex items-center gap-4">
          <EnpiiProgress :value="65" class="flex-1" />
          <EnpiiSpinner size="md" />
        </div>
        <EnpiiSkeleton class="h-6 w-full" />
        <div class="flex gap-2 items-center">
          <EnpiiAvatar name="Enpii User" size="md" />
          <EnpiiEmptyState icon="inbox" title="Belum Ada Data" description="Silakan buat entri baru." />
          <EnpiiInlineEmptyState message="Tidak ada hasil filter" />
        </div>
      </section>

      <!-- 8. Data Display & Tables -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">8. Data Display & Tables (5 Components)</h2>
        <div class="grid grid-cols-2 gap-2">
          <EnpiiStatTile label="Total Transaksi" value="Rp 2.450.000" />
          <EnpiiStatTile label="Pengunjung" value="384" />
        </div>
        <EnpiiSmartTable :columns="tableColumns" :data="tableData" />
        <EnpiiPagination :total-pages="10" v-model="currentPage" />
        <EnpiiLoanHistoryTable />
      </section>

      <!-- 9. Charts & Visualizations -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">9. Charts & Visualizations (6 Components)</h2>
        <div class="grid grid-cols-2 gap-2">
          <EnpiiBarChart :data="chartData" :height="120" />
          <EnpiiLineChart :data="chartData" :height="120" />
        </div>
        <div class="grid grid-cols-3 gap-1 items-center">
          <EnpiiAreaChart :data="chartData" :height="80" />
          <EnpiiDonutChart :data="chartData" :height="80" />
          <EnpiiSparkline :data="[10, 25, 18, 40, 32]" />
        </div>
        <EnpiiTrendBarChart :data="chartData" :height="80" />
      </section>

      <!-- 10. Navigation & Structural Containers -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">10. Navigation & Structure (8 Components)</h2>
        <EnpiiNavbar brand="Enpii Showcase" :links="[{ key: 'h', label: 'Beranda' }, { key: 'p', label: 'Produk' }]" />
        <EnpiiPageHeader title="Judul Halaman" subtitle="Deskripsi ringkas konteks halaman" />
        <EnpiiTabs :items="[{ key: 't1', label: 'Tab Satu' }, { key: 't2', label: 'Tab Dua' }]" v-model="activeTab" />
        <EnpiiBreadcrumb :items="[{ label: 'Home', href: '/' }, { label: 'Components' }]" />
        <EnpiiStepper :steps="[{ key: 's1', label: 'Langkah 1' }, { key: 's2', label: 'Langkah 2' }]" :activeKey="activeStep" />
        <EnpiiAccordion :items="[{ key: 'acc1', title: 'Pertanyaan Umum', content: 'Jawaban detail pertanyaan...' }]" />
        <div class="flex gap-2 items-center">
          <EnpiiThemeMenu />
          <EnpiiNotificationDropdown />
        </div>
        <EnpiiFooter copyright="© 2026 Enpii Studio" />
      </section>

      <!-- 11. Complex Domain, Assistant & WhatsApp -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">11. Assistant & Specialty (4 Components)</h2>
        <EnpiiAssistantPollCard :assistant-block="assistantPollBlock" />
        <EnpiiAssistantArtifactCard :assistant-block="assistantArtifactBlock" />
        <EnpiiWhatsAppPreview :messages="[{ id: '1', body: 'Halo, pesanan Anda sedang disiapkan!', direction: 'out', status: 'read', timestamp: '14:30' }]" />
        <EnpiiTimeline :items="timelineItems" />
      </section>

      <!-- 12. Tree, Kanban, Desktop & Overlays -->
      <section class="enpii-card p-5 flex flex-col gap-4 border-2 border-ink">
        <h2 class="text-base font-bold uppercase border-b pb-2 border-outline-variant">12. Tree, Kanban & Desktop (4 Components)</h2>
        <EnpiiDesktopTitleBar title="Desktop App Title" />
        <EnpiiTreeView :nodes="treeNodes" />
        <EnpiiKanbanBoard :columns="kanbanColumns" :cards="kanbanCards" />
        <EnpiiTransferList :options="transferOptions" v-model="transferVal" />
      </section>
    </main>
  </div>
</template>

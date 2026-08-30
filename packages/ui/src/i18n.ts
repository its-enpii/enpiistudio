import type { InjectionKey } from 'vue'

export type TranslationDictionary = Record<string, string>
export type TranslationMap = Record<string, TranslationDictionary>

export const enpiiI18nKey: InjectionKey<(key: string, params?: Record<string, string | number>) => string> = Symbol('enpii:i18n')

const id: TranslationDictionary = {
  // --- General / Shared ---
  'close': 'Tutup',
  'cancel': 'Batal',
  'delete': 'Hapus',
  'send': 'Kirim',
  'loading': 'Memuat...',
  'approve': 'Setuju',
  'reject': 'Tolak',
  'detail': 'Detail',

  // --- Modal ---
  'modal.close': 'Tutup modal',

  // --- Toast ---
  'toast.close': 'Tutup notifikasi',

  // --- SmartTable ---
  'smartTable.searchPlaceholder': 'Cari data...',
  'smartTable.searchLabel': 'Pencarian',
  'smartTable.clearSearch': 'Hapus pencarian',
  'smartTable.emptyTitle': 'Belum ada data',
  'smartTable.emptyDescription': 'Belum ada data untuk ditampilkan.',
  'smartTable.loading': 'Memuat...',
  'smartTable.summary': 'Menampilkan {from}–{to} dari {total} data',
  'smartTable.previousPage': 'Halaman sebelumnya',
  'smartTable.nextPage': 'Halaman berikutnya',
  'smartTable.perPage': 'Per halaman',
  'smartTable.actionsHeader': 'Aksi',
  'smartTable.perPageLabel': '{count} data',

  // --- SmartSelect ---
  'smartSelect.selectPlaceholder': 'Pilih {label}',
  'smartSelect.clearSelection': 'Hapus pilihan',
  'smartSelect.searchPlaceholder': 'Cari...',
  'smartSelect.noOptions': 'Tidak ada opsi.',
  'smartSelect.loading': 'Memuat...',
  'smartSelect.otherGroup': 'Lainnya',

  // --- DatePicker ---
  'datePicker.selectPlaceholder': 'Pilih {label}',
  'datePicker.clear': 'Hapus',
  'datePicker.today': 'Hari ini',
  'datePicker.thisMonth': 'Bulan ini',
  'datePicker.thisYear': 'Tahun ini',
  'datePicker.previousYear': 'Tahun sebelumnya',
  'datePicker.nextYear': 'Tahun berikutnya',
  'datePicker.previousMonth': 'Bulan sebelumnya',
  'datePicker.nextMonth': 'Bulan berikutnya',

  // --- DateRange ---
  'dateRange.placeholder': 'Pilih rentang tanggal',
  'dateRange.clear': 'Hapus',
  'dateRange.previousMonth': 'Bulan sebelumnya',
  'dateRange.nextMonth': 'Bulan berikutnya',
  'dateRange.invalidRange': 'Tanggal selesai harus setelah tanggal mulai.',

  // --- TimePicker ---
  'timePicker.clearTime': 'Hapus waktu',

  // --- CurrencyInput ---
  'currencyInput.placeholder': 'Masukkan {label}',
  'currencyInput.decrease': 'Kurangi nilai',
  'currencyInput.increase': 'Tambah nilai',

  // --- Input ---
  'input.placeholder': 'Masukkan {label}',

  // --- Textarea ---
  'textarea.placeholder': 'Masukkan {label}',

  // --- CsvImportExport ---
  'csvImportExport.importTitle': 'Impor CSV',
  'csvImportExport.importHint': 'Unggah file CSV (Excel-compatible). Baris pertama harus header.',
  'csvImportExport.importFailed': 'Impor gagal.',
  'csvImportExport.exportButton': 'Export CSV',
  'csvImportExport.importButton': 'Import CSV',
  'csvImportExport.columnsLabel': 'Kolom header',
  'csvImportExport.fileLabel': 'File CSV',
  'csvImportExport.cancel': 'Batal',
  'csvImportExport.import': 'Impor',

  // --- OfflineBanner ---
  'offlineBanner.title': 'Mode Offline (Hanya Baca)',
  'offlineBanner.message': 'Data tetap dapat dibaca & dicetak dari database lokal. Fitur penambahan/perubahan data dinonaktifkan.',
  'offlineBanner.checkServer': 'Cek Server',
  'offlineBanner.checkServerAria': 'Cek koneksi server',
  'offlineBanner.reconnectedTitle': 'Koneksi Pulih',
  'offlineBanner.reconnectedMessage': 'Anda telah terhubung kembali ke server utama.',

  // --- NotificationDropdown ---
  'notification.title': 'Notifikasi',
  'notification.ariaLabel': 'Notifikasi',
  'notification.newCount': '{count} baru',
  'notification.markAllRead': 'Tandai semua dibaca',
  'notification.tabAll': 'Semua ({count})',
  'notification.tabUnread': 'Belum Dibaca ({count})',
  'notification.loading': 'Memuat notifikasi...',
  'notification.emptyAll': 'Tidak ada notifikasi.',
  'notification.emptyUnread': 'Tidak ada notifikasi belum dibaca.',
  'notification.byActor': 'Oleh',
  'notification.whatsappReminder': 'Pengingat WhatsApp',
  'notification.enpiiBilling': 'Tagihan Enpii',

  // --- DesktopSplashScreen ---
  'splash.welcome': 'Selamat Datang',
  'splash.loadingModules': 'Memuat modul sistem...',
  'splash.preparingDb': 'Menyiapkan database lokal...',
  'splash.checkingAuth': 'Memeriksa otentikasi...',
  'splash.ready': 'Siap!',
  'splash.savingSession': 'Menyimpan sesi & mengamankan data...',
  'splash.goodbye': 'Sampai Jumpa!',
  'splash.closingApp': 'Menutup aplikasi dengan aman...',
  'splash.footer': 'Sistem Informasi Dana Bergulir Masyarakat',

  // --- DesktopTitleBar ---
  'titleBar.officer': 'Petugas',
  'titleBar.syncing': 'Menyinkronkan...',
  'titleBar.syncSuccess': 'Sinkronisasi berhasil!',
  'titleBar.syncSuccessNotification': 'Sinkronisasi Berhasil',
  'titleBar.syncSuccessBody': 'Data lokal diperbarui dari cloud oleh {user}.',
  'titleBar.syncFailed': 'Sinkronisasi gagal.',
  'titleBar.connectionFailed': 'Koneksi gagal.',
  'titleBar.syncButton': 'Sinkron',
  'titleBar.onlineTitle': 'Aplikasi terhubung langsung dengan server cloud',
  'titleBar.offlineTitle': 'Aplikasi dalam mode offline lokal (Hanya Baca dari SQLite)',
  'titleBar.offlineLabel': 'Offline (Hanya Baca)',
  'titleBar.syncTitle': 'Sinkronkan data dari cloud server',
  'titleBar.closeTitle': 'Keluar & Tutup Aplikasi',
  'titleBar.savingSession': 'Menyimpan sesi & mengamankan data...',

  // --- KeyboardShortcutsModal ---
  'shortcuts.title': 'Pintasan Keyboard (Shortcuts)',
  'shortcuts.intro': 'Gunakan kombinasi tombol berikut untuk mempercepat navigasi dan pengoperasian aplikasi di {desktop} maupun {website}.',
  'shortcuts.tip': 'Pintasan kombinasi {key} dapat ditekan kapan saja tanpa mengganggu pengetikan formulir.',
  'shortcuts.groupSearch': 'Pencarian & Bantuan',
  'shortcuts.groupNav': 'Navigasi Menu Utama',
  'shortcuts.groupActions': 'Aksi Cepat & Sistem',
  'shortcuts.openSearch': 'Buka Pencarian Cepat / Command Palette',
  'shortcuts.toggleAssistant': 'Buka / Tutup Ariel AI Assistant',
  'shortcuts.openHelp': 'Buka Bantuan Pintasan Keyboard',
  'shortcuts.closeDialog': 'Tutup Dialog / Modal / Menu Terbuka',
  'shortcuts.gotoDashboard': 'Ke Halaman Dashboard',
  'shortcuts.gotoJournal': 'Ke Halaman Jurnal Umum',
  'shortcuts.gotoLoans': 'Ke Halaman Pinjaman & Pembiayaan',
  'shortcuts.gotoMembers': 'Ke Halaman Data Nasabah / Anggota',
  'shortcuts.gotoGroups': 'Ke Halaman Data Kelompok',
  'shortcuts.gotoReports': 'Ke Halaman Laporan Keuangan',
  'shortcuts.gotoBudget': 'Ke Halaman E-Budgeting',
  'shortcuts.gotoClosing': 'Ke Halaman Tutup Buku',
  'shortcuts.syncData': 'Sinkronisasi Data Lokal (Desktop / Cloud)',
  'shortcuts.toggleNotification': 'Buka / Tutup Notifikasi',
  'shortcuts.printReport': 'Cetak Laporan / Halaman Aktif',

  // --- LoanHistoryTable ---
  'loanHistory.emptyTitle': 'Belum ada riwayat pinjaman',
  'loanHistory.emptyDescription': 'Tidak ditemukan pinjaman terkait entitas ini.',
  'loanHistory.headerLoan': 'Pinjaman',
  'loanHistory.headerProduct': 'Produk',
  'loanHistory.headerRole': 'Peran',
  'loanHistory.headerCeiling': 'Plafon',
  'loanHistory.headerRemaining': 'Sisa Pokok',
  'loanHistory.headerDisbursed': 'Cair',
  'loanHistory.headerStatus': 'Status',
  'loanHistory.allocation': 'alokasi {amount}',
  'loanHistory.statusProposal': 'Proposal',
  'loanHistory.statusVerification': 'Verifikasi',
  'loanHistory.statusApproved': 'Disetujui',
  'loanHistory.statusActive': 'Aktif',
  'loanHistory.statusCompleted': 'Lunas',
  'loanHistory.statusWrittenOff': 'Hapus buku',
  'loanHistory.roleBorrower': 'Peminjam',
  'loanHistory.roleBeneficiary': 'Pemanfaat',
  'loanHistory.roleGroup': 'Kelompok',

  // --- ReportPeriodFilter ---
  'reportPeriod.yearLabel': 'Tahun',
  'reportPeriod.monthLabel': 'Bulan',
  'reportPeriod.dayLabel': 'Tanggal',
  'reportPeriod.allMonths': 'Semua bulan',
  'reportPeriod.allDays': 'Semua tanggal',
  'reportPeriod.show': 'Tampilkan',

  // --- RichEditor ---
  'richEditor.placeholder': 'Tulis konten…',
  'richEditor.toolbarLabel': 'Format teks',
  'richEditor.bold': 'Tebal',
  'richEditor.italic': 'Miring',
  'richEditor.underline': 'Garis bawah',
  'richEditor.strike': 'Dicoret',
  'richEditor.orderedList': 'Daftar bernomor',

  // --- AssistantWidget ---
  'assistant.typing': 'Sedang mengetik',
  'assistant.greetingMorning': 'Selamat pagi',
  'assistant.greetingSiang': 'Selamat siang',
  'assistant.greetingSore': 'Selamat sore',
  'assistant.greetingNight': 'Selamat malam',
  'assistant.greetingHelp': '{greeting}, apa yang bisa {name} bantu hari ini?',
  'assistant.greetingReady': 'Butuh bantuan? {name} siap membantu.',
  'assistant.greetingTransaction': 'Perlu bantuan mencatat transaksi? Mungkin {name} bisa bantu.',
  'assistant.greetingSearch': 'Halo! {name} di sini. Ada data yang ingin dicari?',
  'assistant.greetingCheckData': '{greeting}. {name} siap bantu cek angsuran, jurnal, atau data anggota.',
  'assistant.streamUnavailable': 'Stream tidak tersedia.',
  'assistant.searchingData': 'Mencari data…',
  'assistant.dataIncomplete': 'Data tidak lengkap, menyusun jawaban…',
  'assistant.composingAnswer': 'Menyusun jawaban…',
  'assistant.confirmAction': 'Konfirmasi aksi',
  'assistant.actionNeedsConfirm': 'Aksi membutuhkan konfirmasi.',
  'assistant.imageAttachment': 'Berikut lampiran gambar untuk dianalisis.',
  'assistant.imageAlt': 'Gambar terlampir',
  'assistant.failedMessage': 'Maaf, saya belum bisa merangkai jawaban. Coba ulangi pertanyaan atau sebutkan lebih spesifik.',
  'assistant.failedSend': 'Gagal mengirim pesan.',
  'assistant.failedConfirm': 'Gagal konfirmasi.',
  'assistant.executingAction': 'Menjalankan aksi…',
  'assistant.cancellingAction': 'Membatalkan…',
  'assistant.actionExecuted': 'Aksi dijalankan.',
  'assistant.actionCancelled': 'Aksi dibatalkan.',
  'assistant.errorAssistant': 'Terjadi kesalahan asisten.',
  'assistant.maxImageSize': 'Ukuran gambar maksimal 10MB.',
  'assistant.removeImage': 'Hapus gambar',
  'assistant.attachImage': 'Lampirkan Gambar',
  'assistant.send': 'Kirim',
  'assistant.inputPlaceholder': 'Tulis ke {name}...',
  'assistant.close': 'Tutup asisten',
  'assistant.openToggle': 'Buka {name}',

  // --- AssistantArtifactCard ---
  'artifactCard.open': 'Buka {title}',

  // --- AssistantPollCard ---
  'pollCard.placeholder': 'Tulis jawaban…',

  // --- Rating ---
  'rating.ariaLabel': 'Nilai bintang',
  'rating.valueAria': '{value} dari {max} bintang',
  'rating.setAria': 'Beri nilai {value} dari {max}',

  // --- SegmentedControl ---
  'segmentedControl.ariaLabel': 'Pilihan segmented',

  // --- ThemeMenu ---
  'themeMenu.ariaLabel': 'Pilih tema tampilan',
  'themeMenu.selectTheme': 'Pilih tema {label}',

  // --- TrendBarChart ---
  'trendChart.ariaLabel': 'Tren pencairan dan penerimaan angsuran 6 bulan',

  // --- AssistantPollCard ---
  'pollCard.pollingLabel': 'Polling: {question}',
}

const en: TranslationDictionary = {
  // --- General / Shared ---
  'close': 'Close',
  'cancel': 'Cancel',
  'delete': 'Delete',
  'send': 'Send',
  'loading': 'Loading...',
  'approve': 'Approve',
  'reject': 'Reject',
  'detail': 'Detail',

  // --- Modal ---
  'modal.close': 'Close modal',

  // --- Toast ---
  'toast.close': 'Close notification',

  // --- SmartTable ---
  'smartTable.searchPlaceholder': 'Search data...',
  'smartTable.searchLabel': 'Search',
  'smartTable.clearSearch': 'Clear search',
  'smartTable.emptyTitle': 'No data yet',
  'smartTable.emptyDescription': 'No data to display.',
  'smartTable.loading': 'Loading...',
  'smartTable.summary': 'Showing {from}–{to} of {total} entries',
  'smartTable.previousPage': 'Previous page',
  'smartTable.nextPage': 'Next page',
  'smartTable.perPage': 'Per page',
  'smartTable.actionsHeader': 'Actions',
  'smartTable.perPageLabel': '{count} entries',

  // --- SmartSelect ---
  'smartSelect.selectPlaceholder': 'Select {label}',
  'smartSelect.clearSelection': 'Clear selection',
  'smartSelect.searchPlaceholder': 'Search...',
  'smartSelect.noOptions': 'No options.',
  'smartSelect.loading': 'Loading...',
  'smartSelect.otherGroup': 'Other',

  // --- DatePicker ---
  'datePicker.selectPlaceholder': 'Select {label}',
  'datePicker.clear': 'Clear',
  'datePicker.today': 'Today',
  'datePicker.thisMonth': 'This month',
  'datePicker.thisYear': 'This year',
  'datePicker.previousYear': 'Previous year',
  'datePicker.nextYear': 'Next year',
  'datePicker.previousMonth': 'Previous month',
  'datePicker.nextMonth': 'Next month',

  // --- DateRange ---
  'dateRange.placeholder': 'Select date range',
  'dateRange.clear': 'Clear',
  'dateRange.previousMonth': 'Previous month',
  'dateRange.nextMonth': 'Next month',
  'dateRange.invalidRange': 'End date must be after start date.',

  // --- TimePicker ---
  'timePicker.clearTime': 'Clear time',

  // --- CurrencyInput ---
  'currencyInput.placeholder': 'Enter {label}',
  'currencyInput.decrease': 'Decrease value',
  'currencyInput.increase': 'Increase value',

  // --- Input ---
  'input.placeholder': 'Enter {label}',

  // --- Textarea ---
  'textarea.placeholder': 'Enter {label}',

  // --- CsvImportExport ---
  'csvImportExport.importTitle': 'Import CSV',
  'csvImportExport.importHint': 'Upload a CSV file (Excel-compatible). The first row must be headers.',
  'csvImportExport.importFailed': 'Import failed.',
  'csvImportExport.exportButton': 'Export CSV',
  'csvImportExport.importButton': 'Import CSV',
  'csvImportExport.columnsLabel': 'Header columns',
  'csvImportExport.fileLabel': 'CSV File',
  'csvImportExport.cancel': 'Cancel',
  'csvImportExport.import': 'Import',

  // --- OfflineBanner ---
  'offlineBanner.title': 'Offline Mode (Read Only)',
  'offlineBanner.message': 'Data can still be read & printed from the local database. Adding/editing data is disabled.',
  'offlineBanner.checkServer': 'Check Server',
  'offlineBanner.checkServerAria': 'Check server connection',
  'offlineBanner.reconnectedTitle': 'Connection Restored',
  'offlineBanner.reconnectedMessage': 'You have reconnected to the main server.',

  // --- NotificationDropdown ---
  'notification.title': 'Notifications',
  'notification.ariaLabel': 'Notifications',
  'notification.newCount': '{count} new',
  'notification.markAllRead': 'Mark all as read',
  'notification.tabAll': 'All ({count})',
  'notification.tabUnread': 'Unread ({count})',
  'notification.loading': 'Loading notifications...',
  'notification.emptyAll': 'No notifications.',
  'notification.emptyUnread': 'No unread notifications.',
  'notification.byActor': 'By',
  'notification.whatsappReminder': 'WhatsApp Reminders',
  'notification.enpiiBilling': 'Enpii Billing',

  // --- DesktopSplashScreen ---
  'splash.welcome': 'Welcome',
  'splash.loadingModules': 'Loading system modules...',
  'splash.preparingDb': 'Preparing local database...',
  'splash.checkingAuth': 'Checking authentication...',
  'splash.ready': 'Ready!',
  'splash.savingSession': 'Saving session & securing data...',
  'splash.goodbye': 'Goodbye!',
  'splash.closingApp': 'Closing application safely...',
  'splash.footer': 'Community Revolving Fund Information System',

  // --- DesktopTitleBar ---
  'titleBar.officer': 'Officer',
  'titleBar.syncing': 'Syncing...',
  'titleBar.syncSuccess': 'Sync successful!',
  'titleBar.syncSuccessNotification': 'Sync Successful',
  'titleBar.syncSuccessBody': 'Local data updated from cloud by {user}.',
  'titleBar.syncFailed': 'Sync failed.',
  'titleBar.connectionFailed': 'Connection failed.',
  'titleBar.syncButton': 'Sync',
  'titleBar.onlineTitle': 'Application is directly connected to cloud server',
  'titleBar.offlineTitle': 'Application in offline local mode (Read Only from SQLite)',
  'titleBar.offlineLabel': 'Offline (Read Only)',
  'titleBar.syncTitle': 'Sync data from cloud server',
  'titleBar.closeTitle': 'Quit & Close Application',
  'titleBar.savingSession': 'Saving session & securing data...',

  // --- KeyboardShortcutsModal ---
  'shortcuts.title': 'Keyboard Shortcuts',
  'shortcuts.intro': 'Use the following key combinations to speed up navigation and application operation on {desktop} and {website}.',
  'shortcuts.tip': 'Shortcut combinations with {key} can be pressed anytime without interrupting form input.',
  'shortcuts.groupSearch': 'Search & Help',
  'shortcuts.groupNav': 'Main Menu Navigation',
  'shortcuts.groupActions': 'Quick Actions & System',
  'shortcuts.openSearch': 'Open Quick Search / Command Palette',
  'shortcuts.toggleAssistant': 'Open / Close Ariel AI Assistant',
  'shortcuts.openHelp': 'Open Keyboard Shortcuts Help',
  'shortcuts.closeDialog': 'Close Dialog / Modal / Open Menu',
  'shortcuts.gotoDashboard': 'Go to Dashboard',
  'shortcuts.gotoJournal': 'Go to General Ledger',
  'shortcuts.gotoLoans': 'Go to Loans & Financing',
  'shortcuts.gotoMembers': 'Go to Customer / Member Data',
  'shortcuts.gotoGroups': 'Go to Group Data',
  'shortcuts.gotoReports': 'Go to Financial Reports',
  'shortcuts.gotoBudget': 'Go to E-Budgeting',
  'shortcuts.gotoClosing': 'Go to Book Closing',
  'shortcuts.syncData': 'Sync Local Data (Desktop / Cloud)',
  'shortcuts.toggleNotification': 'Open / Close Notifications',
  'shortcuts.printReport': 'Print Report / Active Page',

  // --- LoanHistoryTable ---
  'loanHistory.emptyTitle': 'No loan history yet',
  'loanHistory.emptyDescription': 'No loans found related to this entity.',
  'loanHistory.headerLoan': 'Loan',
  'loanHistory.headerProduct': 'Product',
  'loanHistory.headerRole': 'Role',
  'loanHistory.headerCeiling': 'Ceiling',
  'loanHistory.headerRemaining': 'Remaining Principal',
  'loanHistory.headerDisbursed': 'Disbursed',
  'loanHistory.headerStatus': 'Status',
  'loanHistory.allocation': 'allocation {amount}',
  'loanHistory.statusProposal': 'Proposal',
  'loanHistory.statusVerification': 'Verification',
  'loanHistory.statusApproved': 'Approved',
  'loanHistory.statusActive': 'Active',
  'loanHistory.statusCompleted': 'Paid Off',
  'loanHistory.statusWrittenOff': 'Written Off',
  'loanHistory.roleBorrower': 'Borrower',
  'loanHistory.roleBeneficiary': 'Beneficiary',
  'loanHistory.roleGroup': 'Group',

  // --- ReportPeriodFilter ---
  'reportPeriod.yearLabel': 'Year',
  'reportPeriod.monthLabel': 'Month',
  'reportPeriod.dayLabel': 'Date',
  'reportPeriod.allMonths': 'All months',
  'reportPeriod.allDays': 'All dates',
  'reportPeriod.show': 'Show',

  // --- RichEditor ---
  'richEditor.placeholder': 'Write content…',
  'richEditor.toolbarLabel': 'Text formatting',
  'richEditor.bold': 'Bold',
  'richEditor.italic': 'Italic',
  'richEditor.underline': 'Underline',
  'richEditor.strike': 'Strikethrough',
  'richEditor.orderedList': 'Numbered list',

  // --- AssistantWidget ---
  'assistant.typing': 'Typing',
  'assistant.greetingMorning': 'Good morning',
  'assistant.greetingSiang': 'Good afternoon',
  'assistant.greetingSore': 'Good evening',
  'assistant.greetingNight': 'Good night',
  'assistant.greetingHelp': '{greeting}, what can {name} help you with today?',
  'assistant.greetingReady': 'Need help? {name} is ready to assist.',
  'assistant.greetingTransaction': 'Need help recording a transaction? {name} can help.',
  'assistant.greetingSearch': 'Hello! {name} here. Any data you want to find?',
  'assistant.greetingCheckData': '{greeting}. {name} is ready to help check installments, journals, or member data.',
  'assistant.streamUnavailable': 'Stream is not available.',
  'assistant.searchingData': 'Searching data…',
  'assistant.dataIncomplete': 'Incomplete data, composing answer…',
  'assistant.composingAnswer': 'Composing answer…',
  'assistant.confirmAction': 'Confirm action',
  'assistant.actionNeedsConfirm': 'This action requires confirmation.',
  'assistant.imageAttachment': 'Here is an image attachment for analysis.',
  'assistant.imageAlt': 'Attached image',
  'assistant.failedMessage': 'Sorry, I could not compose an answer. Please rephrase your question or be more specific.',
  'assistant.failedSend': 'Failed to send message.',
  'assistant.failedConfirm': 'Confirmation failed.',
  'assistant.executingAction': 'Executing action…',
  'assistant.cancellingAction': 'Cancelling…',
  'assistant.actionExecuted': 'Action executed.',
  'assistant.actionCancelled': 'Action cancelled.',
  'assistant.errorAssistant': 'An assistant error occurred.',
  'assistant.maxImageSize': 'Maximum image size is 10MB.',
  'assistant.removeImage': 'Remove image',
  'assistant.attachImage': 'Attach Image',
  'assistant.send': 'Send',
  'assistant.inputPlaceholder': 'Write to {name}...',
  'assistant.close': 'Close assistant',
  'assistant.openToggle': 'Open {name}',

  // --- AssistantArtifactCard ---
  'artifactCard.open': 'Open {title}',

  // --- AssistantPollCard ---
  'pollCard.placeholder': 'Write your answer…',

  // --- Rating ---
  'rating.ariaLabel': 'Star rating',
  'rating.valueAria': '{value} of {max} stars',
  'rating.setAria': 'Set rating to {value} of {max}',

  // --- SegmentedControl ---
  'segmentedControl.ariaLabel': 'Segmented options',

  // --- ThemeMenu ---
  'themeMenu.ariaLabel': 'Select display theme',
  'themeMenu.selectTheme': 'Select theme {label}',

  // --- TrendBarChart ---
  'trendChart.ariaLabel': 'Disbursement and installment receipt trend for 6 months',

  // --- AssistantPollCard ---
  'pollCard.pollingLabel': 'Polling: {question}',
}

export const builtinDictionaries: TranslationMap = { id, en }

export function createT(
  locale: string,
  overrides: TranslationMap = {},
): (key: string, params?: Record<string, string | number>) => string {
  const merged: TranslationMap = {}
  for (const lang of Object.keys(builtinDictionaries)) {
    merged[lang] = { ...builtinDictionaries[lang], ...overrides[lang] }
  }
  for (const lang of Object.keys(overrides)) {
    if (!merged[lang]) {
      merged[lang] = { ...overrides[lang] }
    }
  }

  return (key: string, params?: Record<string, string | number>): string => {
    const dict = merged[locale] ?? merged.id ?? {}
    const fallback = merged.id ?? {}
    let text = dict[key] ?? fallback[key] ?? key

    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
      }
    }

    return text
  }
}

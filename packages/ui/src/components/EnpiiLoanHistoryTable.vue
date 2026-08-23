<script setup>
import { inject } from 'vue';
import { useShape } from '../composables/useShape';
import { enpiiNavigationKey } from '../plugin';
import AppBadge from './EnpiiBadge.vue';

const emit = defineEmits(['navigate']);
const navigation = inject(enpiiNavigationKey, { navigate: () => {} });

const props = defineProps({
    loans: { type: Array, default: () => [] },
    emptyTitle: { type: String, default: 'Belum ada riwayat pinjaman' },
    emptyDescription: { type: String, default: 'Tidak ditemukan pinjaman terkait entitas ini.' },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);

const money = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
function formatMoney(v) {
    if (v === null || v === undefined) return '—';
    return money.format(Number(v || 0));
}
function formatDate(v) {
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}

const statusMeta = {
    draft: { label: 'Proposal', tone: 'neutral' },
    verified: { label: 'Verifikasi', tone: 'warning' },
    waiting: { label: 'Waiting', tone: 'warning' },
    approved: { label: 'Disetujui', tone: 'warning' },
    active: { label: 'Aktif', tone: 'success' },
    disbursed: { label: 'Aktif', tone: 'success' },
    completed: { label: 'Lunas', tone: 'primary' },
    written_off: { label: 'Hapus buku', tone: 'error' },
    rescheduled: { label: 'Reschedule', tone: 'neutral' },
};

const roleLabels = {
    borrower: 'Peminjam',
    beneficiary: 'Pemanfaat',
    'borrower+beneficiary': 'Peminjam',
    group: 'Kelompok',
};
</script>

<template>
    <div class="enpii-loan-history-table" :class="shapeClass">
        <table class="enpii-loan-history-table__table">
            <thead class="enpii-loan-history-table__head">
                <tr>
                    <th class="enpii-loan-history-table__th">Pinjaman</th>
                    <th class="enpii-loan-history-table__th">Produk</th>
                    <th class="enpii-loan-history-table__th">Peran</th>
                    <th class="enpii-loan-history-table__th enpii-loan-history-table__th--right">Plafon</th>
                    <th class="enpii-loan-history-table__th enpii-loan-history-table__th--right">Sisa Pokok</th>
                    <th class="enpii-loan-history-table__th">Cair</th>
                    <th class="enpii-loan-history-table__th">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="loans.length === 0">
                    <td colspan="7" class="enpii-loan-history-table__empty">
                        <p class="enpii-loan-history-table__empty-title">{{ emptyTitle }}</p>
                        <p class="enpii-loan-history-table__empty-description">{{ emptyDescription }}</p>
                    </td>
                </tr>
                <tr
                    v-for="loan in loans"
                    :key="loan.row_id"
                    class="enpii-loan-history-table__row"
                >
                    <td class="enpii-loan-history-table__td">
                        <button type="button" class="enpii-loan-history-table__link" @click="navigation.navigate(loan.href); emit('navigate', loan.href)">
                            #{{ loan.id }}
                        </button>
                        <div v-if="loan.loan_number" class="enpii-loan-history-table__meta enpii-loan-history-table__meta--tiny">
                            {{ loan.loan_number }}
                        </div>
                        <div v-if="loan.group_name" class="enpii-loan-history-table__meta enpii-loan-history-table__meta--small">
                            {{ loan.group_name }}
                        </div>
                    </td>
                    <td class="enpii-loan-history-table__td">
                        <span class="enpii-loan-history-table__product">{{ (loan.product_code || '—').toUpperCase() }}</span>
                        <div class="enpii-loan-history-table__meta enpii-loan-history-table__meta--small">{{ loan.product_name || '' }}</div>
                    </td>
                    <td class="enpii-loan-history-table__td"><div class="enpii-loan-history-table__meta">
                        {{ roleLabels[loan.role] || loan.role || '—' }}
                        </div>
                        <div v-if="loan.allocated_amount != null" class="enpii-loan-history-table__meta enpii-loan-history-table__meta--small">
                            alokasi {{ formatMoney(loan.allocated_amount) }}
                        </div>
                    </td>
                    <td class="enpii-loan-history-table__td enpii-loan-history-table__amount">{{ formatMoney(loan.principal_amount) }}</td>
                    <td class="enpii-loan-history-table__td enpii-loan-history-table__amount">
                        {{ formatMoney(loan.principal_remaining) }}
                    </td>
                    <td class="enpii-loan-history-table__td enpii-loan-history-table__date">{{ formatDate(loan.disbursed_at || loan.proposed_at) }}</td>
                    <td class="enpii-loan-history-table__td">
                        <AppBadge :tone="(statusMeta[loan.status] || statusMeta.draft).tone">
                            {{ (statusMeta[loan.status] || { label: loan.status }).label }}
                        </AppBadge>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

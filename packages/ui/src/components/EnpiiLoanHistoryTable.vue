<script setup>
import { inject } from 'vue';
import { useShape } from '../composables/useShape';
import { enpiiNavigationKey } from '../plugin';
import AppBadge from './EnpiiBadge.vue';
import { useT } from '../composables/useT'

const t = useT()

const emit = defineEmits(['navigate']);
const navigation = inject(enpiiNavigationKey, { navigate: () => {} });

const props = defineProps({
    loans: { type: Array, default: () => [] },
    emptyTitle: { type: String, default: undefined },
    emptyDescription: { type: String, default: undefined },
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
    written_off: { label: t('loanHistory.statusWrittenOff'), tone: 'error' },
    rescheduled: { label: 'Reschedule', tone: 'neutral' },
};

const roleLabels = {
    borrower: t('loanHistory.roleBorrower'),
    beneficiary: t('loanHistory.roleBeneficiary'),
    'borrower+beneficiary': t('loanHistory.roleBorrower'),
    group: 'Kelompok',
};
</script>

<template>
    <div class="enpii-loan-history-table max-h-[28rem] overflow-auto" :class="shapeClass">
        <table class="enpii-loan-history-table__table w-full border-collapse text-sm">
            <thead class="enpii-loan-history-table__head sticky top-0 z-raised bg-surface-container-low text-on-surface-variant text-xs font-semibold">
                <tr>
                    <th class="enpii-loan-history-table__th px-3 py-2 text-left">{{ t('loanHistory.headerLoan') }}</th>
                    <th class="enpii-loan-history-table__th px-3 py-2 text-left">{{ t('loanHistory.headerProduct') }}</th>
                    <th class="enpii-loan-history-table__th px-3 py-2 text-left">{{ t('loanHistory.headerRole') }}</th>
                    <th class="enpii-loan-history-table__th px-3 py-2 text-right">{{ t('loanHistory.headerCeiling') }}</th>
                    <th class="enpii-loan-history-table__th px-3 py-2 text-right">{{ t('loanHistory.headerRemaining') }}</th>
                    <th class="enpii-loan-history-table__th px-3 py-2 text-left">{{ t('loanHistory.headerDisbursed') }}</th>
                    <th class="enpii-loan-history-table__th px-3 py-2 text-left">{{ t('loanHistory.headerStatus') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="loans.length === 0">
                    <td colspan="7" class="enpii-loan-history-table__empty px-3 py-10 text-center">
                        <p class="enpii-loan-history-table__empty-title m-0 font-semibold text-on-surface">{{ emptyTitle }}</p>
                        <p class="enpii-loan-history-table__empty-description mt-1 mb-0 text-on-surface-variant text-sm">{{ emptyDescription }}</p>
                    </td>
                </tr>
                <tr
                    v-for="loan in loans"
                    :key="loan.row_id"
                    class="enpii-loan-history-table__row"
                >
                    <td class="enpii-loan-history-table__td px-3 py-2">
                        <button type="button" class="enpii-loan-history-table__link border-0 bg-none font-semibold text-primary-text hover:underline focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus focus-visible:outline-offset-2" @click="navigation.navigate(loan.href); emit('navigate', loan.href)">
                            #{{ loan.id }}
                        </button>
                        <div v-if="loan.loan_number" class="enpii-loan-history-table__meta text-on-surface-variant text-[.625rem]">
                            {{ loan.loan_number }}
                        </div>
                        <div v-if="loan.group_name" class="enpii-loan-history-table__meta text-on-surface-variant text-xs">
                            {{ loan.group_name }}
                        </div>
                    </td>
                    <td class="enpii-loan-history-table__td px-3 py-2">
                        <span class="enpii-loan-history-table__product font-medium">{{ (loan.product_code || '—').toUpperCase() }}</span>
                        <div class="enpii-loan-history-table__meta text-on-surface-variant text-xs">{{ loan.product_name || '' }}</div>
                    </td>
                    <td class="enpii-loan-history-table__td px-3 py-2"><div class="enpii-loan-history-table__meta text-on-surface-variant">
                        {{ roleLabels[loan.role] || loan.role || '—' }}
                        </div>
                        <div v-if="loan.allocated_amount != null" class="enpii-loan-history-table__meta text-on-surface-variant text-xs">
                            {{ t('loanHistory.allocation', { amount: formatMoney(loan.allocated_amount) }) }}
                        </div>
                    </td>
                    <td class="enpii-loan-history-table__td px-3 py-2 text-right font-semibold tabular-nums">{{ formatMoney(loan.principal_amount) }}</td>
                    <td class="enpii-loan-history-table__td px-3 py-2 text-right font-semibold tabular-nums">
                        {{ formatMoney(loan.principal_remaining) }}
                    </td>
                    <td class="enpii-loan-history-table__td whitespace-nowrap px-3 py-2">{{ formatDate(loan.disbursed_at || loan.proposed_at) }}</td>
                    <td class="enpii-loan-history-table__td px-3 py-2">
                        <AppBadge :tone="(statusMeta[loan.status] || statusMeta.draft).tone">
                            {{ (statusMeta[loan.status] || { label: loan.status }).label }}
                        </AppBadge>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue';
import { enpiiNavigationKey } from '../plugin';
import AppButton from './EnpiiButton.vue';
import AppIcon from './EnpiiIcon.vue';
import AppDatePicker from './EnpiiDatePicker.vue';
import { useShape } from '../composables/useShape';

const props = defineProps({
    year: { type: [Number, String], required: true },
    /** null | 'all' | 1–12 */
    month: { type: [Number, String], default: null },
    /** YYYY-MM-DD or null — only for journals / general ledger */
    day: { type: String, default: null },
    showDay: { type: Boolean, default: false },
    baseUrl: { type: String, required: true },
    extra: { type: Object, default: () => ({}) },
    pdfUrl: { type: String, default: null },
    excelUrl: { type: String, default: null },
    shape: {
        type: String,
        default: 'rounded',
        validator: (value) => ['rounded', 'pill', 'sharp'].includes(value),
    },
});

const shapeClass = useShape(props);
const emit = defineEmits(['navigate']);
const navigation = inject(enpiiNavigationKey, { navigate: () => {} });

const selectedYear = ref(toYearValue(props.year));
const selectedMonth = ref(toMonthValue(props.year, props.month));
const selectedDay = ref(props.day && /^\d{4}-\d{2}-\d{2}$/.test(props.day) ? props.day : '');

watch(
    () => [props.year, props.month, props.day],
    () => {
        selectedYear.value = toYearValue(props.year);
        selectedMonth.value = toMonthValue(props.year, props.month);
        selectedDay.value = props.day && /^\d{4}-\d{2}-\d{2}$/.test(props.day) ? props.day : '';
    },
);

watch(selectedYear, (y) => {
    if (!y) return;
    // Keep month empty if cleared; otherwise retarget year part.
    if (selectedMonth.value) {
        const m = selectedMonth.value.slice(5, 7);
        selectedMonth.value = `${y}-${m}`;
    }
    if (selectedDay.value) {
        const rest = selectedDay.value.slice(4); // -MM-DD
        selectedDay.value = `${y}${rest}`;
    }
});

watch(selectedMonth, (m) => {
    if (!m) {
        // Empty month ⇒ clear day (day needs a month context).
        selectedDay.value = '';
        return;
    }
    if (selectedDay.value) {
        const d = selectedDay.value.slice(8, 10);
        selectedDay.value = `${m}-${d}`;
    }
});

const dayMax = computed(() => {
    if (selectedMonth.value) {
        const [y, m] = selectedMonth.value.split('-').map(Number);
        const last = new Date(y, m, 0).getDate();
        return `${selectedMonth.value}-${String(last).padStart(2, '0')}`;
    }
    if (selectedYear.value) {
        return `${selectedYear.value}-12-31`;
    }
    return null;
});

const queryBase = computed(() => {
    const year = selectedYear.value || String(props.year);
    const month = selectedMonth.value ? String(Number(selectedMonth.value.slice(5, 7))) : 'all';
    const q = {
        year,
        month,
        ...props.extra,
    };
    if (props.showDay && selectedDay.value) {
        q.day = selectedDay.value;
    }
    Object.keys(q).forEach((k) => {
        if (q[k] === null || q[k] === undefined || q[k] === '') delete q[k];
    });
    return q;
});

function apply() {
    navigation.navigate(props.baseUrl, {
        params: queryBase.value,
        preserveScroll: true,
        replace: true,
    });
    emit('navigate', { url: props.baseUrl, parameters: queryBase.value });
}

function excelHref() {
    if (!props.excelUrl) return '#';
    const params = new URLSearchParams(
        Object.fromEntries(Object.entries(queryBase.value).map(([k, v]) => [k, String(v)])),
    );
    return `${props.excelUrl}?${params.toString()}`;
}

function pdfHref() {
    if (!props.pdfUrl) return '#';
    const params = new URLSearchParams(
        Object.fromEntries(Object.entries(queryBase.value).map(([k, v]) => [k, String(v)])),
    );
    return `${props.pdfUrl}?${params.toString()}`;
}

function toYearValue(year) {
    const y = Number(year);
    return y >= 2000 && y <= 2100 ? String(y) : String(new Date().getFullYear());
}

function toMonthValue(year, month) {
    if (month === null || month === undefined || month === '' || month === 'all') return '';
    const m = Number(month);
    if (m < 1 || m > 12) return '';
    const y = toYearValue(year);
    return `${y}-${String(m).padStart(2, '0')}`;
}
</script>

<template>
    <div class="enpii-report-period-filter">
        <div class="enpii-report-period-filter__fields" :class="{ 'enpii-report-period-filter__fields--day': showDay }">
            <AppDatePicker v-model="selectedYear" label="Tahun" mode="year" required />
            <AppDatePicker
                v-model="selectedMonth"
                label="Bulan"
                mode="month"
                clearable
                placeholder="Semua bulan"
            />
            <AppDatePicker
                v-if="showDay"
                v-model="selectedDay"
                label="Tanggal"
                mode="date"
                clearable
                placeholder="Semua tanggal"
                :min="selectedMonth ? `${selectedMonth}-01` : selectedYear ? `${selectedYear}-01-01` : null"
                :max="dayMax"
            />
        </div>
        <slot name="extra" />
        <div class="enpii-report-period-filter__actions">
            <AppButton type="button" size="large" @click="apply">Tampilkan</AppButton>
            <a
                v-if="pdfUrl"
                :href="pdfHref()"
                target="_blank"
                rel="noopener"
                class="enpii-report-period-filter__export"
                :class="shapeClass"
            >
                PDF
            </a>
            <a
                v-if="excelUrl"
                :href="excelHref()"
                class="enpii-report-period-filter__export"
                :class="shapeClass"
            >
                <AppIcon name="table_view" class="enpii-report-period-filter__export-icon" />
                Excel
            </a>
        </div>
    </div>
</template>

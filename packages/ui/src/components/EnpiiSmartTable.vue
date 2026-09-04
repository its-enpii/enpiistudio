<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { inject } from "vue";
import { enpiiNavigationKey } from "../plugin";
import AppButton from "./EnpiiButton.vue";
import AppEmptyState from "./EnpiiEmptyState.vue";
import AppIcon from "./EnpiiIcon.vue";
import AppInput from "./EnpiiInput.vue";
import EnpiiSmartSelect from "./EnpiiSmartSelect.vue";
import { useShape } from "../composables/useShape";
import { useT } from "../composables/useT";

const t = useT();

const props = defineProps({
    rows: { type: Array, default: () => [] },
    columns: { type: Array, required: true },
    pagination: {
        type: Object,
        default: () => ({ current_page: 1, last_page: 1, from: 1, to: 0, total: 0 }),
    },
    url: { type: String, default: "" },
    search: { type: String, default: "" },
    searchPlaceholder: { type: String, default: undefined },
    searchLabel: { type: String, default: undefined },
    perPageOptions: { type: Array, default: () => [15, 30, 50, 100] },
    perPage: { type: [Number, String], default: 15 },
    sort: { type: String, default: "" },
    direction: { type: String, default: "asc" },
    emptyTitle: { type: String, default: undefined },
    emptyDescription: { type: String, default: undefined },
    hideToolbar: { type: Boolean, default: false },
    hidePagination: { type: Boolean, default: false },
    hideSearch: { type: Boolean, default: false },
    hidePerPage: { type: Boolean, default: false },
    shape: {
        type: String,
        default: "rounded",
        validator: (value) => ["rounded", "pill", "sharp"].includes(value),
    },
});

const shapeClass = useShape(props);
const emit = defineEmits(["navigate", "sort", "search"]);

const navigation = inject(enpiiNavigationKey, { navigate: () => {} });

const query = ref(props.search);
let timer;
const processing = ref(false);
const currentPage = computed(() => Number(props.pagination?.current_page || 1));
const lastPage = computed(() => Number(props.pagination?.last_page || 1));
const totalPages = computed(() => lastPage.value);
const pages = computed(() => {
    const start = Math.max(1, Math.min(currentPage.value - 2, lastPage.value - 4));
    const end = Math.min(lastPage.value, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
});
const perPageOptions = computed(() =>
    props.perPageOptions.map((value) => ({
        value: Number(value),
        label: t("smartTable.perPageLabel", { count: value }),
    }))
);

watch(
    () => props.search,
    (value) => {
        query.value = value;
    }
);

function visit(parameters = {}) {
    const params = {
        search: query.value || undefined,
        per_page: Number(props.perPage),
        sort: props.sort || undefined,
        direction: props.direction || undefined,
        ...parameters,
    };
    if (props.url) {
        navigation.navigate(props.url, {
            params,
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }
    emit("navigate", { url: props.url, parameters: params });
}

function scheduleSearch() {
    clearTimeout(timer);
    timer = setTimeout(() => {
        emit("search", query.value);
        visit({ page: 1 });
    }, 350);
}

function changePerPage(value) {
    visit({ per_page: Number(value), page: 1 });
}

function sortBy(column) {
    if (!column.sortable) return;
    const direction = props.sort === column.key && props.direction === "asc" ? "desc" : "asc";
    emit("sort", { key: column.key, direction });
    visit({ sort: column.key, direction, page: 1 });
}

function goTo(page) {
    if (page >= 1 && page <= lastPage.value && page !== currentPage.value) visit({ page });
}

function resetSearch() {
    query.value = "";
    emit("search", "");
    visit({ search: undefined, page: 1 });
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
    <div class="enpii-smart-table" :class="shapeClass">
        <div v-if="!hideToolbar" class="enpii-smart-table__toolbar">
            <div class="enpii-smart-table__toolbar-start">
                <EnpiiSmartSelect
                    v-if="!hidePerPage"
                    id="smart-table-per-page"
                    :label="t('smartTable.perPage')"
                    hide-label
                    :model-value="Number(perPage)"
                    :options="perPageOptions"
                    :disabled="processing"
                    @update:model-value="changePerPage"
                />
                <slot name="toolbar" />
            </div>
            <div v-if="!hideSearch" class="enpii-smart-table__search">
                <AppInput
                    v-model="query"
                    :label="searchLabel ?? t('smartTable.searchLabel')"
                    hide-label
                    icon="search"
                    :placeholder="searchPlaceholder ?? t('smartTable.searchPlaceholder')"
                    @input="scheduleSearch"
                >
                    <template v-if="query" #trailing>
                        <button
                            type="button"
                            class="enpii-smart-table__clear"
                            :aria-label="t('smartTable.clearSearch')"
                            @click="resetSearch"
                        >
                            <AppIcon name="close" />
                        </button>
                    </template>
                </AppInput>
            </div>
        </div>
        <div class="enpii-smart-table__scroll">
            <div v-if="processing" class="enpii-smart-table__loading">{{ t("smartTable.loading") }}</div>
            <table class="enpii-smart-table__table">
                <thead class="enpii-smart-table__head">
                    <tr>
                        <th
                            v-for="column in columns"
                            :key="column.key"
                            class="enpii-smart-table__th"
                            :class="column.class"
                            :style="column.style"
                        >
                            <button
                                v-if="column.sortable"
                                type="button"
                                class="enpii-smart-table__sort"
                                @click="sortBy(column)"
                            >
                                {{ column.label }}
                                <AppIcon
                                    :name="sort === column.key ? (direction === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'"
                                    class="enpii-smart-table__sort-icon"
                                />
                            </button>
                            <span v-else>{{ column.label }}</span>
                        </th>
                        <th v-if="$slots.actions" class="enpii-smart-table__th enpii-smart-table__th--actions">
                            {{ t("smartTable.actionsHeader") }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(row, index) in rows"
                        :key="row.row_id || row.id || index"
                        class="enpii-smart-table__row"
                    >
                        <td
                            v-for="column in columns"
                            :key="column.key"
                            class="enpii-smart-table__td"
                            :class="column.class"
                            :style="column.style"
                        >
                            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :index="index">
                                {{ row[column.key] ?? "—" }}
                            </slot>
                        </td>
                        <td v-if="$slots.actions" class="enpii-smart-table__td enpii-smart-table__td--actions">
                            <slot name="actions" :row="row" :index="index" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!rows.length && !processing" class="enpii-smart-table__empty">
                <slot name="empty">
                    <AppEmptyState
                        icon="database"
                        :title="emptyTitle ?? t('smartTable.emptyTitle')"
                        :description="emptyDescription ?? t('smartTable.emptyDescription')"
                    />
                </slot>
            </div>
        </div>
        <div v-if="!hidePagination && (pagination?.total || lastPage > 1)" class="enpii-smart-table__footer">
            <p class="enpii-smart-table__summary">
                {{ t("smartTable.summary", { from: pagination?.from || 0, to: pagination?.to || 0, total: pagination?.total || 0 }) }}
            </p>
            <nav v-if="lastPage > 1" class="enpii-smart-table__pagination" :aria-label="t('smartTable.perPageLabel', { count: totalPages })">
                <AppButton
                    variant="ghost"
                    size="compact"
                    :disabled="currentPage === 1 || processing"
                    :aria-label="t('smartTable.previousPage')"
                    @click="goTo(currentPage - 1)"
                >
                    <AppIcon name="chevron_left" />
                </AppButton>
                <AppButton
                    v-for="page in pages"
                    :key="page"
                    size="compact"
                    :variant="page === currentPage ? 'primary' : 'ghost'"
                    :disabled="processing"
                    @click="goTo(page)"
                >
                    {{ page }}
                </AppButton>
                <AppButton
                    variant="ghost"
                    size="compact"
                    :disabled="currentPage === lastPage || processing"
                    :aria-label="t('smartTable.nextPage')"
                    @click="goTo(currentPage + 1)"
                >
                    <AppIcon name="chevron_right" />
                </AppButton>
            </nav>
        </div>
    </div>
</template>

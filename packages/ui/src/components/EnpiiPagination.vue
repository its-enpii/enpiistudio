<script setup>
import { computed } from 'vue';

const model = defineModel({ type: Number, default: 1 });

const props = defineProps({
    totalPages: { type: Number, required: true },
    siblingCount: { type: Number, default: 1 },
});

function buildPages(totalPages, siblingCount) {
    const totalNumbers = siblingCount * 2 + 5;
    if (totalPages <= totalNumbers) return Array.from({ length: totalPages }, (_, index) => index + 1);
    const leftSibling = Math.max(model.value - siblingCount, 1);
    const rightSibling = Math.min(model.value + siblingCount, totalPages);
    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;
    const pages = [];
    pages.push(1);
    if (!showLeftEllipsis) for (let page = 2; page < leftSibling; page += 1) pages.push(page);
    else pages.push('ellipsis-left');
    for (let page = leftSibling; page <= rightSibling; page += 1) pages.push(page);
    if (!showRightEllipsis) for (let page = rightSibling + 1; page < totalPages; page += 1) pages.push(page);
    else pages.push('ellipsis-right');
    pages.push(totalPages);
    return pages;
}

const pages = computed(() => {
    return buildPages(props.totalPages, props.siblingCount);
});
</script>

<template>
    <nav class="enpii-pagination" aria-label="Pagination">
        <button type="button" class="enpii-pagination__control" :disabled="model === 1" aria-label="Previous page" @click="model -= 1">
            <i class="material-symbols-outlined" aria-hidden="true">chevron_left</i>
        </button>
        <template v-for="page in pages" :key="typeof page === 'number' ? page : page">
            <span v-if="typeof page !== 'number'" class="enpii-pagination__ellipsis">…</span>
            <button v-else type="button" class="enpii-pagination__control" :class="page === model && 'enpii-pagination__control--active'" :aria-current="page === model ? 'page' : undefined" @click="model = page">{{ page }}</button>
        </template>
        <button type="button" class="enpii-pagination__control" :disabled="model === totalPages" aria-label="Next page" @click="model += 1">
            <i class="material-symbols-outlined" aria-hidden="true">chevron_right</i>
        </button>
    </nav>
</template>

import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import EnpiiSmartTable from "../src/components/EnpiiSmartTable.vue";
import { enpiiNavigationKey } from "../src/plugin";

describe("EnpiiSmartTable", () => {
    const defaultColumns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Nama" },
    ];
    const defaultRows = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
    ];

    it("renders rows and columns without errors", () => {
        const wrapper = mount(EnpiiSmartTable, {
            props: {
                columns: defaultColumns,
                rows: defaultRows,
            },
        });

        expect(wrapper.text()).toContain("Nama");
        expect(wrapper.text()).toContain("Item 1");
        expect(wrapper.text()).toContain("Item 2");
    });

    it("hides toolbar when hideToolbar prop is true", () => {
        const wrapper = mount(EnpiiSmartTable, {
            props: {
                columns: defaultColumns,
                rows: defaultRows,
                hideToolbar: true,
            },
        });

        expect(wrapper.find(".enpii-smart-table__toolbar").exists()).toBe(false);
    });

    it("renders custom cell slots", () => {
        const wrapper = mount(EnpiiSmartTable, {
            props: {
                columns: defaultColumns,
                rows: defaultRows,
            },
            slots: {
                "cell-name": `<template #cell-name="{ value }"><span class="custom-name">Custom: {{ value }}</span></template>`,
            },
        });

        expect(wrapper.find(".custom-name").text()).toBe("Custom: Item 1");
    });

    it("renders empty state slot when rows are empty", () => {
        const wrapper = mount(EnpiiSmartTable, {
            props: {
                columns: defaultColumns,
                rows: [],
                hideToolbar: true,
                hidePagination: true,
            },
            slots: {
                empty: `<div class="my-custom-empty">Tidak ada data ditemukan</div>`,
            },
        });

        expect(wrapper.find(".my-custom-empty").text()).toBe("Tidak ada data ditemukan");
    });
});

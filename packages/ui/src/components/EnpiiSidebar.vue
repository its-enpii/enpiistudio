<script setup>
import { ref } from 'vue';
import AppIcon from './EnpiiIcon.vue';

const props = defineProps({
    items: { type: Array, required: true },
    collapsed: { type: Boolean, default: false },
    sticky: { type: Boolean, default: false },
    activeKey: { type: [String, Number], default: null },
});

defineEmits(['navigate']);

const expandedKeys = ref(new Set());

function itemClass(item) {
    const active = props.activeKey === item.key;
    return [
        'enpii-sidebar__item flex w-full min-h-[2.75rem] items-center gap-3 rounded-lg border-0 bg-none py-2.5 px-3.5 text-on-surface-variant font-sans text-[0.9375rem] font-semibold text-left no-underline cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low hover:text-on-surface focus-visible:bg-surface-container-low focus-visible:text-on-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus',
        active && 'enpii-sidebar__item--active bg-primary-soft text-primary-text hover:bg-primary-soft hover:text-primary-text',
    ];
}

function toggleGroup(item) {
    const keys = new Set(expandedKeys.value);
    if (keys.has(item.key)) keys.delete(item.key);
    else keys.add(item.key);
    expandedKeys.value = keys;
}
</script>

<template>
    <aside
        class="enpii-sidebar w-16 border-r border-solid [border-width:var(--control-border-width)] border-outline-variant overflow-y-auto bg-surface-container-lowest text-on-surface transition-[width] duration-fast ease-emphasized"
        :class="[
            collapsed && 'enpii-sidebar--collapsed',
            !collapsed && 'w-64',
            sticky && 'enpii-sidebar--sticky sticky top-0 h-[100dvh]',
        ]"
    >
        <nav class="enpii-sidebar__nav flex flex-col gap-1.5 p-3" aria-label="Sidebar">
            <template v-for="item in items" :key="item.key">
                <button v-if="item.children?.length" type="button" class="enpii-sidebar__group-toggle flex w-full min-h-[2.75rem] items-center gap-3 rounded-lg border-0 bg-none py-2.5 px-3.5 text-on-surface-variant font-sans text-[0.9375rem] font-semibold text-left cursor-pointer [transition-property:all] duration-fast ease-emphasized hover:bg-surface-container-low hover:text-on-surface focus-visible:bg-surface-container-low focus-visible:text-on-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus" :aria-expanded="expandedKeys.has(item.key)" @click="toggleGroup(item)">
                    <AppIcon v-if="item.icon" class="enpii-sidebar__icon w-5 flex-none text-inherit" :name="item.icon" />
                    <span class="enpii-sidebar__label flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ item.label }}</span>
                    <i class="material-symbols-outlined enpii-sidebar__chevron w-4 transition-transform duration-fast ease-emphasized" aria-hidden="true">expand_more</i>
                </button>
                <a v-else :href="item.href ?? '#'" :class="itemClass(item)" @click.prevent="$emit('navigate', item)">
                    <AppIcon v-if="item.icon" class="enpii-sidebar__icon w-5 flex-none text-inherit" :name="item.icon" />
                    <span class="enpii-sidebar__label flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ item.label }}</span>
                    <span v-if="item.badge != null" class="enpii-sidebar__badge rounded-full bg-primary px-1 text-on-primary text-[0.6875rem] leading-[1.5]">{{ item.badge }}</span>
                </a>
                <ul v-if="item.children?.length && expandedKeys.has(item.key)" class="enpii-sidebar__children m-0 pl-9 list-none">
                    <li v-for="child in item.children" :key="child.key">
                        <a :href="child.href ?? '#'" :class="itemClass(child)" @click.prevent="$emit('navigate', child)">
                            <span class="enpii-sidebar__label flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ child.label }}</span>
                            <span v-if="child.badge != null" class="enpii-sidebar__badge rounded-full bg-primary px-1 text-on-primary text-[0.6875rem] leading-[1.5]">{{ child.badge }}</span>
                        </a>
                    </li>
                </ul>
            </template>
        </nav>
    </aside>
</template>

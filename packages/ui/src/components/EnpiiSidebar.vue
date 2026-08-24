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
    return ['enpii-sidebar__item', active && 'enpii-sidebar__item--active'];
}

function toggleGroup(item) {
    const keys = new Set(expandedKeys.value);
    if (keys.has(item.key)) keys.delete(item.key);
    else keys.add(item.key);
    expandedKeys.value = keys;
}
</script>

<template>
    <aside class="enpii-sidebar" :class="[collapsed && 'enpii-sidebar--collapsed', sticky && 'enpii-sidebar--sticky']">
        <nav class="enpii-sidebar__nav" aria-label="Sidebar">
            <template v-for="item in items" :key="item.key">
                <button v-if="item.children?.length" type="button" class="enpii-sidebar__group-toggle" :aria-expanded="expandedKeys.has(item.key)" @click="toggleGroup(item)">
                    <AppIcon v-if="item.icon" class="enpii-sidebar__icon" :name="item.icon" />
                    <span class="enpii-sidebar__label">{{ item.label }}</span>
                    <i class="material-symbols-outlined enpii-sidebar__chevron" aria-hidden="true">expand_more</i>
                </button>
                <a v-else :href="item.href ?? '#'" :class="itemClass(item)" @click.prevent="$emit('navigate', item)">
                    <AppIcon v-if="item.icon" class="enpii-sidebar__icon" :name="item.icon" />
                    <span class="enpii-sidebar__label">{{ item.label }}</span>
                    <span v-if="item.badge != null" class="enpii-sidebar__badge">{{ item.badge }}</span>
                </a>
                <ul v-if="item.children?.length && expandedKeys.has(item.key)" class="enpii-sidebar__children">
                    <li v-for="child in item.children" :key="child.key">
                        <a :href="child.href ?? '#'" :class="itemClass(child)" @click.prevent="$emit('navigate', child)">
                            <span class="enpii-sidebar__label">{{ child.label }}</span>
                            <span v-if="child.badge != null" class="enpii-sidebar__badge">{{ child.badge }}</span>
                        </a>
                    </li>
                </ul>
            </template>
        </nav>
    </aside>
</template>

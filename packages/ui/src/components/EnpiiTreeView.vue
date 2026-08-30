<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import AppIcon from './EnpiiIcon.vue'
import { useT } from '../composables/useT'

export interface EnpiiTreeNode {
    id: string | number
    label: string
    children?: EnpiiTreeNode[]
    icon?: string
}

const props = withDefaults(defineProps<{
    nodes: EnpiiTreeNode[]
    expandable?: boolean
    defaultExpanded?: Array<string | number>
    selectable?: boolean
}>(), {
    expandable: true,
    defaultExpanded: () => [],
    selectable: true,
})

const model = defineModel<string | number | null>({ default: null })
const emit = defineEmits(['select', 'expand'])

const t = useT()
const expandedIds = ref(new Set(props.defaultExpanded))
const focusedId = ref(props.nodes[0]?.id ?? null)
const listHeight = ref<number | null>(null)
const listElement = ref<{ $el: HTMLElement } | null>(null)

interface VisibleNode {
    node: EnpiiTreeNode
    depth: number
    parent: EnpiiTreeNode | null
    hasChildren: boolean
    isExpanded: boolean
}

const visibleNodes = computed<VisibleNode[]>(() => {
    const result: VisibleNode[] = []
    const visit = (nodes: EnpiiTreeNode[], depth: number, parent: EnpiiTreeNode | null) => {
        for (const node of nodes) {
            const hasChildren = Boolean(node.children?.length)
            const isExpanded = expandedIds.value.has(node.id)
            result.push({ node, depth, parent, hasChildren, isExpanded })
            if (hasChildren && isExpanded) visit(node.children!, depth + 1, node)
        }
    }
    visit(props.nodes, 0, null)
    return result
})

function isSelected(node: EnpiiTreeNode) {
    return props.selectable && model.value === node.id
}

function isFocused(node: EnpiiTreeNode) {
    return focusedId.value === node.id
}

function selectNode(node: EnpiiTreeNode) {
    if (!props.selectable) return
    model.value = node.id
    focusedId.value = node.id
    emit('select', node)
}

function toggleNode(node: EnpiiTreeNode, visible?: VisibleNode) {
    if (!props.expandable || !visible?.hasChildren) return
    const nextExpanded = new Set(expandedIds.value)
    if (nextExpanded.has(node.id)) nextExpanded.delete(node.id)
    else nextExpanded.add(node.id)
    expandedIds.value = nextExpanded
    emit('expand', { node, expanded: nextExpanded.has(node.id) })
}

function focusNode(id: string | number) {
    focusedId.value = id
    nextTick(() => {
        document.getElementById(nodeId(id))?.focus()
    })
}

function updateListHeight() {
    listHeight.value = listElement.value?.$el.scrollHeight ?? null
}

function onKeydown(event: KeyboardEvent, visible: VisibleNode) {
    const index = visibleNodes.value.findIndex((item) => item.node.id === visible.node.id)
    const moveFocus = (offset: number) => {
        event.preventDefault()
        const next = visibleNodes.value[index + offset]
        if (next) focusNode(next.node.id)
    }

    if (event.key === 'ArrowDown') moveFocus(1)
    else if (event.key === 'ArrowUp') moveFocus(-1)
    else if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (!visible.isExpanded && visible.hasChildren) toggleNode(visible.node, visible)
        else if (visible.isExpanded && visibleNodes.value[index + 1]) focusNode(visibleNodes.value[index + 1].node.id)
    }
    else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        if (visible.isExpanded) toggleNode(visible.node, visible)
        else if (visible.parent) focusNode(visible.parent.id)
    }
    else if (event.key === 'Enter') {
        event.preventDefault()
        if (visible.hasChildren && !props.selectable) toggleNode(visible.node, visible)
        else selectNode(visible.node)
    }
}

function nodeId(id: string | number) {
    return `enpii-tree-node-${String(id).replace(/[^a-z0-9_-]/gi, '_')}`
}

watch(() => props.defaultExpanded, (value) => {
    expandedIds.value = new Set(value)
    updateListHeight()
})

onMounted(updateListHeight)
</script>

<template>
    <div class="enpii-tree-view" role="tree" :aria-label="t('treeView.ariaLabel')">
        <TransitionGroup
            v-if="visibleNodes.length"
            tag="ul"
            ref="listElement"
            name="enpii-tree-view-node"
            class="enpii-tree-view__list"
            :style="{ height: listHeight ? `${listHeight}px` : undefined }"
            @enter="updateListHeight"
            @after-leave="updateListHeight"
        >
            <li v-for="visible in visibleNodes" :key="visible.node.id" role="none" class="enpii-tree-view__item">
                <button
                    :id="nodeId(visible.node.id)"
                    type="button"
                    role="treeitem"
                    class="enpii-tree-view__node"
                    :class="{
                        'enpii-tree-view__node--focused': isFocused(visible.node),
                        'enpii-tree-view__node--selected': isSelected(visible.node),
                        'enpii-tree-view__node--selectable': props.selectable,
                    }"
                    :aria-level="visible.depth + 1"
                    :aria-expanded="visible.hasChildren ? visible.isExpanded : undefined"
                    :aria-selected="props.selectable ? isSelected(visible.node) : undefined"
                    :aria-label="visible.hasChildren ? `${visible.node.label} ${t(visible.isExpanded ? 'treeView.collapse' : 'treeView.expand')}` : undefined"
                    :tabindex="isFocused(visible.node) ? 0 : -1"
                    :style="{ paddingInlineStart: `${0.75 + visible.depth * 1.25}rem` }"
                    @keydown="onKeydown($event, visible)"
                    @click="selectNode(visible.node)"
                >
                    <AppIcon v-if="visible.node.icon" :name="visible.node.icon" class="enpii-tree-view__icon" />
                    <AppIcon
                        v-if="visible.hasChildren"
                        name="chevron_right"
                        class="enpii-tree-view__chevron"
                        :class="{ 'enpii-tree-view__chevron--expanded': visible.isExpanded }"
                        @click.stop="toggleNode(visible.node, visible)"
                    />
                    <span class="enpii-tree-view__label">{{ visible.node.label }}</span>
                </button>
            </li>
        </TransitionGroup>
    </div>
</template>

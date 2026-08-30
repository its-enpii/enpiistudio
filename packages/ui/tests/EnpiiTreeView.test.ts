import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { EnpiiTreeView } from '../src'

const nodes = [
  {
    id: 'root',
    label: 'Root',
    icon: 'folder',
    children: [
      { id: 'child', label: 'Child' },
      { id: 'nested-parent', label: 'Nested parent', children: [{ id: 'nested', label: 'Nested' }] },
    ],
  },
  { id: 'sibling', label: 'Sibling' },
]

describe('EnpiiTreeView', () => {
  it('renders nested nodes with expanded and collapsed state', () => {
    const wrapper = mount(EnpiiTreeView, { props: { nodes, modelValue: null, defaultExpanded: ['root'] } })
    const treeItems = wrapper.findAll('[role="treeitem"]')

    expect(treeItems.map((item) => item.text())).toEqual([
      'folderchevron_rightRoot',
      'Child',
      'chevron_rightNested parent',
      'Sibling',
    ])
    expect(wrapper.get('[role="treeitem"][aria-level="2"]').attributes('aria-level')).toBe('2')
  })

  it('expands and collapses using chevron and emits expand state', async () => {
    const wrapper = mount(EnpiiTreeView, { props: { nodes, modelValue: null } })

    expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2)
    await wrapper.get('.enpii-tree-view__chevron').trigger('click')
    expect(wrapper.emitted('expand')?.[0]).toEqual([{ node: nodes[0], expanded: true }])
    expect(wrapper.findAll('[role="treeitem"]').length).toBeGreaterThan(2)
  })

  it('selects visible nodes and emits selected payload', async () => {
    const wrapper = mount(EnpiiTreeView, { props: { nodes, modelValue: null, defaultExpanded: ['root'] } })

    await wrapper.findAll('[role="treeitem"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['child'])
    expect(wrapper.emitted('select')?.[0]).toEqual([nodes[0].children![0]])
  })

  it('moves visible focus with ArrowDown and ArrowUp', async () => {
    const wrapper = mount(EnpiiTreeView, { props: { nodes, modelValue: null, defaultExpanded: ['root'] } })
    const treeItems = wrapper.findAll('[role="treeitem"]')

    await treeItems[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.getElementById('enpii-tree-node_-child')).toBeNull()
    await treeItems[1].trigger('keydown', { key: 'ArrowUp' })
    expect(document.getElementById('enpii-tree-node_-root')).toBeNull()
  })

  it('uses ArrowRight to expand or enter and ArrowLeft to collapse or rise', async () => {
    const wrapper = mount(EnpiiTreeView, { props: { nodes, modelValue: null } })
    const treeItems = wrapper.findAll('[role="treeitem"]')

    await treeItems[0].trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('expand')?.[0]).toEqual([{ node: nodes[0], expanded: true }])
    await wrapper.findAll('[role="treeitem"]')[1].trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(document.body)
  })
})

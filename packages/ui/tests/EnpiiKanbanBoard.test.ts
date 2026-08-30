import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EnpiiKanbanBoard from '../src/components/EnpiiKanbanBoard.vue'

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'doing', title: 'Doing', tone: 'primary' as const },
  { id: 'done', title: 'Done', tone: 'success' as const },
]

const cards = [
  { id: 'c1', columnId: 'todo', title: 'Task A', label: 'Bug', assignee: 'Alice' },
  { id: 'c2', columnId: 'todo', title: 'Task B' },
  { id: 'c3', columnId: 'doing', title: 'Task C', tone: 'danger' as const },
  { id: 'c4', columnId: 'done', title: 'Task D' },
]

describe('EnpiiKanbanBoard', () => {
  it('renders all columns with correct titles', () => {
    const wrapper = mount(EnpiiKanbanBoard, {
      props: { columns, cards },
    })
    const headers = wrapper.findAll('.enpii-kanban__column-title')
    expect(headers).toHaveLength(3)
    expect(headers[0].text()).toBe('To Do')
    expect(headers[1].text()).toBe('Doing')
    expect(headers[2].text()).toBe('Done')
  })

  it('renders cards in the correct columns', () => {
    const wrapper = mount(EnpiiKanbanBoard, {
      props: { columns, cards },
    })
    const cols = wrapper.findAll('.enpii-kanban__column')
    const todoCards = cols[0].findAll('.enpii-kanban__card')
    expect(todoCards).toHaveLength(2)
    expect(todoCards[0].text()).toContain('Task A')

    const doingCards = cols[1].findAll('.enpii-kanban__card')
    expect(doingCards).toHaveLength(1)
    expect(doingCards[0].text()).toContain('Task C')

    const doneCards = cols[2].findAll('.enpii-kanban__card')
    expect(doneCards).toHaveLength(1)
  })

  it('displays card count per column', () => {
    const wrapper = mount(EnpiiKanbanBoard, {
      props: { columns, cards },
    })
    const counts = wrapper.findAll('.enpii-kanban__column-count')
    expect(counts[0].text()).toBe('2')
    expect(counts[1].text()).toBe('1')
    expect(counts[2].text()).toBe('1')
  })

  it('emits move event via fallback menu button', async () => {
    document.body.innerHTML = ''
    const wrapper = mount(EnpiiKanbanBoard, {
      props: { columns, cards, modelValue: [...cards] },
      attachTo: document.body,
    })

    const menuButton = wrapper.findAll('.enpii-kanban__card-menu')[0]
    await menuButton.trigger('click')

    const menuItems = document.body.querySelectorAll('[role="menuitem"]')
    expect(menuItems.length).toBeGreaterThanOrEqual(1)

    const targetItem = Array.from(menuItems).find(
      item => !item.hasAttribute('disabled') && item.textContent?.includes('Doing')
    )
    expect(targetItem).toBeTruthy()
    await targetItem!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    const moveEvents = wrapper.emitted('move')
    expect(moveEvents).toHaveLength(1)
    expect(moveEvents![0][0]).toMatchObject({
      cardId: 'c1',
      fromColumn: 'todo',
      toColumn: 'doing',
    })

    wrapper.unmount()
  })

  it('cards are focusable when draggable is true', () => {
    const wrapper = mount(EnpiiKanbanBoard, {
      props: { columns, cards, draggable: true },
    })
    const card = wrapper.find('.enpii-kanban__card')
    expect(card.attributes('tabindex')).toBe('0')
  })

  it('renders label and assignee when provided', () => {
    const wrapper = mount(EnpiiKanbanBoard, {
      props: { columns, cards },
    })
    expect(wrapper.find('.enpii-kanban__card-label').text()).toBe('Bug')
    expect(wrapper.find('.enpii-kanban__card-assignee').text()).toBe('Alice')
  })

  it('applies tone class on column and card', () => {
    const wrapper = mount(EnpiiKanbanBoard, {
      props: { columns, cards },
    })
    const doingColumn = wrapper.findAll('.enpii-kanban__column')[1]
    expect(doingColumn.classes()).toContain('enpii-kanban__column--primary')

    const dangerCard = wrapper.findAll('.enpii-kanban__card')[2]
    expect(dangerCard.classes()).toContain('enpii-kanban__card--danger')
  })

  it('does not show menu button when draggable is false', () => {
    const wrapper = mount(EnpiiKanbanBoard, {
      props: { columns, cards, draggable: false },
    })
    expect(wrapper.find('.enpii-kanban__card-menu').exists()).toBe(false)
  })

  it('has ARIA region role', () => {
    const wrapper = mount(EnpiiKanbanBoard, {
      props: { columns, cards },
    })
    expect(wrapper.find('[role="region"]').exists()).toBe(true)
  })
})

import { mount, VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EnpiiMentionInput from '../src/components/EnpiiMentionInput.vue'

const users = [
    { id: 1, label: 'Alice' },
    { id: 2, label: 'Bob' },
    { id: 3, label: 'Charlie' },
]

function factory(propsOverrides: Record<string, unknown> = {}) {
    return mount(EnpiiMentionInput, {
        props: { modelValue: '', users, ...propsOverrides },
    })
}

describe('EnpiiMentionInput', () => {
    it('renders the textarea with combobox role', () => {
        const wrapper = factory()
        const textarea = wrapper.find('textarea')
        expect(textarea.exists()).toBe(true)
        expect(textarea.attributes('role')).toBe('combobox')
    })

    it('opens suggestion dropdown when trigger is typed', async () => {
        const wrapper = factory()
        const textarea = wrapper.find('textarea')
        const element = textarea.element as HTMLTextAreaElement

        element.value = '@'
        element.selectionStart = 1
        element.selectionEnd = 1
        await textarea.trigger('input')

        const listbox = wrapper.find('[role="listbox"]')
        expect(listbox.exists()).toBe(true)
        expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
    })

    it('filters suggestions as user types after trigger', async () => {
        const wrapper = factory()
        const textarea = wrapper.find('textarea')
        const element = textarea.element as HTMLTextAreaElement

        element.value = '@al'
        element.selectionStart = 3
        element.selectionEnd = 3
        await textarea.trigger('input')

        const options = wrapper.findAll('[role="option"]')
        expect(options).toHaveLength(1)
        expect(options[0].text()).toContain('Alice')
    })

    it('selects a user via keyboard Enter and inserts mention text', async () => {
        const wrapper = factory()
        const textarea = wrapper.find('textarea')
        const element = textarea.element as HTMLTextAreaElement

        element.value = '@'
        element.selectionStart = 1
        element.selectionEnd = 1
        await textarea.trigger('input')

        await textarea.trigger('keydown', { key: 'ArrowDown' })
        await textarea.trigger('keydown', { key: 'Enter' })

        const emitted = wrapper.emitted('update:modelValue')!
        const lastValue = emitted[emitted.length - 1][0] as string
        expect(lastValue).toBe('@Bob ')
    })

    it('closes suggestions on Escape', async () => {
        const wrapper = factory()
        const textarea = wrapper.find('textarea')
        const element = textarea.element as HTMLTextAreaElement

        element.value = '@'
        element.selectionStart = 1
        element.selectionEnd = 1
        await textarea.trigger('input')
        expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

        await textarea.trigger('keydown', { key: 'Escape' })
        expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })

    it('selects a user via mouse click', async () => {
        const wrapper = factory()
        const textarea = wrapper.find('textarea')
        const element = textarea.element as HTMLTextAreaElement

        element.value = '@'
        element.selectionStart = 1
        element.selectionEnd = 1
        await textarea.trigger('input')

        const options = wrapper.findAll('[role="option"]')
        await options[0].trigger('mousedown')

        const emitted = wrapper.emitted('update:modelValue')!
        const lastValue = emitted[emitted.length - 1][0] as string
        expect(lastValue).toBe('@Alice ')
    })

    it('exposes parseMentions that returns valid mentions', async () => {
        const wrapper = factory({ modelValue: 'Hello @Alice and @Bob end' })
        const vm = wrapper.vm as unknown as { parseMentions: () => { id: number | string; label: string; index: number }[] }
        const mentions = vm.parseMentions()

        expect(mentions).toHaveLength(2)
        expect(mentions[0]).toEqual({ id: 1, label: 'Alice', index: 6 })
        expect(mentions[1]).toEqual({ id: 2, label: 'Bob', index: 17 })
    })

    it('disables the textarea when disabled prop is true', () => {
        const wrapper = factory({ disabled: true })
        const textarea = wrapper.find('textarea')
        expect(textarea.element.disabled).toBe(true)
        expect(wrapper.classes()).toContain('enpii-mention-input--disabled')
    })

    it('sets readonly attribute and class when readonly prop is true', () => {
        const wrapper = factory({ readonly: true })
        const textarea = wrapper.find('textarea')
        expect((textarea.element as HTMLTextAreaElement).readOnly).toBe(true)
        expect(wrapper.classes()).toContain('enpii-mention-input--readonly')
    })

    it('has proper ARIA attributes', async () => {
        const wrapper = factory()
        const textarea = wrapper.find('textarea')

        expect(textarea.attributes('aria-expanded')).toBe('false')
        expect(textarea.attributes('aria-autocomplete')).toBe('list')

        const element = textarea.element as HTMLTextAreaElement
        element.value = '@'
        element.selectionStart = 1
        element.selectionEnd = 1
        await textarea.trigger('input')

        expect(textarea.attributes('aria-expanded')).toBe('true')
        expect(textarea.attributes('aria-controls')).toBeTruthy()
        expect(textarea.attributes('aria-activedescendant')).toBeTruthy()
    })

    it('respects rows prop', () => {
        const wrapper = factory({ rows: 5 })
        const textarea = wrapper.find('textarea')
        expect(textarea.attributes('rows')).toBe('5')
    })

    it('respects maxMentions limit', async () => {
        const wrapper = factory({ modelValue: 'Hey @Alice ', maxMentions: 1 })
        const textarea = wrapper.find('textarea')
        const element = textarea.element as HTMLTextAreaElement

        element.value = 'Hey @Alice @'
        element.selectionStart = 12
        element.selectionEnd = 12
        await textarea.trigger('input')

        expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })

    it('navigates suggestions with ArrowUp key', async () => {
        const wrapper = factory()
        const textarea = wrapper.find('textarea')
        const element = textarea.element as HTMLTextAreaElement

        element.value = '@'
        element.selectionStart = 1
        element.selectionEnd = 1
        await textarea.trigger('input')

        await textarea.trigger('keydown', { key: 'ArrowUp' })

        const options = wrapper.findAll('[role="option"]')
        const lastOption = options[options.length - 1]
        expect(lastOption.attributes('aria-selected')).toBe('true')
    })
})

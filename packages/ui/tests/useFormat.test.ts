import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { enpiiLocaleKey, enpiiUi, formatCurrency, formatDate, formatNumber, formatPercent, useFormat } from '../src'

function renderWithPlugin(locale?: string) {
    let result: ReturnType<typeof useFormat> | undefined
    const Component = defineComponent({
        setup() {
            result = useFormat()
            return () => h('div')
        },
    })
    mount(Component, {
        global: {
            plugins: locale ? [[enpiiUi, { locale }]] : [enpiiUi],
        },
    })
    return result!
}

describe('formatCurrency', () => {
    it('formats IDR by default for id-ID', () => {
        expect(formatCurrency(1234567.89)).toBe('Rp 1.234.568')
    })

    it('respects locale override', () => {
        const result = formatCurrency(1234567.89, { locale: 'en-US', currency: 'USD' })
        expect(result).toContain('1,234,567')
        expect(result).toContain('$')
    })

    it('respects fraction digit options', () => {
        expect(formatCurrency(1000.5, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toContain('1.000,50')
    })

    it('falls back safely on invalid currency', () => {
        expect(formatCurrency(500, { currency: '' })).toBe('500')
    })
})

describe('formatNumber', () => {
    it('formats with id-ID by default', () => {
        expect(formatNumber(1234567.891)).toBe('1.234.567,891')
    })

    it('respects locale override', () => {
        expect(formatNumber(1234567.891, { locale: 'en-US' })).toBe('1,234,567.891')
    })

    it('respects min/max fraction digits', () => {
        expect(formatNumber(3.1, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe('3,10')
    })

    it('falls back safely on invalid locale', () => {
        expect(formatNumber(123, { locale: 'xx-INVALID' })).toBe('123')
    })
})

describe('formatPercent', () => {
    it('formats with id-ID by default', () => {
        expect(formatPercent(0.25)).toBe('25%')
    })

    it('respects locale override', () => {
        expect(formatPercent(0.25, { locale: 'en-US' })).toBe('25%')
    })

    it('respects fraction digit options', () => {
        expect(formatPercent(0.1234, { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe('12,3%')
    })

    it('falls back safely on invalid input', () => {
        const result = formatPercent(NaN)
        expect(result).toContain('NaN')
    })
})

describe('formatDate', () => {
    it('formats short date', () => {
        const result = formatDate(new Date(2025, 5, 15), { style: 'short' })
        expect(result).toMatch(/15/)
    })

    it('formats medium date', () => {
        const result = formatDate(new Date(2025, 5, 15), { style: 'medium' })
        expect(result).toContain('Jun')
    })

    it('formats long date', () => {
        const result = formatDate(new Date(2025, 5, 15), { style: 'long' })
        expect(result).toContain('Juni')
    })

    it('formats relative time for future', () => {
        const future = Date.now() + 2 * 60 * 1000
        expect(formatDate(future, { style: 'relative' })).toContain('menit')
    })

    it('formats relative time for past', () => {
        const past = Date.now() - 2 * 60 * 60 * 1000
        expect(formatDate(past, { style: 'relative' })).toContain('jam')
    })

    it('falls back safely on invalid input', () => {
        expect(formatDate('invalid-date')).toBe('invalid-date')
    })
})

describe('useFormat via plugin', () => {
    it('uses id-ID locale by default', () => {
        const { formatCurrency: fc, formatNumber: fn } = renderWithPlugin()
        expect(fc(1234567)).toContain('1.234.567')
        expect(fn(3.14)).toBe('3,14')
    })

    it('uses plugin-provided locale', () => {
        const { formatNumber: fn } = renderWithPlugin('en')
        expect(fn(1234567.891)).toBe('1,234,567.891')
    })

    it('supports per-call locale override', () => {
        const { formatNumber: fn } = renderWithPlugin('en')
        expect(fn(1234567.891, { locale: 'de-DE' })).toBe('1.234.567,891')
    })
})

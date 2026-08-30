import { inject } from 'vue'
import { enpiiLocaleKey } from '../plugin'

export interface CurrencyFormatOptions {
    currency?: string
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
}

export interface NumberFormatOptions {
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
}

export interface PercentFormatOptions extends NumberFormatOptions {}

export type DateFormatStyle = 'short' | 'medium' | 'long' | 'relative'

export interface DateFormatOptions {
    style?: DateFormatStyle
    locale?: string
}

function formatCurrencyImpl(value: number, locale: string, options: Omit<CurrencyFormatOptions, 'locale'> = {}): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: options.currency ?? 'IDR',
            minimumFractionDigits: options.minimumFractionDigits ?? (options.currency === undefined || options.currency === 'IDR' ? 0 : undefined),
            maximumFractionDigits: options.maximumFractionDigits ?? (options.currency === undefined || options.currency === 'IDR' ? 0 : undefined),
        }).format(value)
    } catch {
        return String(value)
    }
}

function formatNumberImpl(value: number, locale: string, options: Omit<NumberFormatOptions, 'locale'> = {}): string {
    try {
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: options.minimumFractionDigits,
            maximumFractionDigits: options.maximumFractionDigits,
        }).format(value)
    } catch {
        return String(value)
    }
}

function formatPercentImpl(value: number, locale: string, options: Omit<PercentFormatOptions, 'locale'> = {}): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'percent',
            minimumFractionDigits: options.minimumFractionDigits,
            maximumFractionDigits: options.maximumFractionDigits,
        }).format(value)
    } catch {
        return String(value)
    }
}

function formatDateImpl(value: Date | string | number, locale: string, options: Omit<DateFormatOptions, 'locale'> = {}): string {
    const style = options.style ?? 'medium'

    try {
        const date = value instanceof Date ? value : new Date(value)
        if (Number.isNaN(date.getTime())) return String(value)

        if (style === 'relative') {
            const diffMs = date.getTime() - Date.now()
            const absDiff = Math.abs(diffMs)
            const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

            if (absDiff < 1000) return rtf.format(0, 'second')

            const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
                { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
                { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
                { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
                { unit: 'day', ms: 24 * 60 * 60 * 1000 },
                { unit: 'hour', ms: 60 * 60 * 1000 },
                { unit: 'minute', ms: 60 * 1000 },
                { unit: 'second', ms: 1000 },
            ]

            for (const { unit, ms } of units) {
                if (absDiff >= ms) {
                    return rtf.format(Math.round(diffMs / ms), unit)
                }
            }
            return rtf.format(0, 'second')
        }

        return new Intl.DateTimeFormat(locale, { dateStyle: style }).format(date)
    } catch {
        return String(value)
    }
}

export function useFormat() {
    const pluginLocale = inject(enpiiLocaleKey, null)
    const locale = pluginLocale ?? 'id-ID'

    return {
        formatCurrency: (value: number, options: CurrencyFormatOptions = {}) =>
            formatCurrencyImpl(value, options.locale ?? locale, options),
        formatNumber: (value: number, options: NumberFormatOptions = {}) =>
            formatNumberImpl(value, options.locale ?? locale, options),
        formatPercent: (value: number, options: PercentFormatOptions = {}) =>
            formatPercentImpl(value, options.locale ?? locale, options),
        formatDate: (value: Date | string | number, options: DateFormatOptions = {}) =>
            formatDateImpl(value, options.locale ?? locale, options),
    }
}

export function formatCurrency(value: number, options: CurrencyFormatOptions = {}): string {
    return formatCurrencyImpl(value, options.locale ?? 'id-ID', options)
}

export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
    return formatNumberImpl(value, options.locale ?? 'id-ID', options)
}

export function formatPercent(value: number, options: PercentFormatOptions = {}): string {
    return formatPercentImpl(value, options.locale ?? 'id-ID', options)
}

export function formatDate(value: Date | string | number, options: DateFormatOptions = {}): string {
    return formatDateImpl(value, options.locale ?? 'id-ID', options)
}

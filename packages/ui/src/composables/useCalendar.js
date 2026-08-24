import { ref } from 'vue'

export const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export function toIsoDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function parseIsoDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export function clampIso(value, min, max) {
    if (min && value < min) return min
    if (max && value > max) return max
    return value
}

export function createMonthGrid(viewDate, min = null, max = null) {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const mondayOffset = (firstDay.getDay() + 6) % 7

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(year, month, 1 - mondayOffset + index)
        const iso = toIsoDate(date)
        return {
            date,
            iso,
            day: date.getDate(),
            currentMonth: date.getMonth() === month,
            disabled: Boolean((min && iso < min) || (max && iso > max)),
        }
    })
}

export function shiftMonth(viewDate, amount) {
    return new Date(viewDate.getFullYear(), viewDate.getMonth() + amount, 1)
}

export function usePopupPosition(triggerRef, popupRef, options = {}) {
    const { minWidth = 320, estimatedHeight = 420, margin = 8 } = options
    const placeAbove = ref(false)
    const popupStyle = ref({})

    function position() {
        const trigger = triggerRef.value
        if (!trigger) return

        const rectangle = trigger.getBoundingClientRect()
        const height = popupRef.value?.getBoundingClientRect().height || estimatedHeight
        const spaceBelow = window.innerHeight - rectangle.bottom - margin
        const spaceAbove = rectangle.top - margin
        placeAbove.value = spaceBelow < height && spaceAbove > spaceBelow

        const width = Math.max(rectangle.width, minWidth)
        const left = Math.min(Math.max(margin, rectangle.left), window.innerWidth - width - margin)
        const common = {
            position: 'fixed',
            left: `${left}px`,
            width: `${width}px`,
            zIndex: 80,
        }

        popupStyle.value = placeAbove.value
            ? { ...common, bottom: `${window.innerHeight - rectangle.top + margin}px`, top: 'auto' }
            : { ...common, bottom: 'auto', top: `${rectangle.bottom + margin}px` }
    }

    function attachViewportListeners() {
        window.addEventListener('resize', position)
        window.addEventListener('scroll', position, true)
    }

    function detachViewportListeners() {
        window.removeEventListener('resize', position)
        window.removeEventListener('scroll', position, true)
    }

    return { placeAbove, popupStyle, position, attachViewportListeners, detachViewportListeners }
}

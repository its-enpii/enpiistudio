import type { Directive, DirectiveBinding } from 'vue'

export interface TooltipOptions {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export type TooltipValue = string | TooltipOptions

interface TooltipHandlers {
  show: () => void
  hide: () => void
}

let tooltipEl: HTMLElement | null = null
let tooltipIdCounter = 0
let showTimer: ReturnType<typeof setTimeout> | null = null
let currentTrigger: HTMLElement | null = null
let scrollListenerCount = 0

function getTooltipElement(): HTMLElement {
  if (!tooltipEl || !tooltipEl.isConnected) {
    tooltipEl = document.createElement('div')
    tooltipEl.className = 'enpii-tooltip__bubble'
    tooltipEl.setAttribute('role', 'tooltip')
    tooltipEl.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;width:max-content;max-width:14rem;opacity:0;visibility:hidden;'
    document.body.appendChild(tooltipEl)
  }
  return tooltipEl
}

function parseValue(value: TooltipValue): Required<TooltipOptions> {
  if (typeof value === 'string') {
    return { content: value, placement: 'top', delay: 0 }
  }
  return {
    content: value?.content ?? '',
    placement: value?.placement ?? 'top',
    delay: value?.delay ?? 0,
  }
}

function positionTooltip(el: HTMLElement, tip: HTMLElement, placement: string): void {
  const rect = el.getBoundingClientRect()
  const tipRect = tip.getBoundingClientRect()
  const margin = 8
  let x: number
  let y: number

  switch (placement) {
    case 'bottom':
      y = rect.bottom + margin
      x = rect.left + (rect.width - tipRect.width) / 2
      break
    case 'left':
      x = rect.left - tipRect.width - margin
      y = rect.top + (rect.height - tipRect.height) / 2
      break
    case 'right':
      x = rect.right + margin
      y = rect.top + (rect.height - tipRect.height) / 2
      break
    default:
      y = rect.top - tipRect.height - margin
      x = rect.left + (rect.width - tipRect.width) / 2
  }

  if (placement === 'top' && y < margin) {
    y = rect.bottom + margin
  } else if (placement === 'bottom' && y + tipRect.height > window.innerHeight - margin) {
    y = rect.top - tipRect.height - margin
  } else if (placement === 'left' && x < margin) {
    x = rect.right + margin
  } else if (placement === 'right' && x + tipRect.width > window.innerWidth - margin) {
    x = rect.left - tipRect.width - margin
  }

  x = Math.max(margin, Math.min(x, window.innerWidth - tipRect.width - margin))
  y = Math.max(margin, Math.min(y, window.innerHeight - tipRect.height - margin))

  tip.style.left = `${x}px`
  tip.style.top = `${y}px`
}

function showTooltip(el: HTMLElement, binding: DirectiveBinding): void {
  const { content, placement, delay } = parseValue(binding.value)
  if (!content) return

  const tip = getTooltipElement()
  tip.textContent = content
  tip.style.transition = 'none'
  tip.style.opacity = '0'
  tip.style.visibility = 'hidden'
  tip.style.transform = 'none'

  positionTooltip(el, tip, placement)

  const doShow = () => {
    const reducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    tip.style.transition = reducedMotion ? 'none' : 'opacity var(--enpii-duration-fast, 150ms) var(--enpii-ease-emphasized, ease)'
    tip.style.visibility = 'visible'
    tip.style.opacity = '1'

    if (!tip.id) {
      tooltipIdCounter++
      tip.id = `enpii-tooltip-${tooltipIdCounter}`
    }
    el.setAttribute('aria-describedby', tip.id)
  }

  if (delay > 0) {
    if (showTimer) clearTimeout(showTimer)
    showTimer = setTimeout(doShow, delay)
  } else {
    doShow()
  }
}

function hideTooltip(el: HTMLElement): void {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }
  if (tooltipEl) {
    tooltipEl.style.visibility = 'hidden'
    tooltipEl.style.opacity = '0'
  }
  el.removeAttribute('aria-describedby')
}

function onScroll(): void {
  if (currentTrigger) {
    hideTooltip(currentTrigger)
    currentTrigger = null
  }
}

function addScrollListener(): void {
  scrollListenerCount++
  if (scrollListenerCount === 1) {
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
  }
}

function removeScrollListener(): void {
  scrollListenerCount--
  if (scrollListenerCount === 0) {
    document.removeEventListener('scroll', onScroll, { capture: true })
  }
}

function getHandlers(el: HTMLElement): TooltipHandlers | undefined {
  return (el as HTMLElement & { __enpiiTooltip?: TooltipHandlers }).__enpiiTooltip
}

function setHandlers(el: HTMLElement, handlers: TooltipHandlers): void {
  (el as HTMLElement & { __enpiiTooltip?: TooltipHandlers }).__enpiiTooltip = handlers
}

function clearHandlers(el: HTMLElement): void {
  delete (el as HTMLElement & { __enpiiTooltip?: TooltipHandlers }).__enpiiTooltip
}

export const vTooltip: Directive<HTMLElement, TooltipValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const show = () => {
      if (showTimer) clearTimeout(showTimer)
      currentTrigger = el
      showTooltip(el, binding)
    }
    const hide = () => {
      hideTooltip(el)
      currentTrigger = null
    }

    el.addEventListener('mouseenter', show)
    el.addEventListener('focusin', show)
    el.addEventListener('mouseleave', hide)
    el.addEventListener('focusout', hide)

    addScrollListener()
    setHandlers(el, { show, hide })
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (currentTrigger === el && binding.value) {
      showTooltip(el, binding)
    }
  },
  beforeUnmount(el: HTMLElement) {
    const handlers = getHandlers(el)
    if (handlers) {
      el.removeEventListener('mouseenter', handlers.show)
      el.removeEventListener('focusin', handlers.show)
      el.removeEventListener('mouseleave', handlers.hide)
      el.removeEventListener('focusout', handlers.hide)
      clearHandlers(el)
    }
    removeScrollListener()
    hideTooltip(el)
    if (currentTrigger === el) {
      currentTrigger = null
    }
  },
}

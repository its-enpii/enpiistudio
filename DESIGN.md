# Enpii UI — Design Guidelines

Design foundation for `@its-enpii/ui`. All components follow these rules.

## Principles

1. **Token-driven** — every visual property reads from a CSS custom property (`--enpii-*`). No hardcoded colors in component styles.
2. **One control scale** — buttons, inputs, selects and pickers share the same metrics.
3. **No overbold** — font-weight is capped at **600** everywhere. Body text 400–500, labels 500–600.
4. **Theme-agnostic** — hue values live only in theme blocks; shape/texture live in style layers.

## Spacing scale (4px grid)

All padding, margin, gap and size values are multiples of 4px:

| Token | Value | Use |
|---|---|---|
| `--enpii-space-field-gap` | `.5rem` (8px) | label → control |
| `--enpii-space-form-row-gap` | `1.5rem` (24px) | between form rows |
| `--enpii-space-control-block` | `.5rem` (8px) | button vertical padding |
| `--enpii-space-control-inline` | `1.5rem` (24px) | button horizontal padding |

Inline values used in CSS: `.25rem` (4), `.5rem` (8), `.75rem` (12), `1rem` (16), `1.25rem` (20), `1.5rem` (24), `2rem` (32). Avoid odd steps like `.375rem` / `.65rem`.

## Control scale

| Token | Value |
|---|---|
| `--enpii-control-height` | `3rem` (48px) |
| `--enpii-control-height-sm` | `2.5rem` (40px) |
| `--enpii-control-font-size` | `1rem` (16px) |

Buttons, inputs, selects, pickers all use these. Compact variants use the `-sm` height.

## Typography

- Family: Inter with system fallback (`--enpii-font-sans`)
- Labels: `.8125rem`, weight 600, color `--enpii-color-on-surface-variant`, **no uppercase**
- Help text: `.8125rem`, `on-surface-variant`; error variant uses `danger-text`
- Headings/components: weight ≤ 600

## Color & theming

Two independent dimensions:

1. **Color themes** via `[data-theme]` on `<html>`: Klasik (default), Gelap, Nord, Dracula, Solarized, Gruvbox, Rosé Pine. Themes only define token **values** (hue).
2. **Style layers** via side-effect CSS imports: Material, Glassmorphism, Neumorphism, Neobrutalism, Minimalism. Layers only override **shape/texture/weight** (radius, shadow, border, backdrop-filter) — never hue.

```js
import '@its-enpii/ui/styles.css'
import '@its-enpii/ui/styles/neobrutalism' // pick ONE
```

Any color theme combines with any style layer.

## Focus & interaction states

- Focus ring: shared token `--enpii-focus-ring` = `0 0 0 4px primary-container @12%`; visible on all controls via `:focus-visible`
- Hover: subtle border-color shift or surface tint; never layout-shifting
- Active: buttons `scale(.98)`; pressed inset where the style layer defines one
- Disabled: opacity .6, cursor not-allowed, no transform

## Motion

- Durations: `--enpii-duration-fast` (150ms) for micro-interactions, `--enpii-duration-base` (200ms) for overlays
- Easing: `--enpii-ease-emphasized: cubic-bezier(.16, 1, .3, 1)` for enter/leave
- Overlays (modal/drawer/dropdown/toast): transform + opacity transitions
- Accordion: smooth expand/collapse animation
- Cards: hover lift −1px + raised shadow
- All motion is disabled under `prefers-reduced-motion: reduce`

## Accessibility

- Every interactive element has a visible focus ring (never `outline: none` without replacement)
- Form fields pair label + control programmatically (`for`/`id` or wrapping)
- Icon-only controls require `aria-label`
- Contrast: text tokens meet WCAG AA in every built-in theme

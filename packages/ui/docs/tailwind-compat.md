# Tailwind compatibility

This package remains Tailwind-free. The preset and CSS-first theme are **opt-in artifacts for
applications that already use Tailwind**; the package never imports Tailwind and its source CSS
stays BEM + `--enpii-*` tokens.

## Version support

- `tailwind.preset.js` targets Tailwind CSS 3.x.
- `tailwind.v4.css` targets Tailwind CSS 4.x (`@theme inline`).
- Values are string references to existing tokens; no new colors, radii, or shadows are introduced.

## Import order

Load package styles before Tailwind:

```css
@import '@its-enpii/ui/styles.css';
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```

The empirical audit below confirms that this order makes `EnpiiButton`, `EnpiiBadge`,
`EnpiiInput`, and `EnpiiCard` match the no-Tailwind baseline when Tailwind preflight is active.
If Tailwind is loaded first, preflight and generic utilities can override package styles; do not
do this unless a utility override is explicitly intended.

For Tailwind 4, keep the package CSS unlayered and import Tailwind normally:

```css
@import '@its-enpii/ui/styles.css';
@import '@its-enpii/ui/tailwind.v4.css';
@import 'tailwindcss';
```

Tailwind 4 puts preflight and utilities in cascade layers, while the package CSS is unlayered.
Consequently, package component CSS keeps precedence over preflight. The v4 theme only adds
Tailwind-native utility values backed by Enpii tokens; it does not restyle `Enpii*` components.

## Preflight

Preferred setup for component-heavy screens is Tailwind preflight enabled with the import order
above. The audit found and closed the following package-side deltas. Values below are Chromium
computed values at the audit viewport; sub-pixel differences are omitted where they are only
default-font metric artifacts of the sandbox.

| Component | Property | Without Tailwind | With preflight + utilities | Status |
|---|---:|---:|---:|---|
| `EnpiiInput` | `font-family` | inherited/user agent | `var(--enpii-font-sans)` | Closed in package |
| `EnpiiInput` | `line-height` | inherited/user agent | `1.5` from preflight | Closed in package |
| `EnpiiBadge` | `font-family` | inherited/user agent | `var(--enpii-font-sans)` | Closed in package |
| `EnpiiCard` | `font-family` | inherited/user agent | `var(--enpii-font-sans)` | Closed in package |
| `EnpiiCard` | `color` | inherited/user agent | `var(--enpii-color-on-surface)` | Closed in package |
| `EnpiiCard` | `line-height` | inherited/user agent | `1.5` | Closed in package |
| `EnpiiCard` | paragraph `margin` | `1rem` default | `0` from preflight | Closed in package |
| Controls | `border-width`/`style` | package explicit values | `0 solid` from preflight | No impact: package shorthand retains `1px` and controls define it explicitly |
| Controls | `background` | package token/background state | transparent from preflight | No impact: package shorthand/state re-establishes token/background |
| Card content | heading margins/weight | `0`/`600` | `0`/`400` from preflight | Closed by existing `EnpiiCard` heading rules |

The audit also checked `bg-primary`, `text-primary`, `.border`, `rounded-md`, `.p-4`, `font-sans`,
and `.shadow-md` with preflight. Utilities changed only the elements/classes they targeted; the
package components themselves remained unchanged except for consumer-applied utility classes.

If preflight is disabled, keep the same order or import package styles alone. Do not rely on
Tailwind’s default border/background normalization.

## Dark mode

The package exposes `data-theme="dark"` tokens and keeps `prefers-color-scheme: dark` fallback
behavior. The Tailwind preset uses the same selector contract:

```js
/** @type {import('tailwindcss').Config} */
import preset from '@its-enpii/ui/tailwind.preset';

export default {
  presets: [preset],
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
};
```

The resulting `darkMode` value is `['selector', '[data-theme="dark"]']`. Dark variants therefore
align with the package dark theme. For a CSS-first Tailwind 4 setup, import
`@its-enpii/ui/tailwind.v4.css` after package styles and apply `data-theme="dark"` on `:root`
(or `html`) as usual.

## Token-backed utilities

Tailwind 3 utility examples produced by the preset:

- `bg-primary` / `text-primary` → `var(--enpii-color-primary)`
- `bg-surface` → `var(--enpii-color-surface)`
- `text-ink` / `text-on-surface` → `var(--enpii-color-on-surface)`
- `text-on-surface-variant` → `var(--enpii-color-on-surface-variant)`
- `text-outline` → `var(--enpii-color-outline)`
- `bg-accent` → `var(--enpii-color-tertiary)`
- `text-error`, `text-danger` → `var(--enpii-color-error)`
- `text-warning` → `var(--enpii-color-warning-text)`
- `text-success` → `var(--enpii-color-success-text)`
- `text-neutral` → `var(--enpii-color-neutral-text)`
- `font-sans` → `var(--enpii-font-sans)`
- `rounded-control` → `var(--enpii-radius-control)`
- `rounded-card` → `var(--enpii-radius-card)`
- `rounded-overlay` → `var(--enpii-radius-overlay)`
- `shadow-control` → `var(--enpii-shadow-control)`
- `shadow-raised` → `var(--enpii-shadow-raised)`
- `shadow-overlay` → `var(--enpii-shadow-overlay)`
- `shadow-sm` / `shadow-md` → `var(--enpii-shadow-md)`
- `shadow-lg` → `var(--enpii-shadow-lg)`
- `shadow-xl` → `var(--enpii-shadow-xl)`

Tailwind 4 uses the equivalent CSS custom properties in `@theme inline`.

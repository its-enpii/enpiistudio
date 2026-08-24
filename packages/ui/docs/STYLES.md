# Enpii UI — Style Layers

Five optional design-style skins for the component library. One app = one style.
They override **shape, texture and weight only** — color themes (`[data-theme]`)
keep working underneath, so any theme × any style combination is valid.

## Usage

```js
// main.js
import '@its-enpii/ui/styles.css'               // base (required)
import '@its-enpii/ui/styles/material'          // pick exactly ONE layer
```

Available: `material` · `glassmorphism` · `neumorphism` · `neobrutalism` · `minimalism`

---

## Material

Material Design 3 flavor.

- Pill radii — controls become fully rounded (`--enpii-radius-control: 999px`)
- M3 elevation shadows on cards, menus, overlays
- State-layer hover: translucent primary overlay on buttons/links/rows
- Font weight ≤ 500
- Filled + tonal button treatments

Best for: product dashboards wanting a familiar Google-ish feel.

## Glassmorphism

Frosted-glass translucency.

- Surfaces `rgba(255,255,255,.55)` + `backdrop-filter: blur(16px) saturate(160%)`
- 1px white borders at 40% alpha; soft large shadows
- Dark-mode surfaces switch to `rgba(20,24,32,.55)`
- `@supports` fallback to near-opaque surfaces when `backdrop-filter` is unsupported

Best for: marketing sites, media-heavy apps with imagery behind UI.

## Neumorphism

Soft extruded (light-source) surfaces.

- Fixed light surface `#e0e5ec` (dark variant `#2d3239`) for consistent light angle
- Dual shadows: dark bottom-right + white top-left; pressed states go inset
- Inputs render as pressed-in wells
- Focus outlines strengthened (contrast is inherently low in this style)

Best for: settings panels, IoT/smart-home control UIs. Not ideal for dense data apps.

## Neobrutalism

Bold flat blocks — loud shapes, quiet type.

- 2px solid black borders + hard offset shadow `4px 4px 0 #000` (no blur)
- Radius ≤ `.25rem`; hover translates element toward its shadow
- Flat saturated block colors per tone
- Typography stays ≤ 600 (never overbold)

Best for: creative tools, portfolios, brands that want maximal personality.

## Minimalism

Quiet hairline aesthetic.

- Borders reduced to 1px hairlines (~40% opacity); no shadows except subtle on overlays
- Secondary/ghost buttons are text-only
- Small radius (`.375rem`), font weight ≤ 500
- Minimal transitions

Best for: documentation, internal tools, content-first products.

---

## Coverage

Every layer covers the full component surface down to variants (buttons/badges
per tone, alerts/toasts/tabs/accordion variants, form controls, overlays, nav,
avatar/skeleton/progress). Special-purpose families (desktop splash/title bar,
assistant widget) inherit via tokens.

## Combining layers

Only import one layer. Importing two will produce unpredictable cascade order —
there is no supported multi-style mode.

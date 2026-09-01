# @its-enpii/skeleton

> Registry: `https://npm.pkg.github.com`

Layout presets for Enpii Studio applications, built on top of `@its-enpii/ui`.

## Install / import

```bash
npm install @its-enpii/skeleton @its-enpii/ui
```

```ts
import '@its-enpii/ui/styles.css'
import '@its-enpii/skeleton/styles.css'
import './brand.css'
```

Import only one style layer if needed:

```ts
import '@its-enpii/ui/styles/neobrutalism'
```

## Presets

### Admin sidebar

```vue
<script setup lang="ts">
import { EnpiiAdminSidebarLayout } from '@its-enpii/skeleton'

const sidebarItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'users', label: 'Users', icon: 'people' },
]
</script>

<template>
  <EnpiiAdminSidebarLayout
    brand="App"
    :sidebar-items="sidebarItems"
    active-key="dashboard"
  >
    <RouterView />
  </EnpiiAdminSidebarLayout>
</template>
```

### Minimal / blank

Use `EnpiiMinimalLayout` for navbar-only screens and `EnpiiBlankLayout` for
auth, print, or full-bleed views. All presets are slot-based and contain no
domain logic. Colors, radius, shadow, and typography are owned by
`--enpii-*` tokens and the consumer `brand.css` template.

Copy `packages/skeleton/brand.css` to `resources/css/brand.css` in the consuming
app, uncomment only the token groups you need, and import it after the UI style
layer.

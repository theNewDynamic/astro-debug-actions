# @thenewdynamic/astro-debug-actions

A dev-only floating debug panel for Astro sites. Surfaces project/page/block info at a glance and
visualizes the currently active viewport breakpoint.

## Installation

```sh
npm install @thenewdynamic/astro-debug-actions
```

## Usage

### 1. Register the integration

```js
// astro.config.mjs
import debugActions from '@thenewdynamic/astro-debug-actions';

export default defineConfig({
  integrations: [debugActions()],
});
```

This registers a virtual module (`virtual:tnd/debug-actions`) that feeds configuration to the
component at render time — see [Options](#options).

### 2. Render the component

```astro
---
import DebugActions from '@thenewdynamic/astro-debug-actions/components/DebugActions.astro';
---
<DebugActions entry={entry} />
```

The component does not gate its own visibility — render it only where appropriate for your project
(e.g. dev mode, preview deploys).

#### Props

| Prop    | Type                            | Required | Notes                                                                                   |
| ------- | -------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `entry` | `{ url: string; id?: string }`   | Yes      | `url` powers the "Production URL" link in the Page section; `id`, if present, is shown alongside it. |

## Requirements

The consuming project needs to provide:

- A `@data/site` module resolvable from this package, exporting `url: string` and `prod(): boolean`
  — used for the "Production URL" link.
- Tailwind CSS — the panel's static layout/spacing (padding, rounding, flex, etc.) is styled with
  Tailwind utility classes.

## Options

```ts
debugActions({
  breakpoints: [...], // Breakpoint[] | false — default: defaultBreakpoints
});
```

### `Breakpoint` shape

```ts
interface Breakpoint {
  name: string;
  minWidth: number; // px at which this breakpoint becomes active; 0 for the base breakpoint
  color: string;     // any valid CSS color
}
```

Each breakpoint gets its own `@media (min-width: …)` rule, generated as plain CSS at render time
(not via Tailwind — see [Styling](#styling)), which:

- Colors the panel's handle background and box border.
- Shows a matching colored pill next to "Breakpoint" in the Project section, visible only within
  that breakpoint's exact range.

### Extending the defaults

`defaultBreakpoints` is exported so you can append to it instead of redefining the whole list:

```ts
import debugActions, { defaultBreakpoints } from '@thenewdynamic/astro-debug-actions';

debugActions({
  breakpoints: [
    ...defaultBreakpoints,
    { name: '3xl', minWidth: 1920, color: '#b45309' },
  ],
});
```

Pass your own array (without spreading the defaults) to replace them entirely.

### Disabling the breakpoint visualization

```ts
debugActions({ breakpoints: false });
```

No "Breakpoint" row is rendered, and the handle/box fall back to solid black.

## Extending the panel (slots)

Named slots let a consuming project append to built-in sections, or add whole new ones, without
forking the component:

| Slot       | Appends to…                                       |
| ---------- | --------------------------------------------------- |
| `project`  | End of the "Project" section                         |
| `page`     | End of the "Page" section                            |
| `block`    | End of the "Block" section                           |
| `sections` | After all built-in sections — use for new sections   |

```astro
<DebugActions entry={entry}>
  <Fragment slot="page">
    <div>Custom page-level line</div>
  </Fragment>
  <DebugSection title="Feature Flags" slot="sections">
    <div>experimentX: on</div>
  </DebugSection>
</DebugActions>
```

`DebugSection` (the same title-bar + content wrapper used internally) is exported so custom
sections stay visually consistent:

```astro
import DebugSection from '@thenewdynamic/astro-debug-actions/components/DebugSection.astro';
```

## Block hover + copy URL

Tag any element you want inspectable in the Block section:

```html
<div data-block-id="abc123" data-block-component="Hero" data-block-title="Welcome">
```

`data-block-title` is optional. While the panel is pinned open (the "Keep open" button), hovering
such an element shows its component/title/id in the Block section, along with a copy button that
copies `<current-page-url>#<block-id>` to the clipboard.

## Styling

- Static layout/spacing uses Tailwind utility classes. These are always literal, complete strings
  in the source — never built by concatenation — so they survive Tailwind's content scanning.
  (An earlier version derived border classes by string-replacing background classes at render
  time; it was reverted once it became clear Tailwind can't see dynamically-assembled class names
  and would purge them in a real build.)
- Breakpoint-driven coloring and visibility are generated as raw CSS media queries at render time,
  independent of Tailwind or any host project's breakpoint config.

## Development

```sh
npm run build   # tsc one-off build
npm run dev     # tsc --watch
```

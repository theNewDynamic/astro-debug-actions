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

| Prop     | Type                            | Required | Notes                                                                                   |
| -------- | -------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `entry`  | `{ url: string; id?: string }`   | Yes      | `url` powers the "Production URL" link in the Page section; `id`, if present, is shown alongside it. |
| `badges` | `Badge[] \| false`                | No       | Passed as a prop rather than an integration option — see [`badges`](#badges) below.       |

## Requirements

The consuming project needs to provide:

- A `@data/site` module resolvable from this package, exporting `url: string` and `prod(): boolean`
  — used for the "Production URL" link.
- Tailwind CSS v4 — the panel's static layout/spacing (padding, rounding, flex, etc.) is styled with
  Tailwind utility classes.

### Required: tell Tailwind to scan this package

Tailwind v4 auto-detects class names across your project but **excludes `node_modules` by
default**. Since this package's `.astro` components are installed into `node_modules`, Tailwind
won't see their classes unless you opt this package in explicitly, via an
[`@source`](https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources)
directive in your main CSS file:

```css
@import "tailwindcss";
@source "../../node_modules/@thenewdynamic/astro-debug-actions/src/**/*.astro";
```

Adjust the relative path to match where your CSS file lives relative to your project root. Skipping
this step doesn't error — it just silently renders the panel with most of its styling (rounded
corners, spacing, colors) missing.

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

### `badges`

Arbitrary label/value pairs shown as stacked tabs above the handle — so they're visible without
opening the panel — and repeated as rows in the Project section once open. Use them for whatever
varies per project and is useful to spot at a glance: a Sanity dataset, an environment name, a
tenant, etc. Pass as many as you want.

Unlike `breakpoints`, this is a **component prop**, not an integration option — badge values
typically come from request-scoped runtime env (e.g. Cloudflare bindings, `Astro.locals`) that
isn't available yet when `astro.config.mjs` is evaluated.

```ts
interface Badge {
  label: string;  // shown before the value in the Project section, e.g. "Dataset"
  value: string;  // shown on the tab and next to the label in the Project section
  color?: string; // any valid CSS color — defaults to black if omitted
}
```

```astro
---
const badges = [
  { label: 'Dataset', value: 'staging', color: '#f59e0b' },
  { label: 'Tenant', value: 'acme' }, // no color → renders black
];
---
<DebugActions entry={entry} badges={badges} />
```

Omit the prop (or pass `false`) to disable it — the default.

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

### Playground

`playground/` is a minimal Astro app (an npm workspace) that depends on this package via
`file:..`, so it always resolves to your local source — no `npm link`/`yalc` needed. Run it with:

```sh
npm run playground   # from the repo root — starts `astro dev` inside playground/
```

Keep `npm run dev` (tsc --watch) running alongside it: `.astro` component edits hot-reload
instantly, but changes to `index.ts` (integration options) are only picked up once `tsc` rebuilds
`dist/index.js`, and — regardless of build/link method — Astro integrations are only re-evaluated
on server restart, so you'll need to restart `npm run playground` after changing `index.ts`.

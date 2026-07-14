import type { AstroIntegration } from 'astro';
import type { Badge, Breakpoint } from './types.js';

export type { Badge, Breakpoint };

export interface DebugActionsOptions {
  /**
   * Breakpoints listed in the panel's "Project" section. Pass `false` to disable
   * the breakpoint visualization (viewport label, handle/box coloring) entirely.
   */
  breakpoints?: Breakpoint[] | false;
  /**
   * Arbitrary label/value/color rows shown as stacked tabs on the closed handle, and as rows in
   * the Project section — e.g. a Sanity dataset, environment name, or tenant. Omit (or pass
   * `false`) to disable. Each badge's `color` is optional and defaults to black.
   */
  badges?: Badge[] | false;
}

export interface DebugActionsConfig {
  breakpoints: Breakpoint[] | false;
  badges: Badge[] | false;
}

export const defaultBreakpoints: Breakpoint[] = [
  { name: "base", minWidth: 0, color: "#334155" }, // slate-700
  { name: "sm", minWidth: 640, color: "#047857" }, // emerald-700
  { name: "md", minWidth: 768, color: "#0369a1" }, // sky-700
  { name: "lg", minWidth: 1024, color: "#4338ca" }, // indigo-700
  { name: "xl", minWidth: 1280, color: "#a21caf" }, // fuchsia-700
  { name: "2xl", minWidth: 1536, color: "#be123c" }, // rose-700
];

const VIRTUAL_MODULE_ID = 'virtual:tnd/debug-actions';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

const VIRTUAL_MODULE_TYPES = `
declare module 'virtual:tnd/debug-actions' {
  import type { DebugActionsConfig } from '@thenewdynamic/astro-debug-actions'
  const config: DebugActionsConfig
  export default config
}
`;

export default function debugActions(options: DebugActionsOptions = {}): AstroIntegration {
  const config: DebugActionsConfig = {
    breakpoints: options.breakpoints === false ? false : options.breakpoints ?? defaultBreakpoints,
    badges: options.badges ?? false,
  };

  return {
    name: '@thenewdynamic/astro-debug-actions',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: '@thenewdynamic/astro-debug-actions',
                resolveId(id) {
                  if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID;
                },
                load(id) {
                  if (id === RESOLVED_VIRTUAL_MODULE_ID) {
                    return `export default ${JSON.stringify(config)}`;
                  }
                },
              },
            ],
          },
        });
      },
      'astro:config:done': ({ injectTypes }) => {
        injectTypes({ filename: 'virtual-tnd-debug-actions.d.ts', content: VIRTUAL_MODULE_TYPES });
      },
    },
  };
}

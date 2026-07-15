import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import debugActions, { defaultBreakpoints } from '@thenewdynamic/astro-debug-actions';

export default defineConfig({
  integrations: [
    debugActions({
      breakpoints: defaultBreakpoints,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@data/site': fileURLToPath(new URL('./src/data/site.ts', import.meta.url)),
      },
    },
  },
});

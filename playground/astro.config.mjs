import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import debugActions, { defaultBreakpoints } from '@thenewdynamic/astro-debug-actions';

export default defineConfig({
  integrations: [
    debugActions({
      breakpoints: defaultBreakpoints,
      badges: [
        { label: 'Dataset', value: 'staging', color: '#f59e0b' },
        { label: 'Env', value: 'prod', color: '#22c55e' },
        { label: 'Tenant', value: 'acme' },
      ],
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

import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/lib/paraglide',
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    env: {
      CORATELLA_SECRET: 'test-secret',
      PUBLIC_TITLE: 'Test Title',
      PUBLIC_LOGO: '/logo.svg',
      PUBLIC_LOGOLIGHT: '/logolight.svg',
      PUBLIC_LOGODARK: '/logodark.svg',
    },
  },
});

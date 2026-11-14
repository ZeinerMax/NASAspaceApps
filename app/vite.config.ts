import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Static single-page app. `base: './'` lets the built site open from any folder (e.g. a USB stick at the venue).
export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
} as any);

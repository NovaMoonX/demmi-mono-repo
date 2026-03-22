import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@moondreamsdev/dreamer-ui/components', replacement: path.resolve(__dirname, './src/__tests__/mocks/dreamer-ui-components.tsx') },
      { find: '@moondreamsdev/dreamer-ui/utils', replacement: path.resolve(__dirname, './src/__tests__/mocks/dreamer-ui-utils.ts') },
      { find: '@moondreamsdev/dreamer-ui/hooks', replacement: path.resolve(__dirname, './src/__tests__/mocks/dreamer-ui-hooks.ts') },
      { find: '@moondreamsdev/dreamer-ui/providers', replacement: path.resolve(__dirname, './src/__tests__/mocks/dreamer-ui-providers.ts') },
      { find: '@moondreamsdev/dreamer-ui/symbols', replacement: path.resolve(__dirname, './src/__tests__/mocks/dreamer-ui-symbols.tsx') },
      { find: /^@lib\/firebase\/firebase\.config$/, replacement: path.resolve(__dirname, './src/__tests__/mocks/firebase.config.ts') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@contexts', replacement: path.resolve(__dirname, './src/contexts') },
      { find: '@hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@routes', replacement: path.resolve(__dirname, './src/routes') },
      { find: '@screens', replacement: path.resolve(__dirname, './src/screens') },
      { find: '@store', replacement: path.resolve(__dirname, './src/store') },
      { find: '@styles', replacement: path.resolve(__dirname, './src/styles') },
      { find: '@ui', replacement: path.resolve(__dirname, './src/ui') },
      { find: '@utils', replacement: path.resolve(__dirname, './src/utils') },
    ],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
});

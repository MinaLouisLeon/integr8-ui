import { integr8Vitest } from '@integr8-media/config/vitest';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
  integr8Vitest({ environment: 'jsdom', coverageThreshold: 80 }),
  defineConfig({
    test: {
      // Unit tests sit next to the code. playground/ holds Playwright specs, not Vitest tests.
      // scripts/ tests cover the registry generator (not counted in coverage, which is src/).
      include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.mjs'],
      setupFiles: ['./test/setup.ts'],
      // Vitest blanks CSS imports by default; the token sync test reads theme.css with ?raw.
      css: { include: [/src[\\/]styles[\\/].*\.css/] },
    },
  }),
);

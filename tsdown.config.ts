import { integr8Tsdown } from '@integr8-media/config/tsdown';
import { defineConfig } from 'tsdown';

// `unbundle` keeps one output file per source file. This keeps the `'use client'` directive on
// the files that need it, so a Next.js server component can still call `getThemeScript()`
// while `ThemeProvider` stays a client component.
export default defineConfig(
  integr8Tsdown({ entry: 'src/index.ts', platform: 'browser', unbundle: true }),
);

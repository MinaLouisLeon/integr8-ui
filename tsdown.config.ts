import { integr8Tsdown } from '@integr8-media/config/tsdown';
import { defineConfig } from 'tsdown';

export default defineConfig({
  ...integr8Tsdown({ entry: 'src/index.ts', platform: 'browser' }),
  // Keep one output file per source file. This keeps the `'use client'` directive on the
  // files that need it, so a Next.js server component can still call `getThemeScript()`
  // while `ThemeProvider` stays a client component.
  unbundle: true,
  inputOptions: {
    // Rolldown warns that 'use client' may be lost when bundling. With `unbundle` each file is
    // built on its own and the directive is kept, so this warning is noise.
    onLog(level, log, defaultHandler) {
      if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
      defaultHandler(level, log);
    },
  },
});

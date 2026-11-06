// Generator config for the shadcn registry (scripts/buildRegistry.mjs).
// The registry is built from the same source files as the npm package. It is standalone: a
// project copies the theme engine and the components it needs, with no npm package to install.

/** @type {import('../scripts/registryItems.mjs').RegistryConfig} */
export default {
  // Where the JSON files are served. GitHub Pages by default; set REGISTRY_BASE_URL to move it
  // (for example to a section of the website). `{name}` and `{version}` come from package.json.
  baseUrl: process.env.REGISTRY_BASE_URL ?? 'https://minalouisleon.github.io/integr8-ui/r',
  // Source folders and files that become registry items.
  sources: ['src/components', 'src/lib/cn.ts', 'src/theme'],
  // Never part of the registry: tests and test helpers.
  exclude: [/\.test\.tsx?$/, /TestUtils\.tsx?$/],
  // The theme engine is one item: its files keep their names under lib/theme/, and the item
  // also carries the tokens and styles of src/styles/theme.css.
  bundles: {
    'src/theme/': {
      name: 'theme',
      title: 'Theme',
      description:
        'Theme tokens, the Light, Dark, System, Integr8 and Integr8 Light themes, ThemeProvider, useTheme, defineTheme and getThemeScript.',
      target: '@lib/theme/',
      alias: '@/lib/theme/',
      themeCss: true,
      registryDependencies: ['fonts'],
      docs: 'Wrap your app in <ThemeProvider> from "@/lib/theme/ThemeProvider". For SSR apps, put getThemeScript() from "@/lib/theme/themeScript" in <head> to avoid a theme flash.',
    },
  },
  // `cn` lives in src/lib/cn.ts here and in `@/lib/utils` in a shadcn project.
  renames: { 'src/lib/cn.ts': { name: 'utils', file: 'lib/utils.ts' } },
  // Built from src/styles/fonts.css.
  fonts: {
    name: 'fonts',
    title: 'Fonts',
    description:
      'Inter, JetBrains Mono and Unbounded from Fontsource, served by your app (no Google Fonts requests).',
  },
  // Packages provided by the app itself: never listed as dependencies.
  peerPackages: ['react', 'react-dom'],
  // Shown by `shadcn add` after installing an item.
  docs: 'Uses the Integr8 theme tokens: run `npx shadcn@latest add {baseUrl}/theme.json` once per project.',
};

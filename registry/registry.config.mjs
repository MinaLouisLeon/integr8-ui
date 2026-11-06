// Generator config for the shadcn registry (scripts/buildRegistry.mjs).
// The registry is built from the same source files as the npm package, at build time.

/** @type {import('../scripts/registryItems.mjs').RegistryConfig} */
export default {
  // Where the JSON files are served: inside the published npm package, through jsDelivr.
  // `{name}` and `{version}` come from package.json.
  baseUrl: 'https://cdn.jsdelivr.net/npm/{name}@{version}/dist/registry',
  // Source folders and files that become registry items.
  sources: ['src/components', 'src/lib/cn.ts'],
  // Never part of the registry: tests and test helpers.
  exclude: [/\.test\.tsx?$/, /TestUtils\.tsx?$/],
  // Imports of the theme engine stay imports of the npm package, so a copied component uses
  // the same ThemeProvider as the rest of the app.
  packageImports: { 'src/theme/': '@integr8-media/ui' },
  // `cn` lives in src/lib/cn.ts here and in `@/lib/utils` in a shadcn project.
  renames: { 'src/lib/cn.ts': { name: 'utils', file: 'lib/utils.ts' } },
  // Packages provided by the app itself: never listed as dependencies.
  peerPackages: ['react', 'react-dom'],
  // Shown by `shadcn add` after installing an item.
  docs: 'Needs the @integr8-media/ui theme tokens: run `npm install @integr8-media/ui` and add `@import "@integr8-media/ui/theme.css";` after `@import "tailwindcss";` in your CSS.',
};

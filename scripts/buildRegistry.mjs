// Builds the shadcn registry into dist/registry/: one <name>.json per component, hook and lib
// file, plus registry.json (the index). Config: registry/registry.config.mjs.
//
// Usage: node scripts/buildRegistry.mjs   (runs as the last step of `npm run build`)
//
// Install an item into a shadcn project:
//   npx shadcn add https://cdn.jsdelivr.net/npm/@integr8-media/ui@<version>/dist/registry/button.json

import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../registry/registry.config.mjs';
import { buildRegistryIndex, buildRegistryItems } from './registryItems.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist', 'registry');

/** Every file under a folder (or the file itself), as repo-relative forward-slash paths. */
async function listFiles(source) {
  const absolute = join(root, source);
  const info = await stat(absolute);
  if (info.isFile()) return [source];
  const entries = await readdir(absolute, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /\.(tsx?)$/.test(entry.name))
    .map((entry) => relative(root, join(entry.parentPath, entry.name)).replaceAll('\\', '/'));
}

const paths = (await Promise.all(config.sources.map(listFiles)))
  .flat()
  .filter((path) => !config.exclude.some((pattern) => pattern.test(path)));

const files = await Promise.all(
  paths.map(async (path) => ({ path, content: await readFile(join(root, path), 'utf8') })),
);

const pkgJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const pkg = {
  name: pkgJson.name,
  version: pkgJson.version,
  homepage: pkgJson.homepage,
  dependencies: pkgJson.dependencies ?? {},
  indexContent: await readFile(join(root, 'src', 'index.ts'), 'utf8'),
};

const items = buildRegistryItems(files, pkg, config);

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await Promise.all(
  items.map((item) =>
    writeFile(join(outDir, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`),
  ),
);
await writeFile(
  join(outDir, 'registry.json'),
  `${JSON.stringify(buildRegistryIndex(items, pkg), null, 2)}\n`,
);

console.log(`dist/registry/ (${items.length} items + registry.json)`);

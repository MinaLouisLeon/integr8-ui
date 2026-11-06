// Builds the static registry site into site/: the item JSON files under site/r/ and a landing
// page at site/index.html. Run scripts/buildRegistry.mjs first (with the same
// REGISTRY_BASE_URL). .github/workflows/registry.yml deploys site/ to GitHub Pages; to host it
// on the website later, copy site/ (or just site/r/) there.
//
// Usage: node scripts/buildRegistry.mjs && node scripts/buildRegistrySite.mjs

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../registry/registry.config.mjs';
import { renderRegistryPage, resolveBaseUrl } from './registryItems.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registryDir = join(root, 'dist', 'registry');
const siteDir = join(root, 'site');

const pkgJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const index = JSON.parse(await readFile(join(registryDir, 'registry.json'), 'utf8'));
const baseUrl = resolveBaseUrl(config.baseUrl, pkgJson);

await rm(siteDir, { recursive: true, force: true });
await mkdir(siteDir, { recursive: true });
await cp(registryDir, join(siteDir, 'r'), { recursive: true });
await writeFile(join(siteDir, 'index.html'), renderRegistryPage(index, baseUrl, pkgJson.version));
// Serve files as they are (no Jekyll processing on GitHub Pages).
await writeFile(join(siteDir, '.nojekyll'), '');

console.log(`site/ (index.html + r/ with ${index.items.length} items) for ${baseUrl}`);

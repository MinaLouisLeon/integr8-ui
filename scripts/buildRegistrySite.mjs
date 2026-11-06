// Builds the static registry site into site/:
//   site/index.html                    landing page (scripts/registryPage.mjs)
//   site/components/<name>/index.html  one documentation page per item (scripts/itemPage.mjs)
//   site/r/                            the registry JSON files (from dist/registry/)
//   site/assets/fonts.css              self-hosted fonts (from dist/fonts.css + dist/fonts/), if built
//   site/playground/                   the Ladle playground (from playground/dist/), if built
//
// .github/workflows/registry.yml deploys site/ to GitHub Pages; to host it on the website
// later, copy site/ there. The fonts and the playground are optional: without them the pages
// fall back to system fonts and have no live previews.
//
// Usage: npm run site:build   (or npm run site to also serve it)

import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../registry/registry.config.mjs';
import { itemDocs, itemNameFromUrl, renderItemPage } from './itemPage.mjs';
import { resolveBaseUrl } from './registryItems.mjs';
import { renderRegistryPage } from './registryPage.mjs';
import { groupItems } from './siteLayout.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const registryDir = join(distDir, 'registry');
const playgroundDir = join(root, 'playground', 'dist');
const siteDir = join(root, 'site');
const docsPath = 'components/';

const pkgJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const index = JSON.parse(await readFile(join(registryDir, 'registry.json'), 'utf8'));
const baseUrl = resolveBaseUrl(config.baseUrl, pkgJson);

// Full items, with file contents (registry.json leaves them out).
const items = await Promise.all(
  index.items.map(async ({ name }) =>
    JSON.parse(await readFile(join(registryDir, `${name}.json`), 'utf8')),
  ),
);

await rm(siteDir, { recursive: true, force: true });
await mkdir(siteDir, { recursive: true });
await cp(registryDir, join(siteDir, 'r'), { recursive: true });

const hasFonts = existsSync(join(distDir, 'fonts.css')) && existsSync(join(distDir, 'fonts'));
if (hasFonts) {
  await mkdir(join(siteDir, 'assets'), { recursive: true });
  await cp(join(distDir, 'fonts.css'), join(siteDir, 'assets', 'fonts.css'));
  await cp(join(distDir, 'fonts'), join(siteDir, 'assets', 'fonts'), { recursive: true });
}

// Ladle stories by item: the story ids of `Button.stories.tsx` start with `button--`.
const hasPlayground = existsSync(join(playgroundDir, 'index.html'));
/** @type {Record<string, { name: string }>} */
let ladleStories = {};
if (hasPlayground) {
  await cp(playgroundDir, join(siteDir, 'playground'), { recursive: true });
  const metaPath = join(playgroundDir, 'meta.json');
  if (existsSync(metaPath))
    ladleStories = JSON.parse(await readFile(metaPath, 'utf8')).stories ?? {};
}
const storiesOf = (name) =>
  Object.entries(ladleStories)
    .filter(([id]) => id.startsWith(`${name}--`))
    .map(([id, story]) => ({ id, name: story.name ?? id }));

// Who documents which export (for links between pages), and who uses which item.
const exportOwners = new Map();
const usedBy = new Map();
for (const item of items) {
  for (const doc of itemDocs(item)) {
    if (!exportOwners.has(doc.name)) exportOwners.set(doc.name, item.name);
  }
  for (const url of item.registryDependencies ?? []) {
    const dependency = itemNameFromUrl(url);
    usedBy.set(dependency, [...(usedBy.get(dependency) ?? []), item.name]);
  }
}

const groups = groupItems(index.items);
const site = {
  baseUrl,
  version: pkgJson.version,
  registryName: pkgJson.name,
  groups,
  order: groups.flatMap((group) => group.items),
  exportOwners,
  docsPath,
  ...(hasPlayground ? { playgroundPath: 'playground/' } : {}),
  ...(hasFonts ? { fontsHref: 'assets/fonts.css' } : {}),
};

for (const item of items) {
  const folder = join(siteDir, docsPath, item.name);
  await mkdir(folder, { recursive: true });
  await writeFile(
    join(folder, 'index.html'),
    renderItemPage(
      { item, stories: storiesOf(item.name), usedBy: (usedBy.get(item.name) ?? []).sort() },
      site,
    ),
  );
}

await writeFile(
  join(siteDir, 'index.html'),
  renderRegistryPage(index, {
    baseUrl,
    version: pkgJson.version,
    docsPath,
    ...(hasPlayground ? { playgroundPath: 'playground/' } : {}),
    ...(hasFonts ? { fontsHref: 'assets/fonts.css' } : {}),
  }),
);
// Serve files as they are (no Jekyll processing on GitHub Pages).
await writeFile(join(siteDir, '.nojekyll'), '');

console.log(
  `site/ (index.html + ${items.length} item pages + r/${hasFonts ? ', fonts' : ''}${hasPlayground ? ', playground' : ''}) for ${baseUrl}`,
);

// Copies the CSS assets into dist/ after tsdown has built the JavaScript.
//
// - dist/theme.css: the Tailwind v4 preset, copied as it is.
// - dist/fonts.css + dist/fonts/*: the @imports in src/styles/fonts.css are inlined, and every
//   font file they reference is copied next to it, so fonts load offline from the package.
//
// Usage: node scripts/buildAssets.mjs

import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = join(root, 'src', 'styles');
const distDir = join(root, 'dist');
const fontsDir = join(distDir, 'fonts');

const IMPORT_PATTERN = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g;
const URL_PATTERN = /url\(\s*(["']?)([^"')]+)\1\s*\)/g;

await mkdir(fontsDir, { recursive: true });

await copyFile(join(stylesDir, 'theme.css'), join(distDir, 'theme.css'));
console.log('dist/theme.css');

const fontsSource = await readFile(join(stylesDir, 'fonts.css'), 'utf8');
const copied = new Set();
const parts = [
  '/* @integr8-media/ui fonts: Inter, JetBrains Mono and Unbounded from Fontsource (OFL-1.1). */',
];

for (const match of fontsSource.matchAll(IMPORT_PATTERN)) {
  const cssPath = resolvePackageFile(match[1]);
  const css = await readFile(cssPath, 'utf8');
  const rewritten = await rewriteUrls(css, dirname(cssPath));
  parts.push(`/* ${match[1]} */`, rewritten.trim());
}

await writeFile(join(distDir, 'fonts.css'), `${parts.join('\n')}\n`);
console.log(`dist/fonts.css (${copied.size} font files in dist/fonts/)`);

/** Finds `<package>/<file>` in the nearest node_modules folder. */
function resolvePackageFile(specifier) {
  const segments = specifier.split('/');
  const packageLength = specifier.startsWith('@') ? 2 : 1;
  const packageName = segments.slice(0, packageLength).join('/');
  const file = segments.slice(packageLength).join('/') || 'index.css';

  for (let dir = root; ; ) {
    const candidate = join(dir, 'node_modules', packageName, file);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`buildAssets: cannot find ${specifier}. Run npm install first.`);
}

/** Copies every file a stylesheet references into dist/fonts/ and points the URLs there. */
async function rewriteUrls(css, cssDir) {
  const replacements = new Map();
  for (const match of css.matchAll(URL_PATTERN)) {
    const url = match[2];
    if (url.startsWith('data:') || replacements.has(url)) continue;
    const source = resolve(cssDir, url);
    const name = basename(source);
    if (!copied.has(name)) {
      await copyFile(source, join(fontsDir, name));
      copied.add(name);
    }
    replacements.set(url, `./fonts/${name}`);
  }
  return css.replace(URL_PATTERN, (whole, _quote, url) =>
    replacements.has(url) ? `url(${replacements.get(url)})` : whole,
  );
}

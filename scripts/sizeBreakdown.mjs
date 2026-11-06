// Shows what makes up the bundle of the package's exports: bundles `import { X }` from the built
// dist/index.mjs with esbuild (the bundler size-limit uses). React and React DOM are left out, as
// the app provides them.
//
// Usage (after `npm run build`):
//   npm run size:why                                  (every export: one line each, largest first)
//   npm run size:why -- --details                     (every export, with the per-package breakdown)
//   npm run size:why -- DatePicker Calendar           (named exports, with the per-package breakdown)
//   npm run size:why -- DatePicker --modules=10       (more modules per package; 0 hides them)
//
// esbuild comes with @size-limit/esbuild; it is not a direct dependency of this repo.

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants } from 'node:zlib';
import { formatReport, formatSummary, groupByPackage, publicExports } from './bundleSizes.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = join(root, 'dist', 'index.mjs');

const args = process.argv.slice(2);
const modulesArg = args.find((arg) => arg.startsWith('--modules='));
const parsedModules = modulesArg ? Number(modulesArg.slice('--modules='.length)) : 3;
const topModules = Number.isFinite(parsedModules) && parsedModules >= 0 ? parsedModules : 3;
const names = args.filter((arg) => !arg.startsWith('--'));
const details = names.length > 0 || args.includes('--details');

if (!existsSync(entry)) {
  console.error('dist/index.mjs is missing. Run `npm run build` first.');
  process.exit(1);
}

let esbuild;
try {
  esbuild = await import('esbuild');
} catch {
  console.error(
    'esbuild was not found. It is installed with @size-limit/esbuild; run `npm install` first.',
  );
  process.exit(1);
}

const shared = {
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  write: false,
  metafile: true,
  logLevel: 'silent',
  external: ['react', 'react-dom', 'react/*', 'react-dom/*'],
  absWorkingDir: root,
};

/** Every runtime export of dist/index.mjs. */
async function listExports() {
  const result = await esbuild.build({ ...shared, entryPoints: [entry] });
  const meta = Object.values(result.metafile.outputs)[0];
  return publicExports(meta?.exports ?? []);
}

/** Bundles `import { name }` and measures it. */
async function measure(name) {
  const result = await esbuild.build({
    ...shared,
    stdin: {
      contents: `export { ${name} } from './dist/index.mjs';`,
      resolveDir: root,
      loader: 'js',
    },
  });
  const output = result.outputFiles[0];
  const meta = Object.values(result.metafile.outputs)[0];
  if (!output || !meta) throw new Error('esbuild produced no output');
  const brotliBytes = brotliCompressSync(output.contents, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length;
  const groups = groupByPackage(meta.inputs);
  return {
    name,
    minifiedBytes: output.contents.length,
    brotliBytes,
    groups,
    largest: groups[0]?.name,
  };
}

const exportsToCheck = names.length > 0 ? names : await listExports();
if (exportsToCheck.length === 0) {
  console.error('No exports found in dist/index.mjs.');
  process.exit(1);
}
if (names.length === 0) {
  console.log(`Measuring ${exportsToCheck.length} exports of dist/index.mjs...\n`);
}

// A few builds at a time: fast, without starting one esbuild build per export at once.
const BATCH = 8;
const rows = [];
for (let start = 0; start < exportsToCheck.length; start += BATCH) {
  const batch = exportsToCheck.slice(start, start + BATCH);
  const results = await Promise.allSettled(batch.map((name) => measure(name)));
  results.forEach((settled, index) => {
    const name = batch[index];
    if (settled.status === 'fulfilled') {
      rows.push(settled.value);
    } else {
      const reason = settled.reason;
      console.error(
        `Could not bundle "${name}": ${reason instanceof Error ? reason.message : reason}`,
      );
      process.exitCode = 1;
    }
  });
}

if (details) {
  for (const row of rows) {
    console.log(
      formatReport({
        label: `import { ${row.name} }`,
        groups: row.groups,
        minifiedBytes: row.minifiedBytes,
        brotliBytes: row.brotliBytes,
        topModules,
      }),
    );
    console.log('');
  }
} else {
  console.log(formatSummary(rows));
  console.log('\nFor the per-package breakdown: npm run size:why -- <Export> [<Export> ...]');
}

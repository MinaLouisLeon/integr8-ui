// Pure helpers for scripts/sizeBreakdown.mjs: group the modules of an esbuild metafile by package
// and print the result. No file system access, so they are easy to test.

/**
 * @typedef {object} ModuleSize
 * @property {string} path The module path as esbuild reports it (forward slashes).
 * @property {number} bytes Minified bytes this module adds to the bundle.
 */

/**
 * @typedef {object} PackageSize
 * @property {string} name Package name, or `@integr8-media/ui (dist)` for this package's own code.
 * @property {number} bytes Minified bytes of all its modules in the bundle.
 * @property {ModuleSize[]} modules Its modules, largest first.
 */

/** Label for this package's own built files. */
export const OWN_CODE = '@integr8-media/ui (dist)';

/**
 * The package a bundled module belongs to: the name after the last `node_modules/` (with its
 * scope), {@link OWN_CODE} for `dist/`, and `(other)` for anything else (such as `<stdin>`).
 *
 * @param {string} path
 * @returns {string}
 */
export function packageOf(path) {
  const normalized = path.replaceAll('\\', '/');
  const marker = 'node_modules/';
  const at = normalized.lastIndexOf(marker);
  if (at !== -1) {
    const parts = normalized.slice(at + marker.length).split('/');
    return parts[0]?.startsWith('@') ? `${parts[0]}/${parts[1]}` : (parts[0] ?? '(other)');
  }
  if (normalized.startsWith('dist/') || normalized.includes('/dist/')) return OWN_CODE;
  return '(other)';
}

/**
 * Groups the inputs of one esbuild output by package, largest first. Modules that add no bytes
 * (removed by tree shaking) are left out.
 *
 * @param {Record<string, { bytesInOutput: number }>} inputs `metafile.outputs[file].inputs`
 * @returns {PackageSize[]}
 */
export function groupByPackage(inputs) {
  /** @type {Map<string, PackageSize>} */
  const groups = new Map();
  for (const [rawPath, { bytesInOutput }] of Object.entries(inputs)) {
    if (bytesInOutput <= 0) continue;
    const path = rawPath.replaceAll('\\', '/');
    const name = packageOf(path);
    const group = groups.get(name) ?? { name, bytes: 0, modules: [] };
    group.bytes += bytesInOutput;
    group.modules.push({ path, bytes: bytesInOutput });
    groups.set(name, group);
  }
  const list = [...groups.values()];
  for (const group of list) group.modules.sort((a, b) => b.bytes - a.bytes);
  return list.sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name));
}

/** `12345` → `12.35 kB` (1 kB = 1000 bytes, like size-limit). */
export function formatKb(bytes) {
  return `${(bytes / 1000).toFixed(2)} kB`;
}

/**
 * The text report for one import: totals, then one line per package with its minified size, an
 * estimate of its brotli share, and its share of the bundle, then its largest modules.
 *
 * The brotli share of a package is estimated from its minified share: compression works on the
 * whole bundle, so an exact per-package brotli size does not exist.
 *
 * @param {object} report
 * @param {string} report.label For example `import { DatePicker }`.
 * @param {PackageSize[]} report.groups From {@link groupByPackage}.
 * @param {number} report.minifiedBytes Size of the minified bundle.
 * @param {number} report.brotliBytes Size of the minified bundle after brotli.
 * @param {number} [report.topModules] Largest modules listed under each package. Default 3.
 * @returns {string}
 */
export function formatReport({ label, groups, minifiedBytes, brotliBytes, topModules = 3 }) {
  const lines = [
    label,
    `  Total: ${formatKb(minifiedBytes)} minified, ${formatKb(brotliBytes)} brotli`,
    '',
    `  ${'Package'.padEnd(36)}${'Minified'.padStart(12)}${'~Brotli'.padStart(12)}${'Share'.padStart(8)}`,
  ];
  for (const group of groups) {
    const share = minifiedBytes > 0 ? group.bytes / minifiedBytes : 0;
    lines.push(
      `  ${group.name.padEnd(36)}${formatKb(group.bytes).padStart(12)}${formatKb(
        share * brotliBytes,
      ).padStart(12)}${`${(share * 100).toFixed(1)}%`.padStart(8)}`,
    );
    for (const item of group.modules.slice(0, topModules)) {
      lines.push(`      ${formatKb(item.bytes).padStart(10)}  ${shortPath(item.path)}`);
    }
  }
  return lines.join('\n');
}

/**
 * @typedef {object} ExportSize
 * @property {string} name The export, for example `DatePicker`.
 * @property {number} minifiedBytes
 * @property {number} brotliBytes
 * @property {string} [largest] The package with the most bytes in its bundle.
 */

/**
 * One line per export, largest brotli size first: the overview printed when no export is named.
 *
 * @param {ExportSize[]} rows
 * @returns {string}
 */
export function formatSummary(rows) {
  const sorted = [...rows].sort(
    (a, b) => b.brotliBytes - a.brotliBytes || a.name.localeCompare(b.name),
  );
  const width = Math.max(6, ...sorted.map((row) => row.name.length)) + 2;
  const lines = [
    `  ${'Export'.padEnd(width)}${'Minified'.padStart(12)}${'Brotli'.padStart(12)}  Largest package`,
  ];
  for (const row of sorted) {
    lines.push(
      `  ${row.name.padEnd(width)}${formatKb(row.minifiedBytes).padStart(12)}${formatKb(
        row.brotliBytes,
      ).padStart(12)}  ${row.largest ?? ''}`,
    );
  }
  return lines.join('\n');
}

/**
 * The runtime export names of a module, from esbuild's metafile (`outputs[file].exports`),
 * sorted. Names starting with `_` are left out.
 *
 * @param {string[]} exportNames
 * @returns {string[]}
 */
export function publicExports(exportNames) {
  return [...new Set(exportNames)]
    .filter((name) => name !== 'default' && !name.startsWith('_'))
    .sort((a, b) => a.localeCompare(b));
}

/** The part of a module path after its package folder (or after `dist/`), for short lines. */
export function shortPath(path) {
  const normalized = path.replaceAll('\\', '/');
  const marker = 'node_modules/';
  const at = normalized.lastIndexOf(marker);
  if (at !== -1) {
    const parts = normalized.slice(at + marker.length).split('/');
    const skip = parts[0]?.startsWith('@') ? 2 : 1;
    return parts.slice(skip).join('/') || normalized;
  }
  const dist = normalized.indexOf('dist/');
  return dist === -1 ? normalized : normalized.slice(dist);
}

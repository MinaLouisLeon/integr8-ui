// Pure helpers for the shadcn registry generator (no file system access, so they are easy to
// test). scripts/buildRegistry.mjs reads the files and writes the JSON.

/**
 * @typedef {object} RegistryConfig
 * @property {string} baseUrl Where the JSON files are served; `{name}` and `{version}` are filled in.
 * @property {string[]} sources Folders or files (relative to the repo root) to turn into items.
 * @property {RegExp[]} exclude Paths to skip.
 * @property {Record<string, string>} packageImports Source path prefix → npm package to import instead.
 * @property {Record<string, { name: string; file: string }>} renames Item name and target file overrides.
 * @property {string[]} peerPackages Packages never listed as dependencies.
 * @property {string} docs Message shown after `shadcn add`.
 */

/**
 * @typedef {object} SourceFile
 * @property {string} path Repo-relative path with forward slashes, for example `src/components/basics/Button.tsx`.
 * @property {string} content The file's text.
 */

/** Error thrown for an import the registry cannot represent. */
export class RegistryError extends Error {
  /**
   * @param {'UNRESOLVED_IMPORT' | 'DUPLICATE_NAME' | 'NOT_PUBLIC'} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'RegistryError';
    this.code = code;
  }
}

/** `DataTableColumnHeader` → `data-table-column-header`, `floatingStyles` → `floating-styles`. */
export function toKebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function baseName(path) {
  const file = path.slice(path.lastIndexOf('/') + 1);
  return file.replace(/\.(tsx?|mjs|js)$/, '');
}

function extension(path) {
  return path.slice(path.lastIndexOf('.'));
}

/**
 * The registry type of a file: PascalCase `.tsx` files are UI components, `use*` files are
 * hooks, everything else is a lib file.
 *
 * @param {string} path
 * @returns {'registry:ui' | 'registry:hook' | 'registry:lib'}
 */
export function itemType(path) {
  const name = baseName(path);
  if (/^use[A-Z]/.test(name)) return 'registry:hook';
  if (/^[A-Z]/.test(name) && path.endsWith('.tsx')) return 'registry:ui';
  return 'registry:lib';
}

/**
 * The item name and the file it becomes in a shadcn project.
 *
 * @param {string} path
 * @param {RegistryConfig} config
 * @returns {{ name: string; file: string; type: ReturnType<typeof itemType> }}
 */
export function describeFile(path, config) {
  const type = itemType(path);
  const rename = config.renames[path];
  if (rename) return { ...rename, type };
  const name = toKebabCase(baseName(path));
  const folder = type === 'registry:ui' ? 'ui' : type === 'registry:hook' ? 'hooks' : 'lib';
  return { name, file: `${folder}/${name}${extension(path)}`, type };
}

/** The `@/...` import path of a file inside a shadcn project. */
export function aliasFor(file) {
  const withoutExtension = file.replace(/\.(tsx?|mjs|js)$/, '');
  if (withoutExtension.startsWith('ui/')) return `@/components/${withoutExtension}`;
  return `@/${withoutExtension}`;
}

/** Joins a relative import onto the importing file's folder: `a/b/C.tsx` + `../d` → `a/d`. */
export function resolveRelative(fromPath, specifier) {
  const parts = fromPath.split('/').slice(0, -1);
  for (const segment of specifier.split('/')) {
    if (segment === '..') parts.pop();
    else if (segment !== '.') parts.push(segment);
  }
  return parts.join('/');
}

/** `@hookform/resolvers/zod` → `@hookform/resolvers`, `radix-ui` → `radix-ui`. */
export function packageName(specifier) {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

// `import ... from '...'` and `export ... from '...'` at the start of a line, including
// multi-line import lists. Starting at a line start skips examples inside TSDoc comments
// (` * import ...`); excluding parentheses skips `export function ...` declarations.
const IMPORT_PATTERN = /^((?:import|export)\b[^'";()]*?\bfrom\s*)(['"])([^'"]+)\2/gm;
// Side-effect imports at the start of a line: `import 'x';`
const BARE_IMPORT_PATTERN = /^(import\s*)(['"])([^'"]+)\2/gm;

/**
 * Lists every module specifier a file imports.
 *
 * @param {string} content
 * @returns {string[]}
 */
export function importSpecifiers(content) {
  const found = new Set();
  for (const match of content.matchAll(IMPORT_PATTERN)) found.add(match[3]);
  for (const match of content.matchAll(BARE_IMPORT_PATTERN)) found.add(match[3]);
  return [...found];
}

/**
 * Names imported by `import { a, type B, c as d } from 'x'` statements for one specifier.
 *
 * @param {string} content
 * @param {string} specifier
 * @returns {string[]}
 */
export function importedNames(content, specifier) {
  const names = [];
  const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `^import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s*from\\s*['"]${escaped}['"]`,
    'gm',
  );
  for (const match of content.matchAll(pattern)) {
    for (const part of match[1].split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        ?.trim();
      if (name) names.push(name);
    }
  }
  return names;
}

/** The names `src/index.ts` exports, to check that package imports stay public. */
export function publicExports(indexContent) {
  const names = new Set();
  for (const match of indexContent.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const part of match[1].split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name) names.add(name);
    }
  }
  return names;
}

/** The first sentence of the TSDoc right above `export function <name>` (or the file's first doc). */
export function describeExport(content, name) {
  const docBefore = new RegExp(
    `/\\*\\*((?:(?!\\*/)[\\s\\S])*)\\*/\\s*export\\s+(?:function|const|class)\\s+${name}\\b`,
  );
  const match = content.match(docBefore) ?? content.match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\//);
  if (!match) return undefined;
  const text = match[1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .filter((line) => !line.startsWith('@'))
    .join(' ')
    .replace(/\{@link\s+([^}]+)\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  const sentence = text.match(/^.*?[.!?](?=\s|$)/);
  return (sentence ? sentence[0] : text) || undefined;
}

/**
 * Builds every registry item from the source files.
 *
 * @param {SourceFile[]} files Every file under the configured sources (already filtered).
 * @param {{ name: string; version: string; dependencies: Record<string, string>; indexContent: string }} pkg
 * @param {RegistryConfig} config
 * @returns {object[]} shadcn registry items, ready for JSON.stringify.
 */
export function buildRegistryItems(files, pkg, config) {
  const baseUrl = config.baseUrl.replace('{name}', pkg.name).replace('{version}', pkg.version);
  const byPath = new Map(
    // `source` is the repo file; `file` (from describeFile) is its path in a shadcn project.
    files.map((file) => [file.path, { source: file, ...describeFile(file.path, config) }]),
  );
  const exported = publicExports(pkg.indexContent);

  const seen = new Map();
  for (const entry of byPath.values()) {
    const other = seen.get(entry.name);
    if (other) {
      throw new RegistryError(
        'DUPLICATE_NAME',
        `Registry: ${entry.source.path} and ${other} would both be "${entry.name}".`,
      );
    }
    seen.set(entry.name, entry.source.path);
  }

  /** Finds the source file a relative import points to (with or without extension). */
  const lookup = (resolved) =>
    byPath.get(resolved) ??
    byPath.get(`${resolved}.tsx`) ??
    byPath.get(`${resolved}.ts`) ??
    byPath.get(`${resolved}/index.ts`);

  return [...byPath.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const file = entry.source;
      const dependencies = new Set();
      const registryDependencies = new Set();
      let content = file.content;

      const rewrite = (specifier) => {
        if (!specifier.startsWith('.')) {
          const pkgName = packageName(specifier);
          if (!config.peerPackages.includes(pkgName)) {
            const range = pkg.dependencies[pkgName];
            dependencies.add(range ? `${pkgName}@${range}` : pkgName);
          }
          return specifier;
        }
        const resolved = resolveRelative(file.path, specifier);
        for (const [prefix, packageImport] of Object.entries(config.packageImports)) {
          if (`${resolved}/`.startsWith(prefix) || resolved.startsWith(prefix)) {
            for (const name of importedNames(file.content, specifier)) {
              if (!exported.has(name)) {
                throw new RegistryError(
                  'NOT_PUBLIC',
                  `Registry: ${file.path} imports "${name}" from ${specifier}, which ${packageImport} does not export.`,
                );
              }
            }
            const range = pkg.dependencies[packageImport];
            dependencies.add(
              range ? `${packageImport}@${range}` : `${packageImport}@^${pkg.version}`,
            );
            return packageImport;
          }
        }
        const target = lookup(resolved);
        if (!target) {
          throw new RegistryError(
            'UNRESOLVED_IMPORT',
            `Registry: ${file.path} imports ${specifier}, which is not part of the registry.`,
          );
        }
        registryDependencies.add(`${baseUrl}/${target.name}.json`);
        return aliasFor(target.file);
      };

      content = content.replace(IMPORT_PATTERN, (_all, head, quote, specifier) => {
        return `${head}${quote}${rewrite(specifier)}${quote}`;
      });
      content = content.replace(BARE_IMPORT_PATTERN, (_all, head, quote, specifier) => {
        return `${head}${quote}${rewrite(specifier)}${quote}`;
      });

      const title = file.path.slice(file.path.lastIndexOf('/') + 1).replace(/\.(tsx?|mjs|js)$/, '');
      const description = describeExport(file.content, title);

      return {
        $schema: 'https://ui.shadcn.com/schema/registry-item.json',
        name: entry.name,
        type: entry.type,
        title,
        ...(description ? { description } : {}),
        ...(dependencies.size > 0 ? { dependencies: [...dependencies].sort() } : {}),
        ...(registryDependencies.size > 0
          ? { registryDependencies: [...registryDependencies].sort() }
          : {}),
        files: [{ path: entry.file, type: entry.type, content }],
        docs: config.docs,
      };
    });
}

/**
 * The registry index (`registry.json`): every item without file contents.
 *
 * @param {object[]} items
 * @param {{ name: string; homepage?: string }} pkg
 */
export function buildRegistryIndex(items, pkg) {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: pkg.name,
    homepage: pkg.homepage ?? '',
    items: items.map(({ $schema: _schema, files, ...item }) => ({
      ...item,
      files: files.map(({ content: _content, ...rest }) => rest),
    })),
  };
}

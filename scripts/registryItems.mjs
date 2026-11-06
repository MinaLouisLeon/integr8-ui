// Pure helpers for the shadcn registry generator (no file system access, so they are easy to
// test). scripts/buildRegistry.mjs reads the files and writes the JSON.

/**
 * A folder that becomes one registry item with many files (the theme engine). Its files keep
 * their names and folders under `target`, so imports between them stay relative.
 *
 * @typedef {object} RegistryBundle
 * @property {string} name Item name, for example `theme`.
 * @property {string} title Item title.
 * @property {string} description Item description.
 * @property {string} target shadcn target placeholder for the folder, for example `@lib/theme/`.
 * @property {string} alias Import path of the folder in a shadcn project, for example `@/lib/theme/`.
 * @property {boolean} [themeCss] Add the tokens and styles from `src/styles/theme.css`.
 * @property {string[]} [registryDependencies] Names of other items it needs, for example `fonts`.
 * @property {string[]} [categories] Registry categories, for example `['theme']`.
 * @property {string} [docs] Message shown after `shadcn add` (default: the config's `docs`).
 */

/**
 * @typedef {object} RegistryConfig
 * @property {string} baseUrl Where the JSON files are served; `{name}` and `{version}` are filled in.
 * @property {string[]} sources Folders or files (relative to the repo root) to turn into items.
 * @property {RegExp[]} exclude Paths to skip.
 * @property {Record<string, RegistryBundle>} bundles Source folder prefix → one multi-file item.
 * @property {Record<string, { name: string; file: string }>} renames Item name and target file overrides.
 * @property {{ name: string; title: string; description: string; categories?: string[] }} fonts The fonts item.
 * @property {string[]} peerPackages Packages never listed as dependencies.
 * @property {string} docs Message shown after `shadcn add`; `{baseUrl}` is filled in.
 */

/**
 * @typedef {object} SourceFile
 * @property {string} path Repo-relative path with forward slashes, for example `src/components/basics/Button.tsx`.
 * @property {string} content The file's text.
 */

/**
 * @typedef {object} RegistryPackage
 * @property {string} name
 * @property {string} version
 * @property {string} [homepage]
 * @property {Record<string, string>} dependencies
 */

/** Error thrown for an import or a stylesheet the registry cannot represent. */
export class RegistryError extends Error {
  /**
   * @param {'UNRESOLVED_IMPORT' | 'DUPLICATE_NAME' | 'INVALID_CSS'} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'RegistryError';
    this.code = code;
  }
}

const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';

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

/**
 * The group of a source file, used as the item's registry category:
 * `src/components/<group>/...` → `<group>`, anything else → `lib`.
 */
export function categoryOf(path) {
  return path.match(/^src\/components\/([^/]+)\//)?.[1] ?? 'lib';
}

/** The base URL with `{name}` and `{version}` filled in and no trailing slash. */
export function resolveBaseUrl(baseUrl, pkg) {
  return baseUrl.replace('{name}', pkg.name).replace('{version}', pkg.version).replace(/\/+$/, '');
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

/** Replaces every import specifier in a file with `rewrite(specifier)`. */
function rewriteImports(content, rewrite) {
  const replace = (_all, head, quote, specifier) => `${head}${quote}${rewrite(specifier)}${quote}`;
  return content.replace(IMPORT_PATTERN, replace).replace(BARE_IMPORT_PATTERN, replace);
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
 * Parses a stylesheet into the nested object shape of a shadcn item's `css` field: selectors
 * and at-rules map to objects, declarations map to strings, and block-less at-rules
 * (`@import "x"`) map to `{}`. Comments are dropped and whitespace is collapsed.
 *
 * @param {string} text
 * @returns {Record<string, unknown>}
 */
export function parseCss(text) {
  const source = text.replace(/\/\*[\s\S]*?\*\//g, '');
  let index = 0;

  // Reads up to the next `;`, `{` or `}` outside strings and parentheses (data URIs, url()).
  const readStatement = () => {
    const start = index;
    let quote = null;
    let depth = 0;
    for (; index < source.length; index++) {
      const char = source[index];
      if (quote) {
        if (char === '\\') index++;
        else if (char === quote) quote = null;
      } else if (char === '"' || char === "'") quote = char;
      else if (char === '(') depth++;
      else if (char === ')') depth--;
      else if (depth === 0 && (char === ';' || char === '{' || char === '}')) break;
    }
    return source.slice(start, index).replace(/\s+/g, ' ').trim();
  };

  const parseBlock = () => {
    /** @type {Record<string, unknown>} */
    const block = {};
    while (index < source.length) {
      const statement = readStatement();
      const stop = source[index];
      index++;
      if (stop === '{') {
        const body = parseBlock();
        const existing = block[statement];
        block[statement] = typeof existing === 'object' ? { ...existing, ...body } : body;
        continue;
      }
      if (statement !== '') {
        if (statement.startsWith('@')) {
          block[statement] = {};
        } else {
          const colon = statement.indexOf(':');
          if (colon <= 0) {
            throw new RegistryError('INVALID_CSS', `Registry: cannot read CSS "${statement}".`);
          }
          block[statement.slice(0, colon).trim()] = statement.slice(colon + 1).trim();
        }
      }
      if (stop === '}') return block;
    }
    return block;
  };

  return parseBlock();
}

const LIGHT_SELECTOR = ':root, [data-theme="light"]';
const DARK_SELECTOR = '[data-theme="dark"]';
const THEME_SELECTOR = /^\[data-theme="[^"]+"\]$/;

/** `{ '--primary': 'x', 'color-scheme': 'dark' }` → `{ primary: 'x' }`. */
function toCssVars(block) {
  return Object.fromEntries(
    Object.entries(block)
      .filter(([key, value]) => key.startsWith('--') && typeof value === 'string')
      .map(([key, value]) => [key.slice(2), value]),
  );
}

/**
 * Turns the parsed `theme.css` into a shadcn item's `cssVars` and `css`.
 *
 * - The Light block becomes `cssVars.light` (`:root`), the Dark block `cssVars.dark` (`.dark`),
 *   and `@theme inline` becomes `cssVars.theme`, so `shadcn add` updates the variables a
 *   shadcn project already has instead of adding a second set.
 * - Other `[data-theme="x"]` blocks (Integr8, Integr8 Light) go into `css`. Their selector also
 *   matches `:root[data-theme="x"]` and `[data-theme="x"].dark`, so they win over the project's
 *   `:root` and `.dark` blocks wherever `shadcn add` puts them.
 * - `@source` and `@custom-variant dark` are left out: a shadcn project scans its own files and
 *   already has a `dark` variant.
 * - Everything else (`@import`, `@custom-variant integr8`, layers, keyframes, the reduced motion
 *   rule) goes into `css` as it is. `@import` packages are returned as `packages`.
 *
 * @param {Record<string, unknown>} tree The result of {@link parseCss}.
 * @returns {{ cssVars: Record<string, Record<string, string>>; css: Record<string, unknown>; packages: string[] }}
 */
export function themeCssToRegistry(tree) {
  /** @type {Record<string, Record<string, string>>} */
  const cssVars = {};
  /** @type {Record<string, unknown>} */
  const css = {};
  const packages = [];

  for (const [key, value] of Object.entries(tree)) {
    if (key.startsWith('@source') || key.startsWith('@custom-variant dark')) continue;
    if (key === '@theme inline') {
      cssVars.theme = toCssVars(value);
    } else if (key === LIGHT_SELECTOR || key === DARK_SELECTOR) {
      const mode = key === LIGHT_SELECTOR ? 'light' : 'dark';
      cssVars[mode] = toCssVars(value);
      if (typeof value['color-scheme'] === 'string') {
        css[mode === 'light' ? ':root' : '.dark'] = { 'color-scheme': value['color-scheme'] };
      }
    } else if (THEME_SELECTOR.test(key)) {
      css[`${key}, :root${key}, ${key}.dark`] = value;
    } else {
      if (key.startsWith('@import ')) {
        const specifier = key.match(/["']([^"']+)["']/)?.[1];
        if (specifier) packages.push(packageName(specifier));
      }
      css[key] = value;
    }
  }

  return { cssVars, css, packages };
}

/** `name@range` from the package's own dependencies, or the bare name. */
function withRange(pkg, name) {
  const range = pkg.dependencies[name];
  return range ? `${name}@${range}` : name;
}

/**
 * Builds every registry item from the source files.
 *
 * @param {SourceFile[]} files Every file under the configured sources (already filtered).
 * @param {RegistryPackage} pkg
 * @param {RegistryConfig} config
 * @param {{ themeCss?: string; fontsCss?: string }} [styles] `src/styles/theme.css` and `fonts.css`.
 * @returns {object[]} shadcn registry items, ready for JSON.stringify.
 */
export function buildRegistryItems(files, pkg, config, styles = {}) {
  const baseUrl = resolveBaseUrl(config.baseUrl, pkg);
  const urlOf = (name) => `${baseUrl}/${name}.json`;
  const docs = config.docs.replaceAll('{baseUrl}', baseUrl);
  const bundles = Object.entries(config.bundles ?? {});
  /** The bundle a repo path (with or without extension) belongs to. */
  const bundleOf = (path) => bundles.find(([prefix]) => `${path}/`.startsWith(prefix));

  const singles = files.filter((file) => !bundleOf(file.path));
  const byPath = new Map(
    // `source` is the repo file; `file` (from describeFile) is its path in a shadcn project.
    singles.map((file) => [file.path, { source: file, ...describeFile(file.path, config) }]),
  );
  const bundleFiles = new Map(
    bundles.map(([prefix]) => [prefix, files.filter((file) => file.path.startsWith(prefix))]),
  );

  // Every item name must be unique: single files, bundles and the fonts item.
  const seen = new Map();
  const claim = (name, owner) => {
    const other = seen.get(name);
    if (other) {
      throw new RegistryError(
        'DUPLICATE_NAME',
        `Registry: ${owner} and ${other} would both be "${name}".`,
      );
    }
    seen.set(name, owner);
  };
  for (const entry of byPath.values()) claim(entry.name, entry.source.path);
  for (const [prefix, bundle] of bundles) {
    if ((bundleFiles.get(prefix) ?? []).length > 0) claim(bundle.name, prefix);
  }
  if (styles.fontsCss !== undefined) claim(config.fonts.name, 'the fonts item');

  /** Finds the single-file item a relative import points to (with or without extension). */
  const lookup = (resolved) =>
    byPath.get(resolved) ??
    byPath.get(`${resolved}.tsx`) ??
    byPath.get(`${resolved}.ts`) ??
    byPath.get(`${resolved}/index.ts`);

  /** Does a bundle hold the file a relative import points to? */
  const bundleHas = (prefix, resolved) =>
    (bundleFiles.get(prefix) ?? []).some((file) =>
      [resolved, `${resolved}.tsx`, `${resolved}.ts`, `${resolved}/index.ts`].includes(file.path),
    );

  /**
   * Rewrites the imports of one file and collects what it needs.
   *
   * @param {SourceFile} file
   * @param {string | undefined} ownPrefix The bundle the file belongs to, if any.
   */
  const rewriteFile = (file, ownPrefix, dependencies, registryDependencies) =>
    rewriteImports(file.content, (specifier) => {
      if (!specifier.startsWith('.')) {
        const name = packageName(specifier);
        if (!config.peerPackages.includes(name)) dependencies.add(withRange(pkg, name));
        return specifier;
      }
      const resolved = resolveRelative(file.path, specifier);
      const bundle = bundleOf(resolved);
      if (bundle) {
        const [prefix, target] = bundle;
        if (!bundleHas(prefix, resolved)) {
          throw new RegistryError(
            'UNRESOLVED_IMPORT',
            `Registry: ${file.path} imports ${specifier}, which is not part of the registry.`,
          );
        }
        // Inside its own bundle a file keeps its relative imports: the folder is copied as is.
        if (prefix === ownPrefix) return specifier;
        registryDependencies.add(urlOf(target.name));
        return `${target.alias}${resolved.slice(prefix.length)}`;
      }
      const single = lookup(resolved);
      if (!single) {
        throw new RegistryError(
          'UNRESOLVED_IMPORT',
          `Registry: ${file.path} imports ${specifier}, which is not part of the registry.`,
        );
      }
      registryDependencies.add(urlOf(single.name));
      return aliasFor(single.file);
    });

  const singleItems = [...byPath.values()].map((entry) => {
    const file = entry.source;
    const dependencies = new Set();
    const registryDependencies = new Set();
    const content = rewriteFile(file, undefined, dependencies, registryDependencies);
    const title = baseName(file.path);
    const description = describeExport(file.content, title);
    return {
      $schema: ITEM_SCHEMA,
      name: entry.name,
      type: entry.type,
      title,
      ...(description ? { description } : {}),
      categories: [categoryOf(file.path)],
      ...(dependencies.size > 0 ? { dependencies: [...dependencies].sort() } : {}),
      ...(registryDependencies.size > 0
        ? { registryDependencies: [...registryDependencies].sort() }
        : {}),
      files: [{ path: entry.file, type: entry.type, content }],
      docs,
    };
  });

  const filledBundles = bundles.filter(([prefix]) => (bundleFiles.get(prefix) ?? []).length > 0);
  const bundleItems = filledBundles.map(([prefix, bundle]) => {
    const dependencies = new Set();
    const registryDependencies = new Set((bundle.registryDependencies ?? []).map(urlOf));
    const bundleFileItems = [...(bundleFiles.get(prefix) ?? [])]
      .sort((a, b) => a.path.localeCompare(b.path))
      .map((file) => {
        const relativePath = file.path.slice(prefix.length);
        return {
          path: `${bundle.alias.replace(/^@\//, '')}${relativePath}`,
          type: 'registry:lib',
          target: `${bundle.target}${relativePath}`,
          content: rewriteFile(file, prefix, dependencies, registryDependencies),
        };
      });

    let styleFields = {};
    if (bundle.themeCss && styles.themeCss !== undefined) {
      const { cssVars, css, packages } = themeCssToRegistry(parseCss(styles.themeCss));
      for (const name of packages) dependencies.add(withRange(pkg, name));
      styleFields = { cssVars, css };
    }

    return {
      $schema: ITEM_SCHEMA,
      name: bundle.name,
      type: 'registry:item',
      title: bundle.title,
      description: bundle.description,
      ...(bundle.categories ? { categories: bundle.categories } : {}),
      ...(dependencies.size > 0 ? { dependencies: [...dependencies].sort() } : {}),
      ...(registryDependencies.size > 0
        ? { registryDependencies: [...registryDependencies].sort() }
        : {}),
      files: bundleFileItems,
      ...styleFields,
      docs: (bundle.docs ?? docs).replaceAll('{baseUrl}', baseUrl),
    };
  });

  const fontsItems =
    styles.fontsCss === undefined ? [] : [buildFontsItem(styles.fontsCss, pkg, config)];

  return [...singleItems, ...bundleItems, ...fontsItems].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/**
 * The fonts item: the `@import`s of `src/styles/fonts.css` (Fontsource, no Google Fonts
 * requests) as CSS, with their packages as dependencies.
 *
 * @param {string} fontsCss
 * @param {RegistryPackage} pkg
 * @param {RegistryConfig} config
 */
export function buildFontsItem(fontsCss, pkg, config) {
  const imports = [...fontsCss.matchAll(/^\s*@import\s+["']([^"']+)["']\s*;/gm)].map(
    (match) => match[1],
  );
  const dependencies = [...new Set(imports.map(packageName))].map((name) => withRange(pkg, name));
  return {
    $schema: ITEM_SCHEMA,
    name: config.fonts.name,
    type: 'registry:item',
    title: config.fonts.title,
    description: config.fonts.description,
    ...(config.fonts.categories ? { categories: config.fonts.categories } : {}),
    ...(dependencies.length > 0 ? { dependencies: dependencies.sort() } : {}),
    css: Object.fromEntries(imports.map((specifier) => [`@import "${specifier}"`, {}])),
  };
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
    items: items.map(({ $schema: _schema, files, cssVars: _vars, css: _css, ...item }) => ({
      ...item,
      ...(files ? { files: files.map(({ content: _content, ...rest }) => rest) } : {}),
    })),
  };
}

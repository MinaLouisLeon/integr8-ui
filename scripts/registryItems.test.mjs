import { describe, expect, it } from 'vitest';
import realConfig from '../registry/registry.config.mjs';
import {
  aliasFor,
  buildFontsItem,
  buildRegistryIndex,
  buildRegistryItems,
  describeExport,
  describeFile,
  importSpecifiers,
  itemType,
  packageName,
  parseCss,
  RegistryError,
  renderRegistryPage,
  resolveBaseUrl,
  resolveRelative,
  themeCssToRegistry,
  toKebabCase,
} from './registryItems.mjs';

// A fixed base URL, so the tests do not depend on REGISTRY_BASE_URL.
const config = { ...realConfig, baseUrl: 'https://example.com/r/' };
const BASE = 'https://example.com/r';

const pkg = {
  name: '@integr8-media/ui',
  version: '1.2.3',
  homepage: 'https://example.com',
  dependencies: {
    'radix-ui': '^1.4.3',
    'lucide-react': '^1.0.0',
    'class-variance-authority': '^0.7.1',
    'tw-animate-css': '^1.4.0',
    '@fontsource-variable/inter': '^5.2.8',
    '@fontsource/unbounded': '^5.2.8',
  },
};

const cnFile = { path: 'src/lib/cn.ts', content: "export function cn() { return ''; }\n" };
const buttonFile = {
  path: 'src/components/basics/Button.tsx',
  content: [
    "import { cva } from 'class-variance-authority';",
    "import { Slot } from 'radix-ui';",
    "import type { ComponentProps, JSX } from 'react';",
    "import { cn } from '../../lib/cn';",
    '',
    '/**',
    ' * A button. Pill-shaped in the Integr8 theme.',
    ' *',
    ' * @example',
    " * import { Other } from 'not-a-dependency';",
    ' */',
    'export function Button() {}',
  ].join('\n'),
};
const switcherFile = {
  path: 'src/components/theme/ThemeSwitcher.tsx',
  content: [
    "'use client';",
    "import { MoonIcon } from 'lucide-react';",
    "import { useTheme } from '../../theme/useTheme';",
    "import { Button, type ButtonProps } from '../basics/Button';",
    '/** A theme menu. */',
    'export function ThemeSwitcher() {}',
  ].join('\n'),
};
const useThemeFile = {
  path: 'src/theme/useTheme.ts',
  content: [
    "'use client';",
    "import { useContext } from 'react';",
    "import { ThemeContext } from './themeContext';",
    'export function useTheme() {}',
  ].join('\n'),
};
const themeContextFile = {
  path: 'src/theme/themeContext.ts',
  content: "import type { ThemeBase } from './tokens';\nexport const ThemeContext = null;\n",
};
const tokensFile = { path: 'src/theme/tokens.ts', content: 'export const TOKEN_NAMES = [];\n' };
const lightFile = {
  path: 'src/theme/themes/light.ts',
  content: "import { FONT_STACKS } from '../tokens';\nexport const lightTheme = {};\n",
};
const themeFiles = [useThemeFile, themeContextFile, tokensFile, lightFile];

const themeCss = `
/* A comment { with braces } */
@import "tw-animate-css";
@source "./**/*.mjs";
@custom-variant dark (&:where(.dark, .dark *));
@custom-variant integr8 (&:where([data-theme="integr8"] *));

:root,
[data-theme="light"] {
  --background: oklch(1 0 0);
  --font-mono:
    "JetBrains Mono", ui-monospace;
  color-scheme: light;
}

[data-theme="dark"] {
  --background: oklch(0.145 0 0);
  color-scheme: dark;
}

[data-theme="integr8"] {
  --background: #07060b;
  color-scheme: dark;
}

@theme inline {
  --color-background: var(--background);
}

@layer components {
  [data-slot="grain-overlay"] {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E");
    opacity: var(--grain-opacity, 0.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-slot]:not([data-slot="spinner"]) {
    animation-duration: 0.01ms;
  }
}
`;

const fontsCss = [
  '/* Fonts */',
  '@import "@fontsource-variable/inter/index.css";',
  '@import "@fontsource/unbounded/400.css";',
  '@import "@fontsource/unbounded/600.css";',
].join('\n');

describe('naming', () => {
  it('turns file names into kebab-case item names', () => {
    expect(toKebabCase('DataTableColumnHeader')).toBe('data-table-column-header');
    expect(toKebabCase('floatingStyles')).toBe('floating-styles');
    expect(toKebabCase('useZodForm')).toBe('use-zod-form');
    expect(toKebabCase('Button')).toBe('button');
  });

  it('picks the item type from the file name', () => {
    expect(itemType('src/components/basics/Button.tsx')).toBe('registry:ui');
    expect(itemType('src/components/form/useZodForm.ts')).toBe('registry:hook');
    expect(itemType('src/components/basics/floatingStyles.ts')).toBe('registry:lib');
    expect(itemType('src/components/form/fieldBase.tsx')).toBe('registry:lib');
  });

  it('places files like a shadcn project and honours renames', () => {
    expect(describeFile('src/components/basics/Button.tsx', config)).toEqual({
      name: 'button',
      file: 'ui/button.tsx',
      type: 'registry:ui',
    });
    expect(describeFile('src/components/form/useZodForm.ts', config).file).toBe(
      'hooks/use-zod-form.ts',
    );
    expect(describeFile('src/lib/cn.ts', config)).toEqual({
      name: 'utils',
      file: 'lib/utils.ts',
      type: 'registry:lib',
    });
  });

  it('maps target files to @/ aliases', () => {
    expect(aliasFor('ui/button.tsx')).toBe('@/components/ui/button');
    expect(aliasFor('lib/utils.ts')).toBe('@/lib/utils');
    expect(aliasFor('hooks/use-zod-form.ts')).toBe('@/hooks/use-zod-form');
  });

  it('fills in the base URL and drops the trailing slash', () => {
    expect(resolveBaseUrl('https://cdn.example/{name}@{version}/r/', pkg)).toBe(
      'https://cdn.example/@integr8-media/ui@1.2.3/r',
    );
  });
});

describe('import helpers', () => {
  it('resolves relative imports and package names', () => {
    expect(resolveRelative('src/components/basics/Button.tsx', '../../lib/cn')).toBe('src/lib/cn');
    expect(resolveRelative('src/components/form/Form.tsx', './fieldBase')).toBe(
      'src/components/form/fieldBase',
    );
    expect(packageName('@hookform/resolvers/zod')).toBe('@hookform/resolvers');
    expect(packageName('radix-ui')).toBe('radix-ui');
  });

  it('finds real imports but not examples in comments', () => {
    expect(importSpecifiers(buttonFile.content)).toEqual([
      'class-variance-authority',
      'radix-ui',
      'react',
      '../../lib/cn',
    ]);
  });

  it('reads the first sentence of an export TSDoc', () => {
    expect(describeExport(buttonFile.content, 'Button')).toBe('A button.');
    expect(describeExport('const x = 1;', 'X')).toBeUndefined();
  });
});

describe('parseCss', () => {
  const tree = parseCss(themeCss);

  it('reads at-rules, selectors and declarations, and drops comments', () => {
    expect(tree['@import "tw-animate-css"']).toEqual({});
    expect(tree[':root, [data-theme="light"]']).toEqual({
      '--background': 'oklch(1 0 0)',
      '--font-mono': '"JetBrains Mono", ui-monospace',
      'color-scheme': 'light',
    });
    expect(Object.keys(tree).some((key) => key.includes('comment'))).toBe(false);
  });

  it('keeps data URIs and nested blocks intact', () => {
    const grain = tree['@layer components']['[data-slot="grain-overlay"]'];
    expect(grain['background-image']).toBe(
      `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E")`,
    );
    expect(grain.opacity).toBe('var(--grain-opacity, 0.06)');
  });

  it('merges repeated blocks', () => {
    expect(parseCss('a { color: red; } a { margin: 0; }')).toEqual({
      a: { color: 'red', margin: '0' },
    });
  });

  it('fails on a declaration without a property', () => {
    expect(() => parseCss('a { nonsense; }')).toThrow(RegistryError);
  });
});

describe('themeCssToRegistry', () => {
  const { cssVars, css, packages } = themeCssToRegistry(parseCss(themeCss));

  it('turns Light, Dark and @theme inline into cssVars', () => {
    expect(cssVars.light).toEqual({
      background: 'oklch(1 0 0)',
      'font-mono': '"JetBrains Mono", ui-monospace',
    });
    expect(cssVars.dark).toEqual({ background: 'oklch(0.145 0 0)' });
    expect(cssVars.theme).toEqual({ 'color-background': 'var(--background)' });
    expect(css[':root']).toEqual({ 'color-scheme': 'light' });
    expect(css['.dark']).toEqual({ 'color-scheme': 'dark' });
  });

  it('keeps other themes in css with a selector that wins over :root and .dark', () => {
    expect(
      css['[data-theme="integr8"], :root[data-theme="integr8"], [data-theme="integr8"].dark'],
    ).toEqual({ '--background': '#07060b', 'color-scheme': 'dark' });
  });

  it('keeps imports, the integr8 variant, layers and media; drops @source and dark', () => {
    expect(Object.keys(css)).toContain('@import "tw-animate-css"');
    expect(Object.keys(css)).toContain(
      '@custom-variant integr8 (&:where([data-theme="integr8"] *))',
    );
    expect(Object.keys(css)).toContain('@layer components');
    expect(Object.keys(css)).toContain('@media (prefers-reduced-motion: reduce)');
    expect(Object.keys(css).some((key) => key.startsWith('@source'))).toBe(false);
    expect(Object.keys(css).some((key) => key.startsWith('@custom-variant dark'))).toBe(false);
    expect(packages).toEqual(['tw-animate-css']);
  });
});

describe('buildFontsItem', () => {
  it('lists the font imports as CSS and their packages as dependencies', () => {
    const fonts = buildFontsItem(fontsCss, pkg, config);
    expect(fonts.name).toBe('fonts');
    expect(fonts.dependencies).toEqual([
      '@fontsource-variable/inter@^5.2.8',
      '@fontsource/unbounded@^5.2.8',
    ]);
    expect(Object.keys(fonts.css)).toEqual([
      '@import "@fontsource-variable/inter/index.css"',
      '@import "@fontsource/unbounded/400.css"',
      '@import "@fontsource/unbounded/600.css"',
    ]);
  });
});

describe('buildRegistryItems', () => {
  const items = buildRegistryItems([buttonFile, cnFile, switcherFile, ...themeFiles], pkg, config, {
    themeCss,
    fontsCss,
  });
  const byName = Object.fromEntries(items.map((item) => [item.name, item]));

  it('creates one item per component file, one for the theme and one for the fonts', () => {
    expect(items.map((item) => item.name)).toEqual([
      'button',
      'fonts',
      'theme',
      'theme-switcher',
      'utils',
    ]);
  });

  it('rewrites relative imports to @/ aliases and lists them as registry dependencies', () => {
    const button = byName.button;
    expect(button.files[0].path).toBe('ui/button.tsx');
    expect(button.files[0].content).toContain("import { cn } from '@/lib/utils';");
    expect(button.registryDependencies).toEqual([`${BASE}/utils.json`]);
    expect(button.dependencies).toEqual(['class-variance-authority@^0.7.1', 'radix-ui@^1.4.3']);
    expect(button.title).toBe('Button');
    expect(button.description).toBe('A button.');
    expect(button.docs).toContain(`${BASE}/theme.json`);
  });

  it('points theme imports at the copied theme engine, never at the npm package', () => {
    const switcher = byName['theme-switcher'];
    expect(switcher.files[0].content).toContain("import { useTheme } from '@/lib/theme/useTheme';");
    expect(switcher.files[0].content).toContain("from '@/components/ui/button';");
    expect(switcher.files[0].content.startsWith("'use client';")).toBe(true);
    expect(switcher.dependencies).toEqual(['lucide-react@^1.0.0']);
    expect(switcher.registryDependencies).toEqual([`${BASE}/button.json`, `${BASE}/theme.json`]);
    const everything = JSON.stringify(items);
    expect(everything).not.toContain('@integr8-media/ui@');
    expect(everything).not.toContain("from '@integr8-media/ui'");
  });

  it('copies the theme engine as one item with its folders and relative imports', () => {
    const theme = byName.theme;
    expect(theme.type).toBe('registry:item');
    expect(theme.files.map((file) => file.target)).toEqual([
      '@lib/theme/themeContext.ts',
      '@lib/theme/themes/light.ts',
      '@lib/theme/tokens.ts',
      '@lib/theme/useTheme.ts',
    ]);
    expect(theme.files[0]).toMatchObject({
      path: 'lib/theme/themeContext.ts',
      type: 'registry:lib',
    });
    const useTheme = theme.files.find((file) => file.target.endsWith('useTheme.ts'));
    expect(useTheme.content).toContain("from './themeContext';");
    const light = theme.files.find((file) => file.target.endsWith('light.ts'));
    expect(light.content).toContain("from '../tokens';");
    expect(theme.registryDependencies).toEqual([`${BASE}/fonts.json`]);
    expect(theme.dependencies).toEqual(['tw-animate-css@^1.4.0']);
  });

  it('carries the theme tokens and styles', () => {
    const theme = byName.theme;
    expect(theme.cssVars.light.background).toBe('oklch(1 0 0)');
    expect(theme.cssVars.dark.background).toBe('oklch(0.145 0 0)');
    expect(theme.cssVars.theme['color-background']).toBe('var(--background)');
    expect(Object.keys(theme.css)).toContain('@layer components');
  });

  it('never lists react as a dependency', () => {
    expect(items.flatMap((item) => item.dependencies ?? [])).not.toContainEqual(
      expect.stringMatching(/^react(@|$)/),
    );
  });

  it('fails on a relative import outside the registry', () => {
    const broken = {
      path: 'src/components/basics/Bad.tsx',
      content: "import x from '../../../test/render';\n",
    };
    expect(() => buildRegistryItems([broken], pkg, config)).toThrow(RegistryError);
  });

  it('fails on an import of a theme file that does not exist', () => {
    const missing = {
      path: 'src/components/feedback/Leak.tsx',
      content: "import { nothing } from '../../theme/notThere';\n",
    };
    try {
      buildRegistryItems([missing, ...themeFiles], pkg, config);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(RegistryError);
      expect(error.code).toBe('UNRESOLVED_IMPORT');
    }
  });

  it('fails when two items would get the same name', () => {
    const twin = { path: 'src/components/other/Button.tsx', content: '' };
    expect(() => buildRegistryItems([buttonFile, twin], pkg, config)).toThrow(/both be "button"/);
    const themeTwin = { path: 'src/components/other/Theme.tsx', content: '' };
    expect(() => buildRegistryItems([themeTwin, ...themeFiles], pkg, config)).toThrow(
      /both be "theme"/,
    );
  });

  it('builds an index without file contents or CSS', () => {
    const index = buildRegistryIndex(items, pkg);
    expect(index.name).toBe('@integr8-media/ui');
    expect(index.items).toHaveLength(5);
    expect(index.items[0].files[0]).toEqual({ path: 'ui/button.tsx', type: 'registry:ui' });
    expect(index.items[0].$schema).toBeUndefined();
    const theme = index.items.find((item) => item.name === 'theme');
    expect(theme.cssVars).toBeUndefined();
    expect(theme.css).toBeUndefined();
    expect(theme.files[0].target).toBe('@lib/theme/themeContext.ts');
    expect(index.items.find((item) => item.name === 'fonts').files).toBeUndefined();
  });
});

describe('renderRegistryPage', () => {
  const index = buildRegistryIndex(
    buildRegistryItems([buttonFile, cnFile, ...themeFiles], pkg, config, { themeCss, fontsCss }),
    pkg,
  );
  const html = renderRegistryPage(index, BASE, '1.2.3');

  it('shows the setup steps and an install command per item', () => {
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain(`npx shadcn@latest add ${BASE}/theme.json`);
    expect(html).toContain(`npx shadcn@latest add ${BASE}/button.json`);
    expect(html).toContain('version 1.2.3');
    expect(html).toContain(`&quot;@integr8&quot;: &quot;${BASE}/{name}.json&quot;`);
  });

  it('escapes item text', () => {
    const page = renderRegistryPage(
      { name: 'x', items: [{ name: 'a', description: '<b>bold</b> & "q"' }] },
      BASE,
      '1.0.0',
    );
    expect(page).toContain('&lt;b&gt;bold&lt;/b&gt; &amp; &quot;q&quot;');
    expect(page).not.toContain('<b>bold</b>');
  });
});

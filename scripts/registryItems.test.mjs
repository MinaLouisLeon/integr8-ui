import { describe, expect, it } from 'vitest';
import config from '../registry/registry.config.mjs';
import {
  aliasFor,
  buildRegistryIndex,
  buildRegistryItems,
  describeExport,
  describeFile,
  importSpecifiers,
  itemType,
  packageName,
  RegistryError,
  resolveRelative,
  toKebabCase,
} from './registryItems.mjs';

const pkg = {
  name: '@integr8-media/ui',
  version: '1.2.3',
  homepage: 'https://example.com',
  dependencies: {
    'radix-ui': '^1.4.3',
    'lucide-react': '^1.0.0',
    'class-variance-authority': '^0.7.1',
  },
  indexContent:
    "export { useTheme } from './theme/useTheme';\nexport { type ThemeBase } from './theme/tokens';",
};

const BASE = 'https://cdn.jsdelivr.net/npm/@integr8-media/ui@1.2.3/dist/registry';

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

describe('buildRegistryItems', () => {
  const items = buildRegistryItems([buttonFile, cnFile, switcherFile], pkg, config);
  const byName = Object.fromEntries(items.map((item) => [item.name, item]));

  it('creates one item per file, sorted by name', () => {
    expect(items.map((item) => item.name)).toEqual(['button', 'theme-switcher', 'utils']);
  });

  it('rewrites relative imports to @/ aliases and lists them as registry dependencies', () => {
    const button = byName.button;
    expect(button.files[0].path).toBe('ui/button.tsx');
    expect(button.files[0].content).toContain("import { cn } from '@/lib/utils';");
    expect(button.registryDependencies).toEqual([`${BASE}/utils.json`]);
    expect(button.dependencies).toEqual(['class-variance-authority@^0.7.1', 'radix-ui@^1.4.3']);
    expect(button.title).toBe('Button');
    expect(button.description).toBe('A button.');
    expect(button.docs).toContain('@integr8-media/ui/theme.css');
  });

  it('keeps theme engine imports as imports of the npm package', () => {
    const switcher = byName['theme-switcher'];
    expect(switcher.files[0].content).toContain("import { useTheme } from '@integr8-media/ui';");
    expect(switcher.files[0].content).toContain("from '@/components/ui/button';");
    expect(switcher.files[0].content.startsWith("'use client';")).toBe(true);
    expect(switcher.dependencies).toContain('@integr8-media/ui@^1.2.3');
    expect(switcher.dependencies).toContain('lucide-react@^1.0.0');
    expect(switcher.registryDependencies).toEqual([`${BASE}/button.json`]);
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

  it('fails when a theme import is not part of the public API', () => {
    const internal = {
      path: 'src/components/feedback/Leak.tsx',
      content: "import { ThemeContext } from '../../theme/themeContext';\n",
    };
    try {
      buildRegistryItems([internal], pkg, config);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(RegistryError);
      expect(error.code).toBe('NOT_PUBLIC');
    }
  });

  it('fails when two files would get the same name', () => {
    const twin = { path: 'src/components/other/Button.tsx', content: '' };
    expect(() => buildRegistryItems([buttonFile, twin], pkg, config)).toThrow(/both be "button"/);
  });

  it('builds an index without file contents', () => {
    const index = buildRegistryIndex(items, pkg);
    expect(index.name).toBe('@integr8-media/ui');
    expect(index.items).toHaveLength(3);
    expect(index.items[0].files[0]).toEqual({ path: 'ui/button.tsx', type: 'registry:ui' });
    expect(index.items[0].$schema).toBeUndefined();
  });
});

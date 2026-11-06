import { describe, expect, it } from 'vitest';
import { cssToText, importLines, itemDocs, itemNameFromUrl, renderItemPage } from './itemPage.mjs';

const BASE = 'https://example.com/r';

const buttonItem = {
  name: 'button',
  type: 'registry:ui',
  title: 'Button',
  description: 'A button.',
  categories: ['basics'],
  dependencies: ['radix-ui@^1.4.3'],
  registryDependencies: [`${BASE}/utils.json`],
  files: [
    {
      path: 'ui/button.tsx',
      type: 'registry:ui',
      content: [
        "import { cn } from '@/lib/utils';",
        '',
        '/** Props for {@link Button}. */',
        'export interface ButtonProps {',
        "  /** Visual style. Default `'default'`. */",
        "  variant?: 'default' | 'outline';",
        '}',
        '',
        '/**',
        ' * A button.',
        ' *',
        ' * @example',
        ' * ```tsx',
        ' * <Button>Save</Button>',
        ' * ```',
        ' */',
        'export function Button(props: ButtonProps) {',
        '  return <button {...props} />;',
        '}',
      ].join('\n'),
    },
  ],
};

const utilsItem = {
  name: 'utils',
  type: 'registry:lib',
  title: 'cn',
  categories: ['lib'],
  files: [
    {
      path: 'lib/utils.ts',
      type: 'registry:lib',
      content:
        '/** Merges class names. */\nexport function cn(...inputs: string[]): string {\n  return inputs.join(" ");\n}\n',
    },
  ],
};

const fontsItem = {
  name: 'fonts',
  type: 'registry:item',
  title: 'Fonts',
  categories: ['theme'],
  css: { '@import "@fontsource/unbounded/400.css"': {} },
};

const site = {
  baseUrl: BASE,
  version: '1.2.3',
  registryName: '@integr8-media/ui',
  groups: [
    { id: 'basics', label: 'Basics', items: [buttonItem] },
    { id: 'theme', label: 'Theme', items: [fontsItem] },
    { id: 'lib', label: 'Utilities', items: [utilsItem] },
  ],
  order: [buttonItem, fontsItem, utilsItem],
  exportOwners: new Map([
    ['Button', 'button'],
    ['ButtonProps', 'button'],
    ['cn', 'utils'],
  ]),
  docsPath: 'components/',
  playgroundPath: 'playground/',
  fontsHref: 'assets/fonts.css',
};

describe('helpers', () => {
  it('reads item names from registry URLs', () => {
    expect(itemNameFromUrl(`${BASE}/data-table.json`)).toBe('data-table');
  });

  it('puts the main export first', () => {
    expect(itemDocs(buttonItem).map((doc) => doc.name)).toEqual(['Button', 'ButtonProps']);
  });

  it('imports value exports from their alias', () => {
    expect(importLines(itemDocs(buttonItem))).toEqual([
      "import { Button } from '@/components/ui/button';",
    ]);
  });

  it('writes shadcn css objects as CSS', () => {
    expect(
      cssToText({ '@import "x"': {}, a: { color: 'red', '&:hover': { color: 'blue' } } }),
    ).toBe('@import "x";\na {\n  color: red;\n  &:hover {\n    color: blue;\n  }\n}');
  });
});

describe('renderItemPage: a component', () => {
  const html = renderItemPage(
    {
      item: buttonItem,
      stories: [
        { id: 'button--default', name: 'Default' },
        { id: 'button--variants', name: 'Variants' },
      ],
      usedBy: ['utils'],
    },
    site,
  );

  it('has a title, the install command and the sidebar with the current item', () => {
    expect(html).toContain('<title>Button · Integr8 UI</title>');
    expect(html).toContain('<h1>Button</h1>');
    expect(html).toContain(`data-copy="npx shadcn@latest add ${BASE}/button.json"`);
    expect(html).toContain('<a href="../../components/button/" aria-current="page">Button</a>');
    expect(html).toContain('<a href="../../components/utils/">cn</a>');
  });

  it('previews the first story, with a story picker and theme buttons', () => {
    expect(html).toContain('data-story="button--default"');
    expect(html).toContain(
      'src="../../playground/?story=button--default&amp;integr8Theme=integr8&amp;mode=preview&amp;integr8Embed=1"',
    );
    expect(html).toContain('<option value="button--variants">Variants</option>');
    expect(html).toContain('data-theme="integr8-light"');
  });

  it('expands the preview in place and never links to the playground itself', () => {
    expect(html).toContain('data-expand aria-pressed="false">Full screen</button>');
    expect(html).not.toContain('href="../../playground/');
    expect(html).not.toContain('Open in playground');
  });

  it('lists what installation adds, linking registry items', () => {
    expect(html).toContain('<code>radix-ui@^1.4.3</code>');
    expect(html).toContain('<a href="../../components/utils/"><code>utils</code></a>');
    expect(html).toContain('<code>ui/button.tsx</code>');
    expect(html).toContain('href="../../components/theme/">theme</a>');
  });

  it('shows usage with the import and the example', () => {
    expect(html).toContain('import { Button } from &#39;@/components/ui/button&#39;;');
    expect(html).toContain('&lt;Button&gt;Save&lt;/Button&gt;');
  });

  it('documents every export with a props table and links between them', () => {
    expect(html).toContain('id="api-Button"');
    expect(html).toContain('id="api-ButtonProps"');
    expect(html).toContain('<a href="#api-ButtonProps"><code>ButtonProps</code></a>');
    expect(html).toContain('<h4>Props</h4>');
    expect(html).toContain('<td><code>variant?</code></td>');
    expect(html).toContain('<code>&#39;default&#39;</code>');
  });

  it('shows the source, used by and previous/next links', () => {
    expect(html).toContain('View the source (1 file)');
    expect(html).toContain('id="used-by"');
    expect(html).toContain('<span>Next</span>Fonts');
  });
});

describe('renderItemPage: other items', () => {
  it('skips the preview without stories and the API without code', () => {
    const html = renderItemPage({ item: fontsItem }, site);
    expect(html).not.toContain('id="preview"');
    expect(html).not.toContain('id="api"');
    expect(html).toContain('id="styles"');
    expect(html).toContain('@import &quot;@fontsource/unbounded/400.css&quot;;');
    expect(html).not.toContain('add <a href="../../components/theme/">theme</a> once');
  });

  it('documents helpers and skips the preview without a playground', () => {
    const html = renderItemPage(
      { item: utilsItem, stories: [{ id: 'utils--x', name: 'X' }] },
      { ...site, playgroundPath: undefined },
    );
    expect(html).not.toContain('id="preview"');
    expect(html).toContain('id="api-cn"');
    expect(html).toContain('cn(...inputs: string[]): string');
    expect(html).toContain('<span>Previous</span>Fonts');
  });
});

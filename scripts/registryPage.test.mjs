import { describe, expect, it } from 'vitest';
import { escapeHtml, groupItems, renderRegistryPage } from './registryPage.mjs';

const BASE = 'https://example.com/r';

const index = {
  name: '@integr8-media/ui',
  items: [
    {
      name: 'button',
      type: 'registry:ui',
      title: 'Button',
      description: 'A button.',
      categories: ['basics'],
    },
    { name: 'data-table', type: 'registry:ui', title: 'DataTable', categories: ['data-table'] },
    { name: 'use-zod-form', type: 'registry:hook', title: 'useZodForm', categories: ['form'] },
    { name: 'theme', type: 'registry:item', title: 'Theme', categories: ['theme'] },
    { name: 'utils', type: 'registry:lib', title: 'cn', categories: ['lib'] },
    { name: 'mystery', type: 'registry:lib', title: 'Mystery' },
  ],
};

describe('escapeHtml', () => {
  it('escapes markup and quotes', () => {
    expect(escapeHtml(`<b>"a" & 'b'</b>`)).toBe(
      '&lt;b&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/b&gt;',
    );
  });
});

describe('groupItems', () => {
  it('groups by first category in page order, unknown ones last', () => {
    expect(groupItems(index.items).map((group) => [group.id, group.items.length])).toEqual([
      ['basics', 1],
      ['form', 1],
      ['data-table', 1],
      ['theme', 1],
      ['lib', 1],
      ['other', 1],
    ]);
  });

  it('leaves out empty groups', () => {
    expect(groupItems([]).length).toBe(0);
  });
});

describe('renderRegistryPage', () => {
  const html = renderRegistryPage(index, {
    baseUrl: BASE,
    version: '1.2.3',
    playgroundPath: 'playground/',
    fontsHref: 'assets/fonts.css',
    repositoryUrl: 'https://github.com/example/integr8-ui',
  });

  it('is a full page with the version and self-hosted fonts', () => {
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('v1.2.3');
    expect(html).toContain('<link rel="stylesheet" href="assets/fonts.css">');
    expect(html).not.toContain('fonts.googleapis.com');
  });

  it('shows the setup steps with copyable commands', () => {
    expect(html).toContain(`data-copy="npx shadcn@latest add ${BASE}/theme.json"`);
    expect(html).toContain('data-copy="npx shadcn@latest init"');
    expect(html).toContain(`&quot;@integr8&quot;: &quot;${BASE}/{name}.json&quot;`);
  });

  it('lists every item in its group with an install command and a preview hook', () => {
    expect(html).toContain('id="group-basics"');
    expect(html).toContain('id="group-other"');
    expect(html).toContain(`data-copy="npx shadcn@latest add ${BASE}/data-table.json"`);
    expect(html).toContain('data-preview="button"');
    expect(html).toContain(`href="${BASE}/use-zod-form.json"`);
    expect(html).toMatch(/<span class="tag">hook<\/span>/);
    expect(html).toMatch(/data-filter="all" aria-pressed="true">All <span>6<\/span>/);
  });

  it('counts components separately from all items', () => {
    expect(html).toContain('<strong>2</strong><span>components</span>');
    expect(html).toContain('<strong>6</strong><span>registry items</span>');
  });

  it('embeds the Ladle playground when it is part of the site', () => {
    expect(html).toContain('id="preview"');
    expect(html).toContain('data-playground="playground/"');
    expect(html).toContain('<iframe id="story-frame"');
    expect(html).toContain('data-expand aria-pressed="false">Full screen</button>');
    expect(html).toContain('href="#components">Browse components</a>');
    expect(html).toContain('href="https://github.com/example/integr8-ui">GitHub</a>');
  });

  it('never links to the playground itself, only embeds it', () => {
    expect(html).not.toContain('href="playground/');
    expect(html).not.toContain('Open in playground');
  });

  it('works without the playground, fonts or repository link', () => {
    const bare = renderRegistryPage(index, { baseUrl: BASE, version: '1.2.3' });
    expect(bare).not.toContain('id="preview"');
    expect(bare).not.toContain('<iframe');
    expect(bare).not.toContain('rel="stylesheet"');
    expect(bare).not.toContain('>GitHub</a>');
    expect(bare).toContain('id="components"');
  });

  it('links every card to its documentation page when there are item pages', () => {
    const page = renderRegistryPage(index, {
      baseUrl: BASE,
      version: '1.2.3',
      docsPath: 'components/',
    });
    expect(page).toContain('<h4><a href="components/button/">Button</a></h4>');
    expect(page).toContain(
      'href="components/data-table/" aria-label="Documentation for data-table">Docs</a>',
    );
    expect(page).not.toContain(`href="${BASE}/button.json"`);
  });

  it('escapes item text', () => {
    const page = renderRegistryPage(
      {
        name: 'x',
        items: [{ name: 'a', type: 'registry:ui', description: '<b>bold</b> & "q"' }],
      },
      { baseUrl: BASE, version: '1.0.0' },
    );
    expect(page).toContain('&lt;b&gt;bold&lt;/b&gt; &amp; &quot;q&quot;');
    expect(page).not.toContain('<b>bold</b>');
  });
});

// The landing page of the hosted registry (GitHub Pages now, a section of integr8-media.com
// later), styled like integr8-media.com (see scripts/siteLayout.mjs). Pure function, so it is
// easy to test; scripts/buildRegistrySite.mjs writes the result to site/index.html.
//
// The page works without JavaScript (setup steps and the full item list, each linking to its
// documentation page). The script adds search, group filters and the live preview, which
// embeds the Ladle playground (site/playground/) and finds each item's story through
// playground/meta.json.

import {
  codeBlock,
  commandBlock,
  escapeHtml,
  groupItems,
  PREVIEW_THEMES,
  renderShell,
  typeLabel,
} from './siteLayout.mjs';

export { escapeHtml, groupItems };

const LANDING_SCRIPT = `
    (function () {
      // Search and group filters
      var search = document.getElementById('search');
      var groups = Array.prototype.slice.call(document.querySelectorAll('.group'));
      var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
      var count = document.getElementById('result-count');
      var empty = document.getElementById('no-results');
      var filter = 'all';
      function apply() {
        var query = search.value.trim().toLowerCase();
        var shown = 0;
        groups.forEach(function (group) {
          var inFilter = filter === 'all' || group.getAttribute('data-group') === filter;
          var visible = 0;
          group.querySelectorAll('.card').forEach(function (card) {
            var match = inFilter && (!query || card.getAttribute('data-search').indexOf(query) !== -1);
            card.hidden = !match;
            if (match) visible++;
          });
          group.hidden = visible === 0;
          shown += visible;
        });
        empty.hidden = shown !== 0;
        count.textContent = shown + (shown === 1 ? ' item' : ' items') + ' shown.';
      }
      search.addEventListener('input', apply);
      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          filter = button.getAttribute('data-filter');
          filterButtons.forEach(function (other) {
            other.setAttribute('aria-pressed', String(other === button));
          });
          apply();
        });
      });

      // Live preview from the Ladle playground
      var preview = document.getElementById('preview');
      if (!preview) return;
      var base = preview.getAttribute('data-playground');
      var select = document.getElementById('story-select');
      var frame = document.getElementById('story-frame');
      var themeButtons = Array.prototype.slice.call(preview.querySelectorAll('[data-theme]'));
      var theme = 'integr8';
      function storyUrl(id) {
        return base + '?story=' + encodeURIComponent(id) + '&integr8Theme=' + theme + '&mode=preview&integr8Embed=1';
      }
      function show(id) {
        if (!id) return;
        select.value = id;
        frame.src = storyUrl(id);
      }
      themeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          theme = button.getAttribute('data-theme');
          themeButtons.forEach(function (other) {
            other.setAttribute('aria-pressed', String(other === button));
          });
          show(select.value);
        });
      });
      select.addEventListener('change', function () { show(select.value); });

      fetch(base + 'meta.json')
        .then(function (response) {
          if (!response.ok) throw new Error(response.statusText);
          return response.json();
        })
        .then(function (meta) {
          var stories = meta.stories || {};
          var ids = Object.keys(stories);
          if (ids.length === 0) throw new Error('No stories');
          select.textContent = '';
          var byGroup = {};
          ids.forEach(function (id) {
            var story = stories[id];
            var level = (story.levels && story.levels[0]) || 'Stories';
            if (!byGroup[level]) {
              byGroup[level] = document.createElement('optgroup');
              byGroup[level].label = level;
              select.appendChild(byGroup[level]);
            }
            var option = document.createElement('option');
            option.value = id;
            option.textContent = (story.levels || []).slice(1).concat(story.name).join(' / ');
            byGroup[level].appendChild(option);
          });
          select.disabled = false;

          // Story of a registry item: <name>--default, else its first story.
          function storyFor(name) {
            if (stories[name + '--default']) return name + '--default';
            for (var i = 0; i < ids.length; i++) if (ids[i].indexOf(name + '--') === 0) return ids[i];
            return null;
          }
          document.querySelectorAll('[data-preview]').forEach(function (button) {
            var id = storyFor(button.getAttribute('data-preview'));
            if (!id) return;
            button.hidden = false;
            button.addEventListener('click', function () {
              show(id);
              preview.scrollIntoView();
              frame.focus();
            });
          });
          show(storyFor('button') || ids[0]);
        })
        .catch(function () {
          select.closest('.viewer-bar').hidden = true;
          frame.hidden = true;
          document.getElementById('preview-error').hidden = false;
        });
    })();
`;

/**
 * Renders the landing page.
 *
 * @param {{ name: string; items: { name: string; type: string; title?: string; description?: string; categories?: string[] }[] }} index
 *   The registry index (`registry.json`).
 * @param {object} options
 * @param {string} options.baseUrl Where the item JSON files are served.
 * @param {string} options.version The package version the registry was built from.
 * @param {string} [options.playgroundPath] Relative path of the Ladle build, for example
 *   `playground/`. Leave out when the playground is not part of the site.
 * @param {string} [options.fontsHref] Relative path of the self-hosted fonts stylesheet.
 * @param {string} [options.repositoryUrl] Link to the source repository.
 * @param {string} [options.docsPath] Relative folder of the item pages, for example
 *   `components/` (each item at `components/<name>/`). Leave out when there are none.
 */
export function renderRegistryPage(index, options) {
  const { baseUrl, version, playgroundPath, docsPath } = options;
  const url = (name) => `${baseUrl}/${name}.json`;
  const add = (name) => `npx shadcn@latest add ${url(name)}`;
  const docsHref = (name) => (docsPath ? `${docsPath}${name}/` : null);
  const componentCount = index.items.filter((item) => item.type === 'registry:ui').length;
  const groups = groupItems(index.items);

  const registriesJson = JSON.stringify(
    { registries: { '@integr8': `${baseUrl}/{name}.json` } },
    null,
    2,
  );
  const providerSample = [
    "import { ThemeProvider } from '@/lib/theme/ThemeProvider';",
    "import { ThemeSwitcher } from '@/components/ui/theme-switcher';",
    '',
    'export function App() {',
    '  return (',
    '    <ThemeProvider defaultTheme="integr8">',
    '      <ThemeSwitcher />',
    '    </ThemeProvider>',
    '  );',
    '}',
  ].join('\n');

  const filters = groups
    .map(
      (group) =>
        `<button type="button" class="chip" data-filter="${escapeHtml(group.id)}" aria-pressed="false">${escapeHtml(group.label)} <span>${group.items.length}</span></button>`,
    )
    .join('\n          ');

  const sections = groups
    .map((group) => {
      const cards = group.items
        .map((item) => {
          const search = [item.name, item.title, item.description, group.label]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          const title = escapeHtml(item.title ?? item.name);
          const href = docsHref(item.name);
          return `<li class="card" data-name="${escapeHtml(item.name)}" data-search="${escapeHtml(search)}">
              <div class="card-head">
                <h4>${href ? `<a href="${escapeHtml(href)}">${title}</a>` : title}</h4>
                <span class="tag">${escapeHtml(typeLabel(item.type))}</span>
              </div>
              <p>${escapeHtml(item.description ?? '')}</p>
              <div class="card-actions">
                <button type="button" class="copy pill-sm" data-copy="${escapeHtml(add(item.name))}" aria-label="Copy the install command for ${escapeHtml(item.name)}">Copy install</button>
                ${href ? `<a class="pill-sm ghost" href="${escapeHtml(href)}" aria-label="Documentation for ${escapeHtml(item.name)}">Docs</a>` : ''}
                <button type="button" class="preview pill-sm ghost" data-preview="${escapeHtml(item.name)}" hidden>Preview</button>
                ${href ? '' : `<a class="pill-sm ghost" href="${escapeHtml(url(item.name))}">JSON</a>`}
              </div>
            </li>`;
        })
        .join('\n            ');
      return `<section class="group" data-group="${escapeHtml(group.id)}" aria-labelledby="group-${escapeHtml(group.id)}">
          <h3 id="group-${escapeHtml(group.id)}">${escapeHtml(group.label)}</h3>
          <ul class="cards">
            ${cards}
          </ul>
        </section>`;
    })
    .join('\n        ');

  const themeButtons = PREVIEW_THEMES.map(
    ([name, label], position) =>
      `<button type="button" class="chip" data-theme="${name}" aria-pressed="${position === 0}">${label}</button>`,
  ).join('\n            ');

  const previewSection = playgroundPath
    ? `<section id="preview" class="section" aria-labelledby="preview-title" data-playground="${escapeHtml(playgroundPath)}">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Live</p>
          <h2 id="preview-title">See it <span class="gradient">before you copy it.</span></h2>
          <p class="lead">Every component runs live from the Ladle playground. Pick a story and a theme.</p>
        </div>
        <div class="viewer">
          <div class="viewer-bar">
            <label class="field">
              <span class="sr-only">Story</span>
              <select id="story-select" disabled>
                <option>Loading stories…</option>
              </select>
            </label>
            <div class="chips" role="group" aria-label="Preview theme">
              ${themeButtons}
            </div>
            <button type="button" class="pill-sm ghost open-full" data-expand aria-pressed="false">Full screen</button>
          </div>
          <iframe id="story-frame" title="Component preview" loading="lazy"></iframe>
          <p id="preview-error" class="note" hidden>The preview could not be loaded. Try again later.</p>
        </div>
      </div>
    </section>`
    : '';

  const body = `<main id="main">
    <section class="hero">
      <div class="glow" aria-hidden="true"></div>
      <div class="wrap">
        <p class="eyebrow">Design system · v${escapeHtml(version)}</p>
        <h1>Build Integr8 apps <span class="gradient">at full speed.</span></h1>
        <p class="lead">shadcn/ui components on Radix and Tailwind v4, with the Integr8 brand built in. Copy in only what you need. There's no npm package to install.</p>
        <div class="cta">
          <a class="btn primary" href="#start">Get started</a>
          <a class="btn ghost" href="#components">Browse components</a>
        </div>
        ${commandBlock(add('theme'), 'Copy the theme install command')}
        <ul class="stats">
          <li><strong>${componentCount}</strong><span>components</span></li>
          <li><strong>5</strong><span>themes</span></li>
          <li><strong>${index.items.length}</strong><span>registry items</span></li>
        </ul>
      </div>
    </section>

    <section id="start" class="section" aria-labelledby="start-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Get started</p>
          <h2 id="start-title">Three commands to <span class="gradient">your first screen.</span></h2>
          <p class="lead">Works in any React 19 app set up for shadcn/ui with Tailwind v4: Next.js, Vite, React Router.</p>
        </div>
        <ol class="steps">
          <li class="step">
            <h3>Set up shadcn</h3>
            <p>Skip this if your project already has a <code>components.json</code>.</p>
            ${commandBlock('npx shadcn@latest init', 'Copy the init command')}
          </li>
          <li class="step">
            <h3>Add the theme</h3>
            <p>Once per project: tokens for all five themes, ThemeProvider and the fonts.</p>
            ${commandBlock(add('theme'), 'Copy the theme install command')}
          </li>
          <li class="step">
            <h3>Add components</h3>
            <p>Each one brings the parts it needs. The code is yours to change.</p>
            ${commandBlock(add('button'), 'Copy the button install command')}
          </li>
        </ol>
        <div class="extras">
          <div class="extra">
            <h3>Shorter names</h3>
            <p>Add the registry to <code>components.json</code>, then run <code>npx shadcn@latest add @integr8/button</code>.</p>
            ${codeBlock(registriesJson, 'Copy the components.json registry setting')}
          </div>
          <div class="extra">
            <h3>Wrap your app</h3>
            <p>The theme follows the OS by default. Integr8, Integr8 Light, Light and Dark are built in.</p>
            ${codeBlock(providerSample, 'Copy the ThemeProvider example')}
          </div>
        </div>
      </div>
    </section>

    ${previewSection}

    <section id="components" class="section" aria-labelledby="components-title">
      <div class="wrap">
        <div class="section-head">
          <p class="eyebrow">Registry</p>
          <h2 id="components-title">Everything in <span class="gradient">the kit.</span></h2>
          <p class="lead">Search, preview and copy. Every item installs with one command and has its own page with docs.</p>
        </div>
        <div class="toolbar">
          <label class="search">
            <span class="sr-only">Search components</span>
            <input id="search" type="search" placeholder="Search ${index.items.length} items…" autocomplete="off">
          </label>
          <div class="chips" role="group" aria-label="Filter by group">
          <button type="button" class="chip" data-filter="all" aria-pressed="true">All <span>${index.items.length}</span></button>
          ${filters}
          </div>
          <p id="result-count" class="sr-only" aria-live="polite"></p>
        </div>
        ${sections}
        <p id="no-results" class="empty" hidden>No items match your search.</p>
      </div>
    </section>
  </main>`;

  return renderShell({
    title: 'Integr8 UI',
    description:
      'The Integr8 design system as a shadcn registry: copy in only the components you need.',
    root: '',
    fontsHref: options.fontsHref,
    repositoryUrl: options.repositoryUrl,
    footerNote: `${index.name} · v${version}`,
    body,
    script: LANDING_SCRIPT,
  });
}

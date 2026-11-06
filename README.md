# @integr8-media/ui

The design system for every `@integr8-media` app: shadcn/ui components on Radix + Tailwind v4, a
theme engine with five built-in themes (Light, Dark, System, Integr8, Integr8 Light), a form kit,
a data table, a command palette and app layout pieces.

**Website: <https://minalouisleon.github.io/integr8-ui/>** — setup steps, a searchable list of
every item, live previews in every theme, and a documentation page for each item (preview,
installation, usage, API reference and source).

The full spec is in [docs/SPEC.md](docs/SPEC.md). The API reference is generated from TSDoc with
`npm run docs` (output in `docs/api/`).

## Requirements

- React 19
- Tailwind CSS v4 (only for apps that use the Tailwind preset, and for the shadcn registry)
- Node 24 LTS for tooling

## Install

There are two ways to use the design system:

| | npm package | shadcn registry (the website's method) |
| --- | --- | --- |
| How | `npm install @integr8-media/ui` | `npx shadcn@latest add <item URL>` |
| You get | Built components you import from `@integr8-media/ui` | The source of only the items you pick, copied into your app |
| Updates | Bump the package version | Run `shadcn add` again (it asks before overwriting your changes) |
| Styling | `theme.css` (Tailwind v4) or the prebuilt `styles.css` (no Tailwind) | Tailwind v4 with the tokens written into your CSS |
| Best for | Apps that want the whole kit and easy upgrades | Apps that want to change the code or keep the bundle small |

### npm package

```sh
npm install @integr8-media/ui
```

Then follow [Setup](#setup).

### shadcn registry

```sh
npx shadcn@latest init                                                          # skip if you have components.json
npx shadcn@latest add https://minalouisleon.github.io/integr8-ui/r/theme.json   # once per project
npx shadcn@latest add https://minalouisleon.github.io/integr8-ui/r/button.json  # any item
```

See [shadcn registry](#shadcn-registry) for short names, the item list and what gets copied.

## Setup

### Apps with Tailwind v4

```css
/* app.css */
@import "tailwindcss";
@import "@integr8-media/ui/theme.css";
@import "@integr8-media/ui/fonts.css";
```

`theme.css` holds the theme tokens as CSS variables, maps them to Tailwind (`bg-primary`,
`text-muted-foreground`, `rounded-lg`, `font-display`, ...), sets up the `dark:` and `integr8:`
variants, imports the enter/exit animations (tw-animate-css) and tells Tailwind to scan the
package's built files for the classes its components use. Your own markup can use the same
utilities: `bg-card`, `text-brand-1`, `dark:...`, `integr8:rounded-full`.

### Apps without Tailwind

```ts
import '@integr8-media/ui/fonts.css';
import '@integr8-media/ui/styles.css';
```

`styles.css` is prebuilt: the tokens plus every class the components use. It does not contain
utilities for your own markup.

### Fonts

`fonts.css` bundles Inter, JetBrains Mono and Unbounded from Fontsource. The font files ship in
the package: no Google Fonts requests, works offline.

## Themes

| Theme | Base | Notes |
| --- | --- | --- |
| `light` | light | Neutral palette, violet accent |
| `dark` | dark | Neutral palette, violet accent |
| `system` | follows OS | Resolves to `light` or `dark`, live |
| `integr8` | dark | The integr8-media.com look: lime primary, violet accent, Unbounded headings, pill buttons |
| `integr8-light` | light | The Integr8 brand on a light base: deep violet primary, same fonts and pills |

```tsx
import { ThemeProvider, ThemeSwitcher, useTheme } from '@integr8-media/ui';

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <ThemeSwitcher /> {/* a menu of every theme */}
      <Page />
    </ThemeProvider>
  );
}

function Page() {
  const { theme, resolvedTheme, base, themes, setTheme } = useTheme();
  return <button onClick={() => setTheme('integr8')}>Integr8 ({resolvedTheme})</button>;
}
```

The provider sets `data-theme="<resolved theme>"` on `<html>` (or on `target`) and adds the
`dark` class for dark-based themes, so Tailwind's `dark:` variant works.

### Integr8 extras

Active only in the two Integr8 themes:

- Headings use Unbounded (`font-display`); buttons, badges and tabs are pills; text selection is
  lime.
- `<GradientText>` fills text with the website's violet → cyan → lime gradient. In other themes
  it is plain text, so it can stay in place while the user switches themes.
- `<GrainOverlay />` adds the film-grain texture over the page (or `cover="parent"` for one
  section). It is not rendered when the user prefers reduced motion. It is opt-in: leave it out
  of dense tool UIs such as an IDE.

```tsx
<h1>
  Build the future, <GradientText>integrated</GradientText>.
</h1>
<GrainOverlay />
```

### Saving the theme

By default the picked theme is saved in localStorage under `integr8-theme`. Pass `storage` to
save it elsewhere; both methods may be async:

```tsx
const agentStorage: ThemeStorage = {
  get: () => agent.getSetting('theme'),
  set: (theme) => agent.setSetting('theme', theme),
};

<ThemeProvider storage={agentStorage}>...</ThemeProvider>;
```

### No flash in server-rendered apps

```tsx
// Next.js app/layout.tsx
import { getThemeScript } from '@integr8-media/ui';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

The script applies the saved built-in theme before the first paint. Pass the same
`defaultTheme` you give `ThemeProvider`.

### Brand themes

```tsx
import { defineTheme, ThemeProvider } from '@integr8-media/ui';

const ocean = defineTheme({
  name: 'ocean',
  label: 'Ocean',
  base: 'dark', // missing tokens come from the dark palette
  tokens: { primary: '#0ea5e9', ring: '#0ea5e9' },
  radius: '0.5rem',
});
const themes = [ocean]; // keep the array stable

<ThemeProvider themes={themes}>...</ThemeProvider>;
```

### Tokens

Every theme defines: `background, foreground, card, card-foreground, popover,
popover-foreground, primary, primary-foreground, secondary, secondary-foreground, muted,
muted-foreground, accent, accent-foreground, destructive, destructive-foreground, success,
warning, info, border, input, ring, brand-1, brand-2, brand-3, brand-4, radius, font-sans,
font-display, font-mono`.

### Errors

The theme engine throws `ThemeError` with a `code`: `UNKNOWN_THEME` (unregistered name passed
to `setTheme` or `defaultTheme`), `INVALID_THEME` (bad `defineTheme` input or a duplicate theme
name) or `MISSING_PROVIDER` (`useTheme` or `ThemeSwitcher` outside `ThemeProvider`).

## Components

shadcn/ui components on Radix, styled only through the theme tokens. Every component accepts
`className` (merged with `cn`, so your classes win), takes a `ref` (React 19 ref-as-prop) and
sets a `data-slot` attribute you can target in CSS. Animations finish at once when the user
prefers reduced motion (the `Spinner` keeps turning).

**Basics:** Accordion, Alert, AlertDialog, Avatar, Badge, Breadcrumb, Button, Card, Checkbox,
Collapsible, Dialog, DropdownMenu, HoverCard, Input, Kbd, Label, Popover, Progress, RadioGroup,
ScrollArea, Select, Separator, Sheet, Skeleton, Slider, Spinner, Switch, Tabs, Textarea, Toggle,
ToggleGroup, Tooltip.

**Feedback:** Toaster + `toast()` (sonner, colored by the theme tokens and following the
resolved theme), EmptyState.

**Command + menus:** Command and CommandDialog (cmdk, for a ⌘K palette), ContextMenu, Menubar,
and Shortcut, which shows a shortcut in the user's OS style (`⌘⇧P` on Apple devices,
`Ctrl+Shift+P` elsewhere). `formatShortcut(keys, platform)` gives the same labels as strings.

```tsx
<Shortcut keys="mod+shift+p" />;              // ⌘ ⇧ P  or  Ctrl Shift P
<Shortcut keys="mod+s" variant="text" />;     // ⌘S     or  Ctrl+S (for menu items)
toast.success('Saved'); // needs one <Toaster /> mounted near the app root
```

**Theme:** ThemeProvider, ThemeSwitcher, GradientText, GrainOverlay (see [Themes](#themes)).

### Form kit

react-hook-form + zod v4. `useZodForm` types the values from the schema; ready fields wire the
label, description, error message and ARIA attributes.

```tsx
import { Button, Form, PasswordField, SwitchField, TextField, useZodForm } from '@integr8-media/ui';
import { z } from 'zod';

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  newsletter: z.boolean(),
});

function SignUp() {
  const form = useZodForm(schema, { defaultValues: { email: '', password: '', newsletter: true } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => save(values))}>
        <TextField name="email" label="Email" type="email" />
        <PasswordField name="password" label="Password" autoComplete="new-password" />
        <SwitchField name="newsletter" label="Newsletter" />
        <Button type="submit">Create account</Button>
      </form>
    </Form>
  );
}
```

Ready fields: TextField, PasswordField, NumberField, TextareaField, SelectField, CheckboxField,
SwitchField, RadioField. For a custom control, use the parts: FormField, FormItem, FormLabel,
FormControl, FormDescription, FormMessage.

### Data table

On TanStack Table **v9**: sorting, search, column filters, faceted filters, pagination, column
visibility, row selection and a hook-in for row virtualization. Each piece of state can be
controlled with its prop and `on*Change`, or left to the table; `manual*` props hand sorting,
filtering or paging to the server.

```tsx
import {
  DataTable,
  type DataTableColumnDef,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTableToolbar,
} from '@integr8-media/ui';

const columns: DataTableColumnDef<Task>[] = [
  { accessorKey: 'title', header: ({ column }) => <DataTableColumnHeader column={column} title="Title" /> },
  { accessorKey: 'status', header: 'Status', filterFn: 'oneOf' },
];

<DataTable
  columns={columns}
  data={tasks}
  getRowId={(task) => task.id}
  enableRowSelection
  toolbar={(table) => (
    <DataTableToolbar table={table}>
      <DataTableFacetedFilter column={table.getColumn('status')} title="Status" options={STATUSES} />
    </DataTableToolbar>
  )}
/>;
```

- Column types: `DataTableColumnDef<TData>` is TanStack's `ColumnDef<DataTableFeatures, TData>`.
  Use `DataTableFeatures` for your own TanStack helpers, for example
  `createColumnHelper<DataTableFeatures, Task>()`.
- Read the table state in a custom toolbar with `table.state` (v9), for example
  `table.state.pagination`.
- `labels` translates every text the table shows.
- For simple static tables, use the `Table` primitives (`Table`, `TableHeader`, `TableBody`,
  `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`): same look, no TanStack.

### App layout

Sidebar, PageHeader, SplitPanes (react-resizable-panels v4), StatusBar and Toolbar.

```tsx
<SidebarProvider persist="cookie">
  <Sidebar collapsible="icon" variant="inset">
    <SidebarHeader>
      <SidebarInput type="search" aria-label="Search" placeholder="Search…" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Project</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive tooltip="Files">
              <FilesIcon />
              <span>Files</span>
            </SidebarMenuButton>
            <SidebarMenuAction aria-label="New file" showOnHover>
              <PlusIcon />
            </SidebarMenuAction>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
  </SidebarInset>
</SidebarProvider>
```

- Sidebar: `collapsible` `icon` / `offcanvas` / `none`; `variant` `sidebar` / `floating` /
  `inset`; nested menus with `SidebarMenuSub*`; ⌘B / Ctrl+B toggles. Save the state yourself
  with `open` / `onOpenChange`, or pass `persist="cookie"` (cookie `sidebar_state`).
- SplitPanes sizes follow react-resizable-panels v4: numbers are pixels, strings take units
  (`'25%'`, `'16rem'`).

## shadcn registry

Like shadcn/ui, an app can copy in only the components it needs, with no npm package to
install. The registry and its website are hosted at <https://minalouisleon.github.io/integr8-ui/>.

| Address | What it is |
| --- | --- |
| [`/`](https://minalouisleon.github.io/integr8-ui/) | Landing page: setup steps, live preview, searchable item list with copy buttons |
| `/components/<name>/` | One page per item, for example [`/components/button/`](https://minalouisleon.github.io/integr8-ui/components/button/) |
| `/r/<name>.json` | The item files `shadcn add` reads; `/r/registry.json` lists them all |
| `/playground/` | The Ladle playground the previews come from |

### Get started

Works in any React 19 app set up for shadcn/ui with Tailwind v4: Next.js, Vite, React Router.

1. **Set up shadcn.** Skip this if the project already has a `components.json`.

   ```sh
   npx shadcn@latest init
   ```

2. **Add the theme.** Once per project: the tokens of all five themes, `ThemeProvider` and the
   fonts.

   ```sh
   npx shadcn@latest add https://minalouisleon.github.io/integr8-ui/r/theme.json
   ```

3. **Add components.** Each one brings the parts it needs. The code is yours to change.

   ```sh
   npx shadcn@latest add https://minalouisleon.github.io/integr8-ui/r/button.json
   ```

4. **Wrap the app** in the copied provider. The theme follows the OS by default; Integr8,
   Integr8 Light, Light and Dark are built in.

   ```tsx
   import { ThemeProvider } from '@/lib/theme/ThemeProvider';
   import { ThemeSwitcher } from '@/components/ui/theme-switcher';

   export function App() {
     return (
       <ThemeProvider defaultTheme="integr8">
         <ThemeSwitcher />
       </ThemeProvider>
     );
   }
   ```

   For SSR apps, put `getThemeScript()` from `@/lib/theme/themeScript` in `<head>` to avoid a
   theme flash (see [No flash in server-rendered apps](#no-flash-in-server-rendered-apps)).

**Shorter names:** add the registry to `components.json`, then run
`npx shadcn@latest add @integr8/button`.

```json
{
  "registries": {
    "@integr8": "https://minalouisleon.github.io/integr8-ui/r/{name}.json"
  }
}
```

### Items

71 items (62 components) in the same groups as the website. Item names are the kebab-case file
names; each one is at `/r/<name>.json` and documented at `/components/<name>/`.

| Group | Items |
| --- | --- |
| Basics | `accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `breadcrumb`, `button`, `card`, `checkbox`, `collapsible`, `dialog`, `dropdown-menu`, `hover-card`, `input`, `kbd`, `label`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `slider`, `spinner`, `switch`, `tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`; helper `floating-styles` |
| Feedback | `empty-state`, `toaster` |
| Command & menus | `command`, `context-menu`, `menubar`, `shortcut`; helper `shortcut-keys` |
| Form kit | `form`, `text-field`, `password-field`, `number-field`, `textarea-field`, `select-field`, `checkbox-field`, `switch-field`, `radio-field`; hook `use-zod-form`; helper `field-base` |
| Data table | `data-table`, `data-table-column-header`, `data-table-faceted-filter`, `data-table-pagination`, `data-table-toolbar`, `data-table-view-options`, `table`; helpers `data-table-features`, `data-table-labels` |
| App layout | `page-header`, `sidebar`, `split-panes`, `status-bar`, `toolbar` |
| Theme | `theme`, `fonts`, `theme-switcher`, `gradient-text`, `grain-overlay` |
| Utilities | `utils` (`cn`) |

### What gets copied

- `theme` copies the theme engine to `@/lib/theme/` and writes the tokens of all five themes into
  your CSS (Light and Dark into your `:root` and `.dark` blocks). It also adds `fonts`
  (Inter, JetBrains Mono, Unbounded from Fontsource, no Google Fonts requests).
- Copied components import `cn` from `@/lib/utils`, each other from `@/components/ui/*` and the
  theme from `@/lib/theme/*`; `shadcn add` installs the npm packages and other items an item
  needs. Each item's page lists them under Installation (npm packages, also adds, files).
- Needs a shadcn CLI recent enough for `@lib/` target placeholders: use `shadcn@latest`.
- The items are also in the npm package under `@integr8-media/ui/registry/*`.

### Maintaining the website

- Items are generated from the same source files (`npm run build:registry`, config in
  `registry/registry.config.mjs`). `npm run build:registry-site` builds the site into `site/`:
  the landing page (`scripts/registryPage.mjs`, styled like integr8-media.com), the JSON in
  `r/` and, when they are built, the fonts and the Ladle playground. `npm run site` builds
  everything and serves it on <http://localhost:4173>.
- Item pages come from `scripts/itemPage.mjs`; the API reference on them is read from the TSDoc
  comments by `scripts/sourceDocs.mjs`. Good TSDoc in `src/` is the documentation: describe each
  export and prop, write defaults as "Default `x`", add `@example` blocks (the first one becomes
  the Usage section), and mark non-public exports `@internal`.
- The site groups items by their `categories` (the `src/components/<group>` folder, `lib` for
  helpers, `theme` for `theme` and `fonts`). Previews embed playground stories with
  `?integr8Embed=1`, which hides the playground's theme toolbar.
- `.github/workflows/registry.yml` builds the fonts, the playground and the registry, and deploys
  `site/` to GitHub Pages on every push to `main`. Setup once: repo Settings → Pages → Source:
  "GitHub Actions". To move the site (for example to a section of integr8-media.com), set the
  `REGISTRY_BASE_URL` (URL of the `r/` folder, such as `https://integr8-media.com/ui/r`) and
  `SITE_BASE_PATH` (path the site is served from, such as `/ui/`) repository variables.

## Non-goals

- No window manager (that is `@integr8-media/window-manager`), no file tree, editor or terminal
- No data fetching, routing or app state
- No RTL or density modes in v1
- No Google Fonts requests at runtime

## Working on this repo

```sh
npm install
npm run lint
npm run typecheck
npm run test:coverage
npm run build             # JS, CSS, fonts and the registry into dist/
npm run size              # size budgets (after build)
npm run check:exports     # publint + attw
npm run playground        # Ladle at http://localhost:61000
npm run playground:smoke  # builds the playground and runs Playwright on every story
npm run fixtures          # packs the package and checks it in a Tailwind app and a plain app
npm run docs              # TypeDoc API reference into docs/api/
npm run site              # builds the registry site (fonts, playground, registry) and serves it on :4173
npm run site:build        # the same build into site/, without the server
```

- Unit tests sit next to the code in `src/`; shared test helpers are in `test/`; the registry
  generator's tests are in `scripts/`.
- Stories live in `playground/`, one file per component; the toolbar above each story switches
  every theme.
- `fixtures/` holds two tiny Vite apps that install the packed package: `tailwind-app` uses
  `theme.css` with Tailwind v4, `plain-app` uses `styles.css`. `npm run fixtures` builds them
  and runs `fixtures/fixtures.spec.ts` (styles applied, themes switch, fonts load offline).

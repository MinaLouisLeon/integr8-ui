# @integr8-media/ui — spec

The design system for every @integr8-media app: shadcn/ui components on Radix + Tailwind v4, a theme engine with four built-in themes (Light, Dark, System, Integr8), a form kit, a data table, a command palette and app layout pieces. Build order 2. **Status: draft for review.**

## Package facts

| Item | Value |
| --- | --- |
| GitHub repo | integr8-ui (private) |
| npm | @integr8-media/ui, public |
| License | Decided at creation |
| Requires | Node 24 LTS (tooling), React 19 |
| Peer dependencies | react ^19, react-dom ^19; tailwindcss ^4 (optional: only for apps that use the Tailwind preset) |
| Tooling | @integr8-media/config ^1.0.0: tsconfig `react-library.json`, Biome preset, `integr8Vitest({ environment: 'jsdom' })`, `integr8Tsdown({ platform: 'browser' })` |
| Playground | Ladle |

**Runtime dependencies (approved list; anything else must be asked first):** radix-ui, class-variance-authority, clsx, tailwind-merge, lucide-react, cmdk, sonner, @tanstack/react-table, react-hook-form, @hookform/resolvers, zod, react-resizable-panels, @fontsource-variable/inter, @fontsource-variable/jetbrains-mono, @fontsource/unbounded.

## Exports

| Import path | What it is |
| --- | --- |
| `@integr8-media/ui` | All components, hooks, `ThemeProvider`, `useTheme`, `defineTheme`, `cn` (named exports only) |
| `@integr8-media/ui/theme.css` | Tailwind v4 preset: theme tokens as CSS variables, `@theme inline` mapping, `@custom-variant dark`, and `@source` pointing at the package's built files so Tailwind sees its classes |
| `@integr8-media/ui/styles.css` | Prebuilt CSS for apps without Tailwind: tokens + every class the components use |
| `@integr8-media/ui/fonts.css` | `@font-face` rules for Inter, JetBrains Mono and Unbounded, bundled from Fontsource (no Google Fonts requests, works offline) |
| `@integr8-media/ui/registry/<name>.json` | shadcn registry items, published inside the npm package |

**Using the registry:** `npx shadcn add https://cdn.jsdelivr.net/npm/@integr8-media/ui@<version>/dist/registry/button.json` copies a component into a project for heavy customizing. The registry is generated from the same source files at build time.

## Themes

Four themes ship built in. "System" is not a palette of its own: it follows the OS setting and resolves to Light or Dark.

| Theme | Base | Source |
| --- | --- | --- |
| `light` | light | Neutral shadcn-style palette, violet accent |
| `dark` | dark | Neutral shadcn-style palette, violet accent |
| `system` | follows OS | Resolves to `light` or `dark` through `prefers-color-scheme`, live |
| `integr8` | dark | Inspired by integr8-media.com (see below) |

### Theme API

```ts
type ThemeName = 'light' | 'dark' | 'system' | 'integr8' | (string & {});

interface ThemeStorage {
  get(): ThemeName | null | Promise<ThemeName | null>;
  set(theme: ThemeName): void | Promise<void>;
}

export function ThemeProvider(props: {
  children: React.ReactNode;
  defaultTheme?: ThemeName;            // default 'system'
  storage?: ThemeStorage;              // default: localStorage key 'integr8-theme'
  themes?: ThemeDefinition[];          // extra brand themes
  target?: HTMLElement;                // default document.documentElement
}): React.JSX.Element;

export function useTheme(): {
  theme: ThemeName;                    // what the user picked
  resolvedTheme: string;               // 'light' | 'dark' | 'integr8' | custom; never 'system'
  base: 'light' | 'dark';              // the resolved theme's base
  themes: ThemeDefinition[];
  setTheme(theme: ThemeName): void;
};

export function defineTheme(def: {
  name: string;
  label: string;
  base: 'light' | 'dark';
  tokens: Partial<Record<TokenName, string>>; // missing tokens fall back to the base palette
  fonts?: { sans?: string; display?: string; mono?: string };
  radius?: string;
}): ThemeDefinition;

export function getThemeScript(options?: { storageKey?: string; defaultTheme?: ThemeName }): string;
```

- The provider sets `data-theme="<resolved>"` on the target and adds the `dark` class when the base is dark, so Tailwind's `dark:` variant works for every dark-based theme.
- `getThemeScript()` returns a tiny inline script that applies the stored theme before the first paint (no flash) for SSR apps such as Next.js.
- Storage is pluggable: Integr8 Workbench passes an adapter that saves on the agent per device.
- A `<ThemeSwitcher />` component shows the four themes (plus registered ones) as a menu.

### Tokens

Every theme defines the same CSS variables (shadcn names plus extras):

`background, foreground, card, card-foreground, popover, popover-foreground, primary, primary-foreground, secondary, secondary-foreground, muted, muted-foreground, accent, accent-foreground, destructive, destructive-foreground, success, warning, info, border, input, ring, brand-1, brand-2, brand-3, brand-4, radius, font-sans, font-display, font-mono`

### Integr8 theme values (from integr8-media.com `globals.css` and `layout.tsx`)

| Token | Value | Website source |
| --- | --- | --- |
| background | `#07060b` | `--bg` |
| card, popover, secondary | `#100e18` | `--bg-soft` |
| foreground, card/popover-foreground | `#f4f2ff` | `--fg` |
| muted-foreground | `#9a96b0` | `--muted` |
| muted | `rgba(255,255,255,0.06)` | derived from `--line` |
| border, input | `rgba(255,255,255,0.08)` | `--line` |
| primary | `#c6ff3d` (lime) | `--lime`, used for CTAs and selection |
| primary-foreground | `#07060b` | text on lime |
| accent, ring | `#7c5cff` (violet) | `--violet` |
| accent-foreground | `#f4f2ff` | `--fg` |
| info | `#22d3ee` (cyan) | `--cyan` |
| brand-1 … brand-4 | violet `#7c5cff`, cyan `#22d3ee`, lime `#c6ff3d`, pink `#ff4fd8` | `--violet`, `--cyan`, `--lime`, `--pink` |
| destructive | `#ff5470` | not on the website; added for errors (pink is a brand color, not an error color) |
| success / warning | `#3ddc97` / `#ffb547` | not on the website; added |
| font-display | Unbounded (400, 600, 800) | `--font-display` |
| font-sans | Inter | `--font-body` |
| font-mono | JetBrains Mono | `--font-mono` |
| radius | `1rem` cards; buttons and badges fully rounded (pill) | `rounded-2xl`/`rounded-[2rem]` cards, `rounded-full` buttons |

**Integr8 extras (active only in the integr8 theme):** headings use `font-display`; `::selection` is lime on `#07060b`; `<GradientText>` renders the website's violet → cyan → lime gradient; `<GrainOverlay>` adds the film-grain texture (off when the user prefers reduced motion; never enabled by default inside dense tool UIs like the IDE). Light/Dark use Inter for headings and an 0.625rem radius with normal (not pill) buttons.

## Components

| Group | Components |
| --- | --- |
| Basics | Accordion, Alert, AlertDialog, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Collapsible, Dialog, DropdownMenu, HoverCard, Input, Kbd, Label, Popover, Progress, RadioGroup, ScrollArea, Select, Separator, Sheet, Skeleton, Slider, Spinner, Switch, Tabs, Textarea, Toggle, ToggleGroup, Tooltip |
| Feedback | Toaster + `toast()` (sonner), EmptyState |
| Command + menus | Command, CommandDialog (palette), ContextMenu, Menubar, Shortcut (keyboard shortcut display with OS-aware ⌘/Ctrl) |
| Form kit | Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage; ready fields: TextField, PasswordField, NumberField, TextareaField, SelectField, CheckboxField, SwitchField, RadioField; `useZodForm(schema, options)` |
| Data table | DataTable (sorting, filtering, pagination, column visibility, row selection, optional virtualization hook-in), DataTableToolbar, DataTablePagination, DataTableColumnHeader, DataTableViewOptions |
| App layout | Sidebar (collapsible, icon-only mode), PageHeader, SplitPanes (react-resizable-panels), StatusBar, Toolbar |
| Theme | ThemeProvider, ThemeSwitcher, GradientText, GrainOverlay |

- Every component forwards refs, accepts `className`, merges classes with `cn()` (clsx + tailwind-merge) and uses `class-variance-authority` for variants.
- Accessibility comes from Radix; every interactive component is keyboard-usable and has visible focus (`ring` token).
- Animations respect `prefers-reduced-motion`.

## Folder layout

```
src/
  index.ts                 public exports only
  lib/cn.ts
  theme/                   ThemeProvider.tsx, useTheme.ts, defineTheme.ts, themes/ (light, dark, integr8), themeScript.ts
  components/<group>/      Button.tsx, DataTable.tsx, ...
  styles/                  theme.css, styles.entry.css, fonts.css
registry/                  generator config for the shadcn registry
playground/                Ladle config + stories (one per component, all themes)
docs/SPEC.md
```

## Example

```tsx
// app entry
import '@integr8-media/ui/fonts.css';
import '@integr8-media/ui/styles.css'; // or @import "@integr8-media/ui/theme.css" in a Tailwind app
import { ThemeProvider, ThemeSwitcher, Button, toast, Toaster } from '@integr8-media/ui';

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <ThemeSwitcher />
      <Button onClick={() => toast('Saved')}>Save</Button>
      <Toaster />
    </ThemeProvider>
  );
}
```

## Non-goals

- No window manager (that is @integr8-media/window-manager), no file tree, editor or terminal
- No data fetching, routing or app state
- No RTL or density modes in v1
- No Google Fonts requests at runtime

## Tests and playground

- Unit tests (Vitest, jsdom): ThemeProvider (system resolution and live OS change, storage adapter, `data-theme` and `dark` class, custom themes), `getThemeScript`, `defineTheme` fallbacks, `cn`, `useZodForm`, DataTable sorting/filtering/pagination logic. 80% line coverage on `src/theme`, `src/lib` and logic hooks.
- Ladle: one story file per component in `playground/`, with a toolbar to switch Light / Dark / System / Integr8.
- `playground:smoke`: Playwright opens every story in light, dark and integr8 and fails on console errors.
- size-limit budgets (initial): `import { Button }` ≤ 12 kB gzip; `styles.css` ≤ 60 kB gzip.

## Done when

- [ ] All components in the table exist, exported from `src/index.ts`, with stories
- [ ] Four themes switch live in the playground; System follows the OS live; no flash with `getThemeScript()`
- [ ] Integr8 theme matches the token table and uses Unbounded for headings
- [ ] `theme.css` works in a fixture Tailwind v4 app; `styles.css` works in a fixture app without Tailwind
- [ ] Fonts load offline from the package
- [ ] Registry JSON generated for every component and installable with `npx shadcn add <url>`
- [ ] Tests at 80% on logic; publint and attw pass; size budgets met
- [ ] README with setup for Tailwind and non-Tailwind apps; TypeDoc API reference

## Open points for review

- Integr8 is dark-only like the website. Add a light Integr8 variant later?
- The three added colors (destructive `#ff5470`, success `#3ddc97`, warning `#ffb547`) are new; keep or change?
- Size budgets are first guesses; adjust after the first build.

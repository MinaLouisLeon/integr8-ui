# @integr8-media/ui — spec

The design system for every @integr8-media app: shadcn/ui components on Radix + Tailwind v4, a theme engine with five built-in themes (Light, Dark, System, Integr8, Integr8 Light), a form kit, a data table, a command palette and app layout pieces. Build order 2. **Status: decisions locked 2026-11-06 (see [Decisions](#decisions)).**

## Package facts

| Item | Value |
| --- | --- |
| GitHub repo | integr8-ui (private) |
| npm | @integr8-media/ui, public |
| License | Decided at creation |
| Requires | Node 24 LTS (tooling), React 19 |
| Peer dependencies | react ^19, react-dom ^19; tailwindcss ^4 (optional: only for apps that use the Tailwind preset) |
| Tooling | @integr8-media/config ^1.0.0: tsconfig `react-library.json`, Biome preset, `integr8Vitest({ environment: 'jsdom' })`, `integr8Tsdown({ platform: 'browser' })`, `integr8SizeLimit()` |
| Playground | Ladle |

**Runtime dependencies (approved list; anything else must be asked first):** radix-ui, class-variance-authority, clsx, tailwind-merge, lucide-react, cmdk, sonner, @tanstack/react-table (v9), react-hook-form, @hookform/resolvers, zod, react-resizable-panels, tw-animate-css, @fontsource-variable/inter, @fontsource-variable/jetbrains-mono, @fontsource/unbounded.

**Dev tooling added for this spec:** size-limit, @size-limit/file, @size-limit/esbuild (size budgets; optional peers of @integr8-media/config).

## Exports

| Import path | What it is |
| --- | --- |
| `@integr8-media/ui` | All components, hooks, `ThemeProvider`, `useTheme`, `defineTheme`, `cn` (named exports only) |
| `@integr8-media/ui/theme.css` | Tailwind v4 preset: theme tokens as CSS variables, `@theme inline` mapping, `@custom-variant dark` and `@custom-variant integr8`, tw-animate-css, and `@source` pointing at the package's built files so Tailwind sees its classes |
| `@integr8-media/ui/styles.css` | Prebuilt CSS for apps without Tailwind: tokens + every class the components use |
| `@integr8-media/ui/fonts.css` | `@font-face` rules for Inter, JetBrains Mono and Unbounded, bundled from Fontsource (no Google Fonts requests, works offline) |
| `@integr8-media/ui/registry/<name>.json` | shadcn registry items, also published inside the npm package; `registry.json` is the index |

**Using the registry (standalone, like shadcn/ui):** an app installs only what it needs, with no `@integr8-media/ui` package. The registry is hosted on GitHub Pages at `https://minalouisleon.github.io/integr8-ui/r/` (later a section of the website; the host is the `REGISTRY_BASE_URL` setting):

```sh
npx shadcn@latest add https://minalouisleon.github.io/integr8-ui/r/theme.json   # once per project
npx shadcn@latest add https://minalouisleon.github.io/integr8-ui/r/button.json
```

With `"registries": { "@integr8": "https://minalouisleon.github.io/integr8-ui/r/{name}.json" }` in `components.json`, `npx shadcn@latest add @integr8/button` works too. The registry is generated from the same source files (`scripts/buildRegistry.mjs`, config `registry/registry.config.mjs`):

- One item per component file (`registry:ui`), hook (`registry:hook`) and shared helper (`registry:lib`); the name is the kebab-case file name (`DataTableColumnHeader.tsx` → `data-table-column-header`). `src/lib/cn.ts` becomes `utils` (`@/lib/utils`).
- Relative imports become `@/components/ui/*`, `@/lib/*` or `@/hooks/*` and are listed as `registryDependencies` (full URLs); npm imports are listed as `dependencies` with the package's version ranges (react excluded).
- `theme` (`registry:item`): the whole theme engine (`src/theme/`) copied to `@/lib/theme/` with its file names and folders (so `ThemeProvider` is `@/lib/theme/ThemeProvider`), plus the tokens and styles of `theme.css`: Light → `cssVars.light` (`:root`), Dark → `cssVars.dark` (`.dark`), `@theme inline` → `cssVars.theme`, and Integr8, Integr8 Light, the `integr8` variant, the Integr8 extras and the reduced-motion rule → `css`. Integr8 selectors also match `:root[data-theme]` and `[data-theme].dark`, so they win over the project's own `:root` / `.dark` blocks. Components that use the theme (`ThemeSwitcher`, `Toaster`) import `@/lib/theme/*` and list `theme` as a registry dependency.
- `fonts` (`registry:item`): the Fontsource `@import`s of `fonts.css` as CSS and the font packages as dependencies; `theme` depends on it.
- Every component item's `docs` says to add `theme` once.
- Hosting: `.github/workflows/registry.yml` builds the registry and a landing page (`scripts/buildRegistrySite.mjs` → `site/`) on every push to `main` and deploys it to GitHub Pages. Needs a shadcn CLI recent enough for `@lib/` target placeholders (`shadcn@latest`).

## Themes

Five themes ship built in. "System" is not a palette of its own: it follows the OS setting and resolves to Light or Dark.

| Theme | Base | Source |
| --- | --- | --- |
| `light` | light | Neutral shadcn-style palette, violet accent |
| `dark` | dark | Neutral shadcn-style palette, violet accent |
| `system` | follows OS | Resolves to `light` or `dark` through `prefers-color-scheme`, live |
| `integr8` | dark | Inspired by integr8-media.com (see below) |
| `integr8-light` | light | The Integr8 brand on a light base (see below) |

### Theme API

```ts
type ThemeName = 'light' | 'dark' | 'system' | 'integr8' | 'integr8-light' | (string & {});

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
  resolvedTheme: string;               // 'light' | 'dark' | 'integr8' | 'integr8-light' | custom; never 'system'
  base: 'light' | 'dark';              // the resolved theme's base
  themes: ThemeDefinition[];
  setTheme(theme: ThemeName): void;
};
export function useOptionalTheme(): ReturnType<typeof useTheme> | null; // null outside a ThemeProvider, never throws

export function defineTheme(def: {
  name: string;
  label: string;
  base: 'light' | 'dark';
  tokens: Partial<Record<TokenName, string>>; // missing tokens fall back to the base palette
  fonts?: { sans?: string; display?: string; mono?: string };
  radius?: string;
}): ThemeDefinition;

export function getThemeScript(options?: { storageKey?: string; defaultTheme?: ThemeName }): string;

// Theme components (src/components/theme/)
export function ThemeSwitcher(props: Omit<ButtonProps, 'children' | 'asChild'> & {
  label?: string;                      // button name + menu heading, default 'Theme'
  systemLabel?: string;                // default 'System'
  showLabel?: boolean;                 // show the picked theme's name, default false (icon only)
  align?: 'start' | 'center' | 'end';  // menu alignment, default 'end'
}): JSX.Element; // default variant 'ghost'; throws ThemeError MISSING_PROVIDER outside a provider

export function GradientText(props: ComponentProps<'span'> & {
  angle?: string;                      // CSS angle, default '90deg'
  asChild?: boolean;
}): JSX.Element;

export function GrainOverlay(props: Omit<ComponentProps<'div'>, 'children'> & {
  opacity?: number;                    // 0–1, default 0.06
  animated?: boolean;                  // default false
  cover?: 'viewport' | 'parent';       // fixed over the window, or absolute in the nearest positioned parent; default 'viewport'
}): JSX.Element | null;                // null while the user prefers reduced motion
```

- The provider sets `data-theme="<resolved>"` on the target and adds the `dark` class when the base is dark, so Tailwind's `dark:` variant works for every dark-based theme.
- `getThemeScript()` returns a tiny inline script that applies the stored theme before the first paint (no flash) for SSR apps such as Next.js. It knows every built-in theme.
- Storage is pluggable: Integr8 Workbench passes an adapter that saves on the agent per device.
- `<ThemeSwitcher />` shows System, the four palettes (plus registered ones) as a radio menu. Its icon is a monitor for System, a moon for dark-based themes and a sun for light-based ones.

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

### Integr8 Light theme values

The Integr8 brand on a light base. Brand colors, fonts, radius and pills are the same as Integr8. Lime has too little contrast on white to carry text or sit on a light page, so the primary is a deeper violet; the status colors are darker so they stay readable on white.

| Token | Value | Notes |
| --- | --- | --- |
| background | `#f7f6fc` | faint violet-white |
| card, popover | `#ffffff` | |
| foreground, card/popover/secondary-foreground | `#0d0b16` | ink, from `#07060b` |
| secondary, muted | `#efedf7` | |
| muted-foreground | `#5d5873` | |
| border / input | `rgba(13,11,22,0.10)` / `rgba(13,11,22,0.14)` | |
| primary / primary-foreground | `#5b3df5` / `#ffffff` | deeper violet, AA with white text |
| accent / accent-foreground, ring | `#7c5cff` / `#ffffff`, `#7c5cff` | brand violet, as in Integr8 |
| destructive / destructive-foreground | `#d61f45` / `#ffffff` | darker `#ff5470` |
| success / warning / info | `#11845a` / `#a35f00` / `#0e7490` | darker `#3ddc97` / `#ffb547` / `#22d3ee` |
| brand-1 … brand-4 | same as Integr8 | |
| radius, fonts | same as Integr8 | |

**Integr8 extras (active only in the `integr8` and `integr8-light` themes):** headings use `font-display`; `::selection` is lime (`brand-3`) on `#07060b`; buttons, badges and tabs are pills; `<GradientText>` renders the website's violet → cyan → lime gradient (plain text in other themes); `<GrainOverlay>` adds the film-grain texture (hidden in other themes, not rendered when the user prefers reduced motion, never enabled by default inside dense tool UIs like the IDE). Components target both themes with the `integr8:` Tailwind variant from `theme.css`. Light/Dark use Inter for headings and an 0.625rem radius with normal (not pill) buttons.

## Components

| Group | Components | Status |
| --- | --- | --- |
| Basics | ✅ Accordion, ✅ Alert, ✅ AlertDialog, ✅ Avatar, ✅ Badge, ✅ Breadcrumb, ✅ Button, ✅ Card, ✅ Checkbox, ✅ Collapsible, ✅ Dialog, ✅ DropdownMenu, ✅ HoverCard, ✅ Input, ✅ Kbd, ✅ Label, ✅ Popover, ✅ Progress, ✅ RadioGroup, ✅ ScrollArea, ✅ Select, ✅ Separator, ✅ Sheet, ✅ Skeleton, ✅ Slider, ✅ Spinner, ✅ Switch, ✅ Tabs, ✅ Textarea, ✅ Toggle, ✅ ToggleGroup, ✅ Tooltip | ✅ Done (32/32) |
| Feedback | ✅ Toaster + `toast()` (sonner), ✅ EmptyState | ✅ Done (2/2) |
| Command + menus | ✅ Command, ✅ CommandDialog (palette), ✅ ContextMenu, ✅ Menubar, ✅ Shortcut (keyboard shortcut display with OS-aware ⌘/Ctrl) | ✅ Done (5/5) |
| Form kit | ✅ Form, ✅ FormField, ✅ FormItem, ✅ FormLabel, ✅ FormControl, ✅ FormDescription, ✅ FormMessage; ready fields: ✅ TextField, ✅ PasswordField, ✅ NumberField, ✅ TextareaField, ✅ SelectField, ✅ CheckboxField, ✅ SwitchField, ✅ RadioField; ✅ `useZodForm(schema, options)` | ✅ Done (16/16) |
| Data table | ✅ DataTable (sorting, filtering, pagination, column visibility, row selection, optional virtualization hook-in), ✅ DataTableToolbar, ✅ DataTablePagination, ✅ DataTableColumnHeader, ✅ DataTableViewOptions, ✅ DataTableFacetedFilter, ✅ Table primitives (Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption) | ✅ Done (7/7) |
| App layout | ✅ Sidebar (collapsible, icon-only mode, floating/inset variants, sub menus, actions, rail, input, cookie persistence), ✅ PageHeader, ✅ SplitPanes (react-resizable-panels), ✅ StatusBar, ✅ Toolbar | ✅ Done (5/5) |
| Theme | ✅ ThemeProvider, ✅ ThemeSwitcher, ✅ GradientText, ✅ GrainOverlay | ✅ Done (4/4) |

✅ = built in `src/components/<group>/` (or `src/theme/`), exported from `src/index.ts`, with a unit test and a Ladle story file per component (the form kit: one per ready field plus `Form.stories.tsx`; the data table: one per part).

- Every component forwards refs, accepts `className`, merges classes with `cn()` (clsx + tailwind-merge) and uses `class-variance-authority` for variants.
- Accessibility comes from Radix; every interactive component is keyboard-usable and has visible focus (`ring` token).
- Animations respect `prefers-reduced-motion`.
- Menu-style items (DropdownMenu, ContextMenu, Menubar, Command) highlight with the `accent` token; their icons and shortcut hints switch to `accent-foreground` while highlighted so they stay readable (violet row in Integr8).

### Feedback and Command + menus API

Built in `src/components/feedback/` and `src/components/command/`.

```ts
// Feedback
export const toast: typeof import('sonner').toast;   // sonner's toast: success, error, warning, info, loading, promise, dismiss
export function Toaster(props: ToasterProps): JSX.Element; // all sonner Toaster props
//  - colors from tokens: popover / popover-foreground / border / radius; type icons use success, info, warning, destructive
//  - theme: explicit `theme` prop > useTheme().base inside a ThemeProvider > 'system' (follows the OS)

export function EmptyState(props: ComponentProps<'div'> & {
  title: ReactNode;                     // rendered as a heading
  description?: ReactNode;
  icon?: ReactNode;                     // hidden from screen readers
  headingLevel?: 2 | 3 | 4 | 5 | 6;     // default 3
  variant?: 'default' | 'outline';      // outline = dashed border; default none
  children?: ReactNode;                 // actions row
}): JSX.Element;

// Command + menus
// Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator,
// CommandShortcut: shadcn parts on cmdk.
export function CommandDialog(props: DialogProps & {
  title?: string;                       // sr-only, default 'Command palette'
  description?: string;                 // sr-only, default 'Search for a command to run.'
  className?: string;                   // dialog window
  showCloseButton?: boolean;            // default false (Esc closes)
  commandProps?: Omit<CommandProps, 'children'>; // e.g. loop, filter, shouldFilter
}): JSX.Element;
// ContextMenu* and Menubar*: shadcn parts on Radix, same item API as DropdownMenu
// (inset, variant 'default' | 'destructive', checkbox/radio items, submenus, *Shortcut).

export function Shortcut(props: ComponentProps<'span'> & {
  keys: string | readonly string[];     // 'mod+shift+p' or ['mod', 'k']; a trailing '+' is the plus key
  variant?: 'kbd' | 'text';             // default 'kbd' (one Kbd per key); 'text' for menu items
  platform?: 'mac' | 'other';           // default: detected; server render uses 'other'
}): JSX.Element;
export function formatShortcut(keys: string | readonly string[], platform: 'mac' | 'other'):
  { keys: string[]; text: string; label: string }; // ['⌘','⇧','P'], '⌘⇧P', 'Command+Shift+P'
export function detectShortcutPlatform(): 'mac' | 'other';
```

- `mod` is ⌘ on macOS/iOS/iPadOS and Ctrl elsewhere. Other key names: `ctrl`, `alt`/`option`, `shift`, `meta`/`cmd`/`win`, `enter`, `esc`, `tab`, `space`, `backspace`, `delete`, `up`/`down`/`left`/`right`, `pageup`, `pagedown`, `home`, `end`, `plus`. Single letters and `f1`–`f24` are upper-cased; anything else is shown as written; keys keep the given order.
- Apple style joins keys without a separator (`⌘⇧P`); the other style joins with `+` (`Ctrl+Shift+P`). Screen readers get the spoken form (`Command+Shift+P`).
- Shortcut, `CommandShortcut` and the menu `*Shortcut` parts are display only; they do not bind keys.

### Form kit API

Built in `src/components/form/` on react-hook-form, @hookform/resolvers and zod (v4).

```ts
// Hook
export function useZodForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>, 'resolver'>,
): UseFormReturn<z.input<TSchema>, unknown, z.output<TSchema>>;
//  - values are typed from the schema input; handleSubmit receives the parsed output

// Parts (shadcn pattern)
export const Form: typeof FormProvider;             // <Form {...form}><form>...</form></Form>
export function FormField(props: ControllerProps<TFieldValues, TName, TTransformedValues>): JSX.Element;
export function FormItem(props: ComponentProps<'div'>): JSX.Element;
export function FormLabel(props: LabelProps): JSX.Element;        // destructive while invalid
export function FormControl(props: SlotProps): JSX.Element;       // id, aria-invalid, aria-describedby
export function FormDescription(props: ComponentProps<'p'>): JSX.Element;
export function FormMessage(props: ComponentProps<'p'>): JSX.Element | null; // error (role="alert") or children
export function useFormField(): { id; name; formItemId; formDescriptionId; formMessageId; invalid; error };
export class FormError extends Error { code: 'NO_FORM_FIELD' } // a part used outside <FormField>

// Ready fields: label + control + description + message in one component
interface FieldBaseProps<TFieldValues, TName, TTransformedValues> {
  name: TName;                          // path in the form, typed from the schema
  control?: Control<...>;               // optional inside <Form>
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;                   // the FormItem wrapper
}
interface FieldOption { value: string; label: ReactNode; disabled?: boolean }

TextField      // + native <input> props, inputClassName; stores a string
PasswordField  // + native <input> props (no type), inputClassName, showToggle (default true),
               //   toggleLabel (default 'Show password'); autoComplete default 'current-password'
NumberField    // + native <input> props (no type), inputClassName; stores number | undefined (empty)
TextareaField  // + native <textarea> props, textareaClassName; stores a string
SelectField    // + options, placeholder, triggerClassName; stores the option value
CheckboxField  // stores boolean; use z.literal(true) for "must accept"
SwitchField    // settings row, switch on the right; stores boolean
RadioField     // + options, orientation ('vertical' | 'horizontal', default vertical); stores the option value
```

- Fields wire `aria-invalid`, `aria-describedby` (description + message) and the label automatically; RadioField names its radiogroup with `aria-labelledby`.
- Unset values render as empty (`''` for text, placeholder for select, unchecked for booleans), so inputs never switch between uncontrolled and controlled.
- NumberField turns empty text into `undefined` and non-numbers into `NaN`, so zod reports them (`z.number('Enter a number')`).
- Error messages come from the schema; the kit adds no text of its own except the PasswordField toggle label.

### Data table API

Built in `src/components/data-table/` on @tanstack/react-table **v9** (`^9.3.1`).

```ts
// The fixed feature set of every DataTable (sorting, column + global filtering, faceting,
// pagination, column visibility, row selection, their row models, the built-in sort and
// filter functions, plus the 'oneOf' filter function).
interface DataTableFeatures extends TableFeatures { /* rowSortingFeature, ..., filterFns, sortFns */ }
type DataTableColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<DataTableFeatures, TData, TValue>;
type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>; // read state with table.state
type DataTableColumn<TData extends RowData, TValue = unknown> = Column<DataTableFeatures, TData, TValue>;
type DataTableRow<TData extends RowData> = Row<DataTableFeatures, TData>;
type DataTableState = TableState<DataTableFeatures>;

export function DataTable<TData extends RowData, TValue>(props: Omit<ComponentProps<'div'>, 'children'> & {
  columns: DataTableColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (row: TData, index: number, parent?: DataTableRow<TData>) => string; // default: row index
  enableRowSelection?: boolean | ((row: DataTableRow<TData>) => boolean); // default false; adds a checkbox column (id 'select')
  enableSorting?: boolean;              // default true
  enableMultiSort?: boolean;            // default true (Shift+click)
  toolbar?: false | ((table: DataTableInstance<TData>) => ReactNode); // default <DataTableToolbar />
  paginate?: boolean;                   // default true; false shows every row and no pagination bar
  pageSize?: number;                    // default 10
  pageSizeOptions?: readonly number[];  // default [10, 20, 30, 50, 100]
  // Controlled state (each optional; the table keeps whatever is not controlled):
  sorting?; onSortingChange?; columnFilters?; onColumnFiltersChange?;
  globalFilter?: string; onGlobalFilterChange?; pagination?; onPaginationChange?;
  columnVisibility?: ColumnVisibilityState; onColumnVisibilityChange?;
  rowSelection?: RowSelectionState; onRowSelectionChange?;   // RowSelectionState = Record<string, true>
  initialState?: Partial<DataTableState>;
  // Server-side:
  manualSorting?: boolean; manualFiltering?: boolean; manualPagination?: boolean; rowCount?: number;
  emptyState?: ReactNode;               // replaces labels.noResults in the empty body
  labels?: Partial<DataTableLabels>;
  useVirtualRows?: DataTableVirtualRowsHook<TData>;
  tableContainerClassName?: string;     // the scrolling box; give it a height when virtualizing
}): JSX.Element;

export function DataTableColumnHeader<TData extends RowData, TValue>(props: ComponentProps<'div'> & {
  column: DataTableColumn<TData, TValue>;
  title: string;
}): JSX.Element; // menu: Asc / Desc / Hide; plain text when the column can neither sort nor hide

export function DataTableToolbar<TData extends RowData>(props: ComponentProps<'div'> & {
  table: DataTableInstance<TData>;
  showSearch?: boolean;                 // default true; sets the global filter
  showViewOptions?: boolean;            // default true
  children?: ReactNode;                 // your own filters, after the search input
}): JSX.Element; // shows "Reset" while the search or any column filter is active

export function DataTablePagination<TData extends RowData>(props: ComponentProps<'div'> & {
  table: DataTableInstance<TData>;
  pageSizeOptions?: readonly number[];
}): JSX.Element; // selected count (when selection is on), rows per page, "Page x of y", first/prev/next/last

export function DataTableViewOptions<TData extends RowData>(props: {
  table: DataTableInstance<TData>;
  className?: string;
}): JSX.Element; // lists hideable accessor columns by string header, else column id

interface DataTableFacetedFilterOption { label: string; value: string; icon?: ComponentType<{ className?: string }> }
export function DataTableFacetedFilter<TData extends RowData, TValue>(props: {
  column: DataTableColumn<TData, TValue> | undefined; // table.getColumn('status'); renders nothing when undefined
  title: string;                        // button text + search placeholder
  options: readonly DataTableFacetedFilterOption[];
  maxBadges?: number;                   // default 2, then "n selected"
  className?: string;
}): JSX.Element | null; // dashed button → searchable checkbox list with counts; sets an array filter value

interface DataTableLabels {             // every text the table shows; English defaults
  noResults; searchPlaceholder; searchLabel; reset; view; toggleColumns;
  sortAscending; sortDescending; hideColumn; rowsPerPage;
  page(page, pageCount): string; selectedRows(selected, total): string;
  firstPage; previousPage; nextPage; lastPage; selectAll; selectRow;
  facetNoResults; clearFilter; facetSelected(count): string;
}

// Virtualization hook-in (shape matches @tanstack/react-virtual's VirtualItem; no dependency)
interface DataTableVirtualRow { index: number; start: number; end: number; key: Key }
interface DataTableVirtualRows { rows: readonly DataTableVirtualRow[]; totalSize: number }
type DataTableVirtualRowsHook<TData extends RowData> = (
  rows: readonly DataTableRow<TData>[],
  getScrollElement: () => HTMLDivElement | null,
) => DataTableVirtualRows | null;     // null = render every row

// Table primitives: a styled static table with the DataTable look, no TanStack.
export function Table(props: ComponentProps<'table'> & { containerClassName?: string }): JSX.Element; // in an overflow-x-auto box
// TableHeader (<thead>), TableBody (<tbody>), TableFooter (<tfoot>), TableRow (<tr>, data-state="selected"),
// TableHead (<th>), TableCell (<td>), TableCaption (<caption>): ComponentProps of their element.
```

- The search is TanStack's global filter (`includesString`, case-insensitive) over string and number columns. Column filters are set from your own toolbar controls with `table.getColumn(id)?.setFilterValue(value)`.
- Every built-in TanStack filter and sort function name works in column definitions (`filterFn: 'equals'`, `sortFn: 'alphanumeric'`). `filterFn: 'oneOf'` keeps rows whose value is in an array filter value; use it on columns with a `DataTableFacetedFilter`.
- Faceted counts come from TanStack faceting: the rows that pass every other filter.
- `<th>` gets `aria-sort` (`ascending`, `descending` or `none`) on sortable columns; selected rows get `data-state="selected"`.
- Labels reach the toolbar, pagination, header, faceted filter and checkbox parts through context, so one `labels` prop translates the whole table.
- With `useVirtualRows`, the body renders only the returned rows between two spacer rows and the header becomes sticky. The hook is called on every render; pass the same hook for the table's whole life.
- Row checkboxes toggle one row each (v9's Shift+click range selection is turned off).
- DataTable's own markup (`table`, `thead`, `tr`, `th`, `td`) is internal; the `Table*` primitives are for static tables.

### App layout API

Built in `src/components/layout/`. SplitPanes uses react-resizable-panels **v4** (`^4.0.0`).

```ts
// Sidebar (shadcn pattern, colors from existing tokens: card, muted, accent)
export function SidebarProvider(props: ComponentProps<'div'> & {
  defaultOpen?: boolean;                // default true (desktop)
  open?: boolean; onOpenChange?: (open: boolean) => void; // controlled, e.g. to save it
  keyboardShortcut?: string | false;    // default 'b' → ⌘B / Ctrl+B toggles; false = off
  persist?: 'cookie';                   // default off; saves the desktop state in a cookie, read on first render
  cookieName?: string;                  // default 'sidebar_state'
  cookieMaxAge?: number;                // seconds, default 7 days
}): JSX.Element; // row wrapper; sets --sidebar-width (16rem) and --sidebar-width-icon (3rem)
export function useSidebar(): {
  state: 'expanded' | 'collapsed'; open; setOpen; openMobile; setOpenMobile;
  isMobile: boolean;                    // below 768px
  toggleSidebar(): void;
};
export class SidebarError extends Error { code: 'NO_SIDEBAR_PROVIDER' }
export function Sidebar(props: ComponentProps<'div'> & {
  side?: 'left' | 'right';              // default 'left'
  collapsible?: 'icon' | 'offcanvas' | 'none'; // default 'icon'
  variant?: 'sidebar' | 'floating' | 'inset'; // default 'sidebar'; desktop only
  mobileTitle?: string;                 // sr-only title of the mobile sheet, default 'Sidebar'
}): JSX.Element;
export function SidebarTrigger(props: ButtonProps & { label?: string }): JSX.Element; // default 'Toggle sidebar'
export function SidebarRail(props: ComponentProps<'button'> & { label?: string }): JSX.Element; // click strip on the inner edge; tabIndex -1
export function SidebarInput(props: InputProps): JSX.Element; // compact search box; hidden in icon mode
export function SidebarMenuButton(props: ComponentProps<'button'> & {
  asChild?: boolean; isActive?: boolean; // active: accent colors + aria-current="page"
  size?: 'default' | 'sm' | 'lg';
  tooltip?: ReactNode;                  // shown only while collapsed to icons
}): JSX.Element;
export function SidebarMenuAction(props: ComponentProps<'button'> & {
  asChild?: boolean;
  showOnHover?: boolean;                // desktop: only while the item is hovered/focused; default false
}): JSX.Element; // icon button at the end of a menu item; hidden in icon mode
export function SidebarMenuSubButton(props: ComponentProps<'button'> & {
  asChild?: boolean; isActive?: boolean;
  size?: 'sm' | 'md';                   // default 'md'
}): JSX.Element;
// Plain parts: SidebarInset (<main>), SidebarHeader, SidebarContent (scrolls), SidebarFooter,
// SidebarSeparator, SidebarGroup, SidebarGroupLabel (asChild), SidebarGroupContent,
// SidebarMenu (<ul>), SidebarMenuItem (<li>), SidebarMenuBadge,
// SidebarMenuSub (<ul>, hidden in icon mode), SidebarMenuSubItem (<li>).

export function PageHeader(props: Omit<ComponentProps<'header'>, 'title'> & {
  title: ReactNode; description?: ReactNode;
  breadcrumb?: ReactNode;               // above the title
  actions?: ReactNode;                  // end of the title row
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6; // default 1
  children?: ReactNode;                 // under the title row (e.g. Tabs)
}): JSX.Element;

// SplitPanes: react-resizable-panels v4 Group / Panel / Separator, all props passed through
export function SplitPanes(props: GroupProps): JSX.Element;  // orientation default 'horizontal'
export function SplitPane(props: PanelProps): JSX.Element;
export function SplitPaneHandle(props: SeparatorProps & { withGrip?: boolean }): JSX.Element;
export type SplitPanesApi = GroupImperativeHandle;  // groupRef: getLayout, setLayout
export type SplitPaneApi = PanelImperativeHandle;   // panelRef: collapse, expand, isCollapsed, getSize, resize

export function StatusBar(props: ComponentProps<'footer'>): JSX.Element;
export function StatusBarSection(props: ComponentProps<'div'> & { align?: 'start' | 'end' }): JSX.Element;
export function StatusBarItem(props: ComponentProps<'span'> & { asChild?: boolean }): JSX.Element;

// Toolbar: Radix Toolbar (one Tab stop, arrow keys between items)
export function Toolbar(props: ToolbarRootProps): JSX.Element;
export function ToolbarButton(props: ToolbarButtonProps & { variant?: ButtonVariant; size?: ButtonSize }): JSX.Element; // default ghost, sm
export function ToolbarToggleItem(props: ToggleItemProps & { variant?: ToggleVariant; size?: ToggleSize }): JSX.Element; // default sm
// ToolbarLink, ToolbarSeparator, ToolbarToggleGroup: Radix parts with styles.
```

- Desktop: the sidebar animates its width; `icon` keeps a 3rem strip (labels, group labels, badges, actions, sub menus and the input hide, tooltips name the icons), `offcanvas` shrinks to 0 and becomes `inert`. Below 768px it renders as a `Sheet` opened by `SidebarTrigger`.
- `floating` draws the sidebar as a rounded card with a 0.5rem gap; `inset` makes the `SidebarInset` next to a left sidebar a rounded card on a `card`-colored page. In icon mode both are 1rem wider than the strip, for the gap.
- `persist="cookie"` writes `sidebar_state=true|false` (path `/`, SameSite=Lax) on every change and reads it on the first render when `open` is not set. With server rendering, read the cookie on the server and pass it as `defaultOpen`.
- `SidebarRail` is a mouse convenience (not in the Tab order); keyboard users have `SidebarTrigger` and the shortcut.
- `SidebarProvider` fills the viewport (`min-h-svh`) and the sidebar is sticky at full height. Inside a box (an IDE window), give the provider `className="h-full min-h-0"`; the sidebar clamps to it.
- No new tokens: sidebar background is `card`, hover `muted`, active item `accent` / `accent-foreground` (violet row in Integr8, like the menus).
- SplitPanes sizes follow v4: numbers are **pixels**, strings take units (`'25%'`, `'16rem'`, `'200px'`; a unitless string is a percentage). Remember layouts by saving `onLayoutChange` and passing it back as `defaultLayout`.
- `SplitPaneHandle` is a vertical line between side-by-side panes and a horizontal line between stacked panes; it turns `ring` while hovered, focused or dragged.
- `StatusBar` is not a live region; values that must be announced go in the app's own `role="status"` element. Clickable items use `asChild` with a `<button>`.

## Folder layout

```text
src/
  index.ts                 public exports only
  lib/cn.ts
  theme/                   ThemeProvider.tsx, useTheme.ts, defineTheme.ts, themes/ (light, dark, integr8, integr8Light), themeScript.ts
  components/<group>/      Button.tsx, DataTable.tsx, ... (theme/: ThemeSwitcher, GradientText, GrainOverlay)
  styles/                  theme.css, styles.entry.css, fonts.css
registry/                  registry.config.mjs: generator config for the shadcn registry
scripts/                   buildAssets.mjs, buildRegistry.mjs + buildRegistrySite.mjs + registryItems.mjs (tested), fixtures.mjs
fixtures/                  tailwind-app/, plain-app/, fixtures.spec.ts, playwright.config.ts
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

- Unit tests (Vitest, jsdom): ThemeProvider (system resolution and live OS change, storage adapter, `data-theme` and `dark` class, custom themes), `getThemeScript`, `defineTheme` fallbacks, `cn`, `formatShortcut` and platform detection, `useZodForm`, DataTable sorting/filtering/pagination logic. 80% line coverage on `src/theme`, `src/lib` and logic hooks. The registry generator is tested in `scripts/registryItems.test.mjs` (outside coverage).
- Ladle: one story file per component in `playground/`, with a toolbar to switch Light / Dark / System / Integr8 / Integr8 Light.
- `playground:smoke`: Playwright opens every story in light, dark, integr8 and integr8-light and fails on console errors.
- `fixtures`: packs the package, installs it in `fixtures/tailwind-app` (theme.css + Tailwind v4) and `fixtures/plain-app` (styles.css), builds both and checks with Playwright that components are styled from the tokens, themes switch live, the app's own Tailwind utilities map to the tokens, and the fonts load with every non-localhost request blocked.
- size-limit budgets (`.size-limit.mjs`, initial): `import { Button }` ≤ 12 kB gzip; `styles.css` ≤ 60 kB gzip. After the first measured build, set each to about 10% above the real size.

## Done when

- [ ] All components in the table exist, exported from `src/index.ts`, with stories
- [ ] Five themes switch live in the playground; System follows the OS live; no flash with `getThemeScript()`
- [ ] Integr8 theme matches the token table and uses Unbounded for headings; Integr8 Light matches its table
- [ ] `theme.css` works in a fixture Tailwind v4 app; `styles.css` works in a fixture app without Tailwind
- [ ] Fonts load offline from the package
- [ ] Registry JSON generated for every component and installable with `npx shadcn add <url>` in a plain shadcn project, without `@integr8-media/ui` installed; hosted on GitHub Pages
- [ ] Tests at 80% on logic; publint and attw pass; size budgets met
- [ ] README with setup for Tailwind and non-Tailwind apps; TypeDoc API reference

## Decisions

Locked on 2026-11-06 (they replace the former open points).

1. **Integr8 light variant:** added in v1 as `integr8-light` (light base, values above).
2. **Added colors:** destructive `#ff5470`, success `#3ddc97`, warning `#ffb547` are kept for Integr8.
3. **Size budgets:** start at 12 kB / 60 kB; after the first measured build, set each to about 10% above the real size.
4. **`formatShortcut` / `detectShortcutPlatform`:** public.
5. **Form kit extras** (`useFormField`, `FormError`, `FieldBaseProps`, `FieldOption`, the field props): kept.
6. **Form kit stories:** one story file per ready field, plus `Form.stories.tsx` (full form, disabled, custom field).
7. **TanStack Table:** v9 now (`^9.3.1`). `DataTableColumnDef` and `DataTableInstance` keep their names on v9 types; `DataTableFeatures`, `DataTableColumn`, `DataTableRow` and `DataTableState` are new exports for typing with v9's feature parameter.
8. **Data table extras** (types, `*Props`, the props in the API): kept.
9. **Faceted filter and `Table*` primitives:** both added in v1 (`DataTableFacetedFilter` with the `oneOf` filter function and three new labels; eight `Table*` primitives).
10. **Data table stories:** one story file per part.
11. **App layout part names and API:** kept.
12. **Sidebar extras:** `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarMenuAction`, `SidebarRail`, `SidebarInput` and the `floating` / `inset` variants are added; cookie persistence is added as an opt-in (`persist="cookie"`, `cookieName`, `cookieMaxAge`).
13. **Sidebar tokens:** no `sidebar-*` tokens; the sidebar uses `card`, `muted` and `accent`.
14. **SplitPanes units:** follow react-resizable-panels v4 (numbers are pixels).
15. **`AppShell.stories.tsx`:** kept, in addition to one story file per component.
16. **tw-animate-css:** on the approved runtime dependency list (`theme.css` imports it for the enter/exit animations).
17. **`useOptionalTheme()`:** new public hook, `useTheme()` that returns `null` outside a provider. `Toaster` uses it, so its shadcn registry copy needs only public exports.
18. **Standalone registry** (2026-11-06, replaces "theme imports stay imports of `@integr8-media/ui`"): the registry works without the npm package. The theme engine, tokens and fonts are registry items (`theme`, `fonts`); copied components import `@/lib/theme/*`. The registry is hosted on GitHub Pages (later the website) instead of jsDelivr. The npm package and its exports are unchanged.

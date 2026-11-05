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

| Group | Components | Status |
| --- | --- | --- |
| Basics | ✅ Accordion, ✅ Alert, ✅ AlertDialog, ✅ Avatar, ✅ Badge, ✅ Breadcrumb, ✅ Button, ✅ Card, ✅ Checkbox, ✅ Collapsible, ✅ Dialog, ✅ DropdownMenu, ✅ HoverCard, ✅ Input, ✅ Kbd, ✅ Label, ✅ Popover, ✅ Progress, ✅ RadioGroup, ✅ ScrollArea, ✅ Select, ✅ Separator, ✅ Sheet, ✅ Skeleton, ✅ Slider, ✅ Spinner, ✅ Switch, ✅ Tabs, ✅ Textarea, ✅ Toggle, ✅ ToggleGroup, ✅ Tooltip | ✅ Done (32/32) |
| Feedback | ✅ Toaster + `toast()` (sonner), ✅ EmptyState | ✅ Done (2/2) |
| Command + menus | ✅ Command, ✅ CommandDialog (palette), ✅ ContextMenu, ✅ Menubar, ✅ Shortcut (keyboard shortcut display with OS-aware ⌘/Ctrl) | ✅ Done (5/5) |
| Form kit | ✅ Form, ✅ FormField, ✅ FormItem, ✅ FormLabel, ✅ FormControl, ✅ FormDescription, ✅ FormMessage; ready fields: ✅ TextField, ✅ PasswordField, ✅ NumberField, ✅ TextareaField, ✅ SelectField, ✅ CheckboxField, ✅ SwitchField, ✅ RadioField; ✅ `useZodForm(schema, options)` | ✅ Done (16/16) |
| Data table | ✅ DataTable (sorting, filtering, pagination, column visibility, row selection, optional virtualization hook-in), ✅ DataTableToolbar, ✅ DataTablePagination, ✅ DataTableColumnHeader, ✅ DataTableViewOptions | ✅ Done (5/5) |
| App layout | ✅ Sidebar (collapsible, icon-only mode), ✅ PageHeader, ✅ SplitPanes (react-resizable-panels), ✅ StatusBar, ✅ Toolbar | ✅ Done (5/5) |
| Theme | ✅ ThemeProvider, ThemeSwitcher, GradientText, GrainOverlay | In progress (1/4) |

✅ = built in `src/components/<group>/` (or `src/theme/`), exported from `src/index.ts`, with a unit test and a Ladle story.

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

Built in `src/components/data-table/` on @tanstack/react-table v8 (`^8.21.3`).

```ts
type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue>; // TanStack v8
type DataTableInstance<TData> = Table<TData>;                              // TanStack v8

export function DataTable<TData, TValue>(props: Omit<ComponentProps<'div'>, 'children'> & {
  columns: DataTableColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (row: TData, index: number, parent?: Row<TData>) => string; // default: row index
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean); // default false; adds a checkbox column (id 'select')
  enableSorting?: boolean;              // default true
  enableMultiSort?: boolean;            // default true (Shift+click)
  toolbar?: false | ((table: DataTableInstance<TData>) => ReactNode); // default <DataTableToolbar />
  paginate?: boolean;                   // default true; false shows every row and no pagination bar
  pageSize?: number;                    // default 10
  pageSizeOptions?: readonly number[];  // default [10, 20, 30, 50, 100]
  // Controlled state (each optional; the table keeps whatever is not controlled):
  sorting?; onSortingChange?; columnFilters?; onColumnFiltersChange?;
  globalFilter?: string; onGlobalFilterChange?; pagination?; onPaginationChange?;
  columnVisibility?; onColumnVisibilityChange?; rowSelection?; onRowSelectionChange?;
  initialState?: InitialTableState;
  // Server-side:
  manualSorting?: boolean; manualFiltering?: boolean; manualPagination?: boolean; rowCount?: number;
  emptyState?: ReactNode;               // replaces labels.noResults in the empty body
  labels?: Partial<DataTableLabels>;
  useVirtualRows?: DataTableVirtualRowsHook<TData>;
  tableContainerClassName?: string;     // the scrolling box; give it a height when virtualizing
}): JSX.Element;

export function DataTableColumnHeader<TData, TValue>(props: ComponentProps<'div'> & {
  column: Column<TData, TValue>;
  title: string;
}): JSX.Element; // menu: Asc / Desc / Hide; plain text when the column can neither sort nor hide

export function DataTableToolbar<TData>(props: ComponentProps<'div'> & {
  table: DataTableInstance<TData>;
  showSearch?: boolean;                 // default true; sets the global filter
  showViewOptions?: boolean;            // default true
  children?: ReactNode;                 // your own filters, after the search input
}): JSX.Element; // shows "Reset" while the search or any column filter is active

export function DataTablePagination<TData>(props: ComponentProps<'div'> & {
  table: DataTableInstance<TData>;
  pageSizeOptions?: readonly number[];
}): JSX.Element; // selected count (when selection is on), rows per page, "Page x of y", first/prev/next/last

export function DataTableViewOptions<TData>(props: {
  table: DataTableInstance<TData>;
  className?: string;
}): JSX.Element; // lists hideable accessor columns by string header, else column id

interface DataTableLabels {             // every text the table shows; English defaults
  noResults; searchPlaceholder; searchLabel; reset; view; toggleColumns;
  sortAscending; sortDescending; hideColumn; rowsPerPage;
  page(page, pageCount): string; selectedRows(selected, total): string;
  firstPage; previousPage; nextPage; lastPage; selectAll; selectRow;
}

// Virtualization hook-in (shape matches @tanstack/react-virtual's VirtualItem; no dependency)
interface DataTableVirtualRow { index: number; start: number; end: number; key: Key }
interface DataTableVirtualRows { rows: readonly DataTableVirtualRow[]; totalSize: number }
type DataTableVirtualRowsHook<TData> = (
  rows: readonly Row<TData>[],
  getScrollElement: () => HTMLDivElement | null,
) => DataTableVirtualRows | null;     // null = render every row
```

- The search is TanStack's global filter (`includesString`, case-insensitive) over string and number columns. Column filters are set from your own toolbar controls with `table.getColumn(id)?.setFilterValue(value)`.
- `<th>` gets `aria-sort` (`ascending`, `descending` or `none`) on sortable columns; selected rows get `data-state="selected"`.
- Labels reach the toolbar, pagination, header and checkbox parts through context, so one `labels` prop translates the whole table.
- With `useVirtualRows`, the body renders only the returned rows between two spacer rows and the header becomes sticky. The hook is called on every render; pass the same hook for the table's whole life.
- The table markup (`table`, `thead`, `tr`, `th`, `td`) is internal; there are no exported `Table*` primitives.

### App layout API

Built in `src/components/layout/`. SplitPanes uses react-resizable-panels **v4** (`^4.0.0`).

```ts
// Sidebar (shadcn pattern, colors from existing tokens: card, muted, accent)
export function SidebarProvider(props: ComponentProps<'div'> & {
  defaultOpen?: boolean;                // default true (desktop)
  open?: boolean; onOpenChange?: (open: boolean) => void; // controlled, e.g. to save it
  keyboardShortcut?: string | false;    // default 'b' → ⌘B / Ctrl+B toggles; false = off
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
  mobileTitle?: string;                 // sr-only title of the mobile sheet, default 'Sidebar'
}): JSX.Element;
export function SidebarTrigger(props: ButtonProps & { label?: string }): JSX.Element; // default 'Toggle sidebar'
export function SidebarMenuButton(props: ComponentProps<'button'> & {
  asChild?: boolean; isActive?: boolean; // active: accent colors + aria-current="page"
  size?: 'default' | 'sm' | 'lg';
  tooltip?: ReactNode;                  // shown only while collapsed to icons
}): JSX.Element;
// Plain parts: SidebarInset (<main>), SidebarHeader, SidebarContent (scrolls), SidebarFooter,
// SidebarSeparator, SidebarGroup, SidebarGroupLabel (asChild), SidebarGroupContent,
// SidebarMenu (<ul>), SidebarMenuItem (<li>), SidebarMenuBadge.

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

- Desktop: the sidebar animates its width; `icon` keeps a 3rem strip (labels, group labels and badges hide, tooltips name the icons), `offcanvas` shrinks to 0 and becomes `inert`. Below 768px it renders as a `Sheet` opened by `SidebarTrigger`.
- `SidebarProvider` fills the viewport (`min-h-svh`) and the sidebar is sticky at full height. Inside a box (an IDE window), give the provider `className="h-full min-h-0"`; the sidebar clamps to it.
- No new tokens: sidebar background is `card`, hover `muted`, active item `accent` / `accent-foreground` (violet row in Integr8, like the menus).
- SplitPanes sizes follow v4: numbers are **pixels**, strings take units (`'25%'`, `'16rem'`, `'200px'`; a unitless string is a percentage). Remember layouts by saving `onLayoutChange` and passing it back as `defaultLayout`.
- `SplitPaneHandle` is a vertical line between side-by-side panes and a horizontal line between stacked panes; it turns `ring` while hovered, focused or dragged.
- `StatusBar` is not a live region; values that must be announced go in the app's own `role="status"` element. Clickable items use `asChild` with a `<button>`.

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

- Unit tests (Vitest, jsdom): ThemeProvider (system resolution and live OS change, storage adapter, `data-theme` and `dark` class, custom themes), `getThemeScript`, `defineTheme` fallbacks, `cn`, `formatShortcut` and platform detection, `useZodForm`, DataTable sorting/filtering/pagination logic. 80% line coverage on `src/theme`, `src/lib` and logic hooks.
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
- `formatShortcut` and `detectShortcutPlatform` are exported beyond the original component list (for tooltips and aria labels). Keep public or make internal?
- Form kit exports beyond the original list: `useFormField`, `FormError`, and the `FieldBaseProps` and `FieldOption` types (for building custom fields). The field props (`options`, `placeholder`, `showToggle`, `toggleLabel`, `orientation`, `*ClassName`) were not named in the original spec. Keep or change?
- Form kit stories are one file, `playground/form/Form.stories.tsx` (a full sign-up form, disabled fields, a custom field), not one file per field. Split them?
- Data table uses @tanstack/react-table **v8** (`^8.21.3`), not the current v9. v9 types every column and table by a feature set (`ColumnDef<TFeatures, TData>`), which is hard to export cleanly under `isolatedDeclarations`. Move to v9 later (it changes `DataTableColumnDef` and `DataTableInstance`)?
- Data table exports beyond the original list: the types `DataTableColumnDef`, `DataTableInstance`, `DataTableLabels`, `DataTableVirtualRow`, `DataTableVirtualRows`, `DataTableVirtualRowsHook`, and every `*Props` type. The props listed in the Data table API were not named in the original spec. Keep or change?
- No faceted filter (shadcn's per-column multi-select with counts) and no exported `Table*` primitives in v1. Add them?
- Data table stories are one file, `playground/data-table/DataTable.stories.tsx` (default, row selection, custom toolbar, server-side, empty, translated labels, 10,000 virtualized rows), not one file per part. Split them?
- App layout: the original spec named only the five components. The part names (`Sidebar*`, `SplitPane`/`SplitPaneHandle`, `StatusBarSection`/`StatusBarItem`, `Toolbar*`), `useSidebar`, `SidebarError`, the `SplitPanesApi`/`SplitPaneApi` types, every `*Props` type and all props in the App layout API are new. Keep or change?
- Sidebar v1 leaves out shadcn's `SidebarMenuSub*`, `SidebarMenuAction`, `SidebarRail`, `SidebarInput`, the `floating`/`inset` variants and cookie persistence (use `open`/`onOpenChange`). Add any of them?
- Sidebar uses existing tokens instead of shadcn's `sidebar-*` tokens. Add dedicated sidebar tokens (a token change)?
- SplitPanes targets react-resizable-panels v4, where bare numbers mean pixels (v3 meant percent). OK?
- An `AppShell.stories.tsx` story combines all five pieces, in addition to one story file per component.

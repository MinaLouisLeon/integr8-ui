# @integr8-media/ui

The design system for every `@integr8-media` app: shadcn/ui components on Radix + Tailwind v4, a
theme engine with four built-in themes (Light, Dark, System, Integr8), a form kit, a data table,
a command palette and app layout pieces.

The full spec is in [docs/SPEC.md](docs/SPEC.md).

> **Status: in progress.** Done so far: the theme engine (`ThemeProvider`, `useTheme`,
> `defineTheme`, `getThemeScript`), `cn`, `theme.css`, `fonts.css` and the basic components.
> Next: feedback, command and menus, form kit, data table, app layout, registry.

## Requirements

- React 19
- Tailwind CSS v4 (only for apps that use the Tailwind preset)
- Node 24 LTS for tooling

## Install

```sh
npm install @integr8-media/ui
```

## Setup

### Apps with Tailwind v4

```css
/* app.css */
@import "tailwindcss";
@import "@integr8-media/ui/theme.css";
```

`theme.css` holds the theme tokens as CSS variables, maps them to Tailwind (`bg-primary`,
`text-muted-foreground`, `rounded-lg`, `font-display`, ...), sets up the `dark:` variant and tells
Tailwind to scan the package's built files for the classes its components use.

### Apps without Tailwind

```ts
import '@integr8-media/ui/styles.css';
```

### Fonts

```ts
import '@integr8-media/ui/fonts.css';
```

Inter, JetBrains Mono and Unbounded, bundled from Fontsource. No Google Fonts requests; works
offline.

## Themes

| Theme | Base | Notes |
| --- | --- | --- |
| `light` | light | Neutral palette, violet accent |
| `dark` | dark | Neutral palette, violet accent |
| `system` | follows OS | Resolves to `light` or `dark`, live |
| `integr8` | dark | The integr8-media.com look: lime primary, violet accent, Unbounded headings |

```tsx
import { ThemeProvider, useTheme } from '@integr8-media/ui';

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
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
name) or `MISSING_PROVIDER` (`useTheme` outside `ThemeProvider`).

## Components

shadcn/ui components on Radix, styled only through the theme tokens. Every component accepts
`className` (merged with `cn`, so your classes win), takes a `ref` (React 19 ref-as-prop) and
sets a `data-slot` attribute you can target in CSS.

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
import { Shortcut, Toaster, toast } from '@integr8-media/ui';

<Shortcut keys="mod+shift+p" />;              // ⌘ ⇧ P  or  Ctrl Shift P
<Shortcut keys="mod+s" variant="text" />;     // ⌘S     or  Ctrl+S (for menu items)

toast.success('Saved'); // needs one <Toaster /> mounted near the app root
```

```tsx
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@integr8-media/ui';

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit profile</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>Changes are saved when you click Save.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>;
```

- In the Integr8 theme, buttons, badges and tabs are pills and card titles use Unbounded.
- Overlays animate with [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css), which
  `theme.css` imports. When the user prefers reduced motion, animations finish at once (the
  `Spinner` keeps turning).

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
npm run build
npm run check:exports
npm run playground        # Ladle at http://localhost:61000
npm run playground:smoke  # builds the playground and runs Playwright on every story
```

- Unit tests sit next to the code in `src/`; shared test helpers are in `test/`.
- Stories live in `playground/`; the toolbar above each story switches Light / Dark / System /
  Integr8.

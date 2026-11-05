import { FONT_STACKS, type ThemeDefinition } from '../tokens';

/**
 * The built-in Dark theme: a neutral shadcn-style palette with a violet accent.
 * The same values live in `src/styles/theme.css`; a test keeps the two in sync.
 */
export const darkTheme: ThemeDefinition = Object.freeze({
  name: 'dark',
  label: 'Dark',
  base: 'dark',
  tokens: Object.freeze({
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.205 0 0)',
    'card-foreground': 'oklch(0.985 0 0)',
    popover: 'oklch(0.205 0 0)',
    'popover-foreground': 'oklch(0.985 0 0)',
    primary: 'oklch(0.606 0.25 292.717)',
    'primary-foreground': 'oklch(0.969 0.016 293.756)',
    secondary: 'oklch(0.269 0 0)',
    'secondary-foreground': 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    'muted-foreground': 'oklch(0.708 0 0)',
    accent: 'oklch(0.283 0.141 291.089)',
    'accent-foreground': 'oklch(0.943 0.029 294.588)',
    destructive: 'oklch(0.704 0.191 22.216)',
    'destructive-foreground': 'oklch(0.145 0 0)',
    success: 'oklch(0.723 0.219 149.579)',
    warning: 'oklch(0.828 0.189 84.429)',
    info: 'oklch(0.746 0.16 232.661)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.702 0.183 293.541)',
    'brand-1': '#7c5cff',
    'brand-2': '#22d3ee',
    'brand-3': '#c6ff3d',
    'brand-4': '#ff4fd8',
    radius: '0.625rem',
    'font-sans': FONT_STACKS.sans,
    'font-display': FONT_STACKS.sans,
    'font-mono': FONT_STACKS.mono,
  }),
});

import { FONT_STACKS, type ThemeDefinition } from '../tokens';

/**
 * The built-in Light theme: a neutral shadcn-style palette with a violet accent.
 * The same values live in `src/styles/theme.css`; a test keeps the two in sync.
 */
export const lightTheme: ThemeDefinition = Object.freeze({
  name: 'light',
  label: 'Light',
  base: 'light',
  tokens: Object.freeze({
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    card: 'oklch(1 0 0)',
    'card-foreground': 'oklch(0.145 0 0)',
    popover: 'oklch(1 0 0)',
    'popover-foreground': 'oklch(0.145 0 0)',
    primary: 'oklch(0.541 0.281 293.009)',
    'primary-foreground': 'oklch(0.969 0.016 293.756)',
    secondary: 'oklch(0.97 0 0)',
    'secondary-foreground': 'oklch(0.205 0 0)',
    muted: 'oklch(0.97 0 0)',
    'muted-foreground': 'oklch(0.556 0 0)',
    accent: 'oklch(0.943 0.029 294.588)',
    'accent-foreground': 'oklch(0.38 0.189 293.745)',
    destructive: 'oklch(0.577 0.245 27.325)',
    'destructive-foreground': 'oklch(0.985 0 0)',
    success: 'oklch(0.627 0.194 149.214)',
    warning: 'oklch(0.769 0.188 70.08)',
    info: 'oklch(0.588 0.158 241.966)',
    border: 'oklch(0.922 0 0)',
    input: 'oklch(0.922 0 0)',
    ring: 'oklch(0.606 0.25 292.717)',
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

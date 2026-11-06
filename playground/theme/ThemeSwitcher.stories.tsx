import type { Story } from '@ladle/react';
import { ThemeSwitcher } from '../../src';

/** Icon-only button (the default). It switches the same theme as the playground toolbar. */
export const Default: Story = () => <ThemeSwitcher />;

/** With the theme name, an outline button and custom labels. */
export const WithLabel: Story = () => (
  <div className="flex flex-wrap items-center gap-3">
    <ThemeSwitcher showLabel variant="outline" />
    <ThemeSwitcher showLabel variant="secondary" label="Appearance" systemLabel="Automatic" />
    <ThemeSwitcher size="icon-sm" align="start" />
  </div>
);

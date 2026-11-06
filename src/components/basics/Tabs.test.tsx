import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

function Example() {
  return (
    <Tabs defaultValue="account">
      <TabsList aria-label="Settings">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account panel</TabsContent>
      <TabsContent value="password">Password panel</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('shows the default tab panel', () => {
    render(<Example />);

    expect(screen.getByRole('tab', { name: 'Account' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toBe('Account panel');
  });

  it('switches panels on click', async () => {
    render(<Example />);

    await userEvent.setup().click(screen.getByRole('tab', { name: 'Password' }));

    expect(screen.getByRole('tabpanel').textContent).toBe('Password panel');
  });

  it('moves between tabs with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Password' }));
    expect(screen.getByRole('tabpanel').textContent).toBe('Password panel');
  });

  it('uses pill tabs in the Integr8 theme', () => {
    render(<Example />);

    expect(screen.getByRole('tablist').className).toContain('integr8:rounded-full');
    expect(screen.getByRole('tab', { name: 'Account' }).className).toContain(
      'integr8:rounded-full',
    );
  });
});

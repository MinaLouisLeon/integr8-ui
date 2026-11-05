import type { Story } from '@ladle/react';
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  FileIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from 'lucide-react';
import { type JSX, useEffect, useState } from 'react';
import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Shortcut,
  Toaster,
  toast,
} from '../../src';

function Items({ onRun }: { onRun: (name: string) => void }): JSX.Element {
  return (
    <>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        <CommandItem onSelect={() => onRun('Calendar')}>
          <CalendarIcon /> Calendar
        </CommandItem>
        <CommandItem onSelect={() => onRun('Search emoji')}>
          <SmileIcon /> Search emoji
        </CommandItem>
        <CommandItem disabled>
          <CalculatorIcon /> Calculator
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Settings">
        <CommandItem onSelect={() => onRun('Profile')}>
          <UserIcon /> Profile
          <CommandShortcut>
            <Shortcut keys="mod+p" variant="text" />
          </CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => onRun('Billing')} keywords={['payment', 'invoice']}>
          <CreditCardIcon /> Billing
          <CommandShortcut>
            <Shortcut keys="mod+b" variant="text" />
          </CommandShortcut>
        </CommandItem>
        <CommandItem onSelect={() => onRun('Settings')}>
          <SettingsIcon /> Settings
          <CommandShortcut>
            <Shortcut keys="mod+," variant="text" />
          </CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}

/** Inline, inside a bordered box. Type to filter; "payment" finds Billing by keyword. */
export const Inline: Story = () => (
  <>
    <Command label="Commands" className="max-w-md rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <Items onRun={(name) => toast(name)} />
      </CommandList>
    </Command>
    <Toaster />
  </>
);

function Palette(): JSX.Element {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const run = (name: string): void => {
    setOpen(false);
    toast(`Ran: ${name}`);
  };

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <FileIcon /> Open palette
      </Button>
      <span className="text-sm text-muted-foreground">
        or press <Shortcut keys="mod+k" />
      </span>
      <CommandDialog open={open} onOpenChange={setOpen} commandProps={{ loop: true }}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <Items onRun={run} />
        </CommandList>
      </CommandDialog>
      <Toaster />
    </div>
  );
}

/** The ⌘K / Ctrl+K command palette. */
export const Dialog: Story = () => <Palette />;

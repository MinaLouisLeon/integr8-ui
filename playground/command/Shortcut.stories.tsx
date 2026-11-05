import type { Story } from '@ladle/react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Shortcut,
} from '../../src';

const EXAMPLES = ['mod+k', 'mod+shift+p', 'alt+up', 'ctrl+`', 'mod+enter', 'shift+tab', 'f5'];

/** Detected from this browser: ⌘ on macOS and iOS, Ctrl elsewhere. */
export const Detected: Story = () => (
  <ul className="grid gap-3">
    {EXAMPLES.map((keys) => (
      <li key={keys} className="flex items-center gap-4">
        <code className="w-32 font-mono text-sm text-muted-foreground">{keys}</code>
        <Shortcut keys={keys} />
      </li>
    ))}
  </ul>
);

/** Both platforms side by side. */
export const BothPlatforms: Story = () => (
  <table className="text-sm">
    <thead>
      <tr className="text-left text-muted-foreground">
        <th className="pr-6 pb-2 font-medium">Keys</th>
        <th className="pr-6 pb-2 font-medium">mac</th>
        <th className="pb-2 font-medium">other</th>
      </tr>
    </thead>
    <tbody>
      {EXAMPLES.map((keys) => (
        <tr key={keys}>
          <td className="pr-6 py-1 font-mono text-muted-foreground">{keys}</td>
          <td className="pr-6 py-1">
            <Shortcut keys={keys} platform="mac" />
          </td>
          <td className="py-1">
            <Shortcut keys={keys} platform="other" />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

/** The text variant inside menu items. */
export const InMenu: Story = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">File</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56" align="start">
      <DropdownMenuItem>
        New file
        <DropdownMenuShortcut>
          <Shortcut keys="mod+n" variant="text" />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        Save
        <DropdownMenuShortcut>
          <Shortcut keys="mod+s" variant="text" />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        Save as…
        <DropdownMenuShortcut>
          <Shortcut keys="mod+shift+s" variant="text" />
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

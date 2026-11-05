import type { Story } from '@ladle/react';
import { CopyIcon, ScissorsIcon, TrashIcon } from 'lucide-react';
import { type JSX, useState } from 'react';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  Shortcut,
} from '../../src';

function EditorMenu(): JSX.Element {
  const [wordWrap, setWordWrap] = useState(true);
  const [indent, setIndent] = useState('spaces');

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-48 w-80 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-60">
        <ContextMenuGroup>
          <ContextMenuItem>
            <ScissorsIcon /> Cut
            <ContextMenuShortcut>
              <Shortcut keys="mod+x" variant="text" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <CopyIcon /> Copy
            <ContextMenuShortcut>
              <Shortcut keys="mod+c" variant="text" />
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>Paste</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={wordWrap} onCheckedChange={setWordWrap}>
          Word wrap
        </ContextMenuCheckboxItem>
        <ContextMenuLabel inset>Indent with</ContextMenuLabel>
        <ContextMenuRadioGroup value={indent} onValueChange={setIndent}>
          <ContextMenuRadioItem value="spaces">Spaces</ContextMenuRadioItem>
          <ContextMenuRadioItem value="tabs">Tabs</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">
          <TrashIcon /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/** An editor-style context menu with shortcuts, a submenu, checkbox and radio items. */
export const Editor: Story = () => <EditorMenu />;

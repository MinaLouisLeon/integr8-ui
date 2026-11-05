import type { Story } from '@ladle/react';
import { type JSX, useState } from 'react';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  Shortcut,
} from '../../src';

function AppMenubar(): JSX.Element {
  const [minimap, setMinimap] = useState(true);
  const [statusBar, setStatusBar] = useState(true);
  const [panel, setPanel] = useState('bottom');

  return (
    <Menubar className="w-fit">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem>
              New file
              <MenubarShortcut>
                <Shortcut keys="mod+n" variant="text" />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Open…
              <MenubarShortcut>
                <Shortcut keys="mod+o" variant="text" />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Open recent</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>README.md</MenubarItem>
                <MenubarItem>src/index.ts</MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Clear recent</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarItem>
            Save
            <MenubarShortcut>
              <Shortcut keys="mod+s" variant="text" />
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>Save all</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Close workspace</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo
            <MenubarShortcut>
              <Shortcut keys="mod+z" variant="text" />
            </MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo
            <MenubarShortcut>
              <Shortcut keys="mod+shift+z" variant="text" />
            </MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Appearance</MenubarLabel>
          <MenubarCheckboxItem checked={minimap} onCheckedChange={setMinimap}>
            Minimap
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked={statusBar} onCheckedChange={setStatusBar}>
            Status bar
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Panel position</MenubarLabel>
          <MenubarRadioGroup value={panel} onValueChange={setPanel}>
            <MenubarRadioItem value="bottom">Bottom</MenubarRadioItem>
            <MenubarRadioItem value="right">Right</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

/** A desktop-style File / Edit / View bar. */
export const App: Story = () => <AppMenubar />;

import type { Story } from '@ladle/react';
import {
  FilesIcon,
  GitBranchIcon,
  HouseIcon,
  InboxIcon,
  SearchIcon,
  SettingsIcon,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import {
  Sidebar,
  type SidebarCollapsible,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  type SidebarSide,
  SidebarTrigger,
  useSidebar,
} from '../../src';

const ITEMS = [
  { label: 'Home', icon: <HouseIcon /> },
  { label: 'Inbox', icon: <InboxIcon />, badge: '12' },
  { label: 'Files', icon: <FilesIcon /> },
  { label: 'Search', icon: <SearchIcon /> },
  { label: 'Source control', icon: <GitBranchIcon />, badge: '3' },
];

function DemoSidebar({
  collapsible,
  side,
}: {
  collapsible?: SidebarCollapsible;
  side?: SidebarSide;
}): ReactNode {
  const [active, setActive] = useState('Home');
  return (
    <Sidebar collapsible={collapsible} side={side}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Integr8 Workbench">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground">
                i8
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-semibold">Integr8</span>
                <span className="text-xs text-muted-foreground">Workbench</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    isActive={active === item.label}
                    tooltip={item.label}
                    onClick={() => setActive(item.label)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function StateLabel(): ReactNode {
  const { state, isMobile } = useSidebar();
  return (
    <p className="text-sm text-muted-foreground">
      state: {state}
      {isMobile ? ' (mobile: the sidebar is a sheet)' : ''} · toggle with ⌘B / Ctrl+B
    </p>
  );
}

function Frame({ children }: { children: ReactNode }): ReactNode {
  return (
    <SidebarInset>
      <header className="flex h-12 items-center gap-2 border-b px-2">
        <SidebarTrigger />
        <span className="text-sm font-medium">{children}</span>
      </header>
      <div className="flex flex-col gap-2 p-4">
        <StateLabel />
      </div>
    </SidebarInset>
  );
}

const BOX = 'h-[480px] min-h-0 overflow-hidden rounded-lg border';

/** Collapses to a strip of icons; hover an icon to see its tooltip. */
export const IconMode: Story = () => (
  <SidebarProvider className={BOX}>
    <DemoSidebar collapsible="icon" />
    <Frame>Icon mode</Frame>
  </SidebarProvider>
);

/** Hides completely when collapsed. */
export const Offcanvas: Story = () => (
  <SidebarProvider className={BOX}>
    <DemoSidebar collapsible="offcanvas" />
    <Frame>Off-canvas</Frame>
  </SidebarProvider>
);

/** On the right edge, starting collapsed. */
export const RightSide: Story = () => (
  <SidebarProvider className={BOX} defaultOpen={false}>
    <Frame>Right side</Frame>
    <DemoSidebar side="right" />
  </SidebarProvider>
);

/** Never collapses. */
export const Fixed: Story = () => (
  <SidebarProvider className={BOX}>
    <DemoSidebar collapsible="none" />
    <Frame>Fixed</Frame>
  </SidebarProvider>
);

/** Controlled: the parent owns the state (where an app would save it). */
export const Controlled: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={open} onChange={(event) => setOpen(event.target.checked)} />
        Expanded (from the parent)
      </label>
      <SidebarProvider className={BOX} open={open} onOpenChange={setOpen}>
        <DemoSidebar />
        <Frame>Controlled</Frame>
      </SidebarProvider>
    </div>
  );
};

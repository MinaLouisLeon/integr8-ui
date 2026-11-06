import type { Story } from '@ladle/react';
import {
  BookIcon,
  FilesIcon,
  FolderIcon,
  GitBranchIcon,
  HouseIcon,
  InboxIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sidebar,
  type SidebarCollapsible,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  type SidebarSide,
  SidebarTrigger,
  type SidebarVariant,
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
  variant,
}: {
  collapsible?: SidebarCollapsible;
  side?: SidebarSide;
  variant?: SidebarVariant;
}): ReactNode {
  const [active, setActive] = useState('Home');
  return (
    <Sidebar collapsible={collapsible} side={side} variant={variant}>
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

/** `variant="floating"`: a rounded card with a gap around it. */
export const Floating: Story = () => (
  <SidebarProvider className={BOX}>
    <DemoSidebar variant="floating" />
    <Frame>Floating</Frame>
  </SidebarProvider>
);

/** `variant="inset"`: the page content sits in a rounded card next to the sidebar. */
export const Inset: Story = () => (
  <SidebarProvider className={BOX}>
    <DemoSidebar variant="inset" />
    <Frame>Inset</Frame>
  </SidebarProvider>
);

const DOCS = [
  { label: 'Getting started', pages: ['Install', 'Themes', 'Fonts'] },
  { label: 'Components', pages: ['Button', 'Data table', 'Sidebar'] },
];

/**
 * Search box (`SidebarInput`), collapsible sub menus (`SidebarMenuSub*`), "…" and "+" actions
 * (`SidebarMenuAction`, the "…" only on hover) and a click-to-toggle rail (`SidebarRail`).
 */
export const NestedMenusAndActions: Story = () => {
  const [page, setPage] = useState('Themes');
  return (
    <SidebarProvider className={BOX}>
      <Sidebar>
        <SidebarHeader>
          <SidebarInput type="search" placeholder="Search docs…" aria-label="Search docs" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Docs</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {DOCS.map((section) => (
                  <Collapsible key={section.label} asChild defaultOpen>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={section.label}>
                          <BookIcon />
                          <span>{section.label}</span>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction showOnHover aria-label={`More for ${section.label}`}>
                            <MoreHorizontalIcon />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start">
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {section.pages.map((item) => (
                            <SidebarMenuSubItem key={item}>
                              <SidebarMenuSubButton
                                isActive={page === item}
                                onClick={() => setPage(item)}
                              >
                                <span>{item}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Projects">
                    <FolderIcon />
                    <span>Projects</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction aria-label="Add project">
                    <PlusIcon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <Frame>Click the rail on the sidebar edge to collapse</Frame>
    </SidebarProvider>
  );
};

/**
 * `persist="cookie"`: the expanded state is saved in the `sidebar_state` cookie, so it
 * survives a reload of this story.
 */
export const CookiePersist: Story = () => (
  <SidebarProvider className={BOX} persist="cookie">
    <DemoSidebar />
    <Frame>Collapse, then reload the page</Frame>
  </SidebarProvider>
);

import type { Story } from '@ladle/react';
import { FilesIcon, GitBranchIcon, PlayIcon, SearchIcon, SettingsIcon } from 'lucide-react';
import {
  Button,
  PageHeader,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SplitPane,
  SplitPaneHandle,
  SplitPanes,
  StatusBar,
  StatusBarItem,
  StatusBarSection,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from '../../src';

/** Every layout piece together: sidebar, page header, toolbar, split panes and status bar. */
export const Workbench: Story = () => (
  <div className="flex h-[600px] flex-col overflow-hidden rounded-lg border">
    <SidebarProvider className="min-h-0 flex-1">
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Explorer">
                    <FilesIcon />
                    <span>Explorer</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Search">
                    <SearchIcon />
                    <span>Search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Source control">
                    <GitBranchIcon />
                    <span>Source control</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
      <SidebarInset className="min-h-0">
        <div className="flex flex-col gap-3 border-b p-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <PageHeader
              className="flex-1"
              headingLevel={2}
              title="integr8-ui"
              description="feat/app-layout-components"
              actions={
                <Button size="sm">
                  <PlayIcon /> Run
                </Button>
              }
            />
          </div>
          <Toolbar aria-label="Editor actions" className="w-fit">
            <ToolbarButton>New file</ToolbarButton>
            <ToolbarButton>Save</ToolbarButton>
            <ToolbarSeparator />
            <ToolbarButton>Format</ToolbarButton>
          </Toolbar>
        </div>
        <div className="min-h-0 flex-1">
          <SplitPanes orientation="vertical">
            <SplitPane id="editor" minSize="20%">
              <pre className="h-full overflow-auto p-4 font-mono text-xs">
                {'export function App() {\n  return <Button>Save</Button>;\n}'}
              </pre>
            </SplitPane>
            <SplitPaneHandle withGrip />
            <SplitPane id="terminal" defaultSize="30%" minSize="10%" collapsible>
              <pre className="h-full overflow-auto bg-card p-4 font-mono text-xs text-muted-foreground">
                $ npm test
              </pre>
            </SplitPane>
          </SplitPanes>
        </div>
      </SidebarInset>
    </SidebarProvider>
    <StatusBar aria-label="Workbench status">
      <StatusBarSection>
        <StatusBarItem>
          <GitBranchIcon /> feat/app-layout-components
        </StatusBarItem>
      </StatusBarSection>
      <StatusBarSection align="end">
        <StatusBarItem>Ln 2, Col 9</StatusBarItem>
        <StatusBarItem>TypeScript JSX</StatusBarItem>
      </StatusBarSection>
    </StatusBar>
  </div>
);

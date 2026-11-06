import type { Story } from '@ladle/react';
import { PlusIcon } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  PageHeader,
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../src';

/** Title, description and actions. */
export const Default: Story = () => (
  <PageHeader
    title="Projects"
    description="Everything your team is building."
    actions={
      <>
        <Button variant="outline">Import</Button>
        <Button>
          <PlusIcon /> New project
        </Button>
      </>
    }
  />
);

/** With a breadcrumb above and tabs below. */
export const WithBreadcrumbAndTabs: Story = () => (
  <PageHeader
    breadcrumb={
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>integr8-ui</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    }
    title="integr8-ui"
    description="The design system for every @integr8-media app."
    actions={<Button variant="outline">Settings</Button>}
  >
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
    </Tabs>
  </PageHeader>
);

/** Title only, as a level-2 heading. */
export const Minimal: Story = () => <PageHeader title="Settings" headingLevel={2} />;

/** A long title wraps, and the actions drop below it in a narrow container. */
export const Narrow: Story = () => (
  <div className="max-w-sm rounded-lg border p-4">
    <PageHeader
      title="A rather long page title that needs to wrap"
      description="Narrow container."
      actions={<Button size="sm">Action</Button>}
    />
  </div>
);

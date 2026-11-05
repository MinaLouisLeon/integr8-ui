import type { Story } from '@ladle/react';
import { useId } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../src';

/** Two tabs with cards. Pill tabs in the Integr8 theme. */
export const Account: Story = () => {
  const id = useId();
  return (
    <Tabs defaultValue="account" className="max-w-md">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Change your account details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Label htmlFor={`${id}-name`}>Name</Label>
            <Input id={`${id}-name`} defaultValue="Mina Louis" />
          </CardContent>
          <CardFooter>
            <Button>Save</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Label htmlFor={`${id}-password`}>New password</Label>
            <Input id={`${id}-password`} type="password" />
          </CardContent>
          <CardFooter>
            <Button>Update password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
